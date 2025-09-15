import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-exception',
  standalone: true,
  imports: [CommonModule, NzResultModule, NzButtonModule, NzIconModule],
  template: `
    <div class="min-h-screen flex-center-center p-6 bg-gray-50">
      <div class="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-md overflow-hidden">
        
        <!-- Header -->
        <div class="px-8 pt-8 pb-6 border-b border-gray-100">
          <div class="flex-center-center gap-4">
            <span class="text-5xl font-bold text-gray-800 tracking-tight">{{ errorCode }}</span>
            <div [class]="getIconContainerClass()">
              <i nz-icon [nzType]="getIconName()" nzTheme="outline" class="text-xl"></i>
            </div>
          </div>
        </div>
        
        <!-- Content -->
        <div class="px-8 py-6 text-center">
          <h1 class="text-2xl font-semibold text-gray-900 mb-2 leading-tight">{{ getErrorTitle() }}</h1>
          <p class="text-gray-600 leading-relaxed mb-8">{{ getErrorSubtitle() }}</p>
          
          <div class="flex gap-3 justify-center">
            <button 
              nz-button 
              class="h-10 px-5 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-500 border-blue-600 hover:border-blue-700 flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/25 hover:text-white"
              (click)="goHome()">
              <i nz-icon nzType="home" nzTheme="outline"></i>
              <span class="!m-0">Home</span>
            </button>
            <button 
              nz-button 
              class="h-10 px-5 rounded-md font-medium bg-green-600 text-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-500 hover:text-white"
              (click)="goBack()">
              <i nz-icon nzType="arrow-left" nzTheme="outline"></i>
              <span class="!m-0">Back</span>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-8 py-5 bg-gray-50 border-t border-gray-100 text-center">
          <span class="text-sm text-gray-600">
            Need assistance? <a href="/contact" class="text-blue-600 hover:text-blue-700 font-medium no-underline hover:underline transition-colors">Contact support</a>
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Override ng-zorro button styles for better integration */
    ::ng-deep .ant-btn {
      border: none !important;
      box-shadow: none !important;
      outline: none !important;
    }

    ::ng-deep .ant-btn-primary {
      background-color: transparent !important;
    }

    ::ng-deep .ant-btn:focus {
      box-shadow: none !important;
    }

    /* Mobile responsiveness */
    @media (max-width: 640px) {
      .exception-container {
        padding: 1rem;
      }

      .error-header {
        padding: 1.5rem 1.25rem 1.25rem;
      }

      .error-content {
        padding: 1.25rem;
      }

      .error-footer {
        padding: 1rem 1.25rem 1.25rem;
      }

      .error-code {
        font-size: 2.5rem;
      }

      .error-title {
        font-size: 1.25rem;
      }

      .error-description {
        font-size: 0.9375rem;
        margin-bottom: 1.5rem;
      }

      .error-actions {
        flex-direction: column;
        gap: 0.5rem;
      }

      .btn-primary,
      .btn-secondary {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ExceptionComponent implements OnInit {
  errorCode: '404' | '403' | '500' | '401' = '404';

  errorMessages: { [key: string]: { title: string; subtitle: string } } = {
    '401': {
      title: 'Authentication Required',
      subtitle: 'Please sign in to access this resource.'
    },
    '403': {
      title: 'Access Forbidden',
      subtitle: 'You don\'t have permission to view this page.'
    },
    '404': {
      title: 'Page Not Found',
      subtitle: 'The requested page could not be found.'
    },
    '500': {
      title: 'Internal Server Error',
      subtitle: 'A server error occurred. Please try again later.'
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['code'] && this.errorMessages[params['code']]) {
        this.errorCode = params['code'];
      }
    });
  }

  getErrorTitle(): string {
    return this.errorMessages[this.errorCode]?.title || 'Error';
  }

  getErrorSubtitle(): string {
    return this.errorMessages[this.errorCode]?.subtitle || 'An error occurred.';
  }

  getIconName(): string {
    const icons: { [key: string]: string } = {
      '401': 'lock',
      '403': 'stop',
      '404': 'file-search',
      '500': 'exclamation-circle'
    };
    return icons[this.errorCode] || 'question-circle';
  }

  getIconContainerClass(): string {
    const classes = {
      '401': 'w-12 h-12 flex-center-center bg-purple-100 text-purple-600 rounded-full',
      '403': 'w-12 h-12 flex-center-center bg-red-100 text-red-600 rounded-full',
      '404': 'w-12 h-12 flex-center-center bg-yellow-100 text-yellow-600 rounded-full',
      '500': 'w-12 h-12 flex-center-center bg-red-100 text-red-600 rounded-full'
    };
    return classes[this.errorCode] || 'w-12 h-12 flex-center-center bg-gray-100 text-gray-600 rounded-full';
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}