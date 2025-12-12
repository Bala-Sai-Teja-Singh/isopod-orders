/* eslint-disable @typescript-eslint/no-unused-vars */
// app/page.tsx
// Main dashboard - shows all orders and allows you to manage them
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
  function StatusDropdown({ order }: { order: Order }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
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
        color: 'text-yellow-800 bg-yellow-100',
      },
      {
        value: 'shipped',
        label: 'Shipped',
        color: 'text-blue-800 bg-blue-100',
      },
      {
        value: 'delivered',
        label: 'Delivered',
        color: 'text-emerald-800 bg-emerald-100',
      },
      {
        value: 'cancelled',
        label: 'Cancelled',
        color: 'text-rose-800 bg-rose-100',
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
          className={`inline-flex items-center gap-2! px-3! py-1! rounded-full text-xs font-semibold transition-all duration-200 hover:shadow-md border ${currentStatus?.color}`}
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
          <div className='absolute z-50 mt-2! w-40 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-1'>
            <div className='p-1!'>
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickStatusUpdate(order.id, option.value);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2! px-3! py-2.5! text-sm rounded-lg transition-colors duration-200 hover:bg-gray-50 ${
                    order.status === option.value
                      ? 'font-semibold'
                      : 'font-normal'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      option.color.split(' ')[0]
                    }`}
                  />
                  <span className={option.color.split(' ')[0]}>
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

  // Handle successful authentication
  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    setShowAuthModal(true);
  };
  // Fetch orders from API
  // In your page.tsx, update these functions:

  // Fetch orders function
  const fetchOrders = async () => {
    try {
      // Get the access key from sessionStorage
      const accessKey = sessionStorage.getItem('accessKey');

      if (!accessKey) {
        // If no access key, show auth modal
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
        // Unauthorized - clear storage and show auth modal
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

  // Delete order function
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
        // Handle unauthorized
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
  // Quick update status function
  // Quick update status function
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
        // Handle unauthorized
        handleLogout();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to update status'}`);
        return;
      }

      // Update local state immediately for better UX
      const updatedOrder = await response.json();
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, ...updatedOrder.order } : order
        )
      );

      // Show success message
      const statusLabels: Record<string, string> = {
        pending: 'Pending',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
      };

      // Optional: Show a subtle notification
      console.log(`Status updated to ${statusLabels[newStatus]}`);
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
  // Load orders when component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search and status
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

  // Export orders to Excel
  const handleExport = async () => {
    const ordersToExport = exportAll ? orders : filteredOrders;

    if (ordersToExport.length === 0) {
      alert(`No orders to export${exportAll ? '' : ' with current filters'}`);
      return;
    }

    setExporting(true);

    try {
      // Add a small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Prepare data for Excel
      const excelData = ordersToExport.map((order) => {
        // Calculate total items amount
        const itemsTotal = order.items.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        );

        // Combine all items into a string
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

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Auto-size columns
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

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

      // Generate file name with current date
      const fileName = `isopod_orders_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

      // Export to Excel
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error exporting orders:', error);
      alert('Failed to export orders. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200';
      case 'shipped':
        return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200';
      case 'delivered':
        return 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border border-emerald-200';
      case 'cancelled':
        return 'bg-gradient-to-r from-rose-100 to-rose-50 text-rose-800 border border-rose-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200';
    }
  };

  // Calculate order statistics
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

  // Format currency
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
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30'>
      {/* Header */}
      <div className='fixed w-full top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm'>
        <div className='flex justify-between max-w-7xl mx-auto! px-6! py-4!'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='p-3! bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg'>
                <Package className='w-7 h-7 text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  Isopod Orders Manager
                </h1>
                <p className='text-gray-600 text-sm mt-0.5'>
                  Manage your isopod, springtails & snails orders
                </p>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => {
                setSelectedOrder(undefined);
                setShowForm(true);
              }}
              className='flex items-center gap-2 px-5! py-3! bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold group'
            >
              <Plus className='w-5 h-5 group-hover:rotate-90 transition-transform duration-200' />
              New Order
            </button>

            <button
              onClick={handleLogout}
              className='flex items-center gap-2 px-4! py-3! bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 shadow-sm hover:shadow transition-all duration-200 font-medium group'
              title='Logout'
            >
              <LogOut className='w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200' />
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className='max-w-7xl mx-auto! mt-20! px-6! py-8!'>
        {/* Statistics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6! mb-8!'>
          <div className='bg-white rounded-2xl shadow-md p-6! border border-gray-100 hover:shadow-lg transition-shadow duration-200'>
            <div className='text-sm font-medium text-gray-600'>
              Total Orders
            </div>
            <div className='text-3xl font-bold text-gray-900 mt-2!'>
              {stats.total}
            </div>
            <div className='text-xs text-gray-500 mt-1!'>All time</div>
          </div>

          <div className='bg-linear-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-md p-6! border border-yellow-100 hover:shadow-lg transition-shadow duration-200'>
            <div className='text-sm font-medium text-yellow-700'>Pending</div>
            <div className='text-3xl font-bold text-yellow-800 mt-2!'>
              {stats.pending}
            </div>
            <div className='text-xs text-yellow-600 mt-1!'>
              Awaiting shipment
            </div>
          </div>

          <div className='bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md p-6! border border-blue-100 hover:shadow-lg transition-shadow duration-200'>
            <div className='text-sm font-medium text-blue-700'>Shipped</div>
            <div className='text-3xl font-bold text-blue-800 mt-2!'>
              {stats.shipped}
            </div>
            <div className='text-xs text-blue-600 mt-1!'>In transit</div>
          </div>

          <div className='bg-linear-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-md p-6! border border-emerald-100 hover:shadow-lg transition-shadow duration-200'>
            <div className='text-sm font-medium text-emerald-700'>
              Delivered
            </div>
            <div className='text-3xl font-bold text-emerald-800 mt-2!'>
              {stats.delivered}
            </div>
            <div className='text-xs text-emerald-600 mt-1!'>
              Successfully delivered
            </div>
          </div>

          <div className='bg-linear-to-br from-purple-50 to-purple-100 rounded-2xl shadow-md p-6! border border-purple-100 hover:shadow-lg transition-shadow duration-200'>
            <div className='text-sm font-medium text-purple-700'>Revenue</div>
            <div className='text-3xl font-bold text-purple-800 mt-2!'>
              {formatCurrency(stats.revenue)}
            </div>
            <div className='text-xs text-purple-600 mt-1!'>Total earnings</div>
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
        <div className='bg-white rounded-2xl shadow-md p-6! mb-6! border border-gray-100'>
          <div className='flex flex-col md:flex-row gap-4! justify-between items-start md:items-center'>
            <div className='flex-1 w-full'>
              <div className='relative'>
                <Search className='absolute left-4! top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                <input
                  type='text'
                  placeholder='Search by customer name, phone, email, tracking number, or item...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-12! pr-4! py-3! bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200'
                />
              </div>
            </div>

            <div className='flex items-center gap-3! w-full md:w-auto'>
              <div className='relative'>
                <Filter className='absolute left-3! top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className='pl-10! pr-4! py-3! bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm font-medium transition-all duration-200'
                >
                  <option value='all'>All Status</option>
                  <option value='pending'>Pending</option>
                  <option value='shipped'>Shipped</option>
                  <option value='delivered'>Delivered</option>
                  <option value='cancelled'>Cancelled</option>
                </select>
              </div>

              <div className='flex items-center gap-2!'>
                <label className='flex items-center gap-2! text-sm text-gray-700 whitespace-nowrap'>
                  <input
                    type='checkbox'
                    checked={exportAll}
                    onChange={(e) => setExportAll(e.target.checked)}
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
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
                  className={`px-4! py-3! rounded-xl transition-all duration-200 font-medium flex items-center gap-2! shadow-md hover:shadow-lg ${
                    exporting ||
                    (exportAll
                      ? orders.length === 0
                      : filteredOrders.length === 0)
                      ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      : 'bg-linear-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800'
                  }`}
                >
                  {exporting ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className='w-4 h-4' />
                      Export {exportAll ? 'All' : 'Filtered'} Orders
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className='text-center py-16!'>
            <div className='inline-block animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600'></div>
            <p className='mt-4! text-gray-600 font-medium'>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className='text-center py-16! bg-white rounded-2xl shadow-md border border-gray-100'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl mb-6!'>
              <Package className='w-10 h-10 text-gray-400' />
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2!'>
              {searchQuery || statusFilter !== 'all'
                ? 'No orders found'
                : 'No orders yet'}
            </h3>
            <p className='text-gray-600 max-w-md mx-auto! mb-6!'>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter to find what you are looking for.'
                : 'Get started by creating your first order!'}
            </p>
            <button
              onClick={() => {
                setSelectedOrder(undefined);
                setShowForm(true);
              }}
              className='inline-flex items-center gap-2! px-6! py-3! bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200'
            >
              <Plus className='w-5 h-5' />
              Create First Order
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6!'>
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className='bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 group'
              >
                <div className='p-6!'>
                  <div className='flex flex-col lg:flex-row lg:items-start justify-between gap-6! mb-6!'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-4! mb-3!'>
                        <h3 className='text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200'>
                          {order.customer_name}
                        </h3>
                        <StatusDropdown order={order} />
                      </div>
                      <div className='flex items-center gap-6! text-sm text-gray-600'>
                        <span className='flex items-center gap-1!'>
                          <svg
                            className='w-4 h-4'
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
                              className='w-4 h-4'
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

                    <div className='flex items-center gap-2!'>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowForm(true);
                        }}
                        className='p-2.5! text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200'
                        title='Edit order'
                      >
                        <Edit className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(order.id)}
                        className='p-2.5! text-rose-600 hover:bg-rose-50 rounded-xl transition-colors duration-200'
                        title='Delete order'
                      >
                        <Trash2 className='w-5 h-5' />
                      </button>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6! mb-6!'>
                    <div className='space-y-3!'>
                      <div className='text-sm font-medium text-gray-700'>
                        Contact Information
                      </div>
                      <div className='space-y-2!'>
                        <div className='flex items-center gap-2! text-sm'>
                          <Phone className='w-4 h-4 text-gray-500' />
                          <span className='font-medium'>{order.phone}</span>
                        </div>
                        {order.email && (
                          <div className='flex items-center gap-2! text-sm'>
                            <Mail className='w-4 h-4 text-gray-500' />
                            <span className='text-gray-900'>{order.email}</span>
                          </div>
                        )}
                        {order.social_media_handle && (
                          <div className='flex items-center gap-2! text-sm'>
                            <span className='text-gray-500'>💬</span>
                            <span className='text-gray-900'>
                              {order.social_media_handle}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='space-y-3!'>
                      <div className='text-sm font-medium text-gray-700'>
                        Shipping Details
                      </div>
                      <div className='space-y-2!'>
                        <div className='text-sm'>
                          <span className='text-gray-500'>Courier:</span>
                          <span className='font-medium ml-2!'>
                            {order.courier_service}
                          </span>
                        </div>
                        {order.courier_receipt && (
                          <div className='text-sm'>
                            <span className='text-gray-500'>Tracking:</span>
                            <span className='font-medium ml-2!'>
                              {order.courier_receipt}
                            </span>
                          </div>
                        )}

                        <div className='text-sm text-gray-600 line-clamp-2'>
                          <MapPin className='w-4 h-4 inline-block mr-1!' />
                          {order.address}
                        </div>
                      </div>
                    </div>

                    <div className='space-y-3!'>
                      <div className='text-sm font-medium text-gray-700'>
                        Order Summary
                      </div>
                      <div className='space-y-2!'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-500'>Items Charge:</span>
                          <span className='font-medium'>
                            ₹
                            {order.items
                              .reduce(
                                (sum, item) => sum + item.price * item.quantity,
                                0
                              )
                              .toFixed(2)}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-gray-500'>
                            Shipping Charge:
                          </span>
                          <span className='font-medium'>
                            {order.shipping_charges
                              ? ` ₹${order.shipping_charges.toFixed(2)}`
                              : ' N/A'}
                          </span>
                        </div>

                        <div className='flex justify-between text-sm pt-2! border-t'>
                          <span className='text-gray-700 font-semibold'>
                            Total:
                          </span>
                          <span className='text-lg font-bold text-blue-600'>
                            ₹{order.payment_amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Section */}
                  <div className='mb-6!'>
                    <div className='text-sm font-medium text-gray-700 mb-3!'>
                      Order Items
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3!'>
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className='bg-linear-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-xl p-4! hover:border-gray-300 transition-colors duration-200'
                        >
                          <div className='flex justify-between items-start'>
                            <div>
                              <div className='font-medium text-gray-900'>
                                {item.name}
                              </div>
                              <div className='text-sm text-gray-600 mt-1!'>
                                Qty: {item.quantity}
                              </div>
                            </div>
                            <div className='text-right'>
                              <div className='font-bold text-gray-900'>
                                ₹{item.price.toFixed(2)}
                              </div>
                              <div className='text-sm text-gray-500'>
                                ₹{(item.quantity * item.price).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.notes && (
                    <div className='bg-linear-to-br from-blue-50/50 to-indigo-50/50 border border-blue-100 rounded-xl p-4!'>
                      <div className='text-sm font-medium text-gray-700 mb-2! flex items-center gap-2!'>
                        <svg
                          className='w-4 h-4'
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
                      <p className='text-gray-600 text-sm'>{order.notes}</p>
                    </div>
                  )}
                </div>

                {/* Delete Confirmation */}
                {deleteConfirm === order.id && (
                  <div className='border-t border-rose-200 bg-linear-to-r from-rose-50 to-pink-50 px-6! py-4! flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4!'>
                    <div className='flex items-center gap-3!'>
                      <div className='w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center'>
                        <Trash2 className='w-5 h-5 text-rose-600' />
                      </div>
                      <div>
                        <div className='font-semibold text-rose-800'>
                          Delete Order
                        </div>
                        <div className='text-sm text-rose-600'>
                          This action cannot be undone.
                        </div>
                      </div>
                    </div>
                    <div className='flex gap-3!'>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className='px-5! py-2.5! bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200'
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className='px-5! py-2.5! bg-linear-to-r from-rose-600 to-rose-700 text-white rounded-lg hover:from-rose-700 hover:to-rose-800 font-medium shadow-md transition-all duration-200'
                      >
                        Delete Order
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
          <div className='mt-8! pt-6! border-t border-gray-200'>
            <div className='flex justify-between items-center text-sm text-gray-600'>
              <div>
                Showing{' '}
                <span className='font-semibold text-gray-900'>
                  {filteredOrders.length}
                </span>{' '}
                of{' '}
                <span className='font-semibold text-gray-900'>
                  {orders.length}
                </span>{' '}
                orders
              </div>
              <div className='text-sm text-gray-500'>
                <span className='font-medium text-emerald-700'>✓</span> Export
                ready
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
