import { Routes } from '@angular/router';

import { Login } from './auth/login/login';

import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

import { PanelLayout } from './layouts/panel-layout/panel-layout';


/* ============================================= */
/* ASISTENTA SOCIAL                              */
/* ============================================= */

import {
  Dashboard as DashboardAsistenta
} from './pages/asistenta/dashboard/dashboard';

import {
  PadronEstudiantes
} from './pages/asistenta/padron-estudiantes/padron-estudiantes';

import {
  Asistencia
} from './pages/asistenta/asistencia/asistencia';

import {
  RetirosSanciones
} from './pages/asistenta/retiros-sanciones/retiros-sanciones';

import {
  Justificaciones
} from './pages/asistenta/justificaciones/justificaciones';


/* ============================================= */
/* NUTRICIONISTA                                 */
/* ============================================= */

import {
  Dashboard as DashboardNutricionista
} from './pages/nutricionista/dashboard/dashboard';

import {
  GestionarMenus
} from './pages/nutricionista/gestionar-menus/gestionar-menus';

import {
  Restricciones
} from './pages/nutricionista/restricciones/restricciones';

import {
  Reportes
} from './pages/nutricionista/reportes/reportes';


/* ============================================= */
/* BECARIO                                       */
/* ============================================= */

import {
  Dashboard as DashboardBecario
} from './pages/becario/dashboard/dashboard';

import {
  HistorialAsistencia
} from './pages/becario/historial-asistencia/historial-asistencia';

import {
  JustificarFalta
} from './pages/becario/justificar-falta/justificar-falta';

import {
  VerMenu
} from './pages/becario/ver-menu/ver-menu';


export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },


  {
    path: 'login',
    component: Login
  },


  /* =========================================== */
  /* ASISTENTA SOCIAL                            */
  /* =========================================== */

  {
    path: 'asistenta',

    component: PanelLayout,

    canActivate: [
      authGuard,
      roleGuard
    ],

    data: {
      rol: 'asistenta_social'
    },

    children: [

      {
        path: '',
        component: DashboardAsistenta,
        data: {
          titulo: 'Dashboard'
        }
      },

      {
        path: 'padron-estudiantes',
        component: PadronEstudiantes,
        data: {
          titulo: 'Padrón de estudiantes'
        }
      },

      {
        path: 'asistencia',
        component: Asistencia,
        data: {
          titulo: 'Control de asistencia'
        }
      },

      {
        path: 'retiros-sanciones',
        component: RetirosSanciones,
        data: {
          titulo: 'Retiros y sanciones'
        }
      },

      {
        path: 'justificaciones',
        component: Justificaciones,
        data: {
          titulo: 'Justificaciones'
        }
      }

    ]
  },


  /* =========================================== */
  /* NUTRICIONISTA                               */
  /* =========================================== */

  {
    path: 'nutricionista',

    component: PanelLayout,

    canActivate: [
      authGuard,
      roleGuard
    ],

    data: {
      rol: 'nutricionista'
    },

    children: [

      {
        path: '',
        component: DashboardNutricionista,
        data: {
          titulo: 'Dashboard'
        }
      },

      {
        path: 'gestionar-menus',
        component: GestionarMenus,
        data: {
          titulo: 'Gestionar menús'
        }
      },

      {
        path: 'restricciones',
        component: Restricciones,
        data: {
          titulo: 'Restricciones alimentarias'
        }
      },

      {
        path: 'reportes',
        component: Reportes,
        data: {
          titulo: 'Reportes nutricionales'
        }
      }

    ]
  },


  /* =========================================== */
  /* BECARIO                                     */
  /* =========================================== */

  {
    path: 'becario',

    component: PanelLayout,

    canActivate: [
      authGuard,
      roleGuard
    ],

    data: {
      rol: 'becario'
    },

    children: [

      {
        path: '',
        component: DashboardBecario,
        data: {
          titulo: 'Dashboard'
        }
      },

      {
        path: 'historial-asistencia',
        component: HistorialAsistencia,
        data: {
          titulo: 'Historial de asistencia'
        }
      },

      {
        path: 'justificar-falta',
        component: JustificarFalta,
        data: {
          titulo: 'Justificar falta'
        }
      },

      {
        path: 'ver-menu',
        component: VerMenu,
        data: {
          titulo: 'Menú del comedor'
        }
      }

    ]
  },


  {
    path: '**',
    redirectTo: 'login'
  }

];