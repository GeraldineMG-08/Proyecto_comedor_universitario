import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JustificarFalta } from './justificar-falta';

describe('JustificarFalta', () => {
  let component: JustificarFalta;
  let fixture: ComponentFixture<JustificarFalta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JustificarFalta],
    }).compileComponents();

    fixture = TestBed.createComponent(JustificarFalta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
