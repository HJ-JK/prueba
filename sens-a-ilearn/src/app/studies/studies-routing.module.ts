import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StudiesPage } from './studies.page';

const routes: Routes = [
  {
    path: '',
    component: StudiesPage
  },
  {
    path: 'l-studies',
    loadChildren: () => import('./l-studies/l-studies.module').then( m => m.LStudiesPageModule)
  },
  {
    path: 'd-studies',
    loadChildren: () => import('./d-studies/d-studies.module').then( m => m.DStudiesPageModule)
  },
  {
    path: ':path',
    pathMatch: 'full',
    component: StudiesPage
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StudiesPageRoutingModule {}
