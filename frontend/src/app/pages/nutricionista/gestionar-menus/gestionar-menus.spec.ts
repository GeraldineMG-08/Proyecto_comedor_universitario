import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarMenus } from './gestionar-menus';

describe('GestionarMenus', () => {
  let component: GestionarMenus;
  let fixture: ComponentFixture<GestionarMenus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarMenus],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionarMenus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
