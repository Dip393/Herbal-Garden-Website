import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'https://herbal-garden-backend-d1uu.onrender.com/api/routes';
  // private apiUrl = 'http://localhost:3000/api/routes';
  // private apiUrl = 'https://herbalbackend.onrender.com/api/routes';
  constructor(private http: HttpClient) {}
  //Add Plant Details
  addPlantDetails(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-plants`, data);
  }
  // Send contact form
  sendContactForm(formValues: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/contact-form`, formValues);
  }
  // Signup form
  signup(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, data);
  }
  // Login form
  login(data: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, data);
  }
  logout(email: string) {
    return this.http.post<any>(`${this.apiUrl}/logout`, { email });
  }
  // Forgot password - Step 1: Send OTP
  sendOtp(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, { email });
  }
  // Forgot password - Step 2: Verify OTP
  verifyForgotPasswordOtp(email: string, otp: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verify-forgotp-otp`, { email, otp });
  }
  // Forgot password - Step 3: Reset Password
  resetPassword(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reset-password`, { email, password });
  }
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token'); // Check if token exists in localStorage
  }
  getUserName(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/getUserName`, { email });
  }
  // Verify Secret Key
  verifySecretKey(secretKey: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verifySecretKey`, { secretKey });
  }
  // Verify Admin OTP
  verifyAdminOtp(otp: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/verifyAdminOtp`, { otp });
  }
  //Check User Type
  userType(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user-type`, { email });
  }
  //Get Random Plants
  getRandomPlants(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/randomPlants`);
  }
  //Search plant
  searchPlants(field: string, query: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/search`, { query, field });
  }
  //Search plant with image
  searchPlantsWithImage(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/search-by-image`, { data });
  }
  //Load plant detaiis
  loadPlantDetails(plantId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/plants/${plantId}`);
  }
  //Add to Bookmarks
  addToBookmarks(plantId: string, email: string): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/add-bookmark`,{plantId, email});
  }
  // Check if bookmarked
  isBookmarked(plantId: string, email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/isBookmarked`,{plantId, email});
  }
  //Get List of all booksmarked plants
  getBookmarkedPlants(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookmarked-plants`,{email});
  }
  //Delete bookmark
  deleteBookmark(plantId: string, email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/remove-bookmark`,{plantId, email});
  }
  //Clicked/Viewed Plant
  clickedPlant(plantId: string, email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/viewed-plants`,{plantId, email});
  }
  //View Last five accessed plants
  getLastFiveAccessedPlants(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/accessViewedPlants`,{email});
  }
  //Add new note to database
  addNote(email: string, note: string, plantName: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-note`,{email, note, plantName});
  }
  //Fetch Saved Notes
  getNotes(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/get-notes`,{email});
  }
  //Delete Note
  deleteNote(noteId: string, email:string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/delete-note`,{ email, noteId});
  }
  //To Edit Note
  editNote(noteId: string, updatedContent: string, email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/edit-note`,{email, noteId, updatedContent});
  }
  //Update Plant Views
  plantView(plantId: string){
    return this.http.post<any>(`${this.apiUrl}/plant-view`,{plantId});
  }
  //Get Most Viewed Plant
  getMostViewedPlant(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/most-viewed-plant`);
  }
  //For chatbot only
  generateResponse(prompt: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/chatbot`, { prompt });
  }
  //To fetch plant for AYUSH categories
  getPlantByCategory(ayushCategory: string, page: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/plant-by-ayush-category`, { ayushCategory, page });
  }
  //To give review for logged in user
  giveReview(email: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/give-review/login`, { email, ...data });
  }
    //To give review for not logged in user
  giveReviewNotLogin(userName: string, rating: number, comment: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/give-review/not-login`, { userName, rating, comment });
  }
  //Advanced search
  advancedSearch(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/advanced-search`, data);
  }
  //To edit plant details
  updatePlantDetails(plantId: string, updatedDetails: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/plants/${plantId}`, { ...updatedDetails });
  }
}

