import { Component, OnInit } from "@angular/core";
import { SharedModule } from "../../../../../../shared/shared-imports";

interface DoctorPerformance {
    TotalPatientTreated: number;
    SuccessRate: number;
    PatientSatisfactionScore: number;
    AverageRating: number;
    TotalReviews: number;
    TotalSurgeriesPerformed: number;
}

@Component({
    selector: 'admin-account-doctor-performance',
    standalone: true,
    imports: [SharedModule],
    template: `
    <div class="relative">
        <div class="overflow-hidden">
          <div class="divide-y divide-gray-200">
            <div class="px-6 pb-5">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 mb-0">Total Patient Treated</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-semibold text-gray-900 mb-0">{{ performance.TotalPatientTreated | number }}</p>
                  <span class="inline-flex items-center text-xs text-blue-600 mt-1">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"></path>
                    </svg>
                    Increase
                  </span>
                </div>
              </div>
            </div>
            <div class="px-6 py-5">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 mb-0">Success Rate</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-semibold text-gray-900 mb-0">{{ performance.SuccessRate }}%</p>
                  <div class="w-32 bg-gray-200 rounded-full h-1.5 mt-2">
                    <div class="bg-green-500 h-1.5 rounded-full" [style.width.%]="performance.SuccessRate"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-6 py-5">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 mb-0">Satisfaction Score</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-semibold text-gray-900 mb-0">{{ performance.PatientSatisfactionScore }}<span class="text-base text-gray-500">/100</span></p>
                  <div class="w-32 bg-gray-200 rounded-full h-1.5 mt-2">
                    <div class="bg-purple-500 h-1.5 rounded-full" [style.width.%]="performance.PatientSatisfactionScore"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-6 py-5">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 mb-0">Average Rating</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-semibold text-gray-900 mb-0">{{ performance.AverageRating }}<span class="text-base text-gray-500">/5.0</span></p>
                  <div class="flex items-center gap-0.5 mt-2 justify-end">
                    <svg *ngFor="let star of [1,2,3,4,5]" class="w-4 h-4" [class.text-yellow-400]="star <= performance.AverageRating" [class.text-gray-300]="star > performance.AverageRating" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-6 py-5">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 mb-0">Total Reviews</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-semibold text-gray-900 mb-0">{{ performance.TotalReviews | number }}</p>
                  <p class="text-xs text-gray-500 mt-1 mb-0">From patient</p>
                </div>
              </div>
            </div>
            <div class="px-6 pt-5">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900 mb-0">Total Surgeries Performed</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-semibold text-gray-900 mb-0">{{ performance.TotalSurgeriesPerformed | number }}</p>
                  <span class="inline-flex items-center text-xs text-red-600 mt-1">Expert</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
    `
})

export class AdminAccountDoctorPerformanceComponent implements OnInit {
    performance: DoctorPerformance = {
        TotalPatientTreated: 0,
        SuccessRate: 0,
        PatientSatisfactionScore: 0,
        AverageRating: 0,
        TotalReviews: 0,
        TotalSurgeriesPerformed: 0
    };

    ngOnInit(): void {
        this.loadPerformanceData();
    }

    private loadPerformanceData(): void {
        this.performance = {
            TotalPatientTreated: 1247,
            SuccessRate: 96.5,
            PatientSatisfactionScore: 92,
            AverageRating: 4.8,
            TotalReviews: 856,
            TotalSurgeriesPerformed: 423
        };
    }
}