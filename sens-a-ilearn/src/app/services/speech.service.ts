import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { VoiceRecorder, RecordingData } from 'capacitor-voice-recorder';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  // BehaviorSubject para almacenar y emitir la lista de textos de speech
  private speechSource = new BehaviorSubject<{ name: string, text: string }[]>([]);
  // Observable para que otros componentes puedan suscribirse
  speech$ = this.speechSource.asObservable();
  recording = false;
  duration = 0;

  constructor(private http: HttpClient) { }

  /*
  // Observable para que otros componentes puedan suscribirse
  updateSpeech(speech: { name:string, text: string }[]) {
    this.speechSource.next(speech);
  }

  */
  async startRecording() {
    if (this.recording) {
      return;
    }
    this.recording = true;
    await VoiceRecorder.startRecording();
    this.calculateDuration();
  }

  async stopRecording() {
    if (!this.recording) {
      return;
    }
    const result: RecordingData = await VoiceRecorder.stopRecording();
    if (result.value && result.value.recordDataBase64) {
      const recordData = result.value.recordDataBase64;
      const time = new Date().getTime();
      const fileName = time + '.mp3';
      await Filesystem.writeFile({
        path: fileName,
        directory: Directory.Data,
        data: recordData
      });
      this.automaticSpeechRecognition(fileName);
    }
    this.recording = false;
  }

  async automaticSpeechRecognition(fileName: string) {
    const audioFile = await Filesystem.readFile({
      path: fileName,
      directory: Directory.Data
    });
    const data = audioFile.data;

    const response = await fetch(
      "http://localhost:8000/asr",
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          audio: data,
          name: fileName
         }),
       }
    );
    const result = await response.json();
      console.log(result);
    
    this.speechSource.next([{ name: fileName, text: result.text.toString() }]);
  }

  calculateDuration() {
    if (!this.recording) {
      this.duration = 0;
      return;
    }
    this.duration += 1;
    setTimeout(() => {
      this.calculateDuration();
    }, 1000);
  }
  
}
