import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, viewChild, ViewChild } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgIf, NgFor } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import * as AOS from 'aos';

Chart.register(...registerables);
declare var webkitSpeechRecognition: any; // Declare the SpeechRecognition API

import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, HttpClientModule, NgIf, NgFor, ReactiveFormsModule, FormsModule, RouterLink],
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
  isListening: boolean = false; // Flag for visual feedback
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

  //Gallery information
  currentIndex = 0;
  intervalId: any;
  loopedPlants: any[] = [];
  @ViewChild('slider', { static: true }) slider!: ElementRef;

  openedFaqIndex: number | null = null;
  isModalOpen: boolean = false;

  //For review section
  isReviewSubmitted: boolean = false;
  reviewForm!: FormGroup;
  isReviewed: boolean = localStorage.getItem('isReviewed') === 'true';
  email = localStorage.getItem('email');

  private router = inject(Router)

  plantcategory=[
    {name: 'Ayurveda',image: 'ayurveda.png', component: 'ayurveda'},
    {name: 'Yoga & Naturopathy', image: 'yoga.png', component: 'naturopathy'},
    {name: 'Unani', image: 'unani.png', component: 'unani'},
    {name: 'Siddha', image:'siddha.png', component: 'siddha'},
    {name:'Homeopathy', image:'homeopathy.png', component: 'homeopathy'},
  ];

  models=[
    {model: 'tulsi.glb', id:'1'},
    {model: 'Turmeric.glb', id:'2'},
    {model: 'Senna.glb', id:'3'},
    {model: 'pepperMint.glb', id:'4'},
  ]
  currentModelIndex: number = 0; // Index of the currently displayed model

  //For bar charts
  chart: any;
  ratings: any;

  //Advanced search options
  searchForm!: FormGroup;
  advancedSearchResults: any[] = [];
  showAdvancedResults: boolean = false;

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
    this.reviewForm = this.fb.group({
      userName: ['', Validators.required],
      rating: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', Validators.required],
    });
    this.searchForm = this.fb.group({
      category: [''],
      region: [''],
      plantType: ['']
    });
  }

  public config: any = {
    type: 'bar',
    data: {
      labels: ['Ayurveda', 'Yoga & Naturopathy', 'Unani', 'Siddha', 'Homeopathy'],
      datasets: [
        {
          data: [40, 80, 50, 40, 50, 100],
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, '#71B280'); // Light green
            gradient.addColorStop(1, '#005C50'); // Dark green
            return gradient;
          },
          borderWidth: 1,
          borderColor: '#001e19',
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
          labels: {
            font: {
              size: 14,
            },
          },
        },
        title: {
          display: true,
          text: 'Comparison of Ayush Categories',
          font: {
            size: 18,
            weight: 'bold',
          },
          padding: {
            top: 10,
            bottom: 20,
          },
          color: '#333', // Title text color
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'AYUSH Categories',
            font: {
              size: 16,
              weight: 'bold',
            },
            color: '#333', // X-axis label color
          },
          ticks: {
            font: {
              size: 14,
              weight: 'bold',
            },
          },
          grid: {
            display: false, // Remove gridlines
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Percentage Of plants used',
            font: {
              size: 16,
              weight: 'bold',
            },
            color: '#333', // Y-axis label color
          },
          ticks: {
            font: {
              size: 14,
              weight: 'bold',
            },
          },
          grid: {
            display: false, // Remove gridlines
          },
        },
      },
      elements: {
        bar: {
          borderRadius: 8, // Rounded corners
          barPercentage: 0.9, // Adjust bar thickness
        },
      },
      responsive: true,
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
          grid:{
            display: false, // Remove gridlines
          },
          beginAtZero: true, // Start X-axis from 0
          ticks: {
            color: '#000', // X-axis label color
          },
        },
        y: {
          grid:{
            display: false, // Remove gridlines
          },
          ticks: {
            color: '#000', // Y-axis label color
          },
        },
      },
    },
  };


  ngOnInit(){
    this.getRandomPlants(); // Get random plants details
    this.loopedPlants = [...this.plants, ...this.plants];
    this.startModelRotation();
    AOS.init({
      duration: 1300, // Animation duration in milliseconds
      delay: 350, // Delay before animation starts in milliseconds
    });
  }
  ngAfterViewInit(): void {
    this.typeEffect(); // Start typing on initialization
    // Ensure the view is initialized before accessing counterSection
    this.observeCounterSection();
    this.chart = new Chart('MyChart', this.config);
    this.intervalId = setInterval(() => {
      this.nextImage();
    }, 3000); // Change image every 3 seconds
    // Initialize the chart
    this.ratings = new Chart('RatingChart', this.ratingconfig);
  }
  goToSection(section: string) {
    this.router.navigate(['/']).then(() => {
      const gallerySection = document.getElementById(section);
      if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
  ngOnDestroy() {
    // Clear interval when the component is destroyed
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  //Advanced Search function
  performSearch() {
    const formData = this.searchForm.value;
    if(this.searchForm.value.category === '' && this.searchForm.value.region === '' && this.searchForm.value.plantType === ''){
      return;
    }
    this.isLoading = true;
    // Make API call to backend
    this.authService.advancedSearch(formData).subscribe(
      (response: any) => {
        this.advancedSearchResults = response; // Bind results
        this.isLoading = false;
        this.showAdvancedResults = true;
      },
      (error) => {
        this.isLoading = false;
        this.showAdvancedResults = true;
        console.error('Error fetching search results:', error);
      }
    );
  }
  //Review Section
  giverReview() {
    if (!this.isReviewed) {
      this.isReviewSubmitted = true;
    } else {
      alert('You have already submitted a review.');
    }
  }

  closeReview() {
    this.isReviewSubmitted = false;
    this.reviewForm.reset();
  }

  submitReview() {
    if (this.reviewForm.valid) {
      const formValues = this.reviewForm.value;
      if (this.email) {
        // Logged-in user
        this.authService.giveReview(this.email, formValues).subscribe(
          (response) => {
            alert(response.message);
            this.isReviewSubmitted = false;
            localStorage.setItem('isReviewed', 'true');
          },
          (error) => {
            alert(error.error.message);
          }
        );
      } else {
        // Non-logged-in user
        this.authService.giveReviewNotLogin(formValues.userName, formValues.rating, formValues.comment).subscribe(
          (response) => {
            alert(response.message);
            this.isReviewSubmitted = false;
            localStorage.setItem('isReviewed', 'true');
          },
          (error) => {
            alert(error.error.message);
          }
        );
      }
    }
  }
  //3D model rotation
  startModelRotation(): void {
    this.intervalId = setInterval(() => {
      this.currentModelIndex = (this.currentModelIndex + 1) % this.models.length;
    }, 10000); // Change every 5 seconds
  }
  get currentModel(): string {
    return this.models[this.currentModelIndex].model;
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
  //To clear search input
  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
  }
  //Add voice based searching
  startVoiceSearch() {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser.');
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    // Show the "Listening" indicator
    this.isListening = true;

    recognition.start();

    recognition.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript;
      console.log('Voice Input:', spokenText);
      this.searchQuery = spokenText;
      this.searchPlants();
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false; // Stop listening on error
    };

    recognition.onend = () => {
      console.log('Speech recognition stopped.');
      this.isListening = false; // Stop listening after input
    };
  }
  //Image Based Recognition
  openImageUploader() {
    const fileInput = document.querySelector<HTMLInputElement>('#fileInput');
    fileInput?.click();
  }

  async onImageUpload(event: any) {
    const file = event.target.files[0]; // Get the first selected file
    if (!file) {
      console.error('No file selected.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file); // 'file' should match the key expected by the Flask backend

    this.isLoading = true; // Show the loader
    try {
      // Make the HTTP POST request to the Flask backend
      const response: any = await this.http.post('http://127.0.0.1:5000/predict/', formData).toPromise();

      if (response && response.plant_name) {
        this.searchQuery = response.plant_name; // Update the search query with the plant name
        this.searchPlants(); // Trigger the plant search with the updated query
      } else {
        console.error('Plant identification failed:', response?.error || 'Unknown error.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      this.isLoading = false; // Hide the loader
    }
  }



  //To get the matching fields
  getMatchingFields(plant: any): { key: string; value: string }[] {
    return plant.matchingFields || [];
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
  // Scroll the slider in the desired direction
  scrollSlider(direction: string): void {
    const slider = document.querySelector('.slider-wrapper') as HTMLElement;
    const scrollAmount = 300; // Amount to scroll per click

    if (direction === 'next') {
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    } else if (direction === 'prev') {
      slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }

  // Method to trim description to a specific length
  trimDescription(description: string, maxLength: number): string {
    return description.length > maxLength ? description.slice(0, maxLength) + '...' : description;
  }
  //Open Plant Details
  openPlantDetails(plantId: string) {
    if(this.email){
      this.authService.clickedPlant(plantId, this.email).subscribe(
        res => {
          console.log('Plant clicked:');
        },
        error =>{
          console.error('Error sending click event:', error);
        }
      );
    }
    this.router.navigate([`/plant-details/${plantId}`]);
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
  //Gallery Section
  galleryImages = [
    {link: 'https://www.housedigest.com/img/gallery/15-trees-with-medicinal-properties-you-can-grow-in-your-yard/l-intro-1667174157.jpg'},
    {link: 'https://th.bing.com/th/id/OIP.RSdTzQ9M4zN3pzV5gDlY_AHaE7?rs=1&pid=ImgDetMain'},
    {link: 'https://th.bing.com/th/id/OIP.azMlbf2Vzmhnuuz8S0ecTAHaE7?w=1280&h=853&rs=1&pid=ImgDetMain'},
    {link: 'https://th.bing.com/th/id/OIP.yIKV9CvRKwbwNpIb-TDYGQHaEA?w=1024&h=555&rs=1&pid=ImgDetMain'},
    {link: 'https://th.bing.com/th/id/R.40eb17898c2004f3fdd0d56524b61e3e?rik=yv00QsxbntZWAw&riu=http%3a%2f%2fnutralfa.uk%2fwp-content%2fuploads%2f2018%2f09%2fherbs_292843331.jpg&ehk=zShtSQ1p%2fek3OSXhFTcKGW3Dz2oBtuwxFO%2fNfduEKDU%3d&risl=&pid=ImgRaw&r=0'},
    {link: 'https://en.amerikanki.com/wp-content/uploads/2021/05/Try-herbs-1920x1280.jpg'},
    {link: 'https://th.bing.com/th/id/OIP.jUokUJJX1CwPbgaLltdC3QHaC5?w=626&h=245&rs=1&pid=ImgDetMain'}
  ];
  //To move to previous image
  prevImage() {
    // Remove the last image from the array and add it to the beginning
    const lastImage = this.galleryImages.pop();
    if (lastImage) {
      this.galleryImages.unshift(lastImage);
    }
  }
  //To move to the next image
  nextImage() {
    // Remove the first image from the array and add it to the end
    const firstImage = this.galleryImages.shift();
    if (firstImage) {
      this.galleryImages.push(firstImage);
    }
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
