import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LStudiesPageRoutingModule } from './l-studies-routing.module';

import { LStudiesPage } from './l-studies.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LStudiesPageRoutingModule
  ],
  declarations: [LStudiesPage]
})
export class LStudiesPageModule {}
