import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth';

@Component({

  selector: 'app-sidebar-asistenta',

  standalone: true,

  imports: [
    RouterLink
  ],

  templateUrl: './sidebar-asistenta.html',

  styleUrl: './sidebar-asistenta.scss'

})

export class SidebarAsistenta implements OnInit {

  usuario: any = {};

  constructor(

    private auth: AuthService,

    private router: Router

  ) {}

  ngOnInit(): void {

    this.usuario = this.auth.obtenerUsuario();

  }

  logout(): void {

    this.auth.cerrarSesion();

    this.router.navigate(['/login']);

  }

}