import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BooTextareaComponent } from './boo-textarea.component';

describe('BooTextareaComponent', () => {
  let component: BooTextareaComponent;
  let fixture: ComponentFixture<BooTextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BooTextareaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BooTextareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
