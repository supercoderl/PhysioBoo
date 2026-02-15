import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { Testimonial } from "../../../../shared/types/testimonial";
import { Feature } from "../../../../shared/types/feature";
import { Banner } from "../../../../shared/types/banner";

@Component({
    selector: 'admin-home-configuration',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Home Page Configuration</h1>
          <p class="text-gray-600">Manage banners, features, and testimonials displayed on the home page</p>
        </div>

        <!-- Tab Navigation -->
        <div class="bg-surface rounded-lg shadow-sm mb-6">
          <div class="border-b border-gray-200">
            <nav class="flex -mb-px">
              <button
                *ngFor="let tab of tabs"
                (click)="activeTab = tab.id"
                [ngClass]="{
                  'border-blue-500 text-blue-600': activeTab === tab.id,
                  'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== tab.id
                }"
                class="px-6 py-4 border-b-2 font-medium text-sm transition-colors"
              >
                {{ tab.name }}
              </button>
            </nav>
          </div>
        </div>

        <!-- Hero Banners Tab -->
        <div *ngIf="activeTab === 'banners'">
          <div class="bg-surface rounded-lg shadow-sm p-6 mb-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Hero Banners</h2>
              <button
                (click)="showBannerModal = true; editingBanner = null"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add Banner
              </button>
            </div>

            <div class="space-y-4">
              <div
                *ngFor="let banner of banners"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex items-start gap-4">
                  <img
                    [src]="banner.imageUrl"
                    alt="Banner"
                    class="w-32 h-20 object-cover rounded-lg"
                  />
                  <div class="flex-1">
                    <div class="flex items-start justify-between">
                      <div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ banner.title }}</h3>
                        <p class="text-sm text-gray-600 mb-2">{{ banner.subtitle }}</p>
                        <div class="flex items-center gap-4 text-sm text-gray-500">
                          <span>Order: {{ banner.order }}</span>
                          <span class="flex items-center gap-1">
                            <span [ngClass]="{
                              'bg-green-100 text-green-800': banner.active,
                              'bg-gray-100 text-gray-800': !banner.active
                            }" class="px-2 py-1 rounded-full text-xs font-medium">
                              {{ banner.active ? 'Active' : 'Inactive' }}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <button
                          (click)="editBanner(banner)"
                          class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        <button
                          (click)="deleteBanner(banner.id)"
                          class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Features Tab -->
        <div *ngIf="activeTab === 'features'">
          <div class="bg-surface rounded-lg shadow-sm p-6 mb-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Features</h2>
              <button
                (click)="showFeatureModal = true; editingFeature = null"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add Feature
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                *ngFor="let feature of features"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start mb-3">
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                    {{ feature.icon }}
                  </div>
                  <div class="flex gap-1">
                    <button
                      (click)="editFeature(feature)"
                      class="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      (click)="deleteFeature(feature.id)"
                      class="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <h3 class="font-semibold text-gray-900 mb-2">{{ feature.title }}</h3>
                <p class="text-sm text-gray-600 mb-3">{{ feature.description }}</p>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-500">Order: {{ feature.order }}</span>
                  <span [ngClass]="{
                    'bg-green-100 text-green-800': feature.active,
                    'bg-gray-100 text-gray-800': !feature.active
                  }" class="px-2 py-1 rounded-full font-medium">
                    {{ feature.active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Testimonials Tab -->
        <div *ngIf="activeTab === 'testimonials'">
          <div class="bg-surface rounded-lg shadow-sm p-6 mb-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-gray-900">Patient Testimonials</h2>
              <button
                (click)="showTestimonialModal = true; editingTestimonial = null"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Add Testimonial
              </button>
            </div>

            <div class="space-y-4">
              <div
                *ngFor="let testimonial of testimonials"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-1">{{ testimonial.patientName }}</h3>
                    <div class="flex items-center gap-2 mb-2">
                      <div class="flex">
                        <svg *ngFor="let star of [1,2,3,4,5]" 
                             [ngClass]="star <= testimonial.rating ? 'text-yellow-400' : 'text-gray-300'"
                             class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      </div>
                      <span class="text-xs text-gray-500">{{ testimonial.date }}</span>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <span [ngClass]="{
                      'bg-green-100 text-green-800': testimonial.active,
                      'bg-gray-100 text-gray-800': !testimonial.active
                    }" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ testimonial.active ? 'Active' : 'Inactive' }}
                    </span>
                    <button
                      (click)="editTestimonial(testimonial)"
                      class="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      (click)="deleteTestimonial(testimonial.id)"
                      class="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <p class="text-sm text-gray-600 italic">"{{ testimonial.comment }}"</p>
              </div>
            </div>
          </div>
        </div>

        <!-- General Settings Tab -->
        <div *ngIf="activeTab === 'settings'">
          <div class="bg-surface rounded-lg shadow-sm p-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
            
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                <input
                  type="text"
                  [(ngModel)]="settings.hospitalName"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter hospital name"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                <input
                  type="text"
                  [(ngModel)]="settings.tagline"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tagline"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
                <textarea
                  [(ngModel)]="settings.welcomeMessage"
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter welcome message"
                ></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    [(ngModel)]="settings.contactPhone"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    [(ngModel)]="settings.contactEmail"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  [(ngModel)]="settings.address"
                  rows="2"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter hospital address"
                ></textarea>
              </div>

              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="showEmergency"
                  [(ngModel)]="settings.showEmergencyBanner"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label for="showEmergency" class="text-sm font-medium text-gray-700">
                  Show Emergency Contact Banner on Home Page
                </label>
              </div>

              <div class="pt-4 border-t border-gray-200">
                <button
                  (click)="saveSettings()"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Banner Modal -->
      <div
        *ngIf="showBannerModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        (click)="showBannerModal = false"
      >
        <div class="bg-surface rounded-lg max-w-2xl w-full p-6" (click)="$event.stopPropagation()">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            {{ editingBanner ? 'Edit Banner' : 'Add New Banner' }}
          </h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter banner title" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <input type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter subtitle" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <input type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter image URL" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                <input type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Learn More" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                <input type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., /services" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                <input type="number" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="1" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button (click)="showTestimonialModal = false" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors">Cancel</button>
            <button class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Save Testimonial</button>
          </div>
        </div>
      </div>
    </div>
    `
})

export class AdminHomeConfigurationComponent {
    // #region Inputs, Outputs, Properties
    activeTab = 'banners';
    showBannerModal = false;
    showFeatureModal = false;
    showTestimonialModal = false;
    editingBanner: Banner | null = null;
    editingFeature: Feature | null = null;
    editingTestimonial: Testimonial | null = null;

    tabs = [
        { id: 'banners', name: 'Hero Banners' },
        { id: 'features', name: 'Features' },
        { id: 'testimonials', name: 'Testimonials' },
        { id: 'settings', name: 'General Settings' }
    ];

    settings = {
        hospitalName: 'City General Hospital',
        tagline: 'Your Health, Our Priority',
        welcomeMessage: 'Welcome to City General Hospital. We provide comprehensive healthcare services with state-of-the-art facilities and experienced medical professionals.',
        contactPhone: '+1 (555) 123-4567',
        contactEmail: 'info@cityhospital.com',
        address: '123 Healthcare Ave, Medical District, City, State 12345',
        showEmergencyBanner: true
    };

    banners: Banner[] = [
        {
            id: 1,
            title: 'Advanced Healthcare Solutions',
            subtitle: 'Experience world-class medical care with our expert team',
            imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
            buttonText: 'Learn More',
            buttonLink: '/services',
            order: 1,
            active: true
        },
        {
            id: 2,
            title: '24/7 Emergency Care',
            subtitle: 'Always ready to serve you in critical moments',
            imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800',
            buttonText: 'Contact Us',
            buttonLink: '/emergency',
            order: 2,
            active: true
        },
        {
            id: 3,
            title: 'Book Your Appointment Online',
            subtitle: 'Schedule consultations with our specialists easily',
            imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
            buttonText: 'Book Now',
            buttonLink: '/appointments',
            order: 3,
            active: false
        }
    ];

    features: Feature[] = [
        {
            id: 1,
            icon: '🏥',
            title: 'Modern Facilities',
            description: 'State-of-the-art medical equipment and comfortable patient rooms',
            order: 1,
            active: true
        },
        {
            id: 2,
            icon: '👨‍⚕️',
            title: 'Expert Doctors',
            description: 'Experienced medical professionals specialized in various fields',
            order: 2,
            active: true
        },
        {
            id: 3,
            icon: '🚑',
            title: '24/7 Emergency',
            description: 'Round-the-clock emergency services for critical care',
            order: 3,
            active: true
        },
        {
            id: 4,
            icon: '💊',
            title: 'Pharmacy Services',
            description: 'In-house pharmacy with all essential medications',
            order: 4,
            active: true
        },
        {
            id: 5,
            icon: '🔬',
            title: 'Diagnostic Lab',
            description: 'Advanced laboratory for accurate and fast test results',
            order: 5,
            active: true
        },
        {
            id: 6,
            icon: '📱',
            title: 'Online Booking',
            description: 'Easy appointment scheduling through our digital platform',
            order: 6,
            active: true
        }
    ];

    testimonials: Testimonial[] = [
        {
            id: 1,
            patientName: 'Sarah Johnson',
            rating: 5,
            comment: 'The staff was incredibly caring and professional. The facilities are modern and clean. I felt safe and well-cared for throughout my treatment.',
            date: '2024-11-15',
            active: true
        },
        {
            id: 2,
            patientName: 'Michael Chen',
            rating: 5,
            comment: 'Excellent service from start to finish. The doctors took time to explain everything clearly and the treatment was very effective.',
            date: '2024-11-10',
            active: true
        },
        {
            id: 3,
            patientName: 'Emily Rodriguez',
            rating: 4,
            comment: 'Great experience overall. The appointment booking was easy and the wait time was minimal. Would definitely recommend.',
            date: '2024-11-05',
            active: true
        },
        {
            id: 4,
            patientName: 'David Thompson',
            rating: 5,
            comment: 'Outstanding emergency care service. The team responded quickly and handled my case with utmost professionalism.',
            date: '2024-10-28',
            active: false
        }
    ];
    // #endregion

    // #region Methods
    editBanner(banner: Banner) {
        this.editingBanner = banner;
        this.showBannerModal = true;
    }

    deleteBanner(id: number) {
        if (confirm('Are you sure you want to delete this banner?')) {
            this.banners = this.banners.filter(b => b.id !== id);
        }
    }

    editFeature(feature: Feature) {
        this.editingFeature = feature;
        this.showFeatureModal = true;
    }

    deleteFeature(id: number) {
        if (confirm('Are you sure you want to delete this feature?')) {
            this.features = this.features.filter(f => f.id !== id);
        }
    }

    editTestimonial(testimonial: Testimonial) {
        this.editingTestimonial = testimonial;
        this.showTestimonialModal = true;
    }

    deleteTestimonial(id: number) {
        if (confirm('Are you sure you want to delete this testimonial?')) {
            this.testimonials = this.testimonials.filter(t => t.id !== id);
        }
    }

    saveSettings() {
        console.log('Saving settings:', this.settings);
        alert('Settings saved successfully!');
    }
    // #endregion
}