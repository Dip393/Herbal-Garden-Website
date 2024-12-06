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
  email = localStorage.getItem('email');
  showLock: boolean = true;

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

  translatedDetails: any = {};
  currentLanguage: string = 'en'; // Default language
  selectedLanguage: string = 'en'; // Selected language for translation
  excludeFields: string[] = ['commonNames', 'botanicalName', 'correspondenceLink'];

  constructor(private route: ActivatedRoute) {
    this.currentPageUrl = `${window.location.origin}${this.router.url}`;
  }
  ngOnInit(): void {
    this.plantId = this.params.snapshot.paramMap.get('id');
    if (this.plantId) {
      this.fetchPlantDetails(this.plantId);
    }
    this.showNotesButton();
    if(this.email){
      this.showLock = false;
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

    this.loading = true;

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
          this.loading = false;
        } else {
          alert('Translation service returned no content.');
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error during translation:', err);
        alert('Translation failed. Please try again.');
        this.loading = false;
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
  showNotesButton(){
    if(this.email){
      this.showNotesBtn = true;
    }
  }
  //To show notes popup
  showPopupNote() {
    this.showPopup = true;
  }
  //To close notes popup
  closeNotesPopup() {
    this.showPopup = false;
  }
  //To add notes
  addNote(note: string){
    this.loading = true;
    if(note.trim() && this.email && this.plantName){
      this.authService.addNote(this.email, note, this.plantName).subscribe(
        (res) => {
          this.loading = false;
          this.closeNotesPopup();
        },
        (err) => {
          this.loading = false;
          alert('Error adding note:'+ err);
        }
      );
    } else {
      alert('Please enter a note');
    }
  }
}
