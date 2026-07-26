import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarNutricionista } from './sidebar-nutricionista';

describe('SidebarNutricionista', () => {
  let component: SidebarNutricionista;
  let fixture: ComponentFixture<SidebarNutricionista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarNutricionista],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarNutricionista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
