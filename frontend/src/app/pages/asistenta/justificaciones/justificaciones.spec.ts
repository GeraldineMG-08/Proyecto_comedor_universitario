import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Justificaciones } from './justificaciones';

describe('Justificaciones', () => {
  let component: Justificaciones;
  let fixture: ComponentFixture<Justificaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Justificaciones],
    }).compileComponents();

    fixture = TestBed.createComponent(Justificaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
