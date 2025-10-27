import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BooButtonComponent } from './boo-button.component';

describe('BooButtonComponent', () => {
  let component: BooButtonComponent;
  let fixture: ComponentFixture<BooButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BooButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BooButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
