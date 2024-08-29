import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../../environments/environment';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage) { }

  // 初始化Firebase
  static initializeFirebase() {
    AngularFireModule.initializeApp(environment.firebaseConfig);
  }

  createDoc() {
    this.firestore.collection('Estudiantes');
  }

  getCollection() {
    this.firestore.collection('Estudiantes').valueChanges().subscribe((res) => {
      console.log('res ->', res);
    });
  }

  uploadFile(file: File, folderPath: string) {
    const filePath = `${folderPath}/${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(url => {
          this.firestore.collection(folderPath).add({ name: file.name, url: url });
        });
      })
    ).subscribe();
  }

  createFolder(folderPath: string) {
    this.firestore.collection(folderPath).add({ created: new Date() }).then(() => {
      console.log(`Folder '${folderPath}' created successfully`);
    }).catch(error => {
      console.error("Error creating folder: ", error);
    });
  }
}
