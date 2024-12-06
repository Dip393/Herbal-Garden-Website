import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

import { AdminComponent } from './admin/admin.component';
import { UserComponent } from './user/user.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';

import { PlantDetailsComponent } from './plant-details/plant-details.component';
import { BookmarksComponent } from './bookmarks/bookmarks.component';
import { AyurvedaComponent } from './ayurveda/ayurveda.component';
import { NaturopathyComponent } from './naturopathy/naturopathy.component';
import { UnaniComponent } from './unani/unani.component';
import { SiddhaComponent } from './siddha/siddha.component';
import { HomeopathyComponent } from './homeopathy/homeopathy.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { OpenGuard } from './guards/open.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
    { path: 'user', component: UserComponent},
    { path: 'plant-details/:id', component: PlantDetailsComponent },
    { path: 'login', component: LoginComponent, canActivate: [AuthGuard]},
    { path: 'signup', component: SignupComponent, canActivate:[AuthGuard]},
    { path: 'bookmarks', component: BookmarksComponent, canActivate:[OpenGuard] },
    { path: 'privacy', component: PrivacyPolicyComponent},
    { path: 'ayurveda', component: AyurvedaComponent },
    { path: 'naturopathy', component: NaturopathyComponent },
    { path: 'unani', component: UnaniComponent },
    { path: 'siddha', component: SiddhaComponent },
    { path: 'homeopathy', component: HomeopathyComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent, canActivate:[AuthGuard]},
    { path: '**', redirectTo: '' }
];
