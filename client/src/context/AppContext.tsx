import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, Provider, ServiceCategory, Service, Booking, Review, Complaint, 
  SystemNotification, Message, BookingStatus, ComplaintStatus 
} from '../types';
import { 
  MOCK_CATEGORIES, MOCK_SERVICES,
  MOCK_BOOKINGS, MOCK_REVIEWS, MOCK_COMPLAINTS, MOCK_NOTIFICATIONS, 
  MOCK_MESSAGES 
} from '../data/mockData';
import { apiRequest, getAuthToken, setAuthToken } from '../utils/api';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isFirebaseConnected: boolean;
  isAuthReady: boolean;
  backendError: string;
  clearBackendError: () => void;
  currentCity: string;
  setCurrentCity: (city: string) => void;
  
  categories: ServiceCategory[];
  services: Service[];
  providers: Provider[];
  bookings: Booking[];
  reviews: Review[];
  complaints: Complaint[];
  notifications: SystemNotification[];
  messages: Message[];
  favorites: string[]; // Provider IDs
  
  commissionPercentage: number;
  setCommissionPercentage: (rate: number) => void;
  
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  isVivaModalOpen: boolean;
  setIsVivaModalOpen: (open: boolean) => void;
  
  // Actions
  toggleFavorite: (providerId: string) => void;
  createBooking: (bookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'updatedAt' | 'statusLogs'>) => Booking;
  updateBookingStatus: (bookingId: string, newStatus: BookingStatus, note?: string) => void;
  addReview: (reviewData: Omit<Review, 'id' | 'createdAt'>) => void;
  raiseComplaint: (complaintData: Omit<Complaint, 'id' | 'createdAt' | 'status'>) => void;
  updateComplaintStatus: (complaintId: string, status: ComplaintStatus, adminNotes?: string) => void;
  sendMessage: (bookingId: string, text: string, imageUrl?: string) => void;
  refreshAdminProviders: () => Promise<Provider[]>;
  updateProviderVerification: (providerId: string, status: 'VERIFIED' | 'REJECTED' | 'SUSPENDED') => Promise<void>;
  updateProviderDetails: (providerId: string, updated: Partial<Provider>) => Promise<void>;
  addProviderAccount: (input: {
    name: string;
    email: string;
    mobile: string;
    password: string;
    city: string;
    categoryId: string;
    categoryName: string;
    avatar?: string;
    servicesOffered: string[];
    qualification: string;
    experienceYears: number;
    startingPrice: number;
    serviceArea: string;
    bio: string;
  }) => Promise<Provider>;
  addCategory: (newCategory: Omit<ServiceCategory, 'id'>) => Promise<ServiceCategory>;
  addService: (newService: Omit<Service, 'id'>) => Promise<Service>;
  updateService: (serviceId: string, updated: Partial<Service>) => void;
  deleteService: (serviceId: string) => void;
  updateCategory: (catId: string, updated: Partial<ServiceCategory>) => void;
  markNotificationRead: (notifId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCity, setCurrentCity] = useState<string>('Jaipur');
  const [categories, setCategories] = useState<ServiceCategory[]>(MOCK_CATEGORIES);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(MOCK_NOTIFICATIONS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [favorites, setFavorites] = useState<string[]>(['pvr-1', 'pvr-3']);
  const [commissionPercentage, setCommissionPercentage] = useState<number>(10);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [backendError, setBackendError] = useState('');

  const persist = async <T,>(path: string, method: string, data?: unknown): Promise<T | null> => {
    if (!isFirebaseConnected) return null;
    try {
      const result = await apiRequest<T>(path, {
        method,
        ...(data === undefined ? {} : { body: JSON.stringify(data) })
      });
      setBackendError('');
      return result;
    } catch (error) {
      setBackendError(error instanceof Error ? error.message : 'Could not save your changes.');
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    apiRequest<{ database: string }>('/api/health').then(async (health) => {
      if (cancelled) return;
      if (health.database !== 'firestore') {
        setCurrentUser(null);
        setAuthToken(null);
        setBackendError('Firestore is not connected. Account registration and sign-in require the database-backed server.');
        return;
      }
      setIsFirebaseConnected(true);

      try {
        const catalog = await apiRequest<{ categories: ServiceCategory[]; services: Service[]; providers: Provider[]; reviews: Review[] }>('/api/catalog');
        if (cancelled) return;
        setCategories(catalog.categories.length ? catalog.categories : MOCK_CATEGORIES);
        setServices(catalog.services.length ? catalog.services : MOCK_SERVICES);
        setProviders(catalog.providers);
        setReviews(catalog.reviews);

        if (!getAuthToken()) {
          setCurrentUser(null);
          return;
        }

        const { user } = await apiRequest<{ user: User }>('/api/auth/me');
        if (!cancelled) setCurrentUser(user);
      } catch (error) {
        if (cancelled) return;
        if (getAuthToken()) {
          setAuthToken(null);
          setCurrentUser(null);
        }
        setBackendError(error instanceof Error ? error.message : 'Could not connect to Firebase.');
      }
    }).catch((error) => {
      if (!cancelled) {
        setCurrentUser(null);
        setAuthToken(null);
        setBackendError(error instanceof Error ? error.message : 'Could not connect to the API server.');
      }
    }).finally(() => {
      if (!cancelled) setIsAuthReady(true);
    });

    return () => { cancelled = true; };
  }, []);

  const currentUserId = currentUser?.id;
  const currentUserRole = currentUser?.role;

  useEffect(() => {
    if (!isFirebaseConnected || !currentUserId || !getAuthToken()) return;
    let cancelled = false;
    apiRequest<{
      bookings: Booking[];
      complaints: Complaint[];
      notifications: SystemNotification[];
      messages: Message[];
      reviews: Review[];
      providers: Provider[];
      favorites: string[];
      commissionPercentage: number;
    }>('/api/app-data').then((data) => {
      if (cancelled) return;
      setBookings(data.bookings);
      setComplaints(data.complaints);
      setNotifications(data.notifications);
      setMessages(data.messages);
      setReviews(data.reviews);
      if (currentUserRole === 'admin') {
        setProviders(data.providers);
      } else if (data.providers.length) {
        setProviders(prev => [...prev.filter(provider => !data.providers.some(item => item.id === provider.id)), ...data.providers]);
      }
      setFavorites(data.favorites);
      setCommissionPercentage(data.commissionPercentage);
      setBackendError('');
    }).catch((error) => {
      if (!cancelled) setBackendError(error instanceof Error ? error.message : 'Could not load account data.');
    });
    return () => { cancelled = true; };
  }, [isFirebaseConnected, currentUserId, currentUserRole]);

  const toggleFavorite = (providerId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(providerId) ? prev.filter(id => id !== providerId) : [...prev, providerId];
      void persist('/api/users/me/favorites', 'PATCH', { favorites: next });
      return next;
    });
  };

  const createBooking = (bookingData: Omit<Booking, 'id' | 'bookingCode' | 'createdAt' | 'updatedAt' | 'statusLogs'>): Booking => {
    const newId = `bk-${isFirebaseConnected && crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString().slice(-4)}`;
    const code = `DV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    
    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      bookingCode: code,
      createdAt: now,
      updatedAt: now,
      status: 'PENDING',
      statusLogs: [
        { status: 'PENDING', timestamp: now, note: 'Booking submitted by customer' }
      ]
    };

    setBookings(prev => [newBooking, ...prev]);
    void persist<Booking>('/api/bookings', 'POST', newBooking).then((savedBooking) => {
      if (savedBooking) setBookings(prev => prev.map(booking => booking.id === savedBooking.id ? savedBooking : booking));
    });

    // Send notifications to provider and customer
    const newNotifProvider: SystemNotification = {
      id: `notif-${Date.now()}`,
      userId: bookingData.providerId,
      title: 'New Booking Request',
      message: `New request from ${bookingData.customerName} for ${bookingData.serviceName} on ${bookingData.date}`,
      type: 'booking',
      isRead: false,
      link: `/provider/booking/${newId}`,
      timestamp: now
    };

    setNotifications(prev => [newNotifProvider, ...prev]);
    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, newStatus: BookingStatus, note?: string) => {
    const now = new Date().toISOString();
    setBookings(prev => prev.map(bk => {
      if (bk.id === bookingId) {
        return {
          ...bk,
          status: newStatus,
          updatedAt: now,
          statusLogs: [...bk.statusLogs, { status: newStatus, timestamp: now, note: note || `Status updated to ${newStatus}` }]
        };
      }
      return bk;
    }));

    // Generate Notification
    const targetBooking = bookings.find(b => b.id === bookingId);
    if (targetBooking) {
      const notif: SystemNotification = {
        id: `notif-${Date.now()}`,
        userId: targetBooking.customerId,
        title: `Booking ${newStatus.replace('_', ' ')}`,
        message: `Your booking ${targetBooking.bookingCode} for ${targetBooking.serviceName} is now ${newStatus.toLowerCase()}.`,
        type: 'booking',
        isRead: false,
        link: `/customer/booking/${bookingId}`,
        timestamp: now
      };
      setNotifications(prev => [notif, ...prev]);
    }
    void persist(`/api/bookings/${bookingId}/status`, 'PATCH', { status: newStatus, note });
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [newReview, ...prev]);
    void persist('/api/reviews', 'POST', reviewData);

    // Update Provider rating
    setProviders(prev => prev.map(p => {
      if (p.id === reviewData.providerId) {
        const newCount = p.reviewCount + 1;
        const newRating = Number(((p.rating * p.reviewCount + reviewData.rating) / newCount).toFixed(2));
        return { ...p, rating: newRating, reviewCount: newCount };
      }
      return p;
    }));
  };

  const raiseComplaint = (complaintData: Omit<Complaint, 'id' | 'createdAt' | 'status'>) => {
    const newComplaint: Complaint = {
      ...complaintData,
      id: `cmp-${Date.now().toString().slice(-3)}`,
      status: 'OPEN',
      createdAt: new Date().toISOString()
    };
    setComplaints(prev => [newComplaint, ...prev]);
    void persist('/api/complaints', 'POST', complaintData);
  };

  const updateComplaintStatus = (complaintId: string, status: ComplaintStatus, adminNotes?: string) => {
    setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status, adminNotes } : c));
    void persist(`/api/complaints/${complaintId}/status`, 'PATCH', { status, adminNotes });
  };

  const sendMessage = (bookingId: string, text: string, imageUrl?: string) => {
    if (!currentUser) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      bookingId,
      senderId: currentUser.id,
      senderRole: currentUser.role,
      senderName: currentUser.name,
      text,
      imageUrl,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, newMsg]);
    void persist('/api/messages', 'POST', { bookingId, text, imageUrl });
  };

  const refreshAdminProviders = useCallback(async () => {
    const result = await apiRequest<{ providers: Provider[] }>('/api/admin/providers');
    setProviders(result.providers);
    return result.providers;
  }, []);

  const updateProviderVerification = async (providerId: string, status: 'VERIFIED' | 'REJECTED' | 'SUSPENDED') => {
    const updated = await apiRequest<Provider>(`/api/providers/${providerId}`, {
      method: 'PATCH',
      body: JSON.stringify({ verificationStatus: status })
    });
    setProviders((current) => current.map((provider) => provider.id === providerId ? updated : provider));
  };

  const updateProviderDetails = async (providerId: string, updated: Partial<Provider>) => {
    const saved = await apiRequest<Provider>(`/api/providers/${providerId}`, {
      method: 'PATCH',
      body: JSON.stringify(updated)
    });
    setProviders((current) => current.map((provider) => provider.id === providerId ? saved : provider));
  };

  const addProviderAccount = async (input: Parameters<AppContextType['addProviderAccount']>[0]) => {
    const result = await apiRequest<{ provider: Provider }>('/api/admin/providers', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    setProviders(prev => [result.provider, ...prev]);
    setBackendError('');
    return result.provider;
  };

  const addCategory = async (newCategory: Omit<ServiceCategory, 'id'>) => {
    const category = await apiRequest<ServiceCategory>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(newCategory)
    });
    setCategories(prev => [...prev, category]);
    setBackendError('');
    return category;
  };

  const addService = async (newService: Omit<Service, 'id'>) => {
    const service = await apiRequest<Service>('/api/services', {
      method: 'POST',
      body: JSON.stringify(newService)
    });
    setServices(prev => [...prev, service]);
    setCategories(prev => prev.map(category => category.id === service.categoryId
      ? {
          ...category,
          popularServices: category.popularServices.includes(service.name)
            ? category.popularServices
            : [...category.popularServices, service.name],
          subServices: category.subServices.includes(service.name)
            ? category.subServices
            : [...category.subServices, service.name]
        }
      : category));
    setBackendError('');
    return service;
  };

  const updateService = (serviceId: string, updated: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, ...updated } : s));
    void persist(`/api/services/${serviceId}`, 'PATCH', updated);
  };

  const deleteService = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
    void persist(`/api/services/${serviceId}`, 'DELETE');
  };

  const updateCategory = (catId: string, updated: Partial<ServiceCategory>) => {
    setCategories(prev => prev.map(c => c.id === catId ? { ...c, ...updated } : c));
    void persist(`/api/categories/${catId}`, 'PATCH', updated);
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
    void persist(`/api/notifications/${notifId}/read`, 'PATCH', {});
  };

  const updateCommissionPercentage = (rate: number) => {
    setCommissionPercentage(rate);
    void persist('/api/settings/platform', 'PATCH', { commissionPercentage: rate });
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      isFirebaseConnected,
      isAuthReady,
      backendError,
      clearBackendError: () => setBackendError(''),
      currentCity,
      setCurrentCity,
      categories,
      services,
      providers,
      bookings,
      reviews,
      complaints,
      notifications,
      messages,
      favorites,
      commissionPercentage,
      setCommissionPercentage: updateCommissionPercentage,
      isAiModalOpen,
      setIsAiModalOpen,
      isVivaModalOpen,
      setIsVivaModalOpen,
      toggleFavorite,
      createBooking,
      updateBookingStatus,
      addReview,
      raiseComplaint,
      updateComplaintStatus,
      sendMessage,
      refreshAdminProviders,
      updateProviderVerification,
      updateProviderDetails,
      addProviderAccount,
      addCategory,
      addService,
      updateService,
      deleteService,
      updateCategory,
      markNotificationRead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
