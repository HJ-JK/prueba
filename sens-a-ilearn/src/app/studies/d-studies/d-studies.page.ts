import { Component, ViewChild, OnInit, ElementRef, ChangeDetectorRef} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GestureController } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { MenuController } from "@ionic/angular";
import { SpeechService } from 'src/app/services/speech.service'; // Importa el servicio sppech service


// Interfaces para manejar la estructura de datos
interface FileItem {
  name: string;
  isFile: boolean;
  children?: FileItem[];
  path: string;
}

interface FileItemChecked extends FileItem {
  checked: boolean;
}

interface Message {
  message: string;
  isHuman: boolean;
}

@Component({
  selector: 'app-d-studies',
  templateUrl: './d-studies.page.html',
  styleUrls: ['./d-studies.page.scss'],
})

export class DStudiesPage implements OnInit {
  @ViewChild('recordbtn', {read: ElementRef }) recordbtn!: ElementRef
  fileData: FileItem[] = []; // Datos de archivos
  selectedFiles: FileItemChecked[] = []; // Archivos seleccionados
  openMenu = false; // Estado del menú de selección de archivos
  files: string[] = []; // Lista de archivos
  selectedFile: string[] = [];  // Un archivo seleccionado
  messages: Message[] = []; // Mensajes de chat
  newMessage: string = ''; // Nuevo mensaje del usuario
  loading: boolean = false;
  sessionid: string = ''; // ID de la sesión actual
  speech: { name:string, text: string }[] = []; // Datos de reconocimiento de voz
  recording = false;
  sessionsid: string[] = []; // IDs de sesiones disponibles
  selectedSessionId: string = ''; // ID de la sesión seleccionada

  constructor(
    private http: HttpClient, 
    public router: Router, 
    public location: Location,
    private menuCtrl: MenuController, 
    private speechService: SpeechService, 
    private gestureCtrl: GestureController, 
    private changeDetectorRef: ChangeDetectorRef
    ) { }

    
   // Inicializa el componente y carga los documentos y sesiones
   ngOnInit() {
    // Carga los documentos
    this.loadDocuments();

    // Carga las sesiones ids
    this.loadSessions();
  
    // Se suscribe al servicio speech de reconocimiento de voz
    this.speechService.speech$.subscribe(data => {
      this.speech = data;
      if (this.speech.length > 0) {
        // Actualiza newMessage con el último elemento de la lista de speech
        this.newMessage = this.speech[this.speech.length - 1].text || '';
      }
    });
    
  }

  // Carga el árbol de archivos desde el servidor
  async loadDocuments() {
    this.http.get<FileItem[]>(`http://localhost:8000/all-files/`)
    .subscribe(data => {
      this.fileData = data;
    });
  }
 
  // 3. Desarrolla el método para actualizar la lista de archivos seleccionados 
  // según si se marca o desmarca un archivo
  handleSelectedFiles(selectedFile: FileItem & {checked: boolean}) {
    if (selectedFile.checked) {
      this.selectedFiles.push(selectedFile);
    } else {
      this.selectedFiles = this.selectedFiles
        .filter(file => file.path !== selectedFile.path)
    }
    this.sessionid = ''; // Resetea el ID de sesión cuando se selecciona un archivo
  }
 

  // Abre el menú de selección de archivos
  openFilesDashboard() {
    this.openMenu = true;
    console.log('open')
    setTimeout(() => {
      this.menuCtrl.open('file-menu')
    }, 800)
  }

  // Maneja el cierre del menú de file selector y muestra un mensaje de introducción de chatbot
  onCloseMenu() {
    if (this.selectedFiles.length > 0) {

      const fileNamesStr = this.selectedFiles.map(
        file => file.name
      ).join(', ');
      this.sessionid = '';
      this.messages = [{
        message: `Hello! I can assist you with understanding the contents of the selected document: ${fileNamesStr}. What specific information are you looking for?`,
        isHuman: false
      }]
    }
  }

  // Envía mensajes al servidor de chatbot y maneja la respuesta
  sendMessage() {
    // Verificar que el mensaje nuevo no está vacío 
    if (this.newMessage.trim().length > 0) {
      // Mensaje del usuario
      this.messages.push({
        message: this.newMessage,
        isHuman: true
      });
      this.newMessage = '';
      this.loading = true;
      // Enviar el solicitud POST al servidor de chatbot
      this.http.post<{sessionid: string, robotMessage: string}>(`http://localhost:8000/chat`, {
        humanText: this.messages[this.messages.length - 1].message,
        filename: this.selectedFiles.length > 0 ? this.selectedFiles.map(file =>
          file.path.replace(/\\/g, '/')
        ) : null,
        sessionid: this.selectedSessionId
      }).subscribe(data => { // La respuesta del servidor de chatbot
        this.selectedSessionId = data.sessionid;
        this.messages.push({
          message: data.robotMessage,
          isHuman: false
        });
        this.loading = false;
      });
  
      /// Usar setTimeout para ejecutar loadSessions después de un breve intervalo
      setTimeout(() => {
        this.loadSessions(); // Recargar sesiones después de un pequeño retraso
      }, 200);
    }
  }

  // Configura el gesto de "presión prolongada" para el botón de grabación
  ngAfterViewInit(): void {
    const longpress = this.gestureCtrl.create({
      el: this.recordbtn.nativeElement,
      threshold: 0,
      gestureName: 'long-press',
      onStart: ev => {
        Haptics.impact({ style: ImpactStyle.Light })
        this.startRecording()
      },
      onEnd: ev => {
        Haptics.impact({ style: ImpactStyle.Light })
        this.stopRecording()
      },
    }, true)

    longpress.enable()
  }

  // Inicia la grabación de audio
  async startRecording() {
    await this.speechService.startRecording();
  }

  // Detiene la grabación de audio
  async stopRecording() {
    await this.speechService.stopRecording();
  }

  // Carga la lista de sesiones ids desde el servidor
  loadSessions(): void {
    this.http.get<{ sessions: string[] }>('http://localhost:8000/sessions/')
      .subscribe(response => {
        this.sessionsid = response.sessions;
        this.changeDetectorRef.detectChanges();
      }, error => {
        console.error('Error al obtener sesiones:', error);
      });
  }

  // Elimina una sesión específica y actualiza la vista
  deleteSession(sessionId: string, event: Event): void {
    event.stopPropagation();
    this.http.delete(`http://localhost:8000/sessions/${sessionId}`)
      .subscribe(response => {
        console.log('Session deleted successfully');
        // Volver a cargar la lista de sesiones para actualizar la vista
        this.loadSessions();
      }, error => {
        console.error('Error deleting session:', error);
      });
      this.selectedSessionId = "";
      this.onSessionSelect(this.selectedSessionId);
  }
  

  // Maneja la selección de una sesión usando la sesionid
  onSessionSelect(sessionId: string) {
    if (sessionId === '') {
      // Deseleccionar la sesión actual
      this.selectedSessionId = '';
      this.messages = [];
    } else {
      // Seleccionar una nueva sesión
      this.selectedSessionId = sessionId;
      this.loadInitialMessages(sessionId);
    }
  }
  

  // Carga los mensajes iniciales de la sesión seleccionada
  loadInitialMessages(sessionId: string) {
    this.http.get<{ history: Message[] }>(`http://localhost:8000/sessions/${sessionId}/`)
      .subscribe(response => {
        this.messages = response.history.map((msg: any) => ({
          message: msg.content,
          isHuman: msg.type === 'HumanMessage'
        }));
      });
  }


}



