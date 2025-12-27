import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./admin.component').then(m => m.AdminComponent),
        data: { breadcrumb: ['admin'] },
        children: [
            {
                path: '',
                redirectTo: 'overview',
                pathMatch: 'full'
            },
            {
                path: 'overview',
                data: { breadcrumb: ['overview'] },
                children: [
                    {
                        path: '',
                        redirectTo: 'dashboard',
                        pathMatch: 'full'
                    },
                    {
                        path: 'dashboard',
                        loadComponent: () => import('./overview/dashboard/dashboard.component').then(m => m.DashboardComponent),
                        data: { breadcrumb: ['dashboard'] },
                    }
                ]
            },
            {
                path: 'reception',
                data: { breadcrumb: ['reception'] },
                children: [
                    {
                        path: '',
                        redirectTo: 'booking',
                        pathMatch: 'full'
                    },
                    {
                        path: 'booking',
                        data: { breadcrumb: ['booking'] },
                        children: [
                            {
                                path: '',
                                redirectTo: 'list',
                                pathMatch: 'full'
                            },
                            {
                                path: 'list',
                                loadComponent: () => import('./reception/booking/admin-booking-list/admin-booking-list.component').then(m => m.AdminBookingListComponent),
                                data: { breadcrumb: ['list'] }
                            }
                        ]
                    },
                    {
                        path: 'queue',
                        data: { breadcrumb: ['queue'] },
                        loadComponent: () => import('./reception/queue/queue.component').then(m => m.AdminQueueComponent),
                    },
                    {
                        path: 'patient-lookup',
                        data: { breadcrumb: ['patient-lookup'] },
                        loadComponent: () => import('./reception/patient-lookup/patient-lookup.component').then(m => m.AdminPatientLookupComponent),
                    },
                    {
                        path: 'registration',
                        data: { breadcrumb: ['registration'] },
                        loadComponent: () => import('./reception/registration/registration.component').then(m => m.AdminRegistrationComponent),
                    }
                ]
            },
            {
                path: 'clinic',
                data: { breadcrumb: ['clinic'] },
                children: [
                    {
                        path: '',
                        redirectTo: 'doctor-desk',
                        pathMatch: 'full'
                    },
                    {
                        path: 'doctor-desk',
                        data: { breadcrumb: ['doctor-desk'] },
                        loadComponent: () => import('./clinic/doctor-desk/doctor-desk.component').then(m => m.AdminDoctorDeskComponent)
                    },
                    {
                        path: 'prescription',
                        data: { breadcrumb: ['prescription'] },
                        loadComponent: () => import('./clinic/prescription/prescription.component').then(m => m.AdminPrescriptionComponent)
                    },
                    {
                        path: 'medical-record',
                        data: { breadcrumb: ['medical record'] },
                        loadComponent: () => import('./clinic/medical-record/medical-record.component').then(m => m.AdminMedicalRecordComponent)
                    }
                ]
            },
            {
                path: 'inpatient',
                data: { breadcrumb: ['inpatient'] },
                children: [
                    {
                        path: '',
                        redirectTo: 'bed-map',
                        pathMatch: 'full'
                    },
                    {
                        path: 'bed-map',
                        data: { breadcrumb: ['bed-map'] },
                        loadComponent: () => import('./inpatient/bed-map/bed-map.component').then(m => m.AdminBedMapComponent),
                    },
                    {
                        path: 'admission',
                        data: { breadcrumb: ['admission'] },
                        loadComponent: () => import('./inpatient/admission/admission.component').then(m => m.AdminAdmissionComponent),
                    },
                    {
                        path: 'treatment-sheet',
                        data: { breadcrumb: ['treatment-sheet'] },
                        loadComponent: () => import('./inpatient/treatment-sheet/treatment-sheet.component').then(m => m.AdminTreatmentSheetComponent),
                    }
                ]
            },
            {
                path: 'paraclinical',
                data: { breadcrumb: ['paraclinical'] },
                children: [
                    {
                        path: '',
                        redirectTo: 'laboratory',
                        pathMatch: 'full'
                    },
                    {
                        path: 'laboratory',
                        data: { breadcrumb: ['laboratory'] },
                        loadComponent: () => import('./paraclinical/laboratory/laboratory.component').then(m => m.AdminLaboratoryComponent),
                    },
                    {
                        path: 'radiology',
                        data: { breadcrumb: ['radiology'] },
                        loadComponent: () => import('./paraclinical/radiology/radiology.component').then(m => m.AdminRadiologyComponent),
                    },
                    {
                        path: 'surgery',
                        data: { breadcrumb: ['surgery'] },
                        loadComponent: () => import('./paraclinical/surgery/surgery.component').then(m => m.AdminSurgeryComponent),
                    }
                ]
            },
            {
                path: 'pharmacy',
                data: { breadcrumb: ['pharmacy'] },
                children: [
                    {
                        path: '',
                        redirectTo: 'retail',
                        pathMatch: 'full'
                    },
                    {
                        path: 'retail',
                        data: { breadcrumb: ['retail'] },
                        loadComponent: () => import('./pharmacy/retail/retail.component').then(m => m.AdminRetailComponent),
                    },
                    {
                        path: 'prescription-dispense',
                        data: { breadcrumb: ['prescription-dispense'] },
                        loadComponent: () => import('./pharmacy/prescription-dispense/prescription-dispense.component').then(m => m.AdminPrescriptionDispenseComponent),
                    },
                    {
                        path: 'inventory-management',
                        data: { breadcrumb: ['inventory-management'] },
                        loadComponent: () => import('./pharmacy/inventory-management/inventory-management.component').then(m => m.AdminInventoryManagementComponent),
                    },
                    {
                        path: 'stock-take',
                        data: { breadcrumb: ['stock-take'] },
                        loadComponent: () => import('./pharmacy/stock-take/stock-take.component').then(m => m.AdminStockTakeComponent),
                    }
                ]
            },
            {
                path: 'finance',
                data: { breadcrumb: ['finance'] },
                children: [
                    {
                        path: '',
                        redirectTo: 'cashier',
                        pathMatch: 'full'
                    },
                    {
                        path: 'cashier',
                        data: { breadcrumb: ['cashier'] },
                        loadComponent: () => import('./finance/cashier/cashier.component').then(m => m.AdminCashierComponent),
                    },
                    {
                        path: 'insurance',
                        data: { breadcrumb: ['insurance'] },
                        loadComponent: () => import('./finance/insurance/insurance.component').then(m => m.AdminInsuranceComponent),
                    },
                    {
                        path: 'reports',
                        data: { breadcrumb: ['reports'] },
                        loadComponent: () => import('./finance/report/revenue-report.component').then(m => m.AdminRevenueReportComponent),
                    }
                ]
            },
            {
                path: 'crm',
                data: { breadcrumb: ['crm'] },
                children: [
                    {
                        path: '',
                        redirectTo: 'customer',
                        pathMatch: 'full'
                    },
                    {
                        path: 'customer',
                        loadComponent: () => import('./crm/customer/customer.component').then(m => m.AdminCustomer360Component),
                        data: { breadcrumb: ['customer'] },
                    },
                    {
                        path: 'marketing-campaign',
                        data: { breadcrumb: ['marketing-campaign'] },
                        loadComponent: () => import('./crm/marketing-campaign/marketing-campaign.component').then(m => m.AdminMarketingCampaignComponent),
                    },
                    {
                        path: 'lead-management',
                        data: { breadcrumb: ['lead-management'] },
                        loadComponent: () => import('./crm/lead-management/lead-management.component').then(m => m.AdminLeadManagementComponent),
                    },
                    {
                        path: 'support-complaint',
                        data: { breadcrumb: ['support-complaint'] },
                        loadComponent: () => import('./crm/support-complaint/support-complaint.component').then(m => m.AdminSupportComplaintComponent),
                    },
                    {
                        path: 'member-point',
                        data: { breadcrumb: ['member-point'] },
                        loadComponent: () => import('./crm/member-point/member-point.component').then(m => m.AdminMemberPointComponent),
                    }
                ]
            },
            {
                path: 'cms',
                data: { breadcrumb: ['cms'] },
                children: [
                    {
                        path: '',
                        redirectTo: 'article-news',
                        pathMatch: 'full'
                    },
                    {
                        path: 'article-news',
                        data: { breadcrumb: ['article-news'] },
                        loadComponent: () => import('./cms/article-news/article-news.component').then(m => m.AdminArticleNewsComponent),
                    },
                    {
                        path: 'service',
                        data: { breadcrumb: ['service'] },
                        loadComponent: () => import('./cms/service/service.component').then(m => m.AdminServiceComponent),
                    },
                    {
                        path: 'home-configuration',
                        data: { breadcrumb: ['home-configuration'] },
                        loadComponent: () => import('./cms/home-configuration/home-configuration.component').then(m => m.AdminHomeConfigurationComponent),
                    },
                    {
                        path: 'doctor',
                        data: { breadcrumb: ['doctor'] },
                        children: [
                            {
                                path: '',
                                redirectTo: 'list',
                                pathMatch: 'full'
                            },
                            {
                                path: 'list',
                                loadComponent: () => import('./cms/doctor/list/doctor-list.component').then(m => m.DoctorListComponent),
                                data: { breadcrumb: ['list'] },
                            }
                        ]
                    },
                ]
            },
            {
                path: 'academy',
                data: { breadcrumb: ['academy'] },
                children: [
                    {
                        path: '',
                        redirectTo: 'list',
                        pathMatch: 'full'
                    },
                    {
                        path: 'list',
                        loadComponent: () => import('./academy/list/academy-list.component').then(m => m.AcademyListComponent),
                        data: { breadcrumb: ['list'] },
                    }
                ]
            },
            {
                path: 'system',
                data: { breadcrumb: ['system'] },
                children: [
                    {
                        path: '',
                        redirectTo: 'file-manager',
                        pathMatch: 'full'
                    },
                    {
                        path: 'file-manager',
                        loadComponent: () => import('./system/file-manager/file-manager.component').then(m => m.FileManagerComponent),
                        data: { breadcrumb: ['file manager'] },
                    },
                    {
                        path: 'note',
                        data: { breadcrumb: ['note'] },
                        children: [
                            {
                                path: '',
                                redirectTo: 'all',
                                pathMatch: 'full'
                            },
                            {
                                path: 'all',
                                data: { breadcrumb: ['all'] },
                                loadComponent: () => import('./system/note/all/all.component').then(m => m.AllNoteComponent),
                            }
                        ]
                    },
                    {
                        path: 'scrumboard',
                        data: { breadcrumb: ['scrumboard'] },
                        children: [
                            {
                                path: '',
                                redirectTo: 'list',
                                pathMatch: 'full'
                            },
                            {
                                path: 'list',
                                data: { breadcrumb: ['list'] },
                                loadComponent: () => import('./system/scrumboard/list/list.component').then(m => m.ListScrumboardComponent),
                            }
                        ]
                    },
                    {
                        path: 'user-permission',
                        data: { breadcrumb: ['user-permission'] },
                        loadComponent: () => import('./system/user-permission/user-permission.component').then(m => m.AdminUserPermissionComponent),
                    },
                    {
                        path: 'common-category',
                        data: { breadcrumb: ['common-category'] },
                        loadComponent: () => import('./system/common-category/common-category.component').then(m => m.AdminCommonCategoryComponent),
                    },
                    {
                        path: 'print-template',
                        data: { breadcrumb: ['print-template'] },
                        loadComponent: () => import('./system/print-template/print-template.component').then(m => m.AdminPrintTemplateComponent),
                    },
                    {
                        path: 'setting',
                        data: { breadcrumb: ['setting'] },
                        loadChildren: () => import('./system/setting/setting.routes').then(r => r.routes)
                    }
                ]
            },
            {
                path: 'profile',
                data: { breadcrumb: ['profile'] },
                children: [
                    {
                        path: '',
                        redirectTo: 'general',
                        pathMatch: 'full'
                    },
                    {
                        path: 'general',
                        loadComponent: () => import('./user/profile/profile.component').then(m => m.ProfileComponent),
                        data: { breadcrumb: ['general'] },
                    }
                ]
            },
            {
                path: 'setting',
                data: { breadcrumb: ['setting'] },
                loadChildren: () => import('./setting/setting.routes').then(r => r.routes)
            }
        ],
    },
];
