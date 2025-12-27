import { Component, OnInit } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { Article } from "../../../../shared/types/article";

@Component({
    selector: 'admin-article-news',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header Section -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">News & Articles</h1>
          <p class="text-gray-600">Stay updated with the latest healthcare news and insights</p>
        </div>

        <!-- Search and Filter Bar -->
        <div class="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="filterArticles()"
                placeholder="Search articles..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <select
              [(ngModel)]="selectedCategory"
              (change)="filterArticles()"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Medical">Medical</option>
              <option value="Research">Research</option>
              <option value="Technology">Technology</option>
              <option value="Wellness">Wellness</option>
              <option value="Community">Community</option>
            </select>
          </div>
        </div>

        <!-- Featured Article -->
        <div *ngIf="featuredArticle" class="mb-12">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Featured Article</h2>
          <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div class="md:flex">
              <div class="md:w-1/2">
                <img
                  [src]="featuredArticle.imageUrl"
                  [alt]="featuredArticle.title"
                  class="h-full w-full object-cover"
                />
              </div>
              <div class="md:w-1/2 p-8">
                <span class="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-4">
                  {{ featuredArticle.category }}
                </span>
                <h3 class="text-3xl font-bold text-gray-900 mb-4">
                  {{ featuredArticle.title }}
                </h3>
                <p class="text-gray-600 mb-6 leading-relaxed">
                  {{ featuredArticle.excerpt }}
                </p>
                <div class="flex items-center justify-between">
                  <div class="flex items-center text-sm text-gray-500">
                    <span class="mr-4">By {{ featuredArticle.author }}</span>
                    <span class="mr-4">{{ featuredArticle.date }}</span>
                    <span>{{ featuredArticle.readTime }}</span>
                  </div>
                  <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    Read More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Articles Grid -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Latest Articles</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              *ngFor="let article of filteredArticles"
              class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            >
              <img
                [src]="article.imageUrl"
                [alt]="article.title"
                class="w-full h-48 object-cover"
              />
              <div class="p-6">
                <span class="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full mb-3">
                  {{ article.category }}
                </span>
                <h3 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {{ article.title }}
                </h3>
                <p class="text-gray-600 mb-4 line-clamp-3">
                  {{ article.excerpt }}
                </p>
                <div class="flex items-center justify-between text-sm text-gray-500">
                  <span>{{ article.author }}</span>
                  <span>{{ article.readTime }}</span>
                </div>
                <div class="mt-2 text-sm text-gray-500">
                  {{ article.date }}
                </div>
                <button class="mt-4 w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200">
                  Read Article
                </button>
              </div>
            </div>
          </div>

          <!-- No Results Message -->
          <div *ngIf="filteredArticles.length === 0" class="text-center py-12">
            <p class="text-gray-500 text-lg">No articles found matching your search.</p>
          </div>
        </div>

        <!-- Pagination -->
        <div class="mt-12 flex justify-center">
          <nav class="inline-flex rounded-lg shadow-sm">
            <button class="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-l-lg hover:bg-gray-50">
              Previous
            </button>
            <button class="px-4 py-2 border-t border-b border-gray-300 bg-blue-600 text-white">
              1
            </button>
            <button class="px-4 py-2 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              2
            </button>
            <button class="px-4 py-2 border-t border-b border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              3
            </button>
            <button class="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-r-lg hover:bg-gray-50">
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
    `
})

export class AdminArticleNewsComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    searchTerm: string = '';
    selectedCategory: string = 'all';

    articles: Article[] = [
        {
            id: 1,
            title: 'Revolutionary AI Technology Transforms Patient Diagnosis',
            category: 'Technology',
            excerpt: 'Discover how artificial intelligence is revolutionizing the way doctors diagnose complex medical conditions, improving accuracy and reducing diagnosis time.',
            author: 'Dr. Sarah Johnson',
            date: 'Dec 15, 2024',
            imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
            readTime: '5 min read',
            featured: true
        },
        {
            id: 2,
            title: 'New Cardiac Care Unit Opens with State-of-the-Art Equipment',
            category: 'Medical',
            excerpt: 'Our hospital proudly announces the opening of a new cardiac care unit equipped with the latest technology to provide exceptional heart care.',
            author: 'Michael Chen',
            date: 'Dec 12, 2024',
            imageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800',
            readTime: '4 min read'
        },
        {
            id: 3,
            title: 'Breakthrough in Cancer Research Shows Promising Results',
            category: 'Research',
            excerpt: 'Recent clinical trials demonstrate significant progress in targeted cancer therapy, offering new hope for patients.',
            author: 'Dr. Emily Rodriguez',
            date: 'Dec 10, 2024',
            imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800',
            readTime: '6 min read'
        },
        {
            id: 4,
            title: 'Mental Health Awareness: Breaking the Stigma',
            category: 'Wellness',
            excerpt: 'Learn about our comprehensive mental health programs and resources available to support your emotional well-being.',
            author: 'Dr. James Williams',
            date: 'Dec 8, 2024',
            imageUrl: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800',
            readTime: '7 min read'
        },
        {
            id: 5,
            title: 'Community Health Fair Success: Over 500 Attendees',
            category: 'Community',
            excerpt: 'Our recent community health fair provided free screenings and health education to hundreds of community members.',
            author: 'Lisa Thompson',
            date: 'Dec 5, 2024',
            imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
            readTime: '3 min read'
        },
        {
            id: 6,
            title: 'Telemedicine Expansion Makes Healthcare More Accessible',
            category: 'Technology',
            excerpt: 'Virtual consultations now available 24/7, bringing quality healthcare to patients in remote areas.',
            author: 'Dr. Robert Lee',
            date: 'Dec 3, 2024',
            imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
            readTime: '5 min read'
        }
    ];

    filteredArticles: Article[] = [];
    featuredArticle: Article | null = null;
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        this.featuredArticle = this.articles.find(a => a.featured) || null;
        this.filteredArticles = this.articles.filter(a => !a.featured);
    }
    // #endregion

    // #region Methods
    filterArticles() {
        let filtered = this.articles.filter(a => !a.featured);

        if (this.selectedCategory !== 'all') {
            filtered = filtered.filter(a => a.category === this.selectedCategory);
        }

        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(term) ||
                a.excerpt.toLowerCase().includes(term) ||
                a.author.toLowerCase().includes(term)
            );
        }

        this.filteredArticles = filtered;
    }
    // #endregion
}