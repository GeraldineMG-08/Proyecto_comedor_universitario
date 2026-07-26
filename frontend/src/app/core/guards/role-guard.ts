import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth';

export const roleGuard: CanActivateFn = (route) => {

    const auth = inject(AuthService);

    const router = inject(Router);

    const rolPermitido = route.data['rol'];

    if (auth.obtenerRol() === rolPermitido) {

        return true;

    }

    router.navigate(['/login']);

    return false;

};