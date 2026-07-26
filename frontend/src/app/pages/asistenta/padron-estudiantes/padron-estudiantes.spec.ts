import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PadronEstudiantes } from './padron-estudiantes';

describe('PadronEstudiantes', () => {
  let component: PadronEstudiantes;
  let fixture: ComponentFixture<PadronEstudiantes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PadronEstudiantes],
    }).compileComponents();

    fixture = TestBed.createComponent(PadronEstudiantes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
