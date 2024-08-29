import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DStudiesPage } from './d-studies.page';

describe('DStudiesPage', () => {
  let component: DStudiesPage;
  let fixture: ComponentFixture<DStudiesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DStudiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
