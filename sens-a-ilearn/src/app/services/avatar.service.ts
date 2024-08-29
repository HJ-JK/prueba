import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage } from '@angular/fire/storage';
import { Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { uploadString } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private storage: Storage
  ) { }

  // Método para obtener el perfil del usuario actual
  getUserProfile(){
    const user = this.auth.currentUser  // Obtiene el usuario actual autenticado
    const userDocRef = doc(this.firestore, `users/${user?.uid}`); // Referencia al documento del usuario en Firestore
    return docData(userDocRef) // Retorna un observable con los datos del documento
  }

  // Método para subir una imagen y actualizar el perfil del usuario
  async uploadImage(cameraFile: Photo){
    const user = this.auth.currentUser; 
    const path = `uploads/${user?.uid}/profile.png`; 
    const storageRef = ref(this.storage, path); // Referencia al lugar de almacenamiento en Firebase

    try {
      // Sube la imagen en formato base64 a Firebase Storage
      await uploadString(storageRef, cameraFile.base64String!, 'base64');
      // Obtiene la URL de descarga de la imagen subida
      const imageUrl = await getDownloadURL(storageRef);
      // Actualiza el documento del usuario en Firestore con la URL de la imagenx
      const userDocRef = doc(this.firestore, `users/${user?.uid}`);
      await setDoc(userDocRef, {
        imageUrl,
      });
      return true;

    }catch(e) {
      return null;
    } 
  }



}



