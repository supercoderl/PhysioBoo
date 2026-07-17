import { User, UserProfile } from "../types/core.types"
import { MenuItem } from "../types/menu.types"
import { generateUUID } from "../utils/common"

// #region Categories
export const CATEGORIES = [
    {
        id: 1,
        title: 'Book Appointment',
        href: "",
        icon: "https://doccure.dreamstechnologies.com//react/template/src/assets/img/icons/list-icon-01.svg",
        color: "#822bd4"
    },
    {
        id: 2,
        title: 'Talk to Doctors',
        href: "",
        icon: "https://doccure.dreamstechnologies.com//react/template/src/assets/img/icons/list-icon-02.svg",
        color: "#0e82fd"
    },
    {
        id: 3,
        title: 'Hospitals & Clinics',
        href: "",
        icon: "https://doccure.dreamstechnologies.com//react/template/src/assets/img/icons/list-icon-03.svg",
        color: "#dd2590"
    },
    {
        id: 4,
        title: 'Healthcare',
        href: "",
        icon: "https://doccure.dreamstechnologies.com//react/template/src/assets/img/icons/list-icon-04.svg",
        color: "#06aed4"
    },
    {
        id: 5,
        title: 'Medicine & Supplies',
        href: "",
        icon: "https://doccure.dreamstechnologies.com//react/template/src/assets/img/icons/list-icon-05.svg",
        color: "#6938ef"
    },
    {
        id: 6,
        title: 'Lab Testing',
        href: "",
        icon: "https://doccure.dreamstechnologies.com//react/template/src/assets/img/icons/list-icon-06.svg",
        color: "#e04f16"
    },
    {
        id: 7,
        title: 'Home Care',
        href: "",
        icon: "https://doccure.dreamstechnologies.com//react/template/src/assets/img/icons/list-icon-07.svg",
        color: "#0e9384"
    }
]
// #endregion

// #region Company Logos
export const COMPANYLOGOS = [
    'https://doccure.dreamstechnologies.com/react/template/src/assets/img/company/company-01.svg',
    'https://doccure.dreamstechnologies.com/react/template/src/assets/img/company/company-02.svg',
    'https://doccure.dreamstechnologies.com/react/template/src/assets/img/company/company-03.svg',
    'https://doccure.dreamstechnologies.com/react/template/src/assets/img/company/company-04.svg',
    'https://doccure.dreamstechnologies.com/react/template/src/assets/img/company/company-05.svg',
    'https://doccure.dreamstechnologies.com/react/template/src/assets/img/company/company-06.svg',
    'https://doccure.dreamstechnologies.com/react/template/src/assets/img/company/company-07.svg',
    'https://doccure.dreamstechnologies.com/react/template/src/assets/img/company/company-08.svg',
]
// #endregion

// #region Footer Menus
export const FOOTER_MENUS = [
    {
        id: 1,
        title: 'Company',
        children: [
            {
                id: 101,
                title: 'About',
                href: ''
            },
            {
                id: 102,
                title: 'Features',
                href: ''
            },
            {
                id: 103,
                title: 'Works',
                href: ''
            },
            {
                id: 104,
                title: 'Careers',
                href: ''
            },
            {
                id: 105,
                title: 'Locations',
                href: ''
            }
        ]
    },
    {
        id: 2,
        title: 'Treatments',
        children: [
            {
                id: 201,
                title: 'Dental',
                href: ''
            },
            {
                id: 202,
                title: 'Cardiac',
                href: ''
            },
            {
                id: 203,
                title: 'Spinal Cord',
                href: ''
            },
            {
                id: 204,
                title: 'Hair Growth',
                href: ''
            },
            {
                id: 205,
                title: 'Anemia & Disorder',
                href: ''
            }
        ]
    },
    {
        id: 3,
        title: 'Specialities',
        children: [
            {
                id: 301,
                title: 'Transplant',
                href: ''
            },
            {
                id: 302,
                title: 'Cardiologist',
                href: ''
            },
            {
                id: 303,
                title: 'Oncology',
                href: ''
            },
            {
                id: 304,
                title: 'Pediatrics',
                href: ''
            },
            {
                id: 305,
                title: 'Gynacology',
                href: ''
            }
        ]
    },
    {
        id: 4,
        title: 'Utilites',
        children: [
            {
                id: 401,
                title: 'Pricing',
                href: ''
            },
            {
                id: 402,
                title: 'Contact',
                href: ''
            },
            {
                id: 403,
                title: 'Request A Quote',
                href: ''
            },
            {
                id: 404,
                title: 'Premium Membership',
                href: ''
            },
            {
                id: 405,
                title: 'Integrations',
                href: ''
            }
        ]
    }
]
// #endregion

// #region Testimonial Counters
export const TESTIMONIAL_COUNTERS = [
    {
        id: 1,
        title: 'Doctors Available',
        count: '300+',
        color: '#04bd6c'
    },
    {
        id: 2,
        title: 'Specialities',
        count: '18+',
        color: '#822bd4'
    },
    {
        id: 3,
        title: 'Bookings Done',
        count: '30K',
        color: '#6938ef'
    },
    {
        id: 4,
        title: 'Hospitals & Clinic',
        count: '97+',
        color: '#dd2590'
    },
    {
        id: 5,
        title: 'Lab Tests Available',
        count: '317+',
        color: '#ffca18'
    }
]
// #endregion

// #region FAQs
export const FAQs = [
    {
        id: 1,
        title: 'How do I book an appointment with a doctor?',
        description: 'Yes, simply visit our website and log in or create an account. Search for a doctor based on specialization, location, or availability & confirm your booking.'
    },
    {
        id: 2,
        title: 'Can I request a specific doctor when booking my appointment?',
        description: 'Yes, you can usually request a specific doctor when booking your appointment, though availability may vary based on their schedule.'
    },
    {
        id: 3,
        title: 'What should I do if I need to cancel or reschedule my appointment?',
        description: 'If you need to cancel or reschedule your appointment, contact the doctor as soon as possible to inform them and to reschedule for another available time slot.'
    },
    {
        id: 4,
        title: 'What if I\'m running late for my appointment?',
        description: 'If you know you will be late, it\'s courteous to call the doctor\'s office and inform them. Depending on their policy and schedule, they may be able to accommodate you or reschedule your appointment.'
    },
    {
        id: 5,
        title: 'Can I book appointments for family members or dependents?',
        description: 'Yes, in many cases, you can book appointments for family members or dependents. However, you may need to provide their personal information and consent to do so.'
    },
]
// #endregion

// #region Headers
export const HEADERS = [
    {
        id: 1,
        title: 'Home',
        href: ''
    },
    {
        id: 2,
        title: 'Doctors',
        href: ''
    },
    {
        id: 3,
        title: 'Hospitals',
        href: 'hospitals'
    },
    {
        id: 4,
        title: 'About Us',
        href: '/about-us'
    },
    {
        id: 5,
        title: 'Contact',
        href: '/contact'
    },
    {
        id: 6,
        title: 'Blog',
        href: '/blog'
    },
]
// #endregion

// #region Best Doctors
export const BEST_DOCTORS = [
    {
        id: 1,
        name: "Dr. Ruby Perrin",
        department: "Cardiology",
        address: "Newyork, USA",
        rating: 4.5,
        ratingCount: 35,
        img: "https://doccure.dreamstechnologies.com/react/template/assets/doctor-03-B8AcSX6C.jpg",
        price: 200
    },
    {
        id: 2,
        name: "Dr. Darren Elder",
        department: "Neurology",
        address: "Florida, USA",
        rating: 4.0,
        ratingCount: 20,
        img: "https://doccure.dreamstechnologies.com/react/template/assets/doctor-04-CkPcwYIi.jpg",
        price: 360
    },
    {
        id: 3,
        name: "Dr. Sofia Brient",
        department: "Urology",
        address: "Georgia, USA",
        rating: 4.5,
        ratingCount: 30,
        img: "https://doccure.dreamstechnologies.com/react/template/assets/doctor-05-BfCC0fXq.jpg",
        price: 450
    },
    {
        id: 1,
        name: "Dr. Paul Richard",
        department: "Orthopedic",
        address: "Michigan, USA",
        rating: 4.3,
        ratingCount: 45,
        img: "https://doccure.dreamstechnologies.com/react/template/assets/doctor-02-CQEE9ehg.jpg",
        price: 570
    }
]
// #endregion

// #region Hospitals
export const HOSPITALS = [
    {
        id: 1,
        name: "Cleveland Clinic",
        address: "Minneapolis, MN",
        img: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/hospitals/hospital-01.svg"
    },
    {
        id: 2,
        name: " Apollo Hospital",
        address: "Philadelphia, PA",
        img: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/hospitals/hospital-02.svg"
    },
    {
        id: 3,
        name: "Asian Institute",
        address: "Piscataway, NJ",
        img: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/hospitals/hospital-03.svg"
    },
    {
        id: 4,
        name: "Manipal North Side",
        address: "Albuquerque, NM",
        img: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/hospitals/hospital-04.svg"
    },
    {
        id: 5,
        name: "Johns Hopkins Hospital",
        address: "Roswell, GA",
        img: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/hospitals/hospital-05.svg"
    },
    {
        id: 6,
        name: "Athol Hospital",
        address: "Chesterfield, IL",
        img: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/hospitals/hospital-06.svg"
    },
    {
        id: 7,
        name: "Austen Riggs Center",
        address: "Atlanta, GA",
        img: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/hospitals/hospital-07.svg"
    },
    {
        id: 8,
        name: "Baldpate Hospital",
        address: "Burbank, CA",
        img: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/hospitals/hospital-08.svg"
    },
    {
        id: 9,
        name: "Baystate Noble Hospital",
        address: "Lena, IL",
        img: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/hospitals/hospital-09.svg"
    },
    {
        id: 10,
        name: "Berkshire Medical Center",
        address: "Saginaw, MI",
        img: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/hospitals/hospital-10.svg"
    },
    {
        id: 11,
        name: "Beverly Hospital",
        address: "Westchester, IL",
        img: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/hospitals/hospital-11.svg"
    },
    {
        id: 12,
        name: "Good Health City Hospital",
        address: "Santa Fe Springs, CA",
        img: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/hospitals/hospital-12.svg"
    }
]
// #endregion

// #region Blogs
export const BLOGS = [
    {
        id: 1,
        title: "10 Tips for Maintaining a Healthy Lifestyle Year-Round",
        description: "Discover practical, everyday tips to help you stay healthy throughout the year.",
        author: {
            name: "Arthur Hetzel",
            avatar: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/patients/patient21.jpg"
        },
        postedAt: "4 Dec 2025",
        thumbnail: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/blog/blog-37.jpg",
        category: "Health Tips"
    },
    {
        id: 2,
        title: "Understanding Common Symptoms: When to See a Doctor",
        description: "Learn how to identify common symptoms and when it's important to seek medical attention.",
        author: {
            name: "Robin Frost",
            avatar: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/patients/patient20.jpg"
        },
        postedAt: "14 Apr 2025",
        thumbnail: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/blog/blog-32.jpg",
        category: "Awareness"
    },
    {
        id: 3,
        title: "Nutrition and Wellness: A Guide to Balanced Eating",
        description: "Good nutrition is the foundation of wellness. Explore tips for creating a balanced diet",
        author: {
            name: "Alyce Buck",
            avatar: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/patients/patient23.jpg"
        },
        postedAt: "21 May 2025",
        thumbnail: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/blog/blog-33.jpg",
        category: "Nutrition"
    },
    {
        id: 4,
        title: "Top Preventive Health Measures Everyone Should Take",
        description: "Prevention is key to a long, healthy life. Discover the top preventive health measures you can adopt.",
        author: {
            name: "Bernadette Vogel",
            avatar: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/patients/patient22.jpg"
        },
        postedAt: "11 May 2025",
        thumbnail: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/blog/blog-34.jpg",
        category: "Prevention"
    },
    {
        id: 5,
        title: "Mental Health Matters: Tips for Managing Stress and Anxiety",
        description: "Earn practical techniques to manage stress and anxiety, and improve your emotional well-being.",
        author: {
            name: "Gregory Johnson",
            avatar: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/patients/patient12.jpg"
        },
        postedAt: "15 Jun 2025",
        thumbnail: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/blog/blog-35.jpg",
        category: "Wellness"
    },
    {
        id: 6,
        title: "Advancements in Medical Technology: What’s New in Healthcare?",
        description: "From AI in diagnostics to cutting-edge treatments, discover how innovation is use in healthcare.",
        author: {
            name: "Teresa Baxter",
            avatar: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/patients/patient13.jpg"
        },
        postedAt: "22 Jun 2025",
        thumbnail: "https://doccure.dreamstechnologies.com/react/template/src/assets/img/blog/blog-36.jpg",
        category: "Technology"
    }
]
// #endregion

// #region Courses
export const COURSES = [
    {
        id: 1,
        name: 'Basic of Angular',
        description: 'Introductory course for Angular and framework basics',
        type: 'Web',
        durationMinutes: 30,
        timeCompleted: 2
    },
    {
        id: 2,
        name: 'Basics of TypeScript',
        description: 'Beginner course for Typescript and its basics',
        type: 'Web',
        durationMinutes: 60,
        timeCompleted: 3
    },
    {
        id: 3,
        name: 'Android N: Quick Settings',
        description: 'Step by step guide for Android N: Quick Settings',
        type: 'Android',
        durationMinutes: 120,
        timeCompleted: 1
    },
    {
        id: 4,
        name: 'Build an App for the Google Assistant with Firebase',
        description: 'Dive deep into Google Assistant apps using Firebase',
        type: 'Firebase',
        durationMinutes: 30,
        timeCompleted: 3
    },
    {
        id: 5,
        name: 'Keep Sensitive Data Safe and Private',
        description: 'Learn how to keep your important data safe and private',
        type: 'Android',
        durationMinutes: 45,
        timeCompleted: 0
    },
    {
        id: 6,
        name: 'Manage Your Pivotal Cloud Foundry App\'s Using Apigee Edge',
        description: 'Introductory course for Pivotal Cloud Foundry App',
        type: 'Cloud',
        durationMinutes: 90,
        timeCompleted: 0
    },
    {
        id: 7,
        name: 'Build a PWA Using Workbox',
        description: 'Step by step guide for building a PWA using Workbox',
        type: 'Web',
        durationMinutes: 120,
        timeCompleted: 0
    },
    {
        id: 8,
        name: 'Cloud Functions for Firebase',
        description: 'Beginners guide of Firebase Cloud Functions',
        type: 'Firebase',
        durationMinutes: 45,
        timeCompleted: 1
    },
    {
        id: 9,
        name: 'Building a gRPC Service with Java',
        description: 'Learn more about building a gRPC Service with Java',
        type: 'Cloud',
        durationMinutes: 30,
        timeCompleted: 1
    },
    {
        id: 10,
        name: 'Looking at Campaign Finance with BigQuery',
        description: 'Dive deep into BigQuery: Campaign Finance',
        type: 'Cloud',
        durationMinutes: 60,
        timeCompleted: 0
    },
    {
        id: 11,
        name: 'Personalize Your iOS App with Firebase User Management',
        description: 'Dive deep into User Management on iOS apps using Firebase',
        type: 'Firebase',
        durationMinutes: 90,
        timeCompleted: 0
    },
    {
        id: 12,
        name: 'Customize Network Topology with Subnetworks',
        description: 'Dive deep into Network Topology with Subnetworks',
        type: 'Web',
        durationMinutes: 45,
        timeCompleted: 0
    },
    {
        id: 13,
        name: 'Launch Cloud Datalab',
        description: 'From start to finish: Launch Cloud Datalab',
        type: 'Cloud',
        durationMinutes: 60,
        timeCompleted: 0
    },
    {
        id: 14,
        name: 'Cloud Firestore',
        description: 'Step by step guide for setting up Cloud Firestore',
        type: 'Cloud',
        durationMinutes: 90,
        timeCompleted: 0
    },
]
// #endregion

// #region Folders
export const FOLDERS = [
    {
        id: 1,
        name: 'Personal',
        totalFiles: 57,
        isFolder: true
    },
    {
        id: 2,
        name: 'Photos',
        totalFiles: 907,
        isFolder: true
    },
    {
        id: 3,
        name: 'Work',
        totalFiles: 24,
        isFolder: true
    }
]
// #endregion

// #region Files
export const FILES = [
    {
        id: 1,
        "name": "Contract #123",
        "type": "pdf"
    },
    {
        id: 2,
        "name": "Estimated budget",
        "type": "xls"
    },
    {
        id: 3,
        "name": "DMCA notice",
        "type": "doc"
    },
    {
        id: 4,
        "name": "Invoices",
        "type": "pdf"
    },
    {
        id: 5,
        "name": "Crash logs",
        "type": "txt"
    },
    {
        id: 6,
        "name": "System logs",
        "type": "txt"
    },
    {
        id: 7,
        "name": "Personal project",
        "type": "doc"
    },
    {
        id: 8,
        "name": "Biometric portrait",
        "type": "jpg"
    },
    {
        id: 9,
        "name": "Scanned image 1",
        "type": "jpg"
    },
    {
        id: 10,
        "name": "Scanned image 2",
        "type": "jpg"
    },
    {
        id: 11,
        "name": "Prices",
        "type": "doc"
    },
    {
        id: 12,
        "name": "Shopping list",
        "type": "doc"
    },
    {
        id: 13,
        "name": "Summer budget",
        "type": "xls"
    }
]
// #endregion

// #region Menus    
export const MENUS: MenuItem[] = [
    {
        id: "overview",
        label: "Overview",
        icon: "layout-dashboard",
        route: "overview",
        permissionCode: ["admin", "director", "doctor", "receptionist", "marketer"],
        children: [
            {
                id: "dashboard",
                label: "Dashboard",
                route: "overview/dashboard",
                icon: "gauge",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
        ],
        isActive: false,
        order: 0
    },
    {
        id: "reception",
        label: "Reception",
        icon: "concierge-bell",
        permissionCode: ["admin", "receptionist"],
        children: [
            {
                id: "booking",
                label: "Booking",
                route: "reception/booking",
                icon: "calendar-days",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "registration",
                label: "Registration",
                route: "reception/registration",
                icon: "user-plus",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "queue",
                label: "Queue",
                route: "reception/queue",
                icon: "users",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "patient-lookup",
                label: "Patient Lookup",
                route: "reception/patient-lookup",
                icon: "search",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            }
        ],
        route: "",
        isActive: false,
        order: 0
    },
    {
        id: "clinic",
        label: "Clinic",
        icon: "stethoscope",
        permissionCode: ["admin", "doctor"],
        children: [
            {
                id: "doctor-desk",
                label: "Doctor Desk",
                route: "clinic/doctor-desk",
                icon: "monitor-check",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "prescription",
                label: "Prescription",
                route: "clinic/prescription",
                icon: "file-plus",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "medical-record",
                label: "Medical Record",
                route: "clinic/medical-record",
                icon: "folder-open",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            }
        ],
        route: "",
        isActive: false,
        order: 0
    },
    {
        id: "inpatient",
        label: "Inpatient",
        icon: "bed",
        permissionCode: ["admin", "nurse", "doctor"],
        children: [
            {
                id: "bed-map",
                label: "Bed Map",
                route: "inpatient/bed-map",
                icon: "layout-grid",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "admission",
                label: "Admission",
                route: "inpatient/admission",
                icon: "log-in",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "treatment-sheet",
                label: "Treatment Sheet",
                route: "inpatient/treatment-sheet",
                icon: "clipboard-list",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            }
        ],
        route: "",
        isActive: false,
        order: 0
    },
    {
        id: "paraclinical",
        label: "Paraclinical",
        icon: "microscope",
        permissionCode: ["admin", "technician", "doctor"],
        children: [
            {
                id: "lis",
                label: "Laboratory",
                route: "paraclinical/laboratory",
                icon: "flask-conical",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "ris",
                label: "Radiology",
                route: "paraclinical/radiology",
                icon: "image",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "surgery",
                label: "Surgery",
                route: "paraclinical/surgery",
                icon: "scissors",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            }
        ],
        route: "",
        isActive: false,
        order: 0
    },
    {
        id: "pharmacy",
        label: "Pharmacy",
        icon: "pill",
        permissionCode: ["admin", "pharmacist"],
        children: [
            {
                id: "retail",
                label: "Retail",
                route: "pharmacy/retail",
                icon: "shopping-cart",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "prescription-dispense",
                label: "Prescription Dispense",
                route: "pharmacy/prescription-dispense",
                icon: "file-check",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "inventory",
                label: "Inventory Management",
                route: "pharmacy/inventory-management",
                icon: "warehouse",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "inventory-check",
                label: "Stock Take",
                route: "pharmacy/stock-take",
                icon: "clipboard-check",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            }
        ],
        route: "",
        isActive: false,
        order: 0
    },
    {
        id: "finance",
        label: "Finance",
        icon: "wallet",
        permissionCode: ["admin", "accountant", "cashier"],
        children: [
            {
                id: "cashier",
                label: "Cashier",
                route: "finance/cashier",
                icon: "banknote",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "insurance",
                label: "Insurance",
                route: "finance/insurance",
                icon: "shield-check",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "revenue-report",
                label: "Revenue Report",
                route: "finance/reports",
                icon: "bar-chart-3",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            }
        ],
        route: "",
        isActive: false,
        order: 0
    },
    {
        id: "crm",
        label: "CRM & CS",
        icon: "users-round",
        permissionCode: ["admin", "marketer", "cskh"],
        children: [
            {
                id: "customer-data",
                label: "Customer 360",
                route: "crm/customer",
                icon: "database",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "marketing",
                label: "Marketing Campaign",
                route: "crm/marketing-campaign",
                icon: "megaphone",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "leads",
                label: "Lead Management",
                route: "crm/lead-management",
                icon: "list-filter",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "tickets",
                label: "Support & Complaints",
                route: "crm/support-complaint",
                icon: "headphones",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "loyalty",
                label: "Members & Points",
                route: "crm/member-point",
                icon: "gift",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            }
        ],
        route: "",
        isActive: false,
        order: 0
    },
    {
        id: "cms",
        label: "CMS",
        icon: "globe",
        permissionCode: ["admin", "marketer"],
        children: [
            {
                id: "articles",
                label: "Articles & News",
                route: "cms/article-news",
                icon: "newspaper",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "services",
                label: "Services",
                route: "cms/service",
                icon: "briefcase",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "doctors",
                label: "Doctors",
                route: "cms/doctor",
                icon: "user-check",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "configuration",
                label: "Home Configuration",
                route: "cms/home-configuration",
                icon: "layout-template",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            }
        ],
        route: "",
        isActive: false,
        order: 0
    },
    {
        id: "system",
        label: "System",
        icon: "settings",
        permissionCode: ["admin"],
        children: [
            {
                id: "users",
                label: "Users & Permissions",
                route: "system/user-permission",
                icon: "user-cog",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "categories",
                label: "Common Categories",
                route: "system/common-category",
                icon: "list",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            },
            {
                id: "print-templates",
                label: "Print Templates",
                route: "system/print-templates",
                icon: "printer",
                isActive: false,
                order: 0,
                permissionCode: [],
                children: []
            }
        ],
        route: "",
        isActive: false,
        order: 0
    }
]
// #endregion

// #region Category Dashboard
export const MEDICAL_CATEGORIES = [
    {
        id: 1,
        name: "All Patient",
        color: "#1F6DB2",
        background: "#EBF2F9",
        icon: "users"
    },
    {
        id: 2,
        name: "Doctors",
        color: "#09800F",
        background: "#EEF9F1",
        icon: "briefcase-medical"
    },
    {
        id: 3,
        name: "Labs Results",
        color: "#FDAF22",
        background: "#FFF8EF",
        icon: "test-tube"
    },
    {
        id: 4,
        name: "Prescriptions",
        color: "#B71C1C",
        background: "#FBECEA",
        icon: "heart-pulse"
    },
    {
        id: 5,
        name: "Visits",
        color: "#6A1B9A",
        background: "#F1EBF7",
        icon: "telescope"
    },
    {
        id: 6,
        name: "Medical Results",
        color: "#00796B",
        background: "#EBF2F1",
        icon: "clipboard-plus"
    }
]
// #endregion

// #region Default Values
export const AVATAR = 'assets/images/default/avatar.png';
export const DEFAULT_IMAGE = 'assets/images/default/default.png';

export const USER: User = {
    id: generateUUID(),
    email: "user@example.com",
    phone: "+1898754115",
    alternatePhone: null,
    isActive: true,
    isVerified: true,
    emailVerifiedAt: new Date(2025, 8, 11),
    phoneVerifiedAt: null,
    lastLoginAt: new Date(2025, 12, 28),
    failedLoginAttempts: 0,
    accountLockedUntil: null,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    profilePicture: AVATAR,
    preferredLanguage: "en",
    timeZone: "Asia/Ho_Chi_Minh",
    createdAt: new Date(2025, 11, 10),
    createdBy: generateUUID(),
    updatedAt: null,
    updatedBy: null,
}

export const USER_PROFILE: UserProfile = {
    id: generateUUID(),
    email: "",
    phone: null,
    isVerified: false,
    profilePicture: null,
    profile: null,
    doctor: null,
    patient: null,
    roles: []
}
// #endregion

// #region Category Management
export const CATEGORIES_MANAGEMENT = [
    {
        id: 1,
        name: "Medical Specialties",
        description:
            "Manage and organize medical specialties used across the system for accurate clinical classification and administration.",
        icon: "stethoscope",
        route: "/admin/system/common-category/medical-specialty"
    },
    {
        id: 2,
        name: "Appointment Types",
        description:
            "Define different appointment types to standardize scheduling duration, service classification, and workflow management.",
        icon: "calendar-check",
        route: "/admin/system/common-category/appointment-type"
    },
    {
        id: 3,
        name: "Imaging Modalities",
        description:
            "Manage diagnostic imaging categories such as X-Ray, Ultrasound, MRI, and CT Scan for structured medical imaging services.",
        icon: "scan",
        route: "/admin/system/common-category/imaging-modality"
    },
    {
        id: 4,
        name: "Lab Test Categories",
        description:
            "Organize laboratory tests into structured categories to support medical diagnostics and reporting.",
        icon: "flask-round",
        route: "/admin/system/common-category/lab-test-category"
    },
    {
        id: 5,
        name: "Lab Tests",
        description:
            "Manage individual laboratory tests including test codes, reference ranges, and pricing.",
        icon: "test-tube",
        route: "/admin/system/common-category/lab-test"
    },
    {
        id: 6,
        name: "Medicine Categories",
        description:
            "Define medicine classification groups to support prescription and pharmacy management.",
        icon: "pill",
        route: "/admin/system/common-category/medicine-category"
    },
    {
        id: 7,
        name: "Insurance Companies",
        description:
            "Manage insurance providers to support billing, claim processing, and coverage validation.",
        icon: "shield-check",
        route: "/admin/system/common-category/insurance-company"
    },
    {
        id: 8,
        name: "Manufacturers",
        description:
            "Manage manufacturers of medicines, medical devices, and healthcare equipment.",
        icon: "factory",
        route: "/admin/system/common-category/manufacturer"
    },
    {
        id: 9,
        name: "Suppliers",
        description:
            "Manage suppliers responsible for distributing medicines, medical supplies, and equipment.",
        icon: "truck",
        route: "/admin/system/common-category/supplier"
    },
    {
        id: 10,
        name: "Departments",
        description:
            "Manage medical and administrative departments, staff assignments, and facility allocation.",
        icon: "theater",
        route: "/admin/system/common-category/department"
    }
];
// #endregion

// #region Setting Management
export const SETTINGS_MANAGEMENT = [
    {
        id: 1,
        name: "Account",
        description:
            "Manage your public profile and private information",
        icon: "circle-user",
        route: "/admin/system/settings/account"
    },
    {
        id: 2,
        name: "Security",
        description:
            "Manage your password and 2-step verification preferences",
        icon: "lock",
        route: "/admin/system/settings/security"
    },
    {
        id: 3,
        name: "Plan & Billing",
        description:
            "Manage your subscription plan, payment method and billing information",
        icon: "credit-card",
        route: "/admin/system/settings/billing"
    },
    {
        id: 4,
        name: "Notification",
        description:
            "Manage when you'll be notified on which channels",
        icon: "bell",
        route: "/admin/system/settings/notification"
    },
    {
        id: 5,
        name: "Team",
        description:
            "Manage your existing team and change roles/permissions",
        icon: "users",
        route: "/admin/system/settings/team"
    },
    {
        id: 6,
        name: "Theme",
        description:
            "Manage your theme which is being applied on the page",
        icon: "palette",
        route: "/admin/system/settings/theme"
    },
    {
        id: 7,
        name: "Sequence Tracker",
        description:
            "Track and manage the order of system records and processes.",
        icon: "pi",
        route: "/admin/system/settings/sequence-tracker"
    },
    {
        id: 8,
        name: "Admin Menu",
        description:
            "Manage administrative menus, configurations, and system settings.",
        icon: "layout-list",
        route: "/admin/system/settings/admin-menu"
    },
]
// #endregion