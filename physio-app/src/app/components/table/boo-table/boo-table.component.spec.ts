import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BooTableComponent } from './boo-table.component';

describe('BooTableComponent', () => {
  let component: BooTableComponent;
  let fixture: ComponentFixture<BooTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BooTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BooTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
