import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  credentials!: FormGroup; // Formulario reactivo para manejar las credenciales de usuario

	constructor(
		private fb: FormBuilder, // Constructor de formularios
		private loadingController: LoadingController,
		private alertController: AlertController,
		private authService: AuthService,
		private router: Router,
	) {}

	// Acceso fácil a los campos del formulario
	get email() {
		return this.credentials.get('email'); // Devuelve el campo email del formulario
	}

	get password() {
		return this.credentials.get('password'); // Devuelve el campo password del formulario
	}

	ngOnInit() {
		// Inicializa el formulario reactivo con validadores para los campos
		this.credentials = this.fb.group({
			email: ['', [Validators.required, Validators.email]], // Campo email, requerido y debe ser un email válido
			password: ['', [Validators.required, Validators.minLength(6)]] // Campo password, requerido y con longitud mínima de 6 caracteres
		});
	}

	// Método para registrar un nuevo usuario
	async register() {
		const loading = await this.loadingController.create();
		await loading.present();
		// Llama al método de registro del servicio de autenticación
		const user = await this.authService.register(this.credentials.value);
		await loading.dismiss();

		if (user) {
			this.router.navigateByUrl('/home', { replaceUrl: true }); // Si el registro es exitoso, navega a la página de inicio
		} else {
			this.showAlert('Registration failed', 'Please try again!');
		}
	}

	// Método para iniciar sesión
	async login() {
		const loading = await this.loadingController.create();
		await loading.present();
		// Llama al método de login del servicio de autenticación
		const user = await this.authService.login(this.credentials.value);
		await loading.dismiss();

		if (user) {
			this.router.navigateByUrl('/home', { replaceUrl: true }); // Si el login es exitoso, navega a la página de inicio
		} else {
			this.showAlert('Login failed', 'Please try again!');
		}
	}

	// Método para mostrar una alerta
	async showAlert(header: string, message: string) {
		const alert = await this.alertController.create({
			header,
			message,
			buttons: ['OK']
		});
		await alert.present();
	}

}
