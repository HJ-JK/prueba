import { Component, OnInit } from '@angular/core';
import { Directory } from '@capacitor/filesystem';
import { MenuController } from '@ionic/angular';
import { Location } from "@angular/common";


@Component({
  selector: 'app-l-studies',
  templateUrl: './l-studies.page.html',
  styleUrls: ['./l-studies.page.scss'],
})
export class LStudiesPage implements OnInit {

  documentName: string = ''; // Nombre del documento para la consulta
  question: string = ''; // Pregunta a realizar sobre el documento
  output: any; // Resultado de la consulta

  constructor(private menu: MenuController, public location: Location) { }

  ngOnInit() {
  }

  // Método para realizar una consulta al backend sobre el documento
  async docqa(filename: any, qt: string) {
    // Envía una solicitud POST al backend con el nombre del archivo y la pregunta en formato JSON
    const response = await fetch(
      "http://localhost:8000/docqa",
      {
        headers: { "Content-Type": "application/json" }, // Tipo de contenido de la solicitud
        method: "POST",
        body: JSON.stringify({
          filename: filename,
          qt: qt
        }),
      }
    );

    // Obtiene la respuesta en formato JSON
    const result = await response.json();

    // Actualiza el `output` con el nombre del documento, la pregunta y la respuesta obtenida del backend
    this.output = {
      documentName: this.documentName,
      question: this.question,
      answer: JSON.stringify(result) // Convierte el resultado a una cadena JSON
    };
    return result;
  }

  async docqaR(){
    const response = await this.docqa("contract.jpeg", "What is the purchase amount?");
    console.log(JSON.stringify(response));
  }

}
