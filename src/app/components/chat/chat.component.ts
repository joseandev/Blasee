import { AfterViewInit, Component,ElementRef,OnInit, ViewChild } from '@angular/core';
import {LoginService} from 'src/app/services/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFireDatabase, AngularFireObject,AngularFireList } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {Observable} from 'rxjs';
import { rejects } from 'assert';
import { DatePipe } from '@angular/common';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit {
  UserLogged = this.loginService.getUserLogged(); 
  UserId:string|null|undefined;
  nameItemRef: AngularFireObject<any>;
  name: Observable<any>;
  profileUrl: Observable<string | null>   
  
  nuevoMensaje: string = "";
  pipe!: any;
  today!: any;

  @ViewChild('contenedorMensajes') private contenedor!: ElementRef;
  public mensajes: Mensajes[] = [];
  no!: number;
  contacto:any;
  public nombreContacto: any;
  existencia:any;
  data:any;
  
  constructor(private loginService: LoginService,private route: ActivatedRoute,private _router: Router,private storage: AngularFireStorage, private db: AngularFireDatabase,
    private chat: ChatService){

    this.contacto = chat.idContacto;
    this.nombreContacto = chat.nombreContacto;
    this.profileUrl = chat.imgContacto;

    this.UserId = this.route.snapshot.paramMap.get('uid');

	 this.nameItemRef = db.object(`usuarios/${this.UserId}/name`);
    this.name = this.nameItemRef.valueChanges();

    const ref = this.storage.ref(`/users/${this.contacto}`);
    this.profileUrl = ref.getDownloadURL();

    setTimeout(()=> { this.obtenerMensajes(); }, 200);
    
    }

  ngOnInit(){
    this.Existencia();
  }
  
  ngAfterViewInit(): void {
    setTimeout(()=>
    {
    this.scrollUltimo();

    }, 1000);
  }

  async enviarMensaje(){

    if (this.nuevoMensaje == "") return;
    var idMsg = uuidv4();
    this.no = new Date().getTime();
    this.pipe = new DatePipe('en-US');
    this.today = this.pipe.transform(Date.now(), 'MMM d, y, h:mm:ss a');

    if(this.existencia == true){

      await this.db.object(`chat/privado/${this.UserId} y ${this.contacto}/Mensajes/${idMsg} - ${this.today}`).set({
        'mensaje': this.nuevoMensaje,
        'emisor': this.UserId,
        'fecha': this.today,
        'no': this.no
      });

    }else{
      
    await this.db.object(`chat/privado/${this.contacto} y ${this.UserId}/Mensajes/${idMsg} - ${this.today}`).set({
      'mensaje': this.nuevoMensaje,
      'emisor': this.UserId,
      'fecha': this.today,
      'no': this.no
    });
  
  }

    await this.obtenerMensajes();

    this.nuevoMensaje = "";
    setTimeout(()=>
    {
    this.scrollUltimo();
    }, 30);

  }


  async obtenerMensajes(){

    var msjdb!: Mensajes[];

    if(this.existencia == true){
      this.db.list(`chat/privado/${this.UserId} y ${this.contacto}/Mensajes`, ref=>
      ref.orderByChild('no').limitToLast(25)).valueChanges(['child_added']).subscribe(
        value => { 
          msjdb = value as Mensajes[];
      
          if(msjdb.length != this.mensajes.length){
      
            this.mensajes = msjdb;
            setTimeout(()=>
            {
            this.scrollUltimo();
            }, 30);
      
          }else{
            
            this.mensajes = msjdb;  
            
          }
            
          this.data = true;
        });
    }else{
      
      this.db.list(`chat/privado/${this.contacto} y ${this.UserId}/Mensajes`, ref=>
      ref.orderByChild('no').limitToLast(25)).valueChanges(['child_added']).subscribe(
        value => {
          msjdb = value as Mensajes[];
      
          if(msjdb.length != this.mensajes.length){
      
            this.mensajes = msjdb;
            setTimeout(()=>
            {
            this.scrollUltimo();
            }, 30);
      
          }else{
            
            this.mensajes = msjdb;  
            
          }
            
          this.data = true;
        });
    }

  }

  public Existencia(){
    
    this.db.database.ref(`chat/privado/${this.UserId} y ${this.contacto}`).once('value', (snapshot) => {
      if(snapshot.exists() == true){
        this.setExistencia(true);
      }else{
        this.setExistencia(false);
      }
     });


  }

  public setExistencia(existencia:boolean){
    this.existencia = existencia;
    console.log(this.existencia);
  }

  async scrollUltimo(){

    try {

      this.contenedor.nativeElement.scrollTop = this.contenedor.nativeElement.scrollHeight;
 
    } catch(err) { 
      console.log(err);
    }  

  }


}

class Mensajes {
  mensaje!: string;
  emisor!: string;
  fecha!: string;
  no!: number;
  
}