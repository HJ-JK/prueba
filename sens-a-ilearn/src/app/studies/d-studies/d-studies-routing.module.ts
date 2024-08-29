import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DStudiesPage } from './d-studies.page';

const routes: Routes = [
  {
    path: '',
    component: DStudiesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DStudiesPageRoutingModule {}
