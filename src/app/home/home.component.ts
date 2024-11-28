import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, viewChild, ViewChild } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgIf, NgFor } from '@angular/common';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, HttpClientModule, NgIf, NgFor, ReactiveFormsModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  @ViewChild('counterSection') counterSection!: ElementRef;
  placeholderText: string = ''; // Current placeholder value
  fullText: string = 'Enter Herbs Name To Search...'; // Text to type
  charIndex: number = 0; // Index of current character
  isTypingForward: boolean = true; // Determines typing direction
  
  contactForm!: FormGroup;
  isFormSubmitted = false;
  isLoading = false;  // Loading state
  emailSentSuccess = false;

  plants: any[] = []; // Array to hold fetched plant details
  plantsByType: any[] = [];
  selectedType: string = ''; // Selected type (Ayurveda, etc.)
  hoveredType: string | null = null;

  //For search plants
  showPopup: boolean = false;
  searchQuery: string = '';
  searchResults: any[] = [];
  selectedField: string = 'all';

  // Tracks the currently active tab
  activeTab: string = 'about'; // Default to 'about'
  openedFaqIndex: number | null = null;
  isModalOpen: boolean = false;
  modalImage: string = '';
  email = localStorage.getItem('email');

  private router = inject(Router)


  plantcategory=[
    {name: 'Ayurveda',image: 'ayurveda.png'},
    {name: 'Yoga & Naturopathy', image: 'yoga.png'},
    {name: 'Unani', image: 'unani.png'},
    {name: 'Siddha', image:'siddha.png'},
    {name:'Homeopathy', image:'homeopathy.png'},
  ];
  //For bar charts
  chart: any;
  ratings: any;

  constructor(
    private fb: FormBuilder,
    private notification: NotificationService,
    private http: HttpClient,
    private authService: AuthService,
  ){
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      profession: ['', Validators.required],
      message: ['', Validators.required],
    });
  }

  public config:any = {
    type: 'bar',
    data: {
      labels: ['Ayurveda', 'Yoga & Naturopathy', 'Unani', 'Siddha', 'Homeopathy'],
      datasets:[
        {
          label: 'Ayush Category',
          data: [40, 80, 50, 40, 50],
          backgroundColor: ['#091e00'],
          color: ['#000']
          // borderColor: ['rgba(75, 192, 192, 1)'],
          // borderWidth: 1
        }
      ]
    },
    options: {
      options: {
        aspectRatio : 1
      },
      scales: {
        x: {
          ticks: {
              font: {
                  size: 16,
                  weight: 'bold',
                  color: '#000'
              }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            font: {
                size: 16,
                weight: 'bold',
                color: '#000'
            }
          }
        }
      }
    },
  };

  public ratingconfig: any = {
    type: 'bar',
    data: {
      labels: ['5 *', '4 *', '3 *', '2 *', '1 *'], // Ratings from 5 to 1
      datasets: [
        {
          label: 'Number of Ratings',
          data: [50, 30, 20, 15, 5], // Number of ratings for each level
          backgroundColor: ['#091e00'],
          color: ['#000']
        },
      ],
    },
    options: {
      indexAxis: 'y', // Make the bars horizontal
      plugins: {
        legend: {
          display: true, // Show legend
          labels: {
            color: '#000', // Legend text color
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true, // Start X-axis from 0
          ticks: {
            color: '#000', // X-axis label color
          },
        },
        y: {
          ticks: {
            color: '#000', // Y-axis label color
          },
        },
      },
    },
  };
  

  ngOnInit(){
    this.typeEffect(); // Start typing on initialization
    this.getRandomPlants(); // Get random plants details
    // Initialize the chart
    this.ratings = new Chart('RatingChart', this.ratingconfig);
    this.chart = new Chart('MyChart', this.config);
  }
  ngAfterViewInit(): void {
    // Ensure the view is initialized before accessing counterSection
    this.observeCounterSection();
  }
  openSearchPopup() {
    this.showPopup = true;
  }
  //To close search popup
  closeSearchPopup() {
    this.showPopup = false;
    this.searchQuery = '';
    this.searchResults = [];
  }
  //Search Plants
  searchPlants() {
    const searchField = this.selectedField; // Get selected field from dropdown
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
  
    this.isLoading = true;
  
    this.authService.searchPlants(searchField, this.searchQuery).subscribe({
      next: (response: any) => {
        // Process the results
        this.searchResults = response.map((plant: any) => ({
          ...plant,
          highlightedCommonNames: this.highlightText(plant.commonNames),
          matchingFields: Object.entries(plant.matchingFields).map(([key, value]) => ({
            key,
            value: Array.isArray(value)
              ? this.highlightText(value.join(', '))
              : this.highlightText(typeof value === 'string' ? value : ''),
          })),
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching search results:', error);
        this.isLoading = false;
      },
    });
  }
  //Highlight matching elements in the search results
  highlightText(text: string | string[] | null | undefined): string {
    if (!text) return '';
    const queryRegex = new RegExp(`(${this.searchQuery})`, 'gi');
    if (Array.isArray(text)) {
      return text
        .map((t) => t.replace(queryRegex, `<span class="highlighter">$1</span>`))
        .join(', ');
    }
    return text.replace(queryRegex, `<span class="highlighter">$1</span>`);
  }
  getMatchingFields(plant: any): { key: string; value: string }[] {
    return plant.matchingFields || [];
  }
  //Open Plant Details
  openPlantDetails(plantId: string) {
    if(this.email){
      this.authService.clickedPlant(plantId, this.email);
    }
    this.router.navigate([`/plant-details/${plantId}`]);
  }
  // Start typing on initialization
  typeEffect() {
    setInterval(() => {
      if (this.isTypingForward) {
        // Typing forward
        if (this.charIndex < this.fullText.length) {
          this.placeholderText += this.fullText[this.charIndex];
          this.charIndex++;
        } else {
          this.isTypingForward = false; // Switch to clearing text
        }
      } else {
        // Clearing text
        if (this.charIndex > 0) {
          this.placeholderText = this.placeholderText.slice(0, -1);
          this.charIndex--;
        } else {
          this.isTypingForward = true; // Restart typing
        }
      }
    }, 500); // Adjust typing speed here
  }
  //To send messages using contact form
  onSubmit() {
    this.isFormSubmitted = true;
    if (this.contactForm.valid) {
      this.isLoading = true;  // Start loader
      const formValues = this.contactForm.value;
      this.authService.sendContactForm(formValues).subscribe(
        response => {
          console.log('Email sent successfully', response);
          this.emailSentSuccess = true;
          this.isLoading = false;  // Stop loader
          this.contactForm.reset();  // Reset form
          this.isFormSubmitted = false;  // Reset form submission state
          this.notification.showNotification(`${response.msg}`, 'success');
        },
        error => {
          console.error('Error sending email', error);
          this.notification.showNotification(`${error.error.msg}`, 'error');
          this.isLoading = false;  // Stop loader
        }
      );
    }
  }
  //Get 5 random plants by type
  getRandomPlants(): void {
    this.authService.getRandomPlants().subscribe(
      response => {
        if (response.success) {
          this.plants = response.data;
        }
      },
      error => {
        console.error('Error fetching random plants:', error);
      },
    );
  }
  // Method to trim description to a specific length
  trimDescription(description: string, maxLength: number): string {
    return description.length > maxLength ? description.slice(0, maxLength) + '...' : description;
  }
  //To start counter animation on viewing it 
  observeCounterSection(): void {
    const options = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.5, // Trigger when 50% of the section is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.animateCounters();
          observer.disconnect(); // Stop observing once the animation starts
        }
      });
    }, options);

    // Start observing the section where counters are located
    observer.observe(this.counterSection.nativeElement);
  }

  //Incremental Counter Animation
  animateCounters(): void {
    const counters = document.querySelectorAll('[id^="counter"]');

    counters.forEach((counter) => {
      const target = +(counter as HTMLElement).getAttribute('data-target')!;
      const increment = target / 500; // Control the speed of the increment

      let current = 0;

      const updateCounter = () => {
        if (current < target) {
          current += increment;
          if (current > target) current = target; // Ensure it doesn't exceed the target
          (counter as HTMLElement).innerText = Math.floor(current).toString();

          // Gradually slow down as it approaches the target
          setTimeout(updateCounter, 200 / Math.sqrt(target - current + 1));
        }
      };

      updateCounter();
    });
  }
  //FAQ Section
  faqs = [
    {
      question: 'What is the Herbal Virtual 3D Garden website?',
      answer: 'The Herbal Virtual 3D Garden is an interactive platform where you can explore 3D models of various plants, learn about their medicinal properties, habitats, and uses, and download detailed information about them.',
    },
    {
      question: 'How do I interact with the 3D plant models?',
      answer: 'You can interact with the 3D plant models by clicking on them. You can zoom in, rotate, and examine the plants in detail for a better understanding of their structure.',
    },
    {
      question: 'Is the information about the plants accurate and reliable?',
      answer: 'Yes, the information provided is curated from reliable sources, including scientific research and expert contributions. However, always consult a professional for medical advice.',
    },
    {
      question: 'Can I download plant details from the website?',
      answer: 'Yes, you can download PDFs containing detailed information about each plant, including their medicinal uses, habitats, and chemical compositions.',
    },
    {
      question: 'How can I bookmark plants for future reference?',
      answer: 'You can bookmark plants by clicking the "Bookmark" button on the plant details page. You need to log in to save bookmarks, and they will be available in your profile for future reference.',
    },
    {
      question: 'Can I use the website in multiple languages?',
      answer: 'Yes, the website supports multiple languages. You can select your preferred language, and most of the content (except common and botanical names) will be translated for your convenience.',
    },
    {
      question: 'Is the website free to use?',
      answer: 'Yes, the website is completely free to use. You can explore 3D models, download information, and interact with the platform at no cost.',
    },
  ];
  
  
  
  // Toggle FAQ item by index
  toggleFaq(index: number): void {
    // If clicked FAQ is already open, close it
    if (this.openedFaqIndex === index) {
      this.openedFaqIndex = null;
    } else {
      this.openedFaqIndex = index; // Open the clicked FAQ
    }
  }
}
