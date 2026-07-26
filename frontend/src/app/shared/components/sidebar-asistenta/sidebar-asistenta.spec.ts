import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarAsistenta } from './sidebar-asistenta';

describe('SidebarAsistenta', () => {
  let component: SidebarAsistenta;
  let fixture: ComponentFixture<SidebarAsistenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarAsistenta],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarAsistenta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
