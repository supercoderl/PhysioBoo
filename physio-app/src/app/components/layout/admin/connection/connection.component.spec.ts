import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminConnectionComponent } from './connection.component';

describe('AdminConnectionComponent', () => {
  let component: AdminConnectionComponent;
  let fixture: ComponentFixture<AdminConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminConnectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
