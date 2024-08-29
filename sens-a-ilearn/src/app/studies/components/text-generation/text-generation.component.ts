import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-text-generation',
  templateUrl: './text-generation.component.html',
  styleUrls: ['./text-generation.component.scss'],
})
export class TextGenerationComponent  implements OnInit {

  textInput: string = ''; // Almacena el texto de entrada proporcionado por el usuario
  generatedText: string = ''; // Almacena el texto generado por la API

  constructor(private modalController: ModalController) {}

  // Método para cerrar el modal
  async dismiss() {
    await this.modalController.dismiss(); // Desvincula el modal de la vista
  }

  // Método para llamar a la API del modelo de generación de texto
  async tg(t: string) {
    // Envía una solicitud POST a la API para generar texto basado en la entrada
    const response = await fetch(
      "http://localhost:8000/tg",
      {
        headers: { 
          "Content-Type": "application/json" // Tipo de contenido de la solicitud
        },
        method: "POST",
        body: JSON.stringify({ texts: t }),
      }
    );
    // Verifica si la respuesta de la API fue exitosa
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    this.generatedText = result.generated_text;

  }

  ngOnInit() {}

}
