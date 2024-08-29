import { Component, EventEmitter, Input, Output } from '@angular/core';

interface FileItem {
  name: string;
  isFile: boolean;
  children?: FileItem[];
  path: string;
}

@Component({
  selector: 'app-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss'],
})

export class FileSelectorComponent {
  @Input() files: FileItem[] = [];
  // 1. Define el evento para emitir datos de FileItem y si está seleccionado
  @Output() onSelectFile: EventEmitter<FileItem & {checked: boolean}> = new EventEmitter();

  openedFolders: Set<string> = new Set();
  selectedFiles: Set<FileItem> = new Set();

  // Alterna el estado de apertura de una carpeta.
  toggleFolder(folder: FileItem) {
    // Si la carpeta está abierta, se cierra, y viceversa
    if (this.openedFolders.has(folder.name)) {
      this.openedFolders.delete(folder.name);
    } else {
      this.openedFolders.add(folder.name);
    }
  }

  // Alterna la selección de un archivo y 
  // emite un evento con la información del archivo y su estado de selección.
  toggleFileSelection(file: FileItem, e: any) {
    // Si el archivo está seleccionado, se deselecciona, y viceversa
    console.log(e.target.checked)
    if (this.selectedFiles.has(file)) {
      this.selectedFiles.delete(file);
    } else {
      this.selectedFiles.add(file);
    }
    // 2. Emitir el evento
    this.onSelectFile.emit({...file, checked: e.target.checked});
  }

  // Verifica si una carpeta está abierta.
  isFolderOpened(folder: FileItem): boolean {
    return this.openedFolders.has(folder.name);
  }

  // Verifica si un archivo está seleccionado.
  isFileSelected(file: FileItem): boolean {
    return this.selectedFiles.has(file);
  }
}
