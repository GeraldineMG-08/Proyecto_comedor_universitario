import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SidebarAsistenta } from './sidebar-asistenta';
import { AuthService } from '../../../core/services/auth';

describe('SidebarAsistenta', () => {
  let component: SidebarAsistenta;
  let fixture: ComponentFixture<SidebarAsistenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarAsistenta],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            obtenerUsuario: () => ({ nombre: 'Test User', rol: 'asistenta_social' }),
            cerrarSesion: () => {}
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarAsistenta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
