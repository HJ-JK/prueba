import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {
  redirectUnauthorizedTo,
  redirectLoggedInTo,
  canActivate,
} from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['home']);

const routes: Routes = [
  { path: '', redirectTo: 'tabs/tab4', pathMatch: 'full' },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./tab3/tab3.module').then(m => m.Tab3PageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'home',
    loadChildren: () => import('./tab2/tab2.module').then(m => m.Tab2PageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'voice',
    loadChildren: () => import('./tab1/tab1.module').then(m => m.Tab1PageModule)
  },
  {
    path: 'studies',
    loadChildren: () => import('./studies/studies.module').then(m => m.StudiesPageModule)
  },
  {
    path: 'studies/:folder',
    loadChildren: () => import('./studies/studies.module').then(m => m.StudiesPageModule)
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'l-studies',
    loadChildren: () => import('./studies/l-studies/l-studies.module').then( m => m.LStudiesPageModule)
  },
  {
    path: 'd-studies',
    loadChildren: () => import('./studies/d-studies/d-studies.module').then( m => m.DStudiesPageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
