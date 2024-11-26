import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, model, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { jsPDF } from 'jspdf';
import { catchError, lastValueFrom, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-plant-details',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './plant-details.component.html',
  styleUrl: './plant-details.component.css',
})
export class PlantDetailsComponent {
  plantId: string | null = null;
  plantDetails: any = null;
  data: any = null;
  email : string | null = null;

  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);
  private params = inject(ActivatedRoute);
  private router = inject(Router);

  largeViewSrc!: SafeResourceUrl;
  largeViewType: string = '';
  showCommentModal: boolean = false;
  commentText: string = '';

  showMedicinalUses: boolean = false;
  showComposition: boolean = false;
  showUses: boolean = false;

  currentPageUrl: string;
  loading: boolean = false;
  isPlantBookmarked: boolean = false;
  selectedLanguage = 'en';

  private http = inject(HttpClient)
  constructor(private route: ActivatedRoute) {
    this.currentPageUrl = `${window.location.origin}${this.router.url}`;
  }
  ngOnInit(): void {
    this.plantId = this.params.snapshot.paramMap.get('id');
    if (this.plantId) {
      this.fetchPlantDetails(this.plantId);
    }
  }

  fetchPlantDetails(plantId: string): void {
    this.authService.loadPlantDetails(plantId).subscribe({
      next: (data) => {
        this.plantDetails = data;
        this.largeViewSrc = this.plantDetails.model;
        this.largeViewType = '3dmodel';
  
        const email = localStorage.getItem('email');
        if (email) {
          this.authService.isBookmarked(this.plantDetails._id, email).subscribe(
            (res) => {
              // Extract boolean from response object
              this.isPlantBookmarked = res?.isBookmarked || false;
              console.log(`Bookmark status: ${this.isPlantBookmarked}`);
            },
            (err) => {
              console.error('Error checking bookmark status:', err);
              this.isPlantBookmarked = false; // Default to false in case of error
            }
          );
        }
      },
      error: (err) => console.error('Error fetching plant details:', err),
    });
  }
  
  
  onLanguageChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedLanguage = target.value;

    // Translate the fields
    this.translateContent();
  }

  async translateContent() {
    this.loading = true;
  
    const fieldsToTranslate = [
      { field: 'family', value: this.plantDetails.family },
      { field: 'description', value: this.plantDetails.description },
      { field: 'region', value: this.plantDetails.region },
      { field: 'composition', value: this.plantDetails.composition.join(', ') },
      { field: 'usageProcedure', value: this.plantDetails.usageProcedure.join(', ') },
      { field: 'precautions', value: this.plantDetails.precautions },
    ];
  
    try {
      const translationRequests = fieldsToTranslate.map((field) =>
        lastValueFrom(this.authService.translateText(field.value, this.selectedLanguage))
      );
  
      const responses = await Promise.all(translationRequests);
  
      fieldsToTranslate.forEach((field, index) => {
        this.plantDetails[field.field] = responses[index].translations[0].translatedText;
      });
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      this.loading = false;
    }
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

  sanitizeUrl(url: string): SafeResourceUrl { 
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  
  showInLargeView(src: string, type: string) {
    if(type === 'video'){
      this.largeViewSrc = this.sanitizeUrl(src); 
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
    if (!this.plantDetails) return;

    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(this.plantDetails.botanicalName, 10, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Common Names: ${this.plantDetails.commonNames.join(', ')}`, 10, 30);
    doc.text(`Family: ${this.plantDetails.family}`, 10, 40);
    doc.text('Description:', 10, 50);
    doc.text(this.plantDetails.description, 10, 60, { maxWidth: 180 });

    doc.text('Medicinal Uses:', 10, 90, { maxWidth: 180 });
    this.plantDetails.medicinalUses.forEach((use: string, index: number) => {
      doc.text(`- ${use}`, 15, 100 + index * 10);
    });

    doc.save(`${this.plantDetails.botanicalName}.pdf`);
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
}
