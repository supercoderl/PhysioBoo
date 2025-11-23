import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BooFormComponent } from './boo-form.component';

describe('BooFormComponent', () => {
  let component: BooFormComponent;
  let fixture: ComponentFixture<BooFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BooFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BooFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
