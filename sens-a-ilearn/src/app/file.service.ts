import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  copiedFilePath = '';
  filename = '';
  constructor() { }

  setCopiedFilePath(path: string) {
    this.copiedFilePath = path;
  }

  getCopiedFilePath() {
    return this.copiedFilePath;
  }

  setFilename(filename: string) {
    this.filename = filename;
  }

  getFilename() {
    return this.filename;
  }
}
