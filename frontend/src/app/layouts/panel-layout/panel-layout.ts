import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { filter, Subscription } from 'rxjs';

import { AuthService } from '../../core/services/auth';


type RolUsuario =
  | 'asistenta_social'
  | 'nutricionista'
  | 'becario';


interface UsuarioSesion {
  nombre: string;
  rol: RolUsuario;
}


interface MenuItem {
  texto: string;
  icono: string;
  ruta: string;
  exacta?: boolean;
}


interface MenuSeccion {
  titulo?: string;
  opciones: MenuItem[];
}


@Component({
  selector: 'app-panel-layout',

  standalone: true,

  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './panel-layout.html',

  styleUrl: './panel-layout.scss'
})
export class PanelLayout implements OnInit, OnDestroy {

  usuario: UsuarioSesion | null = null;

  tituloPagina = 'Dashboard';

  sidebarAbierto = false;

  private routerSubscription?: Subscription;


  private readonly menusPorRol: Record<RolUsuario, MenuSeccion[]> = {

    asistenta_social: [
      {
        titulo: 'Gestión académica',

        opciones: [
          {
            texto: 'Dashboard',
            icono: 'bi bi-grid-fill',
            ruta: '/asistenta',
            exacta: true
          },
          {
            texto: 'Padrón de estudiantes',
            icono: 'bi bi-people-fill',
            ruta: '/asistenta/padron-estudiantes'
          },
          {
            texto: 'Control de asistencia',
            icono: 'bi bi-person-check-fill',
            ruta: '/asistenta/asistencia'
          },
          {
            texto: 'Retiros / sanciones',
            icono: 'bi bi-person-x-fill',
            ruta: '/asistenta/retiros-sanciones'
          },
          {
            texto: 'Justificaciones',
            icono: 'bi bi-file-earmark-medical-fill',
            ruta: '/asistenta/justificaciones'
          }
        ]
      }
    ],


    nutricionista: [
      {
        titulo: 'Gestión alimentaria',

        opciones: [
          {
            texto: 'Dashboard',
            icono: 'bi bi-grid-fill',
            ruta: '/nutricionista',
            exacta: true
          },
          {
            texto: 'Gestionar menús',
            icono: 'bi bi-egg-fried',
            ruta: '/nutricionista/gestionar-menus'
          },
          {
            texto: 'Restricciones',
            icono: 'bi bi-exclamation-triangle-fill',
            ruta: '/nutricionista/restricciones'
          },
          {
            texto: 'Reportes',
            icono: 'bi bi-bar-chart-fill',
            ruta: '/nutricionista/reportes'
          }
        ]
      }
    ],


    becario: [
      {
        titulo: 'Mi comedor',

        opciones: [
          {
            texto: 'Dashboard',
            icono: 'bi bi-grid-fill',
            ruta: '/becario',
            exacta: true
          },
          {
            texto: 'Historial de asistencia',
            icono: 'bi bi-list-check',
            ruta: '/becario/historial-asistencia'
          },
          {
            texto: 'Justificar falta',
            icono: 'bi bi-file-earmark-medical-fill',
            ruta: '/becario/justificar-falta'
          },
          {
            texto: 'Ver menú',
            icono: 'bi bi-calendar-week-fill',
            ruta: '/becario/ver-menu'
          }
        ]
      }
    ]

  };


  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}


  ngOnInit(): void {

    this.usuario =
      this.authService.obtenerUsuario() as UsuarioSesion | null;


    /*
     * Protección adicional.
     * Normalmente los guards ya evitan entrar sin sesión,
     * pero esta comprobación impide errores si localStorage
     * fue eliminado manualmente.
     */
    if (!this.usuario || !this.usuario.rol) {

      this.cerrarSesion();

      return;

    }


    this.actualizarTituloPagina();


    this.routerSubscription = this.router.events

      .pipe(
        filter(
          (evento): evento is NavigationEnd =>
            evento instanceof NavigationEnd
        )
      )

      .subscribe(() => {

        this.actualizarTituloPagina();

        /*
         * Al navegar desde un dispositivo móvil,
         * el sidebar se cierra automáticamente.
         */
        this.sidebarAbierto = false;

      });

  }


  ngOnDestroy(): void {

    this.routerSubscription?.unsubscribe();

  }


  get menuActual(): MenuSeccion[] {

    if (!this.usuario) {

      return [];

    }

    return this.menusPorRol[this.usuario.rol] ?? [];

  }


  get inicialesUsuario(): string {

    const nombre = this.usuario?.nombre?.trim();

    if (!nombre) {

      return 'U';

    }

    return nombre

      .split(/\s+/)

      .slice(0, 2)

      .map(parte => parte.charAt(0))

      .join('')

      .toUpperCase();

  }


  get nombreRol(): string {

    const nombres: Record<RolUsuario, string> = {

      asistenta_social: 'Asistenta social',

      nutricionista: 'Nutricionista',

      becario: 'Becario'

    };

    return this.usuario
      ? nombres[this.usuario.rol]
      : 'Usuario';

  }


  alternarSidebar(): void {

    this.sidebarAbierto = !this.sidebarAbierto;

  }


  cerrarSidebar(): void {

    this.sidebarAbierto = false;

  }


  cerrarSesion(): void {

    this.authService.cerrarSesion();

    this.router.navigate(['/login']);

  }


  private actualizarTituloPagina(): void {

    let rutaActiva = this.activatedRoute;


    /*
     * Busca la ruta hija que corresponde a la página
     * actualmente visible dentro del router-outlet.
     */
    while (rutaActiva.firstChild) {

      rutaActiva = rutaActiva.firstChild;

    }


    this.tituloPagina =
      rutaActiva.snapshot.data['titulo']
      ?? 'Dashboard';

  }

}