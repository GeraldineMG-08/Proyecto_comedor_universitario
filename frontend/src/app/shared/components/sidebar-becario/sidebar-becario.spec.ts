import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarBecario } from './sidebar-becario';

describe('SidebarBecario', () => {
  let component: SidebarBecario;
  let fixture: ComponentFixture<SidebarBecario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarBecario],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarBecario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
