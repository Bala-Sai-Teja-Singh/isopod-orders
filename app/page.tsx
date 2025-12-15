
'use client';

import { useState, useEffect, useRef } from 'react';
import { Order } from '@/types/order';
import OrderForm from '@/components/OrderForm';
import {
  Plus,
  Search,
  Package,
  Edit,
  Trash2,
  Filter,
  Download,
  Phone,
  Mail,
  MapPin,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import KeyAuthModal from '@/components/KeyAuthModal';

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [exporting, setExporting] = useState(false);
  const [exportAll, setExportAll] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function StatusDropdown({ order }: { order: Order }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsDropdownOpen(false);
        }
      };

      if (isDropdownOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
          document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isDropdownOpen]);

    const statusOptions = [
      {
        value: 'pending',
        label: 'Pending',
        light: 'text-yellow-800 bg-yellow-100',
        dark: 'dark:text-yellow-200 dark:bg-yellow-900/30',
        dot: 'bg-yellow-500',
      },
      {
        value: 'shipped',
        label: 'Shipped',
        light: 'text-blue-800 bg-blue-100',
        dark: 'dark:text-blue-200 dark:bg-blue-900/30',
        dot: 'bg-blue-500',
      },
      {
        value: 'delivered',
        label: 'Delivered',
        light: 'text-emerald-800 bg-emerald-100',
        dark: 'dark:text-emerald-200 dark:bg-emerald-900/30',
        dot: 'bg-emerald-500',
      },
      {
        value: 'cancelled',
        label: 'Cancelled',
        light: 'text-rose-800 bg-rose-100',
        dark: 'dark:text-rose-200 dark:bg-rose-900/30',
        dot: 'bg-rose-500',
      },
    ];

    const currentStatus = statusOptions.find(
      (opt) => opt.value === order.status
    );

    return (
      <div className='relative' ref={dropdownRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className={`inline-flex items-center gap-2! px-3! py-1! rounded-full text-xs font-semibold transition-all duration-200 hover:shadow-md border ${currentStatus?.light} ${currentStatus?.dark}`}
        >
          <span>{currentStatus?.label}</span>
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className='absolute z-50 mt-2! w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-1'>
            <div className='p-1!'>
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickStatusUpdate(order.id, option.value);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2! px-3! py-2.5! text-sm rounded-lg transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    order.status === option.value
                      ? 'font-semibold'
                      : 'font-normal'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${option.dot} dark:${option.dot}`}
                  />
                  <span className={`${option.light} ${option.dark}`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setShowAuthModal(false);
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const fetchOrders = async () => {
    try {
      const accessKey = sessionStorage.getItem('accessKey');

      if (!accessKey) {
        setIsAuthenticated(false);
        setShowAuthModal(true);
        return;
      }

      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${accessKey}`,
        },
      });

      if (response.status === 401) {
        sessionStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('accessKey');
        setIsAuthenticated(false);
        setShowAuthModal(true);
        return;
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setFilteredOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const accessKey = sessionStorage.getItem('accessKey');

      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessKey}`,
        },
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (response.ok) {
        fetchOrders();
        setDeleteConfirm(null);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to delete order'}`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const handleQuickStatusUpdate = async (
    orderId: string,
    newStatus: string
  ) => {
    try {
      const accessKey = sessionStorage.getItem('accessKey');

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessKey}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to update status'}`);
        return;
      }

      const updatedOrder = await response.json();
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, ...updatedOrder.order } : order
        )
      );

      console.log(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.customer_name.toLowerCase().includes(query) ||
          order.phone.includes(query) ||
          order.email?.toLowerCase().includes(query) ||
          order.courier_receipt?.toLowerCase().includes(query) ||
          order.items.some((item) => item.name.toLowerCase().includes(query))
      );
    }

    setFilteredOrders(filtered);
  }, [searchQuery, orders, statusFilter]);

  const handleExport = async () => {
    const ordersToExport = exportAll ? orders : filteredOrders;

    if (ordersToExport.length === 0) {
      alert(`No orders to export${exportAll ? '' : ' with current filters'}`);
      return;
    }

    setExporting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const excelData = ordersToExport.map((order) => {
        const itemsTotal = order.items.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        );

        const itemsString = order.items
          .map((item) => `${item.name} (Qty: ${item.quantity}, ₹${item.price})`)
          .join('; ');

        return {
          'Order ID': order.id,
          'Customer Name': order.customer_name,
          'Phone Number': order.phone,
          'Email Address': order.email || 'N/A',
          'Social Media': order.social_media_handle || 'N/A',
          'Shipping Address': order.address,
          'Order Date': format(new Date(order.created_at), 'yyyy-MM-dd HH:mm'),
          'Sent Date': order.sent_date
            ? format(new Date(order.sent_date), 'yyyy-MM-dd')
            : 'Not Sent',
          Status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
          'Courier Service': order.courier_service || 'N/A',
          'Tracking Number': order.courier_receipt || 'N/A',
          'Items Details': itemsString,
          'Items Total': itemsTotal,
          'Shipping Charges': order.shipping_charges || 0,
          'Total Amount': order.payment_amount,
          Notes: order.notes || 'N/A',
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      const maxWidth = excelData.reduce((width: number, row) => {
        Object.values(row).forEach((value: unknown) => {
          const cellLength = String(value).length;
          if (cellLength > width) width = cellLength;
        });
        return width;
      }, 10);

      const wscols = Array(Object.keys(excelData[0] || {}).length).fill({
        wch: Math.min(maxWidth, 50),
      });
      worksheet['!cols'] = wscols;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

      const fileName = `isopod_orders_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error exporting orders:', error);
      alert('Failed to export orders. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-linear-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:text-yellow-200 dark:border-yellow-800';
      case 'shipped':
        return 'bg-linear-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:text-blue-200 dark:border-blue-800';
      case 'delivered':
        return 'bg-linear-to-r from-emerald-100 to-emerald-50 text-emerald-800 border border-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:text-emerald-200 dark:border-emerald-800';
      case 'cancelled':
        return 'bg-linear-to-r from-rose-100 to-rose-50 text-rose-800 border border-rose-200 dark:from-rose-900/20 dark:to-rose-800/20 dark:text-rose-200 dark:border-rose-800';
      default:
        return 'bg-linear-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200 dark:from-gray-900/20 dark:to-gray-800/20 dark:text-gray-200 dark:border-gray-800';
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    revenue: orders.reduce((sum, order) => {
      const itemsTotal = (order.items || []).reduce(
        (s, item) => s + (item.quantity || 0) * (item.price || 0),
        0
      );
      return sum + itemsTotal;
    }, 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isAuthenticated) {
    return <KeyAuthModal onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800/30'>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden'
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className='fixed top-0 right-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-xl p-6!'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex justify-between items-center mb-8!'>
              <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
                Menu
              </h2>
              <button onClick={() => setMobileMenuOpen(false)} className='p-2!'>
                <X className='w-5 h-5 text-gray-500 dark:text-gray-400' />
              </button>
            </div>
            <div className='space-y-4!'>
              <button
                onClick={() => {
                  setSelectedOrder(undefined);
                  setShowForm(true);
                  setMobileMenuOpen(false);
                }}
                className='w-full flex items-center justify-center gap-2 px-5! py-3! bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg font-semibold transition-all duration-200'
              >
                <Plus className='w-5 h-5' />
                New Order
              </button>

              <button
                onClick={handleLogout}
                className='w-full flex items-center justify-center gap-2 px-5! py-3! bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-all duration-200'
              >
                <LogOut className='w-4 h-4' />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className='fixed w-full top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm'>
        <div className='max-w-7xl mx-auto! px-4! sm:px-6! py-3! sm:py-4!'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-3 sm:gap-4'>
              <div className='p-2! sm:p-3! bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg'>
                <Package className='w-5 h-5 sm:w-7 sm:h-7 text-white' />
              </div>
              <div>
                <h1 className='text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white'>
                  Isopod Orders
                </h1>
                <p className='text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-0.5 hidden sm:block'>
                  Manage your isopod, springtails & snails orders
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2 sm:gap-4'>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className='lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg'
              >
                <Menu className='w-5 h-5' />
              </button>

              {/* Desktop Buttons */}
              <div className='hidden lg:flex items-center gap-4'>
                <button
                  onClick={() => {
                    setSelectedOrder(undefined);
                    setShowForm(true);
                  }}
                  className='flex items-center gap-2 px-5! py-3! bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold group'
                >
                  <Plus className='w-5 h-5 group-hover:rotate-90 transition-transform duration-200' />
                  <span className='hidden sm:inline'>New Order</span>
                </button>

                <button
                  onClick={handleLogout}
                  className='flex items-center gap-2 px-4! py-3! bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 shadow-sm hover:shadow transition-all duration-200 font-medium group'
                  title='Logout'
                >
                  <LogOut className='w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200' />
                  <span className='hidden sm:inline'>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto! mt-16! sm:mt-20! px-3! sm:px-4! md:px-6! py-4! sm:py-6! md:py-8!'>
        {/* Statistics Cards */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3! sm:gap-4! md:gap-6! mb-6! sm:mb-8!'>
          <div className='bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md p-3! sm:p-4! md:p-6! border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200'>
            <div className='text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400'>
              Total
            </div>
            <div className='text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1! sm:mt-2!'>
              {stats.total}
            </div>
            <div className='text-xs text-gray-500 dark:text-gray-400 mt-0.5! sm:mt-1!'>
              All orders
            </div>
          </div>

          <div className='bg-linear-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl sm:rounded-2xl shadow-md p-3! sm:p-4! md:p-6! border border-yellow-100 dark:border-yellow-800/30 hover:shadow-lg transition-shadow duration-200'>
            <div className='text-xs sm:text-sm font-medium text-yellow-700 dark:text-yellow-300'>
              Pending
            </div>
            <div className='text-xl sm:text-2xl md:text-3xl font-bold text-yellow-800 dark:text-yellow-200 mt-1! sm:mt-2!'>
              {stats.pending}
            </div>
            <div className='text-xs text-yellow-600 dark:text-yellow-400 mt-0.5! sm:mt-1!'>
              Awaiting
            </div>
          </div>

          <div className='bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl sm:rounded-2xl shadow-md p-3! sm:p-4! md:p-6! border border-blue-100 dark:border-blue-800/30 hover:shadow-lg transition-shadow duration-200'>
            <div className='text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300'>
              Shipped
            </div>
            <div className='text-xl sm:text-2xl md:text-3xl font-bold text-blue-800 dark:text-blue-200 mt-1! sm:mt-2!'>
              {stats.shipped}
            </div>
            <div className='text-xs text-blue-600 dark:text-blue-400 mt-0.5! sm:mt-1!'>
              In transit
            </div>
          </div>

          <div className='bg-linear-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl sm:rounded-2xl shadow-md p-3! sm:p-4! md:p-6! border border-emerald-100 dark:border-emerald-800/30 hover:shadow-lg transition-shadow duration-200'>
            <div className='text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300'>
              Delivered
            </div>
            <div className='text-xl sm:text-2xl md:text-3xl font-bold text-emerald-800 dark:text-emerald-200 mt-1! sm:mt-2!'>
              {stats.delivered}
            </div>
            <div className='text-xs text-emerald-600 dark:text-emerald-400 mt-0.5! sm:mt-1!'>
              Delivered
            </div>
          </div>

          <div className='col-span-2 sm:col-span-3 md:col-span-1 bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl sm:rounded-2xl shadow-md p-3! sm:p-4! md:p-6! border border-purple-100 dark:border-purple-800/30 hover:shadow-lg transition-shadow duration-200'>
            <div className='text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300'>
              Revenue
            </div>
            <div className='text-xl sm:text-2xl md:text-3xl font-bold text-purple-800 dark:text-purple-200 mt-1! sm:mt-2!'>
              {formatCurrency(stats.revenue)}
            </div>
            <div className='text-xs text-purple-600 dark:text-purple-400 mt-0.5! sm:mt-1!'>
              Total earnings
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <OrderForm
            order={selectedOrder}
            onSuccess={() => {
              setShowForm(false);
              setSelectedOrder(undefined);
              fetchOrders();
            }}
            onCancel={() => {
              setShowForm(false);
              setSelectedOrder(undefined);
            }}
          />
        )}

        {/* Controls Bar */}
        <div className='bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md p-4! sm:p-6! mb-4! sm:mb-6! border border-gray-100 dark:border-gray-700'>
          <div className='flex flex-col gap-4!'>
            {/* Search Bar */}
            <div className='w-full'>
              <div className='relative'>
                <Search className='absolute left-3! sm:left-4! top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5' />
                <input
                  type='text'
                  placeholder='Search orders...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10! sm:pl-12! pr-4! py-2.5! sm:py-3! bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 dark:text-white text-sm sm:text-base'
                />
              </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-3! justify-between items-stretch sm:items-center'>
              {/* Filter */}
              <div className='relative w-full sm:w-auto'>
                <Filter className='absolute left-3! top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className='w-full pl-10! pr-4! py-2.5! sm:py-3! bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm font-medium transition-all duration-200'
                >
                  <option value='all'>All Status</option>
                  <option value='pending'>Pending</option>
                  <option value='shipped'>Shipped</option>
                  <option value='delivered'>Delivered</option>
                  <option value='cancelled'>Cancelled</option>
                </select>
              </div>

              {/* Export Controls */}
              <div className='flex flex-col xs:flex-row gap-3! items-stretch xs:items-center'>
                <label className='flex items-center gap-2! text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap px-2!'>
                  <input
                    type='checkbox'
                    checked={exportAll}
                    onChange={(e) => setExportAll(e.target.checked)}
                    className='rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700'
                  />
                  Export All
                </label>

                <button
                  onClick={handleExport}
                  disabled={
                    exporting ||
                    (exportAll
                      ? orders.length === 0
                      : filteredOrders.length === 0)
                  }
                  className={`px-4! py-2.5! sm:py-3! rounded-lg sm:rounded-xl transition-all duration-200 font-medium flex items-center justify-center gap-2! shadow-md hover:shadow-lg ${
                    exporting ||
                    (exportAll
                      ? orders.length === 0
                      : filteredOrders.length === 0)
                      ? 'bg-gray-400 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                      : 'bg-linear-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800'
                  }`}
                >
                  {exporting ? (
                    <>
                      <div className='animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white'></div>
                      <span className='text-xs sm:text-sm'>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download className='w-3 h-3 sm:w-4 sm:h-4' />
                      <span className='text-xs sm:text-sm'>
                        Export {exportAll ? 'All' : 'Filtered'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className='text-center py-12! sm:py-16!'>
            <div className='inline-block animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 border-b-2 border-blue-600'></div>
            <p className='mt-4! text-gray-600 dark:text-gray-400 font-medium text-sm sm:text-base'>
              Loading orders...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className='text-center py-12! sm:py-16! bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md border border-gray-100 dark:border-gray-700'>
            <div className='inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl sm:rounded-2xl mb-4! sm:mb-6!'>
              <Package className='w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500' />
            </div>
            <h3 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2!'>
              {searchQuery || statusFilter !== 'all'
                ? 'No orders found'
                : 'No orders yet'}
            </h3>
            <p className='text-gray-600 dark:text-gray-400 max-w-md mx-auto! mb-6! text-sm sm:text-base px-4!'>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter to find what you are looking for.'
                : 'Get started by creating your first order!'}
            </p>
            <button
              onClick={() => {
                setSelectedOrder(undefined);
                setShowForm(true);
              }}
              className='inline-flex items-center gap-2! px-5! sm:px-6! py-2.5! sm:py-3! bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base'
            >
              <Plus className='w-4 h-4 sm:w-5 sm:h-5' />
              Create First Order
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4! sm:gap-6!'>
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className='bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 dark:border-gray-700 group'
              >
                <div className='p-4! sm:p-6!'>
                  <div className='flex flex-col lg:flex-row lg:items-start justify-between gap-4! sm:gap-6! mb-4! sm:mb-6!'>
                    <div className='flex-1'>
                      <div className='flex flex-col xs:flex-row xs:items-center gap-2! xs:gap-4! mb-3!'>
                        <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate'>
                          {order.customer_name}
                        </h3>
                        <StatusDropdown order={order} />
                      </div>
                      <div className='flex flex-col xs:flex-row xs:items-center gap-2! xs:gap-6! text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                        <span className='flex items-center gap-1!'>
                          <svg
                            className='w-3 h-3 sm:w-4 sm:h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                          </svg>
                          {format(
                            new Date(order.created_at),
                            'MMM dd, yyyy • hh:mm a'
                          )}
                        </span>
                        {order.sent_date && (
                          <span className='flex items-center gap-1!'>
                            <svg
                              className='w-3 h-3 sm:w-4 sm:h-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                              />
                            </svg>
                            Sent:{' '}
                            {format(new Date(order.sent_date), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className='flex items-center gap-2! self-end xs:self-center mt-2! xs:mt-0!'>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowForm(true);
                        }}
                        className='p-2! text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg sm:rounded-xl transition-colors duration-200'
                        title='Edit order'
                      >
                        <Edit className='w-4 h-4 sm:w-5 sm:h-5' />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(order.id)}
                        className='p-2! text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg sm:rounded-xl transition-colors duration-200'
                        title='Delete order'
                      >
                        <Trash2 className='w-4 h-4 sm:w-5 sm:h-5' />
                      </button>
                    </div>
                  </div>

                  {/* Mobile Compact Info */}
                  <div className='lg:hidden space-y-4! mb-4! sm:mb-6!'>
                    <div className='grid grid-cols-2 gap-3!'>
                      <div className='space-y-1!'>
                        <div className='text-xs font-medium text-gray-700 dark:text-gray-300'>
                          Contact
                        </div>
                        <div className='text-sm font-medium text-gray-900 dark:text-white'>
                          {order.phone}
                        </div>
                        {order.email && (
                          <div className='text-xs text-gray-600 dark:text-gray-400 truncate'>
                            {order.email}
                          </div>
                        )}
                      </div>
                      <div className='space-y-1!'>
                        <div className='text-xs font-medium text-gray-700 dark:text-gray-300'>
                          Courier
                        </div>
                        <div className='text-sm font-medium text-gray-900 dark:text-white truncate'>
                          {order.courier_service}
                        </div>
                        {order.courier_receipt && (
                          <div className='text-xs text-gray-600 dark:text-gray-400 truncate'>
                            {order.courier_receipt}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='space-y-1!'>
                      <div className='text-xs font-medium text-gray-700 dark:text-gray-300'>
                        Shipping Address
                      </div>
                      <div className='text-sm text-gray-600 dark:text-gray-400 line-clamp-2'>
                        <MapPin className='w-3 h-3 inline-block mr-1!' />
                        {order.address}
                      </div>
                    </div>
                  </div>

                  <div className='hidden lg:grid grid-cols-1 md:grid-cols-3 gap-4! sm:gap-6! mb-4! sm:mb-6!'>
                    <div className='space-y-2! sm:space-y-3!'>
                      <div className='text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Contact Information
                      </div>
                      <div className='space-y-1! sm:space-y-2!'>
                        <div className='flex items-center gap-2! text-xs sm:text-sm'>
                          <Phone className='w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400' />
                          <span className='font-medium dark:text-gray-300'>
                            {order.phone}
                          </span>
                        </div>
                        {order.email && (
                          <div className='flex items-center gap-2! text-xs sm:text-sm'>
                            <Mail className='w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400' />
                            <span className='text-gray-900 dark:text-gray-300 truncate'>
                              {order.email}
                            </span>
                          </div>
                        )}
                        {order.social_media_handle && (
                          <div className='flex items-center gap-2! text-xs sm:text-sm'>
                            <span className='text-gray-500 dark:text-gray-400'>
                              💬
                            </span>
                            <span className='text-gray-900 dark:text-gray-300 truncate'>
                              {order.social_media_handle}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='space-y-2! sm:space-y-3!'>
                      <div className='text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Shipping Details
                      </div>
                      <div className='space-y-1! sm:space-y-2!'>
                        <div className='text-xs sm:text-sm'>
                          <span className='text-gray-500 dark:text-gray-400'>
                            Courier:
                          </span>
                          <span className='font-medium ml-1! sm:ml-2! dark:text-gray-300'>
                            {order.courier_service}
                          </span>
                        </div>
                        {order.courier_receipt && (
                          <div className='text-xs sm:text-sm'>
                            <span className='text-gray-500 dark:text-gray-400'>
                              Tracking:
                            </span>
                            <span className='font-medium ml-1! sm:ml-2! dark:text-gray-300'>
                              {order.courier_receipt}
                            </span>
                          </div>
                        )}

                        <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2'>
                          <MapPin className='w-3 h-3 sm:w-4 sm:h-4 inline-block mr-1!' />
                          {order.address}
                        </div>
                      </div>
                    </div>

                    <div className='space-y-2! sm:space-y-3!'>
                      <div className='text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Order Summary
                      </div>
                      <div className='space-y-1! sm:space-y-2!'>
                        <div className='flex justify-between text-xs sm:text-sm'>
                          <span className='text-gray-500 dark:text-gray-400'>
                            Items:
                          </span>
                          <span className='font-medium dark:text-gray-300'>
                            ₹
                            {order.items
                              .reduce(
                                (sum, item) => sum + item.price * item.quantity,
                                0
                              )
                              .toFixed(2)}
                          </span>
                        </div>
                        <div className='flex justify-between text-xs sm:text-sm'>
                          <span className='text-gray-500 dark:text-gray-400'>
                            Shipping:
                          </span>
                          <span className='font-medium dark:text-gray-300'>
                            {order.shipping_charges
                              ? ` ₹${order.shipping_charges.toFixed(2)}`
                              : ' N/A'}
                          </span>
                        </div>

                        <div className='flex justify-between text-xs sm:text-sm pt-2! border-t dark:border-gray-700'>
                          <span className='text-gray-700 dark:text-gray-300 font-semibold'>
                            Total:
                          </span>
                          <span className='text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400'>
                            ₹{order.payment_amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Section */}
                  <div className='mb-4! sm:mb-6!'>
                    <div className='text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2! sm:mb-3!'>
                      Order Items ({order.items.length})
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2! sm:gap-3!'>
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className='bg-linear-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl p-3! sm:p-4! hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200'
                        >
                          <div className='flex justify-between items-start'>
                            <div className='max-w-[60%]'>
                              <div className='font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate'>
                                {item.name}
                              </div>
                              <div className='text-xs text-gray-600 dark:text-gray-400 mt-1!'>
                                Qty: {item.quantity}
                              </div>
                            </div>
                            <div className='text-right'>
                              <div className='font-bold text-gray-900 dark:text-white text-sm sm:text-base'>
                                ₹{item.price.toFixed(2)}
                              </div>
                              <div className='text-xs text-gray-500 dark:text-gray-400'>
                                ₹{(item.quantity * item.price).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.notes && (
                    <div className='bg-linear-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg sm:rounded-xl p-3! sm:p-4!'>
                      <div className='text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1! sm:mb-2! flex items-center gap-2!'>
                        <svg
                          className='w-3 h-3 sm:w-4 sm:h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                          />
                        </svg>
                        Notes
                      </div>
                      <p className='text-gray-600 dark:text-gray-400 text-xs sm:text-sm line-clamp-3'>
                        {order.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === order.id && (
                  <div className='border-t border-rose-200 dark:border-rose-800 bg-linear-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 px-4! sm:px-6! py-3! sm:py-4! flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3! sm:gap-4!'>
                    <div className='flex items-center gap-3!'>
                      <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center'>
                        <Trash2 className='w-4 h-4 sm:w-5 sm:h-5 text-rose-600 dark:text-rose-400' />
                      </div>
                      <div>
                        <div className='font-semibold text-rose-800 dark:text-rose-300 text-sm sm:text-base'>
                          Delete Order
                        </div>
                        <div className='text-xs sm:text-sm text-rose-600 dark:text-rose-400'>
                          This action cannot be undone.
                        </div>
                      </div>
                    </div>
                    <div className='flex gap-2! sm:gap-3! w-full sm:w-auto'>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className='flex-1 sm:flex-none px-4! py-2! sm:py-2.5! bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors duration-200 text-sm'
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className='flex-1 sm:flex-none px-4! py-2! sm:py-2.5! bg-linear-to-r from-rose-600 to-rose-700 text-white rounded-lg hover:from-rose-700 hover:to-rose-800 font-medium shadow-md transition-all duration-200 text-sm'
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer Summary */}
        {filteredOrders.length > 0 && (
          <div className='mt-6! sm:mt-8! pt-4! sm:pt-6! border-t border-gray-200 dark:border-gray-700'>
            <div className='flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2! xs:gap-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
              <div>
                Showing{' '}
                <span className='font-semibold text-gray-900 dark:text-white'>
                  {filteredOrders.length}
                </span>{' '}
                of{' '}
                <span className='font-semibold text-gray-900 dark:text-white'>
                  {orders.length}
                </span>{' '}
                orders
              </div>
              <div className='text-xs sm:text-sm text-gray-500 dark:text-gray-400'>
                <span className='font-medium text-emerald-700 dark:text-emerald-400'>
                  ✓
                </span>{' '}
                Export ready
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
