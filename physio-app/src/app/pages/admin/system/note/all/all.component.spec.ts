import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllNoteComponent } from './all.component';

describe('AllNoteComponent', () => {
  let component: AllNoteComponent;
  let fixture: ComponentFixture<AllNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllNoteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
