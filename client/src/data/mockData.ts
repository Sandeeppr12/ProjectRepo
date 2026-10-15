import { ServiceCategory, Service, Provider, User, Booking, Review, Complaint, SystemNotification, Message } from '../types';

export const MOCK_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat-home',
    name: 'HOME SERVICES',
    slug: 'home-services',
    description: 'Certified electricians, plumbers, painters, appliance repair technicians, and deep cleaning professionals.',
    iconName: 'Wrench',
    popularServices: ['AC Repair & Service', 'Electrician', 'Plumbing Work', 'Deep Home Cleaning', 'RO Repair'],
    subServices: [
      'Electrician', 'Plumber', 'Carpenter', 'Painter', 'AC Repair', 
      'RO Repair', 'Refrigerator Repair', 'Washing Machine Repair', 
      'Appliance Repair', 'Home Cleaning', 'Deep Cleaning', 'Pest Control', 
      'CCTV Installation', 'Home Maintenance'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'cat-event',
    name: 'EVENT MANAGEMENT',
    slug: 'event-management',
    description: 'Professional wedding planners, photographers, decorators, caterers, DJs, and makeup artists.',
    iconName: 'PartyPopper',
    popularServices: ['Wedding Photography', 'Event Decoration', 'Catering Services', 'Bridal Makeup', 'Cinematic Videography'],
    subServices: [
      'Event Management', 'Wedding Planning', 'Wedding Photography', 'Pre-Wedding Photography', 
      'Videography', 'Cinematic Videography', 'Decoration', 'Catering', 
      'DJ', 'Makeup Artist', 'Mehndi Artist', 'Choreographer', 'Event Staff'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'cat-digital',
    name: 'DIGITAL MARKETING & IT',
    slug: 'digital-marketing-it',
    description: 'Expert web developers, SEO specialists, social media managers, UI/UX designers, and IT support.',
    iconName: 'Code',
    popularServices: ['Website Development', 'SEO Optimization', 'Social Media Management', 'Graphic Designing', 'Google Ads'],
    subServices: [
      'Digital Marketing', 'SEO', 'Social Media Management', 'Website Development', 
      'Web Design', 'Graphic Designing', 'Video Editing', 'Content Writing', 
      'UI/UX Design', 'Google Business Profile Management', 'Online Advertising', 'IT Support'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'cat-health',
    name: 'HEALTHCARE',
    slug: 'healthcare',
    description: 'Verified home nursing, elderly care, physiotherapy, post-treatment care, and medical sample collection.',
    iconName: 'Activity',
    popularServices: ['Nurse at Home', 'Physiotherapy at Home', 'Elderly Care', 'Patient Care', 'Lab Sample Collection'],
    subServices: [
      'Nurse at Home', 'Patient Care', 'Elderly Care', 'Physiotherapy at Home', 
      'Medical Attendant', 'Post-Treatment Care', 'Home Health Assistant', 'Lab Sample Collection'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'cat-edu',
    name: 'EDUCATION',
    slug: 'education',
    description: 'Find top-rated home tutors, online mentors, coding experts, and competitive exam trainers.',
    iconName: 'GraduationCap',
    popularServices: ['Mathematics Tutor', 'Coding Tutor', 'Competitive Exam Mentor', 'Science Tutor', 'Spoken English'],
    subServices: [
      'Home Tutor', 'Online Tutor', 'Mathematics Tutor', 'Science Tutor', 
      'English Tutor', 'Coding Tutor', 'Competitive Exam Mentor', 
      'Spoken English Trainer', 'Doubt Solving', 'Academic Counselling', 'Skill Development Trainer'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200'
  }
];

export const MOCK_SERVICES: Service[] = [
  // Education
  {
    id: 'srv-edu-1',
    categoryId: 'cat-edu',
    categoryName: 'EDUCATION',
    name: 'Mathematics Tutor',
    slug: 'mathematics-tutor',
    description: 'Expert home & online coaching for Class 8 to 12, JEE Mains, and competitive exams.',
    priceStartingFrom: 500,
    unit: 'per hour',
    estimatedDuration: '1 Hour',
    features: ['1-on-1 Personal Attention', 'Weekly Mock Tests', 'Doubt Solving', 'CBSE & ICSE Aligned'],
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600',
    popular: true
  },
  {
    id: 'srv-edu-2',
    categoryId: 'cat-edu',
    categoryName: 'EDUCATION',
    name: 'Coding Tutor',
    slug: 'coding-tutor',
    description: 'Learn Python, Java, Full-Stack Web Development, Data Structures & Algorithms from Industry Engineers.',
    priceStartingFrom: 799,
    unit: 'per hour',
    estimatedDuration: '1.5 Hours',
    features: ['Live Hands-on Coding', 'Project Building', 'Git & GitHub Training', 'Interview Prep'],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',
    popular: true
  },
  {
    id: 'srv-edu-3',
    categoryId: 'cat-edu',
    categoryName: 'EDUCATION',
    name: 'Science Tutor',
    slug: 'science-tutor',
    description: 'Comprehensive Physics, Chemistry & Biology tutoring for High School & NEET aspirants.',
    priceStartingFrom: 600,
    unit: 'per hour',
    estimatedDuration: '1 Hour',
    features: ['Concept Visualization', 'Formula Sheets', 'NCERT Solutions', 'Lab Practical Guidance'],
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600',
    popular: false
  },
  {
    id: 'srv-edu-4',
    categoryId: 'cat-edu',
    categoryName: 'EDUCATION',
    name: 'Competitive Exam Mentor',
    slug: 'competitive-exam-mentor',
    description: 'Personalized mentoring for UPSC, GATE, CAT & Banking exams with top rankers.',
    priceStartingFrom: 999,
    unit: 'per session',
    estimatedDuration: '1 Hour',
    features: ['Strategy Roadmap', 'Answer Writing Evaluation', 'Mock Interviews', 'Current Affairs Notes'],
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
    popular: true
  },

  // Healthcare
  {
    id: 'srv-hlth-1',
    categoryId: 'cat-health',
    categoryName: 'HEALTHCARE',
    name: 'Nurse at Home',
    slug: 'nurse-at-home',
    description: 'Registered nurse for IV therapy, wound dressing, post-op care, catheter management, and vital monitoring.',
    priceStartingFrom: 850,
    unit: 'per visit',
    estimatedDuration: '2 Hours',
    features: ['Certified GNM/B.Sc Nurse', 'Sterilized Equipment', 'Doctor Coordination', 'Emergency Protocol Trained'],
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
    popular: true
  },
  {
    id: 'srv-hlth-2',
    categoryId: 'cat-health',
    categoryName: 'HEALTHCARE',
    name: 'Physiotherapy at Home',
    slug: 'physiotherapy-at-home',
    description: 'Personalized rehabilitation for back pain, stroke recovery, sports injuries, and joint pain.',
    priceStartingFrom: 750,
    unit: 'per session',
    estimatedDuration: '45 Mins',
    features: ['Licensed Physiotherapist', 'Electrotherapy Equipment', 'Custom Exercise Plan', 'Pain Management'],
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
    popular: true
  },
  {
    id: 'srv-hlth-3',
    categoryId: 'cat-health',
    categoryName: 'HEALTHCARE',
    name: 'Elderly Care & Attendant',
    slug: 'elderly-care',
    description: 'Compassionate 12hr/24hr medical attendants for senior citizens assistance & mobility.',
    priceStartingFrom: 1200,
    unit: 'per shift',
    estimatedDuration: '12 Hours',
    features: ['Daily Living Assistance', 'Medication Timers', 'Mobility Support', 'Verified Background Check'],
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600',
    popular: true
  },

  // Digital Marketing & IT
  {
    id: 'srv-dig-1',
    categoryId: 'cat-digital',
    categoryName: 'DIGITAL MARKETING & IT',
    name: 'Website Development',
    slug: 'website-development',
    description: 'Modern, fast, SEO-friendly custom websites with React, Node.js, Next.js or WordPress.',
    priceStartingFrom: 4999,
    unit: 'per project',
    estimatedDuration: '5 Days',
    features: ['Mobile Responsive', 'SEO Ready', 'Domain & SSL Setup', 'Admin Dashboard Included'],
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=600',
    popular: true
  },
  {
    id: 'srv-dig-2',
    categoryId: 'cat-digital',
    categoryName: 'DIGITAL MARKETING & IT',
    name: 'SEO & Google Ads Management',
    slug: 'seo-google-ads',
    description: 'Boost business visibility on Google, drive organic leads and optimize Ad Spend with high ROI.',
    priceStartingFrom: 2999,
    unit: 'per month',
    estimatedDuration: 'Ongoing',
    features: ['Keyword Research', 'Technical SEO Audit', 'Competitor Analysis', 'Weekly Analytics Report'],
    image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=600',
    popular: true
  },
  {
    id: 'srv-dig-3',
    categoryId: 'cat-digital',
    categoryName: 'DIGITAL MARKETING & IT',
    name: 'Social Media Management',
    slug: 'social-media-management',
    description: 'Complete Instagram, Facebook, LinkedIn branding, posts, reels creation, and community management.',
    priceStartingFrom: 3499,
    unit: 'per month',
    estimatedDuration: '1 Month',
    features: ['15 Custom Creatives/Month', 'Reels Editing', 'Hashtag Strategy', 'Lead Generation Ads'],
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=600',
    popular: true
  },

  // Home Services
  {
    id: 'srv-home-1',
    categoryId: 'cat-home',
    categoryName: 'HOME SERVICES',
    name: 'AC Repair & Service',
    slug: 'ac-repair-service',
    description: 'Foam jet deep servicing, gas leak repair, compressor check, and master installation.',
    priceStartingFrom: 499,
    unit: 'per unit',
    estimatedDuration: '1 Hour',
    features: ['Foam & Power Jet Wash', '30-Day Service Warranty', 'Gas Top-up Check', 'Spare Parts Transparancy'],
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
    popular: true
  },
  {
    id: 'srv-home-2',
    categoryId: 'cat-home',
    categoryName: 'HOME SERVICES',
    name: 'Electrician Services',
    slug: 'electrician-services',
    description: 'Wiring fixes, short circuit detection, MCB replacement, fan/light installation, and inverter setup.',
    priceStartingFrom: 299,
    unit: 'per visit',
    estimatedDuration: '45 Mins',
    features: ['Background Verified Technicians', 'Safety Standard Tools', '30-Day Warranty', 'Upfront Rate Card'],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600',
    popular: true
  },
  {
    id: 'srv-home-3',
    categoryId: 'cat-home',
    categoryName: 'HOME SERVICES',
    name: 'Deep Home Cleaning',
    slug: 'deep-home-cleaning',
    description: 'Full home mechanized cleaning, kitchen degreasing, bathroom sanitization, and floor scrubbing.',
    priceStartingFrom: 1999,
    unit: 'per flat',
    estimatedDuration: '4 Hours',
    features: ['Single Disc Scrubbing Machine', 'Eco-friendly Chemicals', '4-Member Trained Crew', 'Hard Stain Removal'],
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600',
    popular: true
  },

  // Event Management
  {
    id: 'srv-evnt-1',
    categoryId: 'cat-event',
    categoryName: 'EVENT MANAGEMENT',
    name: 'Wedding Photography & Videography',
    slug: 'wedding-photography',
    description: 'Cinematic pre-wedding films, traditional & candid photography, drone coverage, and luxury album.',
    priceStartingFrom: 15000,
    unit: 'per event',
    estimatedDuration: 'Full Day',
    features: ['4K Camera Rig & Drone', 'Candid Specialist', 'Trailer Video Edit', 'Unlimited Soft Copies'],
    image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80&w=600',
    popular: true
  },
  {
    id: 'srv-evnt-2',
    categoryId: 'cat-event',
    categoryName: 'EVENT MANAGEMENT',
    name: 'Wedding Planning & Decoration',
    slug: 'wedding-planning-decoration',
    description: 'Theme setup, stage floral decor, mandap lighting, vendor management, and complete event execution.',
    priceStartingFrom: 35000,
    unit: 'per event',
    estimatedDuration: '3 Days',
    features: ['Custom 3D Stage Render', 'Vendor Coordination', 'Floral Arrangements', 'Dedicated Event Manager'],
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600',
    popular: true
  }
];

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'pvr-1',
    userId: 'usr-pvr-1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    mobile: '+91 98290 12345',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    category: 'DIGITAL MARKETING & IT',
    servicesOffered: ['Website Development', 'SEO & Google Ads Management', 'Social Media Management'],
    skills: ['React', 'Node.js', 'SEO', 'Google Ads', 'UI/UX Design'],
    qualification: 'B.Tech CSE - MNIT Jaipur',
    experienceYears: 6,
    city: 'Jaipur',
    serviceArea: 'Vaishali Nagar, Malviya Nagar, Mansarovar',
    maxRadiusKm: 25,
    hourlyRate: 800,
    startingPrice: 2999,
    verificationStatus: 'VERIFIED',
    verificationDocs: {
      idProof: 'aadhaar_rahul_redacted.pdf',
      certificate: 'degree_mnit_cs.pdf',
      submittedAt: '2026-01-15'
    },
    rating: 4.9,
    reviewCount: 142,
    completedJobs: 185,
    bio: 'Full-stack software engineer & growth marketer with 6+ years building scalable web apps and driving 10x ROI campaigns for Indian startups.',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableToday: true,
    responseTimeMinutes: 15,
    portfolio: [
      { id: 'pf-1', title: 'E-Commerce Platform', description: 'Built MERN stack marketplace for 50k monthly active users', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=500' },
      { id: 'pf-2', title: 'SaaS Dashboard', description: 'High-converting landing page with 34% conversion rate', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=500' }
    ],
    locationCoords: { lat: 26.9124, lng: 75.7873 }
  },
  {
    id: 'pvr-2',
    userId: 'usr-pvr-2',
    name: 'Dr. Ananya Iyer',
    email: 'ananya.iyer@example.com',
    mobile: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    category: 'HEALTHCARE',
    servicesOffered: ['Physiotherapy at Home', 'Nurse at Home', 'Elderly Care & Attendant'],
    skills: ['BPT Physiotherapy', 'Stroke Rehabilitation', 'Post-Surgical Care', 'Pain Management'],
    qualification: 'BPT, MPT (Orthopedics) - AIIMS Delhi',
    experienceYears: 8,
    city: 'Delhi',
    serviceArea: 'South Delhi, Connaught Place, Dwarka',
    maxRadiusKm: 20,
    hourlyRate: 750,
    startingPrice: 750,
    verificationStatus: 'VERIFIED',
    verificationDocs: {
      idProof: 'aadhaar_ananya.pdf',
      certificate: 'medical_council_reg.pdf',
      submittedAt: '2025-11-20'
    },
    rating: 4.95,
    reviewCount: 98,
    completedJobs: 130,
    bio: 'Senior Certified Physiotherapist specializing in home-based orthopedic recovery, geriatric mobility, and stroke rehabilitation.',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    availableToday: true,
    responseTimeMinutes: 10,
    portfolio: [
      { id: 'pf-3', title: 'Post-Knee Replacement Care', description: 'Complete 6-week mobility restoration plan', imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=500' }
    ],
    locationCoords: { lat: 28.6139, lng: 77.2090 }
  },
  {
    id: 'pvr-3',
    userId: 'usr-pvr-3',
    name: 'Prof. Vikram Singh',
    email: 'vikram.singh@example.com',
    mobile: '+91 94140 88776',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    category: 'EDUCATION',
    servicesOffered: ['Mathematics Tutor', 'Coding Tutor', 'Competitive Exam Mentor', 'Science Tutor'],
    skills: ['Calculus', 'Linear Algebra', 'JEE Advanced Math', 'Python', 'C++'],
    qualification: 'M.Sc Mathematics - IIT Kanpur',
    experienceYears: 10,
    city: 'Jaipur',
    serviceArea: 'Tonk Road, C-Scheme, Raja Park',
    maxRadiusKm: 15,
    hourlyRate: 600,
    startingPrice: 500,
    verificationStatus: 'VERIFIED',
    verificationDocs: {
      idProof: 'aadhaar_vikram.pdf',
      certificate: 'iitk_degree.pdf',
      submittedAt: '2026-02-01'
    },
    rating: 4.88,
    reviewCount: 210,
    completedJobs: 340,
    bio: 'Ex-Allen senior faculty with 10+ years coaching JEE Mains/Advanced and CBSE board students with a proven record of 99+ percentile ranks.',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    availableToday: true,
    responseTimeMinutes: 20,
    portfolio: [
      { id: 'pf-4', title: 'JEE Advanced Rankers Batch', description: 'Mentored 15 students under AIR 500 in 2025', imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=500' }
    ],
    locationCoords: { lat: 26.9124, lng: 75.7873 }
  },
  {
    id: 'pvr-4',
    userId: 'usr-pvr-4',
    name: 'Rajesh Verma Technicians',
    email: 'rajesh.verma@example.com',
    mobile: '+91 97850 44332',
    avatar: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&q=80&w=300',
    category: 'HOME SERVICES',
    servicesOffered: ['AC Repair & Service', 'Electrician Services', 'Deep Home Cleaning'],
    skills: ['Split & Window AC Servicing', 'Gas Charging', 'Inverter PCB Repair', 'House Wiring'],
    qualification: 'ITI Certified HVAC Specialist',
    experienceYears: 9,
    city: 'Mumbai',
    serviceArea: 'Andheri West, Bandra, Powai, Thane',
    maxRadiusKm: 30,
    hourlyRate: 400,
    startingPrice: 499,
    verificationStatus: 'VERIFIED',
    verificationDocs: {
      idProof: 'aadhaar_rajesh.pdf',
      certificate: 'iti_hvac_license.pdf',
      submittedAt: '2025-10-10'
    },
    rating: 4.82,
    reviewCount: 320,
    completedJobs: 510,
    bio: 'Master HVAC technician & licensed electrician with 9+ years servicing commercial and residential cooling systems across Mumbai.',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    availableToday: true,
    responseTimeMinutes: 5,
    portfolio: [
      { id: 'pf-5', title: 'Commercial AC Overhaul', description: 'Serviced 24 cassette AC units for IT Park office', imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=500' }
    ],
    locationCoords: { lat: 19.0760, lng: 72.8777 }
  },
  {
    id: 'pvr-5',
    userId: 'usr-pvr-5',
    name: 'Priya Patel Studios',
    email: 'priya.patel@example.com',
    mobile: '+91 99090 77665',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    category: 'EVENT MANAGEMENT',
    servicesOffered: ['Wedding Photography & Videography', 'Wedding Planning & Decoration'],
    skills: ['Candid Photography', 'Drone Videography', 'Wedding Storytelling', 'Stage Decor'],
    qualification: 'Diploma in Visual Arts & Cinematography',
    experienceYears: 7,
    city: 'Bangalore',
    serviceArea: 'Indiranagar, Koramangala, Whitefield, HSR Layout',
    maxRadiusKm: 35,
    hourlyRate: 2000,
    startingPrice: 15000,
    verificationStatus: 'VERIFIED',
    verificationDocs: {
      idProof: 'aadhaar_priya.pdf',
      certificate: 'photography_association.pdf',
      submittedAt: '2026-01-05'
    },
    rating: 4.96,
    reviewCount: 85,
    completedJobs: 110,
    bio: 'Award-winning destination wedding photographer and creative director delivering fairy-tale visuals and high-end cinematic wedding films.',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    availableToday: false,
    responseTimeMinutes: 30,
    portfolio: [
      { id: 'pf-6', title: 'Udaipur Royal Wedding', description: 'Grand 3-day royal wedding visual coverage & drone film', imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80&w=500' },
      { id: 'pf-7', title: 'Floral Mandap Design', description: 'Exquisite eco-friendly orchid & marigold wedding decor', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=500' }
    ],
    locationCoords: { lat: 12.9716, lng: 77.5946 }
  },
  {
    id: 'pvr-6',
    userId: 'usr-pvr-6',
    name: 'Amit Gupta',
    email: 'amit.gupta@example.com',
    mobile: '+91 98288 99112',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    category: 'DIGITAL MARKETING & IT',
    servicesOffered: ['Website Development', 'Social Media Management'],
    skills: ['UI/UX Design', 'Figma', 'React', 'Tailwind CSS'],
    qualification: 'B.Des - NID Ahmedabad',
    experienceYears: 5,
    city: 'Pune',
    serviceArea: 'Baner, Viman Nagar, Hinjewadi',
    maxRadiusKm: 20,
    hourlyRate: 700,
    startingPrice: 3499,
    verificationStatus: 'UNDER_REVIEW',
    verificationDocs: {
      idProof: 'aadhaar_amit.pdf',
      certificate: 'nid_degree.pdf',
      submittedAt: '2026-03-20'
    },
    rating: 4.75,
    reviewCount: 42,
    completedJobs: 56,
    bio: 'Product designer and frontend builder crafting delightful brand experiences and pixel-perfect mobile web apps.',
    availabilityDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    availableToday: true,
    responseTimeMinutes: 25,
    portfolio: [
      { id: 'pf-8', title: 'Fintech Mobile App UI', description: 'Redesigned core banking app dashboard for 1M users', imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=500' }
    ],
    locationCoords: { lat: 18.5204, lng: 73.8567 }
  }
];

export const MOCK_USERS: User[] = [
  {
    id: 'usr-cust-1',
    name: 'Aarav Sharma',
    email: 'aarav.customer@example.com',
    mobile: '+91 98291 55443',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    city: 'Jaipur',
    createdAt: '2026-01-10'
  },
  {
    id: 'usr-pvr-1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    mobile: '+91 98290 12345',
    role: 'provider',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    city: 'Jaipur',
    createdAt: '2026-01-15'
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk-1001',
    bookingCode: 'DV-2026-8891',
    customerId: 'usr-cust-1',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav.customer@example.com',
    customerMobile: '+91 98291 55443',
    providerId: 'pvr-1',
    providerName: 'Rahul Sharma',
    providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    providerCategory: 'DIGITAL MARKETING & IT',
    serviceId: 'srv-dig-1',
    serviceName: 'Website Development',
    date: '2026-09-28',
    timeSlot: '10:00 AM - 12:00 PM',
    address: 'Flat 302, Royal Residency, C-Scheme',
    city: 'Jaipur',
    pincode: '302001',
    requirements: 'Need a custom React portfolio landing page with lead form and high Google PageSpeed score.',
    totalAmount: 4999,
    commissionPercentage: 10,
    commissionAmount: 499.9,
    providerEarnings: 4499.1,
    paymentId: 'pay_RZP_982938112',
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    status: 'IN_PROGRESS',
    createdAt: '2026-09-24T10:30:00Z',
    updatedAt: '2026-09-25T09:00:00Z',
    statusLogs: [
      { status: 'PENDING', timestamp: '2026-09-24T10:30:00Z', note: 'Booking created by customer' },
      { status: 'ACCEPTED', timestamp: '2026-09-24T11:00:00Z', note: 'Accepted by Rahul Sharma' },
      { status: 'CONFIRMED', timestamp: '2026-09-24T11:05:00Z', note: 'Payment verified (UPI)' },
      { status: 'IN_PROGRESS', timestamp: '2026-09-25T09:00:00Z', note: 'Requirement analysis & dev started' }
    ]
  },
  {
    id: 'bk-1002',
    bookingCode: 'DV-2026-4432',
    customerId: 'usr-cust-1',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav.customer@example.com',
    customerMobile: '+91 98291 55443',
    providerId: 'pvr-3',
    providerName: 'Prof. Vikram Singh',
    providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    providerCategory: 'EDUCATION',
    serviceId: 'srv-edu-1',
    serviceName: 'Mathematics Tutor',
    date: '2026-09-26',
    timeSlot: '04:00 PM - 05:00 PM',
    address: 'House 45, Sector 7, Vidhyadhar Nagar',
    city: 'Jaipur',
    pincode: '302039',
    requirements: 'Focus on Calculus and Integration concepts for Class 12 board preparation.',
    totalAmount: 500,
    commissionPercentage: 10,
    commissionAmount: 50,
    providerEarnings: 450,
    paymentId: 'pay_RZP_11200344',
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    status: 'ACCEPTED',
    createdAt: '2026-09-25T08:15:00Z',
    updatedAt: '2026-09-25T08:30:00Z',
    statusLogs: [
      { status: 'PENDING', timestamp: '2026-09-25T08:15:00Z', note: 'Booking created' },
      { status: 'ACCEPTED', timestamp: '2026-09-25T08:30:00Z', note: 'Accepted by Prof. Vikram Singh' }
    ]
  },
  {
    id: 'bk-1003',
    bookingCode: 'DV-2026-1109',
    customerId: 'usr-cust-1',
    customerName: 'Aarav Sharma',
    customerEmail: 'aarav.customer@example.com',
    customerMobile: '+91 98291 55443',
    providerId: 'pvr-4',
    providerName: 'Rajesh Verma Technicians',
    providerAvatar: 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&q=80&w=300',
    providerCategory: 'HOME SERVICES',
    serviceId: 'srv-home-1',
    serviceName: 'AC Repair & Service',
    date: '2026-09-20',
    timeSlot: '11:00 AM - 12:00 PM',
    address: 'B-12, Vaishali Nagar',
    city: 'Jaipur',
    pincode: '302021',
    requirements: '1.5 Ton Split AC foam jet servicing and gas pressure check.',
    totalAmount: 499,
    commissionPercentage: 10,
    commissionAmount: 49.9,
    providerEarnings: 449.1,
    paymentId: 'pay_RZP_77661122',
    paymentMethod: 'Card',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    createdAt: '2026-09-19T14:00:00Z',
    updatedAt: '2026-09-20T12:30:00Z',
    statusLogs: [
      { status: 'PENDING', timestamp: '2026-09-19T14:00:00Z' },
      { status: 'ACCEPTED', timestamp: '2026-09-19T14:10:00Z' },
      { status: 'CONFIRMED', timestamp: '2026-09-19T14:12:00Z' },
      { status: 'ON_THE_WAY', timestamp: '2026-09-20T10:45:00Z' },
      { status: 'IN_PROGRESS', timestamp: '2026-09-20T11:05:00Z' },
      { status: 'COMPLETED', timestamp: '2026-09-20T12:30:00Z', note: 'Service successfully finished' }
    ]
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    bookingId: 'bk-1003',
    providerId: 'pvr-4',
    customerId: 'usr-cust-1',
    customerName: 'Aarav Sharma',
    customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    rating: 5,
    qualityRating: 5,
    professionalismRating: 5,
    timelinessRating: 5,
    comment: 'Exceptional AC service! Rajesh arrived on time, used foam pressure jet wash, and fixed the cooling issue completely. Highly recommended!',
    createdAt: '2026-09-20T13:00:00Z'
  },
  {
    id: 'rev-2',
    bookingId: 'bk-998',
    providerId: 'pvr-1',
    customerId: 'usr-cust-2',
    customerName: 'Meera Kapoor',
    rating: 5,
    qualityRating: 5,
    professionalismRating: 5,
    timelinessRating: 5,
    comment: 'Rahul delivered our e-commerce platform ahead of schedule with great UI and super fast loading. Very professional!',
    createdAt: '2026-09-15T16:20:00Z'
  },
  {
    id: 'rev-3',
    bookingId: 'bk-995',
    providerId: 'pvr-2',
    customerId: 'usr-cust-3',
    customerName: 'Sanjay Mehta',
    rating: 5,
    qualityRating: 5,
    professionalismRating: 5,
    timelinessRating: 5,
    comment: 'Dr. Ananya helped my mother recover mobility after knee surgery in just 4 weeks of physiotherapy. Truly compassionate doctor.',
    createdAt: '2026-09-10T11:45:00Z'
  }
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    bookingId: 'bk-1001',
    senderId: 'usr-cust-1',
    senderRole: 'customer',
    senderName: 'Aarav Sharma',
    text: 'Hi Rahul, excited for the website build! Did you receive the design wireframe files?',
    timestamp: '2026-09-24T11:10:00Z',
    isRead: true
  },
  {
    id: 'msg-2',
    bookingId: 'bk-1001',
    senderId: 'usr-pvr-1',
    senderRole: 'provider',
    senderName: 'Rahul Sharma',
    text: 'Hello Aarav! Yes, I reviewed the Figma link. The structure looks clean. Starting the React + Tailwind implementation today.',
    timestamp: '2026-09-24T11:15:00Z',
    isRead: true
  },
  {
    id: 'msg-3',
    bookingId: 'bk-1001',
    senderId: 'usr-cust-1',
    senderRole: 'customer',
    senderName: 'Aarav Sharma',
    text: 'Awesome! Please ensure it is fully mobile responsive.',
    timestamp: '2026-09-24T11:20:00Z',
    isRead: true
  }
];

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-101',
    bookingId: 'bk-991',
    customerId: 'usr-cust-4',
    customerName: 'Nikhil Rathi',
    providerId: 'pvr-6',
    providerName: 'Amit Gupta',
    category: 'Delayed Delivery',
    description: 'The social media graphics were promised by Tuesday evening but were delivered 24 hours late.',
    expectedResolution: 'Partial refund or extra post design',
    status: 'UNDER_REVIEW',
    adminNotes: 'Contacting provider for clarification.',
    createdAt: '2026-09-22T09:30:00Z'
  }
];

export const MOCK_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    userId: 'usr-cust-1',
    title: 'Booking Accepted',
    message: 'Prof. Vikram Singh accepted your Mathematics Tutor booking for Sep 26, 4:00 PM.',
    type: 'booking',
    isRead: false,
    link: '/customer/booking/bk-1002',
    timestamp: '2026-09-25T08:30:00Z'
  },
  {
    id: 'notif-2',
    userId: 'usr-cust-1',
    title: 'Payment Successful',
    message: '₹4,999 payment received for Website Development service.',
    type: 'payment',
    isRead: true,
    link: '/customer/booking/bk-1001',
    timestamp: '2026-09-24T11:05:00Z'
  }
];

export const INDIAN_CITIES = [
  'Jaipur', 'Delhi', 'Mumbai', 'Bangalore', 'Pune', 'Bhopal', 'Lucknow', 'Ahmedabad'
];
