import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMainHeaderComponent } from './main-header.component';

describe('AdminMainHeaderComponent', () => {
  let component: AdminMainHeaderComponent;
  let fixture: ComponentFixture<AdminMainHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMainHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminMainHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
