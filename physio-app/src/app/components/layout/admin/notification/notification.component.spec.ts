import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AdminNotificationComponent } from './notification.component';

describe('AdminNotificationComponent', () => {
  let component: AdminNotificationComponent;
  let fixture: ComponentFixture<AdminNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNotificationComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows an empty state instead of sample notifications', () => {
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain("You're all caught up");
    expect(text).not.toContain('Fuse');
  });
});
