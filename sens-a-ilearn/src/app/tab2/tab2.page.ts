import { Component} from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { AvatarService } from '../services/avatar.service';
import { DocumentData } from '@angular/fire/firestore';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  profile: DocumentData | null = null; // Almacena los datos del perfil del usuario

  constructor(
    private avatarService: AvatarService,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) {
    // Suscripción a los datos del perfil del usuario y asignación a 'profile'
    this.avatarService.getUserProfile().subscribe((data) => {
      this.profile = data ?? null;
    });
  }

  // Cierra sesión y redirige a la página de inicio
  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/tabs/tab3', {replaceUrl: true});
  }

  // Permite cambiar la imagen de avatar del usuario
  async changeImage() {
		const image = await Camera.getPhoto({
			quality: 90,
			allowEditing: false,
			resultType: CameraResultType.Base64,
			source: CameraSource.Photos // Camera, Photos or Prompt!
		});

		if (image) {
			const loading = await this.loadingController.create(); // Muestra un indicador de carga
			await loading.present();

			const result = await this.avatarService.uploadImage(image); // Sube la imagen usando el servicio de avatar
			loading.dismiss();

			if (!result) {
        // La alerta
				const alert = await this.alertController.create({
					header: 'Upload failed',
					message: 'There was a problem uploading your avatar.',
					buttons: ['OK']
				});
				await alert.present();
			}
		}
	}
}



