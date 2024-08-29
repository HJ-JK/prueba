import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LStudiesPage } from './l-studies.page';

const routes: Routes = [
  {
    path: '',
    component: LStudiesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LStudiesPageRoutingModule {}
