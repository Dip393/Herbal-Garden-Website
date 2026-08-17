import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, model, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { jsPDF } from 'jspdf';
import { catchError, lastValueFrom, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

@Component({
  selector: 'app-plant-details',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, NavbarComponent, FooterComponent, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './plant-details.component.html',
  styleUrl: './plant-details.component.css',
})
export class PlantDetailsComponent {
  plantId: string | null = null;
  plantDetails: any = null;
  plantName: string | null = null;
  data: any = null;
  showModelInLargeView: boolean = false;

  email = localStorage.getItem('email');
  isAdmin = localStorage.getItem('isAdmin');

  showLock: boolean = true;
  is3DModelVisible: boolean = false;

  showEditPopup: boolean = false;
  editablePlantDetails: any = {};

  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);
  private params = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient)

  //Parameters to display images, videos & 3D models in larger view
  largeViewSrc!: SafeResourceUrl;
  proxyUrl!: string;
  largeViewType: string = '';
  showCommentModal: boolean = false;
  commentText: string = '';

  //To shorten plant details
  showMedicinalUses: boolean = false;
  showComposition: boolean = false;
  showUses: boolean = false;
  showCitations: boolean = false;

  //Parameter to share page
  currentPageUrl: string;
  loading: boolean = false;
  isPlantBookmarked: boolean = false;
  //To take notes
  showNotesBtn: boolean = false;
  showPopup: boolean = false;
  notes: any[] = [];
  isNotesLoading: boolean = false;
  currentNote: string = '';
  currentNoteId: string | null = null;

  translatedDetails: any = {};
  isTranslateLoading: boolean = false;
  currentLanguage: string = 'en'; // Default language
  selectedLanguage: string = 'en'; // Selected language for translation
  excludeFields: string[] = ['commonNames', 'botanicalName', 'correspondenceLink'];

  //Map Showing Information
  private map : L.Map | undefined;
  locations = [
    { name: 'Punjab', lat: 30.7333, lng: 76.7794 },
    { name: 'West Bengal', lat: 22.5726, lng: 88.3639 },
    { name: 'Gujarat', lat: 22.2587, lng: 71.1924 },
  ];

  isModel: boolean = true;

  constructor(private route: ActivatedRoute) {
    this.currentPageUrl = `${window.location.origin}${this.router.url}`;
  }
  ngOnInit(): void {
    this.plantId = this.params.snapshot.paramMap.get('id');
    if (this.plantId) {
      this.fetchPlantDetails(this.plantId);
    }
    this.showNotesButton();
    if (this.email) {
      this.showLock = false;
    }
    this.editablePlantDetails = { ...this.plantDetails };
    this.initMap();
  }
  openEditForm(): void {
    // Open the popup form and copy the current plant details to an editable object
    this.showEditPopup = true;
    this.editablePlantDetails = { ...this.plantDetails };
  }
  showModelPopup(){
    this.is3DModelVisible = true;
    this.proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  }
  close3DPopup(){
    this.is3DModelVisible = false;
  }
  private initMap(): void {
    // Initialize the map after the view is loaded
    this.map = L.map('map').setView([22.9868, 87.855], 5); // Center on India

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    // Add markers
    this.locations.forEach((location) => {
      L.marker([location.lat, location.lng])
        .addTo(this.map!)
        .bindPopup(`<b>${location.name}</b>`);
    });
  }
  openFullMap(): void {
    const query = this.locations
      .map((loc) => `${loc.lat},${loc.lng}`)
      .join('/');
    window.open(
      `https://www.openstreetmap.org/?mlat=${this.locations[0].lat}&mlon=${this.locations[0].lng}&zoom=5#map=5/${query}`,
      '_blank'
    );
  }
  saveChanges(): void {
    const updatedDetails = this.editablePlantDetails;
    this.loading = true;
    if(this.plantId){
      this.authService.updatePlantDetails(this.plantId, updatedDetails).subscribe({
        next: () => {
          this.plantDetails = { ...this.editablePlantDetails }; // Update local data
          this.showEditPopup = false;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          alert('Failed to update plant details.');
        }
      });
    }
  }

  discardChanges(): void {
    // Close the popup without saving changes
    this.showEditPopup = false;
  }
  addItem(array: any[]) {
    if (Array.isArray(array)) {
      array.push(''); // Adds a new empty item
    }
  }

  removeItem(array: any[], index: number) {
    if (Array.isArray(array) && index >= 0 && index < array.length) {
      array.splice(index, 1); // Removes the specific item
    }
  }

  fetchPlantDetails(plantId: string): void {
    this.authService.loadPlantDetails(plantId).subscribe({
      next: (data) => {
        this.plantDetails = data;
        this.largeViewSrc = this.plantDetails.model;
        this.largeViewType = '3dmodel';
        this.authService.plantView(plantId).subscribe(
          (res) =>{
            console.log('');
          }
        )
        this.plantName = this.plantDetails.commonNames[0];

        if (this.email) {
          this.loadNotes();
        }

        const email = localStorage.getItem('email');
        if (email) {
          this.authService.isBookmarked(this.plantDetails._id, email).subscribe(
            (res) => {
              // Extract boolean from response object
              this.isPlantBookmarked = res?.isBookmarked || false;
              // console.log(`Bookmark status: ${this.isPlantBookmarked}`);
            },
            (err) => {
              // console.error('Error checking bookmark status:', err);
              this.isPlantBookmarked = false; // Default to false in case of error
            }
          );

        }
      },
      error: (err) => console.error('Error fetching plant details:', err),
    });
  }
  translateContent(): void {
    if (this.currentLanguage === this.selectedLanguage) {
      alert('Content is already in the selected language.');
      return;
    }

    this.isTranslateLoading = true;

    const payload = {
      plantDetails: this.plantDetails, // Send the entire object
      from_code: this.currentLanguage,
      to_code: this.selectedLanguage
    };

    this.http.post('http://127.0.0.1:9000/translate', payload).subscribe({
      next: (response: any) => {
        if (response.translatedDetails) {
          this.translatedDetails = response.translatedDetails; // Use translated content
          this.currentLanguage = this.selectedLanguage;
          this.isTranslateLoading = false;
        } else {
          alert('Translation service returned no content.');
          this.isTranslateLoading = false;
        }
      },
      error: (err) => {
        console.error('Error during translation:', err);
        alert('Translation failed. Please try again.');
        this.isTranslateLoading = false;
      }
    });
  }

  goToBookmarks() {
    this.router.navigate(['/bookmarks']); // Redirect to bookmarks page
  }
  toggleMedicinalUses() {
    this.showMedicinalUses = !this.showMedicinalUses;
  }
  toggleComposition(){
    this.showComposition = !this.showComposition;
  }
  toggleUses() {
    this.showUses =!this.showUses;
  }
  toggleCitations() {
    this.showCitations = !this.showCitations;
  }
  sanitizeUrl(url: string): SafeResourceUrl {
    // Return sanitized URL for non-YouTube videos
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  showInLargeView(src: string, type: string) {
    if(type === 'video' || type === 'image'){
      this.isModel = false;
    }
    else{
      this.isModel = true;
    }
    if(type === 'video'){
      this.largeViewSrc = this.sanitizeUrl(src);
      console.log(this.largeViewSrc);
      this.largeViewType = type;
      return;
    }
    this.largeViewSrc = src;
    this.largeViewType = type;
  }

  toggleCommentModal() {
    this.showCommentModal = !this.showCommentModal;
  }

  submitComment() {
    console.log('Comment submitted:', this.commentText);
    this.showCommentModal = false;
  }


  // Add the plant to bookmarks
  bookmarkPlant(plantId: string): void {
    const email = localStorage.getItem('email');
    if (!email) {
      // Redirect to login if not logged in
      this.router.navigate(['/login']);
      return;
    }

    this.loading = true; // Show spinner
    this.authService.addToBookmarks(plantId, email).subscribe(
      (res) => {
        window.location.reload();
      },
      (err) => {
        this.loading = false;
      }
    );
  }

  downloadPDF(): void {
    if(!this.email){
      // Redirect to login if not logged in
      this.router.navigate(['/login']);
      return;
    }
    if (!this.plantDetails) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    let yPosition = margin + 10;

    // Add Image
    if (this.plantDetails.images && this.plantDetails.images.length > 0) {
      const imageUrl = this.plantDetails.images[0];
      const imgWidth = 80; // Fixed image width
      const imgHeight = 60; // Fixed image height
      if (yPosition + imgHeight + margin > pageHeight) {
        doc.addPage(); // Add a new page if not enough space
        yPosition = margin;
      }
      doc.addImage(imageUrl, 'JPEG', margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(this.plantDetails.botanicalName, margin, yPosition);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    // Common Names
    const commonNames = `Common Names: ${this.plantDetails.commonNames.join(', ')}`;
    yPosition = this.addWrappedText(doc, commonNames, margin, yPosition, pageWidth - margin * 2);

    // Family
    const family = `Family: ${this.plantDetails.family}`;
    yPosition = this.addWrappedText(doc, family, margin, yPosition, pageWidth - margin * 2);

    // Description
    yPosition = this.addWrappedText(doc, 'Description:', margin, yPosition, pageWidth - margin * 2, true);
    yPosition = this.addWrappedText(doc, this.plantDetails.description, margin, yPosition, pageWidth - margin * 2);

    // Medicinal Uses
    yPosition = this.addWrappedText(doc, 'Medicinal Uses:', margin, yPosition, pageWidth - margin * 2, true);
    this.plantDetails.medicinalUses.forEach((use: string, index: number) => {
      yPosition = this.addWrappedText(doc, `- ${use}`, margin + 5, yPosition, pageWidth - margin * 2);
    });

    // Composition
    yPosition = this.addWrappedText(doc, 'Chemical Composition:', margin, yPosition, pageWidth - margin * 2, true);
    yPosition = this.addWrappedText(doc, this.plantDetails.composition, margin, yPosition, pageWidth - margin * 2);

    //Usage Procedure
    yPosition = this.addWrappedText(doc, 'Usage Procedure:', margin, yPosition, pageWidth - margin * 2, true);
    this.plantDetails.usageProcedure.forEach((use: string, index: number) => {
      yPosition = this.addWrappedText(doc, `- ${use}`, margin + 5, yPosition, pageWidth - margin * 2);
    });

    // Save the PDF
    doc.save(`${this.plantDetails.botanicalName}.pdf`);
  }

  // Helper Function to Add Wrapped Text with Automatic Page Breaks
  addWrappedText(
    doc: jsPDF,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    isBold: boolean = false
  ): number {
    const pageHeight = doc.internal.pageSize.getHeight();
    const lineHeight = 10; // Adjust based on font size
    const lines = doc.splitTextToSize(text, maxWidth);

    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }

    lines.forEach((line: string | string[]) => {
      if (y + lineHeight > pageHeight - 10) {
        doc.addPage(); // Add new page if text overflows
        y = 10;
      }
      doc.text(line, x, y);
      y += lineHeight;
    });

    return y;
  }


  sharePage() {
    if (navigator.share) {
      // Use Web Share API
      navigator.share({
        title: 'Check out this plant!',
        text: 'Here is a detailed view of the plant.',
        url: this.currentPageUrl,
      })
      .then(() => console.log('Successfully shared'))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(this.currentPageUrl)
        .then(() => alert('Link copied to clipboard!'))
        .catch((error) => console.error('Error copying link:', error));
    }
  }

  loadNotes(): void {
    if (!this.email || !this.plantName) {
      console.log('Cannot load notes:', { email: this.email, plantName: this.plantName });
      return;
    }

    this.isNotesLoading = true;

    this.authService.getNotes(this.email).subscribe({
      next: (res) => {
        console.log('ALL NOTES FROM BACKEND:', res);
        this.notes = Array.isArray(res) ? res : [];

        const plantNote = this.notes.find((note: any) => note.plantName === this.plantName);

        if (plantNote) {
          this.currentNote = plantNote.content || '';
          this.currentNoteId = plantNote._id || null;
          console.log('CURRENT PLANT NOTE:', plantNote);
        } else {
          this.currentNote = '';
          this.currentNoteId = null;
          console.log('No note found for:', this.plantName);
        }
        this.isNotesLoading = false;
      },
      error: (err) => {
        console.error('Error loading notes:', err);
        this.notes = [];
        this.currentNote = '';
        this.currentNoteId = null;
        this.isNotesLoading = false;
      }
    });
  }


  showNotesButton(){
    if(this.email){
      this.showNotesBtn = true;
    }
  }
  //To show notes popup
  showPopupNote(): void {
    console.log('Opening notes popup');
    console.log('Current plant:', this.plantName);
    console.log('Current note:', this.currentNote);
    this.showPopup = true;
  }
  //To close notes popup
  closeNotesPopup() {
    this.showPopup = false;
  }
  //To add notes
  addNote(note: string): void {
    if (!note.trim()) {
      alert('Please enter a note');
      return;
    }

    if (!this.email || !this.plantName) {
      alert('Please login first.');
      return;
    }

    this.loading = true;

    this.authService.addNote(
      this.email,
      note.trim(),
      this.plantName
    ).subscribe({
      next: (res) => {
        this.loading = false;

        console.log('Note added:', res);
        this.currentNote = note.trim();
        this.closeNotesPopup();

        // ⭐ Refresh notes from MongoDB
        this.loadNotes();
      },

      error: (err) => {
        this.loading = false;

        console.error('Error adding note:', err);

        alert(
          'Error adding note: ' +
          (err?.error?.error || err?.message || 'Unknown error')
        );
      }
    });
  }
}
