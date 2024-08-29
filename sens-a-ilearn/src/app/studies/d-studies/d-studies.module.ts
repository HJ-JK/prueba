import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DStudiesPageRoutingModule } from './d-studies-routing.module';

import { DStudiesPage } from './d-studies.page';

import { HttpClientModule } from '@angular/common/http';
import {FileSelectorComponent} from "./components/file-selector/file-selector.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DStudiesPageRoutingModule,
    HttpClientModule,

  ],
  declarations: [DStudiesPage, FileSelectorComponent]
})
export class DStudiesPageModule {}
