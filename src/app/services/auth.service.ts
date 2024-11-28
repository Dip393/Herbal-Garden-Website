import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/routes';
  constructor(private http: HttpClient) {}

  sendContactForm(formValues: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/contact-form`, formValues);
  }


  signup(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signup`, data);
  }

  login(data: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, data);
  }
  
  verifyLoginOtp(data: any) {
    return this.http.post<any>(`${this.apiUrl}/verify-login-otp`, data);
  }  

  verifyOtp(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, data);
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
  translateText(text: string, toLang: string): Observable<any> {
    return this.http.post('https://translate.argosopentech.com/translate', {
      text,
      from_lang: 'en',
      to_lang: toLang
    });
  }
}

