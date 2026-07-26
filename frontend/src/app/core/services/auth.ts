import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private api = environment.apiUrl;


  constructor(
    private http: HttpClient
  ){}



  login(datos:any){


    return this.http.post<any>(

      `${this.api}/auth/login`,

      datos

    );


  }



  guardarSesion(respuesta:any){


    localStorage.setItem(

      'token',

      respuesta.token

    );


    localStorage.setItem(

      'usuario',

      JSON.stringify(respuesta.usuario)

    );


  }




  obtenerUsuario(){


    const usuario = localStorage.getItem('usuario');


    return usuario 
      ? JSON.parse(usuario)
      : null;


  }





  obtenerToken(){


    return localStorage.getItem('token');


  }





  cerrarSesion(){


    localStorage.removeItem('token');

    localStorage.removeItem('usuario');


  }

obtenerRol(): string | null {

  const usuario = this.obtenerUsuario();

  return usuario ? usuario.rol : null;

}

estaAutenticado(): boolean {

  return !!this.obtenerToken();

}

}