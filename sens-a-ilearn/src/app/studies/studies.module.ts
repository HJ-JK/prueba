import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StudiesPageRoutingModule } from './studies-routing.module';

import { StudiesPage } from './studies.page';

import { HttpClientModule } from '@angular/common/http';

import { TextGenerationComponent } from './components/text-generation/text-generation.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StudiesPageRoutingModule,
    HttpClientModule
  ],
  declarations: [
    StudiesPage,
    TextGenerationComponent
  ]
})
export class StudiesPageModule {}
