import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademyListComponent } from './academy-list.component';

describe('AcademyListComponent', () => {
  let component: AcademyListComponent;
  let fixture: ComponentFixture<AcademyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademyListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AcademyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
