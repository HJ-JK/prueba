import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LStudiesPage } from './l-studies.page';

describe('LStudiesPage', () => {
  let component: LStudiesPage;
  let fixture: ComponentFixture<LStudiesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LStudiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
