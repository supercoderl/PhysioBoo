import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNotificationComponent } from './notification.component';

describe('AdminNotificationComponent', () => {
  let component: AdminNotificationComponent;
  let fixture: ComponentFixture<AdminNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNotificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
