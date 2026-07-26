import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { NgClass } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({

selector:'app-login',

standalone:true,

imports:[
  FormsModule,
  NgClass
],

templateUrl:'./login.html',

styleUrl:'./login.scss'

})



export class Login {


codigo_usuario='';

password='';

mensaje='';


showPassword = false;



constructor(

    private auth:AuthService,

    private router:Router

){}




onLogin(){


const datos = {


codigo_usuario:this.codigo_usuario,


password:this.password


};


if (!this.codigo_usuario.trim() || !this.password.trim()) {

  Swal.fire({

    icon: 'warning',

    title: 'Campos incompletos',

    text: 'Ingrese su usuario y contraseña.',

    confirmButtonColor: '#2563eb'

  });

  return;

}


this.auth.login(datos)
.subscribe({


next: (resp) => {

  console.log('Login correcto', resp);

  this.auth.guardarSesion(resp);

  this.mensaje = 'Bienvenido ' + resp.usuario.nombre;

  Swal.fire({

    icon: 'success',

    title: `¡Bienvenido, ${resp.usuario.nombre}!`,

    text: 'Has iniciado sesión correctamente.',

    timer: 1800,

    showConfirmButton: false,

    allowOutsideClick: false,

    background: '#ffffff',

    color: '#1e293b'

  }).then(()=>{

      const rutas: Record<string, string> = {

          asistenta_social: '/asistenta',

          nutricionista: '/nutricionista',

          becario: '/becario'

      };

      this.router.navigate([rutas[resp.usuario.rol] || '/login']);

});

},



error: (error) => {

  console.error(error);

  this.mensaje =
    error.error?.mensaje ||
    'Error al iniciar sesión';

  Swal.fire({

    icon: 'error',

    title: 'Inicio de sesión',

    text: this.mensaje,

    confirmButtonText: 'Aceptar',

    confirmButtonColor: '#2563eb'

  });

}


});



}



}