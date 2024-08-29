import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Directory } from '@capacitor/filesystem';
import { AlertController, MenuController, ModalController, ToastController } from '@ionic/angular';
import { PreviewAnyFile } from '@ionic-native/preview-any-file/ngx';
import { HttpClient } from '@angular/common/http';
import { FileService } from "../file.service";
import { FirestoreService } from "../services/firestore.service";
import { TextGenerationComponent } from './components/text-generation/text-generation.component';

// Interfaz para definir el contenido de una carpeta
interface FolderContent {
  name: string;
  isFile: boolean;
};

@Component({
  selector: 'app-studies',
  templateUrl: './studies.page.html',
  styleUrls: ['./studies.page.scss'],
})

export class StudiesPage implements OnInit {
  folderContent: FolderContent[] = []; // Contenido de la carpeta actual
	currentFolder = ''; //La ruta de la carpeta actual
	copyFile: FolderContent | null = null;
  files: string[] = []; // Lista de archivos
  folder: string = ''; // Ruta de la carpeta actual
  newText: string = '';  // Texto nuevo para generación de texto
	@ViewChild('filepicker') picker!: ElementRef; // Referencia al selector de archivos

  constructor(
    private route: ActivatedRoute,
		private alertCtrl: AlertController,
		private router: Router,
		private previewAnyFile: PreviewAnyFile,
		private toastCtrl: ToastController,
    private http: HttpClient,
    private menuCtrl: MenuController,
    public fileService: FileService,
    private fireBase: FirestoreService,
    private modalController: ModalController
  ) { }

  
  // Método para abrir el modal
  async openTextGenerationModal() {
    // Crea una instancia del modal
    const modal = await this.modalController.create({
      component: TextGenerationComponent, // El componente que se mostrará en el modal
    });
    // Presenta el modal en la pantalla
    return await modal.present();
  }
  

  ngOnInit() {
    // Obtiene la ruta de la carpeta actual desde la URL
		this.currentFolder = this.route.snapshot.paramMap.get('folder') || '';
    this.route.paramMap.subscribe((params) => {
      const folder: string | null = params.get('path');
      this.folder = folder || '';
      this.currentFolder = folder || '';
      this.loadDocuments(); // Carga el contenido de la carpeta
    });

	}
  // Listar el contenido de la carpeta actual desde el backend
  async loadDocuments() {
		this.http.get<FolderContent[]>(`http://localhost:8000/files/?folder=${this.folder}`)
      .subscribe(data => {
        this.folderContent = data; // Actualiza el contenido de la carpeta
      });
	}

  // Muestra un cuadro de diálogo para crear una nueva carpeta
  async createFolder() {
		let alert = await this.alertCtrl.create({
			header: 'Create folder',
			message: 'Please specify the name of the new folder',
			inputs: [
				{
					name: 'name',
					type: 'text',
					placeholder: 'MyDir'
				}
			],
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel'
				},
				{
					text: 'Create',
					handler: async (data) => {
            // Envía la solicitud para crear la carpeta en el backend
						await this.http.post(`http://localhost:8000/create_folder/`, {
              folder_path: data.name
            }).toPromise();
						this.loadDocuments(); // Recarga el contenido de la carpeta
					}
				}
			]
		});
		await alert.present();
	}

  // Cierra el menú principal y navega a la página de d-studies
  handleClickDStudies() {
    this.menuCtrl.close('main-menu')
    this.router.navigate(['/studies/d-studies'])
  }

  // Abre el selector de archivos
  addFile() {
    this.picker.nativeElement.click(); // Simula un clic en el selector de archivos
  }

  // Maneja el evento cuando se selecciona un archivo
  async fileSelected($event: any) {
    // Intenta subir el archivo a Firebase Storage
    try {
      this.fireBase.uploadFile($event.target.files[0], this.folder);
    } catch (err) {

    }
    // Construye el formulario con el archivo seleccionado y la ruta de la carpeta actual
    const selected = $event.target.files[0];
    const formData = new FormData();
    formData.append("file", selected);
    if (this.folder) {
      formData.append("folder_path", this.folder);
    }
    // Envía el archivo al Backend con una solicitud POST
    this.http.post(`http://localhost:8000/upload/`, formData).subscribe((data) => {
      this.loadDocuments(); 
    });
  }

  // Maneja el clic en un elemento (archivo o carpeta)
	async itemClicked(entry: any) {
    console.log(entry)
    if (!entry.isFile) {
      this.router.navigateByUrl(`/studies/${entry.name}`); // Navega a la carpeta seleccionada
    }
    // if (this.copyFile) {
    //   // We can only copy to a folder
    //   if (entry.isFile) {
    //     let toast = await this.toastCtrl.create({
    //       message: 'Please select a folder for your operation'
    //     });
    //     await toast.present();
    //     return;
    //   }
    //   // Finish the ongoing operation
    //   this.finishCopyFile(entry);
    // } else {
    //   // Open the file or folder
    //   if (entry.isFile) {
    //
    //   } else {
    //     let pathToOpen =
    //       this.currentFolder != '' ? this.currentFolder + '/' + entry.name : entry.name;
    //     let folder = encodeURIComponent(pathToOpen);
    //     this.router.navigateByUrl(`/studies/${folder}`);
    //   }
    // }
  }

  /*
  async openFile(entry: any) {
    if (isPlatform('hybrid')) {
      // Get the URI and use our Cordova plugin for preview
      const file_uri = await Filesystem.getUri({
        directory: APP_DIRECTORY,
        path: this.currentFolder + '/' + entry.name
      });
      console.log('URI: ', file_uri);

      this.previewAnyFile.preview(file_uri.uri)
        .then((res: any) => console.log(res))
        .catch((error: any) => console.error(error));
    } else {
      // Browser fallback to download the file
      const file = await Filesystem.readFile({
        directory: APP_DIRECTORY,
        path: this.currentFolder + '/' + entry.name
      });

      const blob = this.b64toBlob(file.data, '');
      const blobUrl = URL.createObjectURL(blob);

      let a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = blobUrl;
      a.download = entry.name;
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      a.remove();
    }
  }
	b64toBlob = (b64Data: any, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  };
  */

  // Elimina un archivo o carpeta del backend y recarga la lista de documentos
	async delete(entry: any) {
    this.http.delete(`http://localhost:8000/delete/?item_path=${entry.path}`).subscribe((data) => {
      this.loadDocuments();
    });

  }

  // Inicia el proceso de copia de un archivo, guardando la ruta y el nombre del archivo copiado en Firebase
	startCopy(file: any) {
    this.fileService.setCopiedFilePath(file.path);
    this.fileService.setFilename(file.name);
  }

  // Pega el archivo copiado en la carpeta actual, obteniendo los datos desde Firebase
  paste() {
    const filename = this.fileService.getFilename();
    const filePath = this.fileService.getCopiedFilePath();
    const folder = this.route.snapshot.paramMap.get('path') || '';
    const newPath = folder ? `${folder}/${filename}` : filename; // Construye la nueva ruta del archivo
    // Envía una solicitud al backend para realizar la pega del archivo en la nueva ruta
    this.http.post(`http://localhost:8000/copy/?old_file_path=${filePath}&new_file_path=${newPath}`, {}).subscribe((data) => {
      this.loadDocuments();
      this.fileService.setCopiedFilePath(''); // Resetea la ruta del archivo copiado
    });
  }

  /*
  async finishCopyFile(entry: any) {
    // Make sure we don't have any additional slash in our path
    const current = this.currentFolder != '' ? `/${this.currentFolder}` : ''

    const from_uri = await Filesystem.getUri({
      directory: APP_DIRECTORY,
      path: `${current}/${this.copyFile?.name}`
    });

    const dest_uri = await Filesystem.getUri({
      directory: APP_DIRECTORY,
      path: `${current}/${entry.name}/${this.copyFile?.name}`
    });

    await Filesystem.copy({
      from: from_uri.uri,
      to: dest_uri.uri
    });
    this.delete(this.copyFile);
    this.copyFile = null;
    this.loadDocuments();

  }
  */

}
