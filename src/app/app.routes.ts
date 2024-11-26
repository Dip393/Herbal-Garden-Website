import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';
import { UserComponent } from './user/user.component';
import { LoginComponent } from './login/login.component';
import { PlantDetailsComponent } from './plant-details/plant-details.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { SignupComponent } from './signup/signup.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { BookmarksComponent } from './bookmarks/bookmarks.component';
import { OpenGuard } from './guards/open.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
    { path: 'user', component: UserComponent},
    { path: 'plant-details/:id', component: PlantDetailsComponent },
    { path: 'login', component: LoginComponent, canActivate: [AuthGuard]},
    { path: 'signup', component: SignupComponent, canActivate:[AuthGuard]},
    { path: 'bookmarks', component: BookmarksComponent, canActivate:[OpenGuard] },
    { path: 'privacy', component: PrivacyPolicyComponent}
];
