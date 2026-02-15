import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { interval, Subject, takeUntil } from "rxjs";
import { AdminContentHeaderComponent } from "../../../../components/layout/admin/content-header/content-header.component";

interface QueueDisplay {
  queueNumber: string;
  counter: string;
  status: 'current' | 'next' | 'waiting';
}

@Component({
  selector: 'admin-queue',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SharedModule,
    AdminContentHeaderComponent
],
  template: `
    <admin-content-header>
      <!-- Current Number Display -->
      <div class="mb-8">
        <div class="bg-surface rounded-3xl p-12 border-4 border-blue-500">
          <div class="text-center">
            <h2 class="text-4xl font-bold text-gray-700 mb-6">NOW SERVING</h2>
            <div class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl py-16 px-8 mb-6">
              <div class="text-9xl font-bold text-white tracking-wider animate-pulse">
                {{ currentQueue.queueNumber }}
              </div>
            </div>
            <div class="flex items-center justify-center gap-4 text-3xl font-semibold text-gray-700">
              <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{{ currentQueue.counter }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Next Numbers Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Next in Queue -->
        <div class="bg-surface rounded-2xl p-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="bg-green-100 rounded-full p-3">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <h3 class="text-3xl font-bold text-gray-800 mb-0">NEXT</h3>
          </div>
          <div *ngFor="let queue of nextQueues" 
               class="bg-green-50 rounded-xl p-6 mb-4 border-2 border-green-200">
            <div class="flex items-center justify-between">
              <div class="text-5xl font-bold text-green-700">
                {{ queue.queueNumber }}
              </div>
              <div class="text-right">
                <div class="text-xl font-semibold text-gray-700">{{ queue.counter }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Waiting List -->
        <div class="bg-surface rounded-2xl p-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="bg-yellow-100 rounded-full p-3">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-3xl font-bold text-gray-800 mb-0">WAITING</h3>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div *ngFor="let queue of waitingQueues" 
                 class="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 text-center">
              <div class="text-3xl font-bold text-gray-700">
                {{ queue.queueNumber }}
              </div>
              <div class="text-sm text-gray-600 mt-2">{{ queue.counter }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Info Bar -->
      <div class="bg-surface rounded-2xl p-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="bg-blue-100 rounded-full p-3">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-2xl font-semibold text-gray-800 mb-0">Please wait for your number</p>
              <p class="text-lg text-gray-600 mb-0">Check the counter location when called</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-lg text-gray-600 mb-0">{{ currentTime }}</p>
            <p class="text-2xl font-bold text-blue-600 mb-0">{{ currentDate }}</p>
          </div>
        </div>
      </div>

      <!-- Scrolling Announcement -->
      <div class="mt-6 bg-red-600 rounded-2xl p-4 overflow-hidden">
        <div class="flex items-center gap-3">
          <svg class="w-8 h-8 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <div class="announcement-scroll overflow-hidden">
            <p class="text-2xl font-semibold text-white whitespace-nowrap">
              {{ announcement }}
            </p>
          </div>
        </div>
      </div>
    </admin-content-header>
    `,
  styles: [`
    @keyframes scroll {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
    
    .announcement-scroll p {
      animation: scroll 20s linear infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})

export class AdminQueueComponent implements OnInit, OnDestroy {
  // #region Inputs, Outputs, Properties
  private destroy$ = new Subject<void>();
  currentQueue = { queueNumber: 'A025', counter: 'Counter 3' };

  nextQueues: QueueDisplay[] = [
    { queueNumber: 'A026', counter: 'Counter 3', status: 'next' },
    { queueNumber: 'B012', counter: 'Counter 1', status: 'next' }
  ];

  waitingQueues: QueueDisplay[] = [
    { queueNumber: 'A027', counter: 'Counter 3', status: 'waiting' },
    { queueNumber: 'A028', counter: 'Counter 3', status: 'waiting' },
    { queueNumber: 'B013', counter: 'Counter 1', status: 'waiting' },
    { queueNumber: 'B014', counter: 'Counter 1', status: 'waiting' },
    { queueNumber: 'C008', counter: 'Counter 5', status: 'waiting' },
    { queueNumber: 'C009', counter: 'Counter 5', status: 'waiting' }
  ];

  currentTime: string = '';
  currentDate: string = '';
  announcement: string = 'Welcome to City General Hospital • Please maintain social distancing • Wear your mask at all times • Follow staff instructions';

  private timeInterval: any;
  // #endregion

  // #region Init (Lifecycle + Setup)
  ngOnInit() {
    this.updateTime();
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateTime());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  // #endregion

  // #region Methods
  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    this.currentDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  // #endregion
}