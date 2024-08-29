import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { Capacitor } from '@capacitor/core';
import { indexedDBLocalPersistence, initializeAuth } from 'firebase/auth';
import { getApp } from 'firebase/app';

import { PreviewAnyFile } from '@ionic-native/preview-any-file/ngx';
import {FileService} from "./file.service";
import {FirestoreService} from "./services/firestore.service";
import { HttpClientModule } from '@angular/common/http'; // Importar HttpClientModule



@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => {
			if (Capacitor.isNativePlatform()) {
				return initializeAuth(getApp(), {
					persistence: indexedDBLocalPersistence
				});
			} else {
				return getAuth();
			}
		}),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    HttpClientModule
  ],
  providers: [
    FileService,
    FirestoreService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
    , PreviewAnyFile
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
