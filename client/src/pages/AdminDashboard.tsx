import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Define types for our components and data
interface NavItem {
  path: string;
  label: string;
  icon: JSX.Element;
}

interface SidebarProps {
  expanded: boolean;
  onToggle: () => void;
}

interface HeaderProps {
  onToggleSidebar: () => void;
}

interface MetricsData {
  totalUsers: number;
  activeVendors: number;
  totalRevenue: number;
  growthRate: number;
  userGrowth: number;
  vendorGrowth: number;
  revenueGrowth: number;
  growthRateChange: number;
}

interface MetricsProps {
  metrics: MetricsData;
}

interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

interface ActivityProps {
  activities: Activity[];
}

interface RevenueDataItem {
  month: string;
  amount: number;
  year: number;
}

interface RevenueChartProps {
  data: RevenueDataItem[];
}

interface User {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
  status: 'active' | 'pending' | 'inactive';
}

interface UserTableProps {
  users: User[];
}

interface Vendor {
  id: number;
  name: string;
  email: string;
  revenue: number;
  status: 'active' | 'pending' | 'inactive';
}

interface VendorTableProps {
  vendors: Vendor[];
}

// --- Sidebar Component ---
function Sidebar({ expanded, onToggle }: SidebarProps) {
  const [location] = useLocation();

  const mainNavItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      path: '/users',
      label: 'Users',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      path: '/vendors',
      label: 'Vendors',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      path: '/products',
      label: 'Products',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      path: '/orders',
      label: 'Orders',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
    },
  ];

  const settingsNavItems = [
    {
      path: '/settings',
      label: 'General',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      path: '/integrations',
      label: 'Integrations',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
    },
  ];

  const NavItem = ({ item }: { item: NavItem }) => {
    const isActive = location === item.path || (item.path === '/dashboard' && location === '/');
    
    return (
      <Link href={item.path}>
        <div className={cn(
          "flex items-center px-4 py-3 mb-1 transition-colors cursor-pointer",
          isActive 
            ? "text-white bg-gray-800" 
            : "text-gray-300 hover:bg-gray-800"
        )}>
          <span className="mr-3 text-lg">{item.icon}</span>
          {expanded && <span>{item.label}</span>}
        </div>
      </Link>
    );
  };

  return (
    <div className={cn(
      "bg-black text-white flex-shrink-0 transition-all duration-300 ease-in-out z-20",
      expanded ? "w-64" : "w-20",
      "fixed h-full md:relative md:h-screen"
    )}>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            {expanded && <h1 className="text-xl font-bold">PrintMe</h1>}
          </div>
          <button 
            className="p-1 rounded-md hover:bg-gray-700 md:hidden"
            onClick={onToggle}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className={cn("px-4 pb-2 text-xs text-gray-400 uppercase", !expanded && "text-center")}>
            {expanded ? "Main" : "—"}
          </div>
          {mainNavItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
          
          <div className={cn("px-4 pt-6 pb-2 text-xs text-gray-400 uppercase", !expanded && "text-center")}>
            {expanded ? "Settings" : "—"}
          </div>
          {settingsNavItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-3">
              <span className="text-sm font-medium">JD</span>
            </div>
            {expanded && (
              <div>
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            )}
            {expanded && (
              <div className="ml-auto">
                <button className="text-gray-400 hover:text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Header Component ---
function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button 
            className="p-1 mr-3 rounded-md text-gray-500 hover:bg-gray-100 md:hidden"
            onClick={onToggleSidebar}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="relative w-56 md:w-64">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="hidden md:block px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 transition-colors">
            <div className="flex items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Project
            </div>
          </button>
          
          <div className="flex items-center space-x-3">
            <button className="relative p-1 rounded-full text-gray-500 hover:bg-gray-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </button>
            
            <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// --- Metrics Cards Component ---
function MetricsCards({ metrics }: MetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <div className="p-2 bg-blue-50 rounded-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline">
          <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
          <span className="ml-2 text-sm font-medium text-green-600 flex items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            {metrics.userGrowth}%
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">vs previous month</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Active Vendors</h3>
          <div className="p-2 bg-purple-50 rounded-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        </div>
        <div className="flex items-baseline">
          <p className="text-2xl font-bold">{metrics.activeVendors.toLocaleString()}</p>
          <span className="ml-2 text-sm font-medium text-green-600 flex items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            {metrics.vendorGrowth}%
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">vs previous month</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <div className="p-2 bg-green-50 rounded-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
        </div>
        <div className="flex items-baseline">
          <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
          <span className="ml-2 text-sm font-medium text-green-600 flex items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            {metrics.revenueGrowth}%
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">vs previous month</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Growth Rate</h3>
          <div className="p-2 bg-red-50 rounded-full">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
        </div>
        <div className="flex items-baseline">
          <p className="text-2xl font-bold">{metrics.growthRate}%</p>
          <span className="ml-2 text-sm font-medium text-green-600 flex items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            {metrics.growthRateChange}%
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">vs previous month</p>
      </div>
    </div>
  );
}

// --- Recent Activity Component ---
function RecentActivity({ activities }: ActivityProps) {
  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return (
          <div className="p-2 bg-blue-100 rounded-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        );
      case 'vendor':
        return (
          <div className="p-2 bg-purple-100 rounded-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        );
      case 'order':
        return (
          <div className="p-2 bg-green-100 rounded-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
        );
      case 'alert':
        return (
          <div className="p-2 bg-red-100 rounded-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        );
      default:
        return (
          <div className="p-2 bg-gray-100 rounded-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <button className="text-sm text-black hover:underline">View All</button>
      </div>
      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start">
            {getActivityIcon(activity.type)}
            <div className="ml-4">
              <h3 className="text-sm font-medium">{activity.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
              <span className="text-xs text-gray-400 block mt-1">{formatTime(activity.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Revenue Chart Component ---
function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Revenue Overview</h2>
          <p className="text-sm text-gray-500">Monthly revenue performance</p>
        </div>
        <div className="flex space-x-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-black mr-2"></div>
            <span className="text-xs text-gray-500">Current Year</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
            <span className="text-xs text-gray-500">Previous Year</span>
          </div>
        </div>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={value => formatCurrency(value)} />
            <Tooltip formatter={value => (typeof value === 'number' ? formatCurrency(value) : value)} />
            <Legend />
            <Bar name="Revenue" dataKey="amount" fill="#000000" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- User Table Component ---
function UserTable({ users }: UserTableProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Recent Users</h2>
        <button className="text-sm text-black hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">NAME</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">EMAIL</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">JOINED</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">STATUS</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-gray-600">
                        {user.fullName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{user.fullName}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">{user.email}</td>
                <td className="py-3 px-4 text-sm">{formatDate(user.createdAt)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="19" cy="12" r="1" />
                          <circle cx="5" cy="12" r="1" />
                        </svg>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => alert(`Edit ${user.fullName}`)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => alert(`Delete ${user.fullName}`)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Vendor Table Component ---
function VendorTable({ vendors }: VendorTableProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Top Vendors</h2>
        <button className="text-sm text-black hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">VENDOR</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">EMAIL</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">REVENUE</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">STATUS</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor: Vendor) => (
              <tr key={vendor.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-gray-600">
                        {vendor.name.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{vendor.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">{vendor.email}</td>
                <td className="py-3 px-4 text-sm font-medium">{formatCurrency(vendor.revenue)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(vendor.status)}`}>
                    {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="19" cy="12" r="1" />
                          <circle cx="5" cy="12" r="1" />
                        </svg>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => alert(`Edit ${vendor.name}`)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => alert(`Delete ${vendor.name}`)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Admin Dashboard (Main Component) ---
const DashboardConsolidated = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [timeRange, setTimeRange] = useState('Last 30 days');
  
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery<any>({
    queryKey: ['/api/metrics'],
  });

  const { data: revenueData, isLoading: isLoadingRevenue } = useQuery<any>({
    queryKey: ['/api/revenue-data'],
  });

  const { data: activities, isLoading: isLoadingActivities } = useQuery<any>({
    queryKey: ['/api/activities'],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<any>({
    queryKey: ['/api/users'],
  });

  const { data: vendors, isLoading: isLoadingVendors } = useQuery<any>({
    queryKey: ['/api/vendors'],
  });

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleExport = () => {
    alert('Exporting data...');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar expanded={sidebarExpanded} onToggle={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-[#F2F2F2] p-4 md:p-6">
          <div className="fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <select 
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm w-full sm:w-auto appearance-none cursor-pointer"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>This year</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <button 
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                  onClick={handleExport}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span className="text-sm">Export</span>
                </button>
              </div>
            </div>
            
            {isLoadingMetrics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-8 w-24 mb-4" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))}
              </div>
            ) : (
              <MetricsCards metrics={metrics} />
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {isLoadingRevenue ? (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 lg:col-span-2">
                  <Skeleton className="h-6 w-48 mb-6" />
                  <Skeleton className="h-72 w-full" />
                </div>
              ) : (
                <RevenueChart data={revenueData} />
              )}
              
              {isLoadingActivities ? (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <Skeleton className="h-6 w-40 mb-6" />
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start mb-4">
                      <Skeleton className="h-10 w-10 rounded-full mr-3" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-40 mb-2" />
                        <Skeleton className="h-3 w-full mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <RecentActivity activities={activities} />
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isLoadingUsers ? (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <Skeleton className="h-6 w-32 mb-6" />
                  <div className="overflow-x-auto">
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                </div>
              ) : (
                <UserTable users={users || []} />
              )}
              
              {isLoadingVendors ? (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <Skeleton className="h-6 w-32 mb-6" />
                  <div className="overflow-x-auto">
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                </div>
              ) : (
                <VendorTable vendors={vendors || []} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardConsolidated;