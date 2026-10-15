export type UserRole = 'customer' | 'provider' | 'admin';

export type VerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type BookingStatus = 
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'CONFIRMED' 
  | 'ON_THE_WAY' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'DISPUTED';

export type ComplaintStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  avatar?: string;
  city: string;
  createdAt: string;
  emailVerified?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  popularServices: string[];
  subServices: string[];
  bannerImage: string;
}

export interface Service {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  description: string;
  priceStartingFrom: number;
  unit: string; // e.g. 'per hour', 'per project', 'per visit'
  estimatedDuration: string;
  features: string[];
  image: string;
  popular: boolean;
}

export interface ProviderPortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface Provider {
  id: string;
  userId: string;
  name: string;
  email: string;
  mobile: string;
  avatar: string;
  category: string; // Category Name
  servicesOffered: string[]; // List of service names or IDs
  skills: string[];
  qualification: string;
  experienceYears: number;
  city: string;
  serviceArea: string;
  maxRadiusKm: number;
  hourlyRate: number;
  startingPrice: number;
  verificationStatus: VerificationStatus;
  verificationDocs?: {
    idProof?: string;
    certificate?: string;
    submittedAt?: string;
  };
  rating: number;
  reviewCount: number;
  completedJobs: number;
  bio: string;
  availabilityDays: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  availableToday: boolean;
  responseTimeMinutes: number;
  portfolio: ProviderPortfolioItem[];
  locationCoords?: { lat: number; lng: number };
}

export interface Booking {
  id: string;
  bookingCode: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  providerCategory: string;
  serviceId: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  address: string;
  city: string;
  pincode: string;
  requirements: string;
  attachedImages?: string[];
  totalAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  providerEarnings: number;
  paymentId?: string;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'Other' | 'PayAfterService';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  statusLogs: { status: BookingStatus; timestamp: string; note?: string }[];
}

export interface Review {
  id: string;
  bookingId: string;
  providerId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  qualityRating: number;
  professionalismRating: number;
  timelinessRating: number;
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: UserRole;
  senderName: string;
  text: string;
  imageUrl?: string;
  timestamp: string;
  isRead: boolean;
}

export interface Complaint {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  category: string;
  description: string;
  attachmentUrl?: string;
  expectedResolution: string;
  status: ComplaintStatus;
  adminNotes?: string;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'verification' | 'review' | 'system';
  isRead: boolean;
  link?: string;
  timestamp: string;
}

export interface AIRecommendationReason {
  score: number;
  reasons: string[];
  scoreBreakdown: {
    serviceMatch: number;
    ratingScore: number;
    distanceScore: number;
    experienceScore: number;
    pricingScore: number;
    availabilityScore: number;
    responseRateScore: number;
  };
}

export interface SearchFilterState {
  category: string;
  service: string;
  city: string;
  maxDistance: number;
  priceMin: number;
  priceMax: number;
  minRating: number;
  verifiedOnly: boolean;
  availableTodayOnly: boolean;
  sortBy: 'recommended' | 'rating' | 'price_low' | 'price_high' | 'experience';
}
