import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Restricciones } from './restricciones';

describe('Restricciones', () => {
  let component: Restricciones;
  let fixture: ComponentFixture<Restricciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Restricciones],
    }).compileComponents();

    fixture = TestBed.createComponent(Restricciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
