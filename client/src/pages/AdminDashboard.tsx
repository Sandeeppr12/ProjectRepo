import React, { useCallback, useEffect, useState } from 'react';
import { Edit, Trash2, Save, X, Plus, Download, Search, RefreshCw } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../components/UserAvatar';
import { Service, Provider, ServiceCategory, BookingStatus } from '../types';
import { apiRequest } from '../utils/api';

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  city: string;
  createdAt: string;
}

interface AdminTransactionRecord {
  id: string;
  orderId: string;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  providerName: string;
  serviceName: string;
  amountRupees: number;
  currency: string;
  method: string;
  status: string;
  testMode: boolean;
  bookingStatus: string;
  createdAt: string;
}

interface AdminRecordsResponse {
  users: AdminUserRecord[];
  transactions: AdminTransactionRecord[];
}

const downloadCsv = <T extends object,>(filename: string, columns: [keyof T, string][], rows: T[]) => {
  const escapeCell = (value: unknown) => {
    let cell = String(value ?? '');
    if (/^[=+\-@]/.test(cell)) cell = `'${cell}`;
    return `"${cell.replace(/"/g, '""')}"`;
  };
  const content = [
    columns.map(([, label]) => escapeCell(label)).join(','),
    ...rows.map((row) => columns.map(([key]) => escapeCell(row[key])).join(','))
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const REVENUE_DATA = [
  { month: 'Apr', revenue: 45000, commission: 4500 },
  { month: 'May', revenue: 68000, commission: 6800 },
  { month: 'Jun', revenue: 92000, commission: 9200 },
  { month: 'Jul', revenue: 115000, commission: 11500 },
  { month: 'Aug', revenue: 140000, commission: 14000 },
  { month: 'Sep', revenue: 185000, commission: 18500 },
];

const CATEGORY_DEMAND = [
  { name: 'Home Services', bookings: 78, color: '#f59e0b' },
  { name: 'Event Mgmt', bookings: 28, color: '#e11d48' },
  { name: 'Digital & IT', bookings: 54, color: '#7c3aed' },
  { name: 'Healthcare', bookings: 32, color: '#0d9488' },
  { name: 'Education', bookings: 45, color: '#2563eb' },
];

export const AdminDashboard: React.FC = () => {
  const { 
    providers, bookings, complaints, commissionPercentage, setCommissionPercentage, 
    updateProviderVerification, updateProviderDetails, categories, updateCategory, addCategory, addProviderAccount,
    services, addService, updateService, deleteService, updateComplaintStatus, updateBookingStatus 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'services' | 'providers' | 'bookings' | 'complaints' | 'settings' | 'users' | 'transactions'>('overview');
  const [adminRecords, setAdminRecords] = useState<AdminRecordsResponse>({ users: [], transactions: [] });
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [transactionSearch, setTransactionSearch] = useState('');

  const requestAdminRecords = useCallback(() => (
    apiRequest<AdminRecordsResponse>('/api/admin/records')
  ), []);

  const loadAdminRecords = useCallback(async () => {
    setRecordsLoading(true);
    setRecordsError('');
    try {
      setAdminRecords(await requestAdminRecords());
    } catch (error) {
      setRecordsError(error instanceof Error ? error.message : 'Could not load user and transaction records.');
    } finally {
      setRecordsLoading(false);
    }
  }, [requestAdminRecords]);

  useEffect(() => {
    let isCurrent = true;
    requestAdminRecords()
      .then((records) => {
        if (isCurrent) setAdminRecords(records);
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setRecordsError(error instanceof Error ? error.message : 'Could not load user and transaction records.');
        }
      })
      .finally(() => {
        if (isCurrent) setRecordsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [requestAdminRecords]);

  const verifiedProviders = providers.filter(p => p.verificationStatus === 'VERIFIED');
  const pendingProviders = providers.filter(p => p.verificationStatus === 'PENDING' || p.verificationStatus === 'UNDER_REVIEW');
  const activeBookings = bookings.filter(b => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalCommission = bookings.reduce((sum, b) => sum + b.commissionAmount, 0);
  const openComplaints = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'REJECTED');
  const filteredUsers = adminRecords.users.filter((user) =>
    [user.name, user.email, user.mobile, user.role, user.city].some((value) =>
      value.toLowerCase().includes(userSearch.trim().toLowerCase())
    )
  );
  const filteredTransactions = adminRecords.transactions.filter((transaction) =>
    [
      transaction.id, transaction.orderId, transaction.bookingCode, transaction.customerName,
      transaction.customerEmail, transaction.providerName, transaction.serviceName,
      transaction.method, transaction.status
    ].some((value) => value.toLowerCase().includes(transactionSearch.trim().toLowerCase()))
  );

  // Edit Service State
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editSrvName, setEditSrvName] = useState('');
  const [editSrvPrice, setEditSrvPrice] = useState(0);

  // Edit Provider State
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [editPvrName, setEditPvrName] = useState('');
  const [editPvrRate, setEditPvrRate] = useState(0);
  const [editPvrExp, setEditPvrExp] = useState(0);

  // Edit Category State
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [editCatDesc, setEditCatDesc] = useState('');

  // Form state for adding new service
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCatId, setNewServiceCatId] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(499);
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [newServiceUnit, setNewServiceUnit] = useState('per visit');
  const [newServiceDuration, setNewServiceDuration] = useState('1 Hour');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('Layers');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [newProvider, setNewProvider] = useState({
    name: '', email: '', mobile: '', password: '', city: '', categoryId: '',
    qualification: '', experienceYears: 0, startingPrice: 499, serviceArea: '', bio: ''
  });
  const [newProviderServices, setNewProviderServices] = useState<string[]>([]);
  const [catalogFormError, setCatalogFormError] = useState('');
  const [catalogFormSuccess, setCatalogFormSuccess] = useState('');
  const [catalogFormLoading, setCatalogFormLoading] = useState(false);

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatalogFormError('');
    setCatalogFormSuccess('');
    const matchedCat = categories.find(c => c.id === newServiceCatId) || categories[0];
    if (!newServiceName.trim() || !matchedCat) return;

    setCatalogFormLoading(true);
    try {
      await addService({
        categoryId: matchedCat.id,
        categoryName: matchedCat.name,
        name: newServiceName.trim(),
        slug: newServiceName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        description: newServiceDescription.trim() || `Professional ${newServiceName.trim()} services.`,
        priceStartingFrom: newServicePrice,
        unit: newServiceUnit,
        estimatedDuration: newServiceDuration,
        features: ['Verified Experts', 'On-Time Guarantee', 'Standard Rates'],
        image: matchedCat.bannerImage,
        popular: false
      });
      setNewServiceName('');
      setNewServiceDescription('');
      setCatalogFormSuccess('Service added and published to the catalog.');
    } catch (error) {
      setCatalogFormError(error instanceof Error ? error.message : 'Could not add this service.');
    } finally {
      setCatalogFormLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatalogFormError('');
    setCatalogFormSuccess('');
    const slug = newCategoryName.toLowerCase().trim().normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slug) {
      setCatalogFormError('Enter a category name using letters or numbers.');
      return;
    }
    setCatalogFormLoading(true);
    try {
      const category = await addCategory({
        name: newCategoryName.trim().toUpperCase(),
        slug,
        description: newCategoryDescription.trim(),
        iconName: newCategoryIcon,
        popularServices: [],
        subServices: [],
        bannerImage: newCategoryImage.trim()
      });
      setNewCategoryName('');
      setNewCategoryDescription('');
      setNewCategoryImage('');
      setNewServiceCatId(category.id);
      setNewProvider((current) => ({ ...current, categoryId: category.id }));
      setCatalogFormSuccess('Category added and now available across the site.');
    } catch (error) {
      setCatalogFormError(error instanceof Error ? error.message : 'Could not add this category.');
    } finally {
      setCatalogFormLoading(false);
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatalogFormError('');
    setCatalogFormSuccess('');
    setCatalogFormLoading(true);
    try {
      await addProviderAccount({ ...newProvider, servicesOffered: newProviderServices });
      setNewProvider({
        name: '', email: '', mobile: '', password: '', city: '', categoryId: '',
        qualification: '', experienceYears: 0, startingPrice: 499, serviceArea: '', bio: ''
      });
      setNewProviderServices([]);
      setCatalogFormSuccess('Provider login and profile created. They are pending verification before appearing as a trusted professional.');
    } catch (error) {
      setCatalogFormError(error instanceof Error ? error.message : 'Could not create this provider.');
    } finally {
      setCatalogFormLoading(false);
    }
  };

  const handleSaveServiceEdit = () => {
    if (!editingService) return;
    updateService(editingService.id, {
      name: editSrvName,
      priceStartingFrom: editSrvPrice
    });
    setEditingService(null);
  };

  const handleSaveProviderEdit = () => {
    if (!editingProvider) return;
    updateProviderDetails(editingProvider.id, {
      name: editPvrName,
      startingPrice: editPvrRate,
      experienceYears: editPvrExp
    });
    setEditingProvider(null);
  };

  const handleSaveCategoryEdit = () => {
    if (!editingCategory) return;
    updateCategory(editingCategory.id, {
      description: editCatDesc
    });
    setEditingCategory(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-600/30 text-purple-300 border border-purple-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              System Admin Control Center
            </span>
            <span className="text-xs text-slate-400">Digital Vistara Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Enterprise Admin Control & Analytics
          </h1>
        </div>

        <div className="flex items-center space-x-3 bg-slate-800 p-2.5 rounded-2xl border border-slate-700 text-xs">
          <span className="text-slate-400 font-medium">Platform Fee Rate:</span>
          <span className="font-extrabold text-purple-400 text-sm">{commissionPercentage}%</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
          <div className="text-xl font-extrabold text-slate-900">₹{totalRevenue.toLocaleString()}</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Platform Commission</span>
          <div className="text-xl font-extrabold text-purple-600">₹{totalCommission.toLocaleString()}</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Verified Providers</span>
          <div className="text-xl font-extrabold text-emerald-600">{verifiedProviders.length} / {providers.length}</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Bookings</span>
          <div className="text-xl font-extrabold text-blue-600">{activeBookings.length}</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Open Complaints</span>
          <div className="text-xl font-extrabold text-rose-600">{openComplaints.length}</div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4 sm:gap-6 text-sm font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition ${activeTab === 'overview' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 border-b-2 transition ${activeTab === 'categories' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Categories (5)
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 border-b-2 transition ${activeTab === 'services' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Edit Services ({services.length})
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          className={`pb-3 border-b-2 transition relative ${activeTab === 'providers' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          <span>Edit Providers ({providers.length})</span>
          {pendingProviders.length > 0 && (
            <span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {pendingProviders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 border-b-2 transition ${activeTab === 'bookings' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition ${activeTab === 'users' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Registered Users ({adminRecords.users.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 border-b-2 transition ${activeTab === 'transactions' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Transactions ({adminRecords.transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('complaints')}
          className={`pb-3 border-b-2 transition ${activeTab === 'complaints' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Complaints ({complaints.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 border-b-2 transition ${activeTab === 'settings' ? 'border-purple-600 text-purple-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
        >
          Commission Settings
        </button>
      </div>

      {/* TAB 1: OVERVIEW CHARTS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Gross Marketplace Revenue vs Platform Commission</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" textAnchor="middle" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" fillOpacity={1} fill="url(#colorRev)" name="Marketplace Gross (₹)" />
                  <Area type="monotone" dataKey="commission" stroke="#7c3aed" fillOpacity={1} fill="url(#colorComm)" name="Platform Fee (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Demand Pie */}
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Category Demand Share</h3>
            <div className="h-56 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DEMAND}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="bookings"
                  >
                    {CATEGORY_DEMAND.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {CATEGORY_DEMAND.map(c => (
                <div key={c.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></span>
                  <span className="text-slate-600">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'users' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Registered Accounts</h2>
              <p className="text-sm text-slate-500">Account registration data. Passwords and credentials are never shown here.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  placeholder="Search users"
                  className="min-w-0 outline-none"
                />
              </label>
              <button
                onClick={() => downloadCsv('digital-vistara-users.csv', [
                  ['id', 'Account ID'], ['name', 'Name'], ['email', 'Email'], ['mobile', 'Mobile'],
                  ['role', 'Role'], ['city', 'City'], ['createdAt', 'Registered At']
                ], filteredUsers)}
                disabled={filteredUsers.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button
                onClick={() => void loadAdminRecords()}
                disabled={recordsLoading}
                aria-label="Refresh records"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-slate-700 disabled:opacity-40"
              >
                <RefreshCw className={`w-4 h-4 ${recordsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          {recordsError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{recordsError}</p>}
          {recordsLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading registered users…</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>{['Name', 'Email', 'Mobile', 'Role', 'City', 'Registered'].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="text-slate-700">
                      <td className="px-3 py-3 font-semibold text-slate-900">{user.name || '—'}</td>
                      <td className="px-3 py-3">{user.email || '—'}</td>
                      <td className="px-3 py-3">{user.mobile || '—'}</td>
                      <td className="px-3 py-3 capitalize">{user.role}</td>
                      <td className="px-3 py-3">{user.city || '—'}</td>
                      <td className="px-3 py-3">{user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && <tr><td colSpan={6} className="px-3 py-10 text-center text-slate-500">No registered users match this search.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === 'transactions' && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Payments & Booking Transactions</h2>
              <p className="text-sm text-slate-500">Includes recorded payments and bookings awaiting payment confirmation.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  value={transactionSearch}
                  onChange={(event) => setTransactionSearch(event.target.value)}
                  placeholder="Search transactions"
                  className="min-w-0 outline-none"
                />
              </label>
              <button
                onClick={() => downloadCsv('digital-vistara-transactions.csv', [
                  ['id', 'Transaction ID'], ['orderId', 'Order ID'], ['bookingCode', 'Booking'],
                  ['customerName', 'Customer'], ['customerEmail', 'Customer Email'], ['providerName', 'Provider'],
                  ['serviceName', 'Service'], ['amountRupees', 'Amount (INR)'], ['method', 'Method'],
                  ['status', 'Payment Status'], ['bookingStatus', 'Booking Status'],
                  ['testMode', 'Test Mode'], ['createdAt', 'Created At']
                ], filteredTransactions)}
                disabled={filteredTransactions.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button
                onClick={() => void loadAdminRecords()}
                disabled={recordsLoading}
                aria-label="Refresh records"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-slate-700 disabled:opacity-40"
              >
                <RefreshCw className={`w-4 h-4 ${recordsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          {recordsError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{recordsError}</p>}
          {recordsLoading ? <p className="py-8 text-center text-sm text-slate-500">Loading transactions…</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>{['Transaction', 'Customer', 'Service / Provider', 'Amount', 'Method', 'Payment', 'Booking', 'Date'].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="text-slate-700">
                      <td className="px-3 py-3 font-mono text-xs">{transaction.orderId || transaction.id}{transaction.testMode && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">TEST</span>}</td>
                      <td className="px-3 py-3"><div className="font-semibold text-slate-900">{transaction.customerName || '—'}</div><div className="text-xs text-slate-500">{transaction.customerEmail}</div></td>
                      <td className="px-3 py-3"><div>{transaction.serviceName || '—'}</div><div className="text-xs text-slate-500">{transaction.providerName}</div></td>
                      <td className="px-3 py-3 font-bold">{transaction.currency} {transaction.amountRupees.toLocaleString()}</td>
                      <td className="px-3 py-3">{transaction.method}</td>
                      <td className="px-3 py-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{transaction.status}</span></td>
                      <td className="px-3 py-3">{transaction.bookingCode || transaction.bookingStatus || '—'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && <tr><td colSpan={8} className="px-3 py-10 text-center text-slate-500">No transactions match this search.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-xs text-slate-500">Payment status is read-only here. Refunds and payment changes must be handled through the payment provider.</p>
        </section>
      )}

      {/* TAB 2: CATEGORIES EDITOR */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <form onSubmit={handleAddCategory} className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
            <div>
              <h3 className="font-bold text-lg">Add a Marketplace Category</h3>
              <p className="text-sm text-slate-300">New categories are saved to the database and appear across the site.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} placeholder="Category name" maxLength={60} required className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              <select value={newCategoryIcon} onChange={(event) => setNewCategoryIcon(event.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                {['Layers', 'Wrench', 'Activity', 'GraduationCap', 'Code', 'PartyPopper'].map((icon) => <option key={icon} value={icon}>{icon}</option>)}
              </select>
              <textarea value={newCategoryDescription} onChange={(event) => setNewCategoryDescription(event.target.value)} placeholder="Short category description" maxLength={500} required className="md:col-span-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" rows={2} />
              <input type="url" value={newCategoryImage} onChange={(event) => setNewCategoryImage(event.target.value)} placeholder="Banner image URL (optional)" className="md:col-span-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
            </div>
            <button disabled={catalogFormLoading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Category
            </button>
            {catalogFormError && <p role="alert" className="text-sm text-rose-300">{catalogFormError}</p>}
            {catalogFormSuccess && <p role="status" className="text-sm text-emerald-300">{catalogFormSuccess}</p>}
          </form>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Marketplace Categories ({categories.length})</h3>
            <div className="space-y-4">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center shrink-0">{idx + 1}</span>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{cat.name}</h4>
                      <p className="text-slate-600 mt-0.5">{cat.description}</p>
                      <p className="text-slate-400 mt-1">{services.filter((service) => service.categoryId === cat.id).length} services</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setEditCatDesc(cat.description);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Description
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SERVICE CATEGORIES & SERVICES MANAGER & EDITOR */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          
          {/* Add New Service Form */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
            <div>
              <h3 className="font-bold text-lg text-white">Add a Marketplace Service</h3>
              <p className="text-sm text-slate-300">Choose a category, set a starting price, and publish the service.</p>
            </div>
            
            <form onSubmit={handleAddService} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="Service name"
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                maxLength={80}
                required
              />

              <select
                value={newServiceCatId || categories[0]?.id || ''}
                onChange={(e) => setNewServiceCatId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold"
                required
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <input
                type="number"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(Number(e.target.value))}
                placeholder="Starting price (₹)"
                min={1}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                required
              />
              <input value={newServiceUnit} onChange={(event) => setNewServiceUnit(event.target.value)} placeholder="Price unit (e.g. per visit)" maxLength={40} required className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              <input value={newServiceDuration} onChange={(event) => setNewServiceDuration(event.target.value)} placeholder="Estimated duration" maxLength={40} required className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
              <textarea value={newServiceDescription} onChange={(event) => setNewServiceDescription(event.target.value)} placeholder="Description (optional)" maxLength={500} rows={2} className="sm:col-span-2 lg:col-span-3 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />

              <button
                type="submit"
                disabled={catalogFormLoading || categories.length === 0}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> {catalogFormLoading ? 'Saving…' : 'Create Service'}
              </button>
            </form>
            {categories.length === 0 && <p className="text-sm text-amber-300">Add a category before creating a service.</p>}
            {catalogFormError && <p role="alert" className="text-sm text-rose-300">{catalogFormError}</p>}
            {catalogFormSuccess && <p role="status" className="text-sm text-emerald-300">{catalogFormSuccess}</p>}
          </div>

          {/* Active Services Editing List */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Active Marketplace Services</h3>
            
            <div className="divide-y divide-slate-100 text-xs">
              {services.map(s => (
                <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                    <span className="ml-2 text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-semibold text-[10px]">{s.categoryName}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">{s.description}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-extrabold text-slate-900">Starting ₹{s.priceStartingFrom}</span>
                    <button
                      onClick={() => {
                        setEditingService(s);
                        setEditSrvName(s.name);
                        setEditSrvPrice(s.priceStartingFrom);
                      }}
                      className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg border border-blue-200 flex items-center gap-1 font-semibold"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => deleteService(s.id)}
                      className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg border border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: PROVIDERS EDIT & VERIFICATION MANAGER */}
      {activeTab === 'providers' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 text-base">Manage & Edit Service Professionals</h3>
          
          <div className="divide-y divide-slate-100 space-y-4">
            {providers.map(p => (
              <div key={p.id} className="pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                <div className="flex items-center space-x-3">
                  <UserAvatar src={p.avatar} name={p.name} className="w-12 h-12 rounded-xl" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{p.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        p.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.verificationStatus}
                      </span>
                    </div>
                    <div className="text-slate-500">{p.category} • {p.qualification} • {p.city}</div>
                    <div className="text-slate-400 mt-0.5">Rate: ₹{p.startingPrice} | Exp: {p.experienceYears} Yrs | Rating: ★ {p.rating}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingProvider(p);
                      setEditPvrName(p.name);
                      setEditPvrRate(p.startingPrice);
                      setEditPvrExp(p.experienceYears);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-1.5 px-3 rounded-lg flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Details
                  </button>

                  <button
                    onClick={() => updateProviderVerification(p.id, p.verificationStatus === 'VERIFIED' ? 'SUSPENDED' : 'VERIFIED')}
                    className={`font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 ${
                      p.verificationStatus === 'VERIFIED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {p.verificationStatus === 'VERIFIED' ? 'Suspend' : 'Approve Verified'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BOOKINGS MANAGER */}
      {activeTab === 'bookings' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-base">All Platform Bookings Control</h3>
          <div className="divide-y divide-slate-100 space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{b.serviceName} ({b.bookingCode})</div>
                  <div className="text-slate-500">Customer: {b.customerName} • Provider: {b.providerName}</div>
                  <div className="text-slate-400">Total: ₹{b.totalAmount} • Status: <span className="font-bold text-blue-600">{b.status}</span></div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={b.status}
                    onChange={(e) => updateBookingStatus(b.id, e.target.value as BookingStatus, 'Updated by Admin')}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-800"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="ON_THE_WAY">ON_THE_WAY</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: COMPLAINTS MANAGER */}
      {activeTab === 'complaints' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-base">Customer Complaints & Dispute Resolution</h3>
          
          <div className="divide-y divide-slate-100 space-y-3">
            {complaints.map(c => (
              <div key={c.id} className="pt-3 space-y-2">
                <div className="flex justify-between font-bold">
                  <span>Ticket #{c.id} • {c.category} (Booking {c.bookingId})</span>
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">{c.status}</span>
                </div>
                <p className="text-slate-600">{c.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateComplaintStatus(c.id, 'RESOLVED', 'Refund issued to customer.')}
                    className="bg-emerald-600 text-white font-bold px-3 py-1 rounded"
                  >
                    Resolve Ticket
                  </button>
                  <button
                    onClick={() => updateComplaintStatus(c.id, 'REJECTED', 'No violation found.')}
                    className="bg-slate-200 text-slate-700 font-bold px-3 py-1 rounded"
                  >
                    Reject Claim
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: PLATFORM COMMISSION SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm max-w-xl space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-base">Platform Revenue Commission Controller</h3>
          
          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">Commission Percentage (%)</label>
            <input
              type="number"
              min="0"
              max="50"
              value={commissionPercentage}
              onChange={(e) => setCommissionPercentage(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-bold text-sm"
            />
            <p className="text-slate-500 text-[11px]">
              This percentage is automatically deducted from gross booking amounts and credited to Digital Vistara platform revenue.
            </p>
          </div>
        </div>
      )}

      {/* EDIT SERVICE MODAL */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 text-slate-900 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm">Edit Service Details</h3>
              <button onClick={() => setEditingService(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Service Name</label>
                <input
                  type="text"
                  value={editSrvName}
                  onChange={(e) => setEditSrvName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Starting Price ₹</label>
                <input
                  type="number"
                  value={editSrvPrice}
                  onChange={(e) => setEditSrvPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <button
                onClick={handleSaveServiceEdit}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROVIDER MODAL */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 text-slate-900 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm">Edit Professional Profile</h3>
              <button onClick={() => setEditingProvider(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Professional Name</label>
                <input
                  type="text"
                  value={editPvrName}
                  onChange={(e) => setEditPvrName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Starting Rate ₹</label>
                <input
                  type="number"
                  value={editPvrRate}
                  onChange={(e) => setEditPvrRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Years of Experience</label>
                <input
                  type="number"
                  value={editPvrExp}
                  onChange={(e) => setEditPvrExp(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                />
              </div>

              <button
                onClick={handleSaveProviderEdit}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1"
              >
                <Save className="w-4 h-4" /> Save Provider Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 text-slate-900 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm">Edit Category: {editingCategory.name}</h3>
              <button onClick={() => setEditingCategory(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold block mb-1">Category Description</label>
                <textarea
                  rows={3}
                  value={editCatDesc}
                  onChange={(e) => setEditCatDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                />
              </div>

              <button
                onClick={handleSaveCategoryEdit}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1"
              >
                <Save className="w-4 h-4" /> Save Category Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
