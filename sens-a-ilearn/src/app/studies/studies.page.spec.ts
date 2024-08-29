import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudiesPage } from './studies.page';

describe('StudiesPage', () => {
  let component: StudiesPage;
  let fixture: ComponentFixture<StudiesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(StudiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
