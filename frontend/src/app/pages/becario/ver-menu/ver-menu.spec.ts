import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerMenu } from './ver-menu';

describe('VerMenu', () => {
  let component: VerMenu;
  let fixture: ComponentFixture<VerMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(VerMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
