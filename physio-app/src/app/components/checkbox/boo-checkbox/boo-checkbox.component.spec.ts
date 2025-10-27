import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BooCheckboxComponent } from './boo-checkbox.component';

describe('BooCheckboxComponent', () => {
  let component: BooCheckboxComponent;
  let fixture: ComponentFixture<BooCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BooCheckboxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BooCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
