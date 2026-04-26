import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
  selector: 'app-exception',
  standalone: true,
  imports: [CommonModule, NzResultModule, NzButtonModule, NzIconModule],
  template: `
    <section class="h-dvh flex-center-center">
      <div class="text-center animate-fade-in bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-2xl p-10 max-w-xl mx-auto shadow-2xl border border-white border-opacity-20">
          <div class="relative mb-6">
              <span class="text-9xl font-extrabold text-blue-300 block animate-bounce-in leading-none">{{ errorCode }}</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold mb-4">{{ getErrorTitle() }}</h1>
          <p class="text-md md:text-xl text-opacity-80 mb-6">
              {{ getErrorSubtitle() }}
          </p>
          <a 
            class="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
            (click)="goHome()"
          >
              Go to Home
          </a>
      </div>
    </section>                                     
  `,
  styles: `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fade-in {
      animation: fadeIn 0.8s ease-out forwards;
    }

    @keyframes bounceIn {
      0%, 20%, 40%, 60%, 80%, 100% {
        transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
      }
      0% {
        opacity: 0;
        transform: scale3d(.3, .3, .3);
      }
      20% {
        transform: scale3d(1.1, 1.1, 1.1);
      }
      40% {
        transform: scale3d(.9, .9, .9);
      }
      60% {
        opacity: 1;
        transform: scale3d(1.03, 1.03, 1.03);
      }
      80% {
        transform: scale3d(.97, .97, .97);
      }
      100% {
        opacity: 1;
        transform: scale3d(1, 1, 1);
      }
    }
        
    .animate-bounce-in {
      animation: bounceIn 1.2s ease-out forwards;
    }

    @keyframes wiggle {
      0%, 7% {
        transform: rotateZ(0);
      }
      15% {
        transform: rotateZ(-15deg);
      }
      20% {
        transform: rotateZ(10deg);
      }
      25% {
        transform: rotateZ(-10deg);
      }
      30% {
        transform: rotateZ(6deg);
      }
      35% {
        transform: rotateZ(-4deg);
      }
      40%, 100% {
        transform: rotateZ(0);
      }
    }
    .animate-wiggle {
      animation: wiggle 2s infinite ease-in-out; /* Infinite loop */
    }
  `
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
}