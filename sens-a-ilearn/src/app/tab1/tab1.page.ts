import { AfterViewInit, Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef} from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { Filesystem, Directory, Encoding, FileInfo } from '@capacitor/filesystem';
import { RecordingData, VoiceRecorder, VoiceRecorderPlugin, GenericResponse, CurrentRecordingStatus } from 'capacitor-voice-recorder';
import { GestureController } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import * as BlobUtil from 'blob-util';
import { Buffer } from 'buffer';
import { SpeechService } from '../services/speech.service'; // Importa el servicio para actualizar speech

interface SpeechItem {
  name: string;
  text: string;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, AfterViewInit{
  recording = false;
  storedFileNames: FileInfo[] = [];
  durationDisplay = ''
  duration = 0
  speech: SpeechItem[] = []; // Lista para almacenar los textos de speech
  @ViewChild('recordbtn', {read: ElementRef }) recordbtn!: ElementRef // Referencia al botón de grabación

  constructor(
    private firestore: FirestoreService,
    private gestureCtrl: GestureController,
    private changeDetectorRef: ChangeDetectorRef,
    private speechService: SpeechService // Servicio para actualizar y compartir datos de speech
    ) {}

  ngOnInit(){
    this.loadFiles();
    VoiceRecorder.requestAudioRecordingPermission();
    this.automaticSpeechRecognition();
  }

  // Configura un gesto de presionado largo para comenzar y detener la grabación
  ngAfterViewInit(): void {
    const longpress = this.gestureCtrl.create({
      el: this.recordbtn.nativeElement,
      threshold: 0,
      gestureName: 'long-press',
      onStart: ev => {
        Haptics.impact({ style: ImpactStyle.Light })
        this.startRecording()
        this.calculateDuration()
      },
      onEnd: ev => {
        Haptics.impact({ style: ImpactStyle.Light })
        this.stopRecording()
      },
    }, true)

    longpress.enable()
  }

  // Calcula la duración de la grabación en segundos y muestra en formato MM:SS
  calculateDuration() {
    if (!this.recording) {
      this.duration = 0
      this.durationDisplay = ''
      return
    }
    this.duration +=1
    const minutes = Math.floor(this.duration / 60)
    const seconds = (this.duration % 60).toString().padStart(2, '0')
    this.durationDisplay = `${ minutes }:${ seconds }`
    setTimeout(() => {
      this.calculateDuration()
    },1000)
  }

  // Carga la lista de archivos almacenados en el directorio de datos
  async loadFiles() {
    Filesystem.readdir({
      path: '',
      directory: Directory.Data
    }).then(result => {
      console.log(result);
      this.storedFileNames = result.files;
      this.storedFileNames = this.storedFileNames.filter(file => file.name.endsWith('.mp3'))
    });
  }


  // Convierte datos en base64 a un blob de audio MP3
  async convertBase64ToMp3(base64Data: string, filename: string) {	
    const blob = BlobUtil.base64StringToBlob(base64Data);	
    const arrayBuffer = await blob.arrayBuffer();	
    const audioBlob = new Blob([arrayBuffer], { type: 'audio/wav' });	
    const audioUrl = URL.createObjectURL(audioBlob);	
    const link = document.createElement('a');	
    link.href = audioUrl;	
    link.download = 'audio.mp3';	
    //document.body.appendChild(link);	
    //link.click();	
    //document.body.removeChild(link);	
    return audioBlob;	
  }

  // Inicia la grabación si no se está grabando actualmente
  startRecording(){
    if (this.recording) {
      return;
    }
    this.recording = true;
    VoiceRecorder.startRecording();
  }

  // Detiene la grabación y guarda el archivo
  stopRecording(){
    if (!this.recording) {
      return;
    }
    VoiceRecorder.stopRecording().then(async (result: RecordingData) => {
      if (result.value && result.value.recordDataBase64) {
        const recordData = result.value.recordDataBase64;
        const time = new Date().getTime();
        const fileName = time + '.mp3';
        this.convertBase64ToMp3(result.value.recordDataBase64, time + '.mp3');
        await Filesystem.writeFile({
          path: fileName,
          directory: Directory.Data,
          data: recordData
        });
        this.loadFiles();
        this.automaticSpeechRecognition();
      }
      this.recording = false;
    })
  }

  // Reproduce un archivo de audio almacenado
  async playFile(fileName: any) {
    const audioFile = await Filesystem.readFile({
      path: fileName,
      directory: Directory.Data
    })
    const base64Sound = audioFile.data
    console.log(typeof(base64Sound));
    const audioRef = new Audio(`data:audio/aac;base64,${ base64Sound }`)
    audioRef.oncanplaythrough = () => audioRef.play()
    audioRef.load()
  }

  // Elimina un archivo de grabación y actualiza la lista de transcripciones
  async deleteRecording(fileName: string, event: Event) {
    event.stopPropagation(); // Detiene la propagación del evento
    await Filesystem.deleteFile({
      directory: Directory.Data,
      path: fileName
    })
    this.loadFiles()

    // Elimina la transcripción correspondiente de la lista `speech`
    this.speech = this.speech.filter(item => item.name !== fileName);

    // Fuerza la detección de cambios si es necesario
    this.changeDetectorRef.detectChanges();

  }

  // Realiza el reconocimiento automático del habla para todos los archivos de audio almacenados
  async automaticSpeechRecognition() {
    this.speech = [];
    const audiofiles = await Filesystem.readdir({
      path: '',
      directory: Directory.Data
    });
    for (const file of audiofiles.files) {
      const filePath = `${''}/${file.name}`;
      const audioFile = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Data
      });
      const data = audioFile.data;
      // const buf = Buffer.from(data, 'base64');
      const response = await fetch(
        "http://localhost:8000/asr",
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            audio: data,
            name: file.name
           }),
         }
      );
      const result = await response.json();
      console.log(result);

      //this.speech.push(result.text.toString());
      
      this.speech.push({
        name: file.name,
        text: result.text.toString()
      });
  
      // this.speechService.updateSpeech(this.speech);
      // Fuerza la detección de cambios para actualizar la vista
      this.changeDetectorRef.detectChanges();
      
     
    }

  }
  

}
