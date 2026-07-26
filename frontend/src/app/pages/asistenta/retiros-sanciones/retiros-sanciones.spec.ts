import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetirosSanciones } from './retiros-sanciones';

describe('RetirosSanciones', () => {
  let component: RetirosSanciones;
  let fixture: ComponentFixture<RetirosSanciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetirosSanciones],
    }).compileComponents();

    fixture = TestBed.createComponent(RetirosSanciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
