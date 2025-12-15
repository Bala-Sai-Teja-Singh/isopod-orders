'use client';

import { useState, useEffect } from 'react';
import { Order } from '@/types/order';
import OrderForm from '@/components/OrderForm';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import StatsCards from '@/components/StatsCards';
import DashboardControls from '@/components/DashboardControls';
import OrderCard from '@/components/OrderCard';
import { Plus, Package, LogOut, Menu, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import KeyAuthModal from '@/components/KeyAuthModal';
import { format } from 'date-fns';

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = checking auth
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true); // true = fetching data
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [exporting, setExporting] = useState(false);
  const [exportAll, setExportAll] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication - Initialize on first render
  useEffect(() => {
    // Check authentication synchronously
    const authStatus = sessionStorage.getItem('isAuthenticated');
    const accessKey = sessionStorage.getItem('accessKey');

    // If both auth status and access key exist, set authenticated
    if (authStatus === 'true' && accessKey) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      // Clear any invalid session data
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('accessKey');
      setLoading(false); // No need to load data if not authenticated
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    // When auth succeeds, we should start loading data
    setLoading(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('accessKey');
    setIsAuthenticated(false);
    setMobileMenuOpen(false);
    setOrders([]);
    setFilteredOrders([]);
  };

  // Data fetching
  const fetchOrders = async () => {
    try {
      const accessKey = sessionStorage.getItem('accessKey');

      if (!accessKey) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${accessKey}`,
        },
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setFilteredOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated === true) {
      // Only fetch orders if authenticated
      fetchOrders();
    }
  }, [isAuthenticated]);

  // Filtering
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

  // Actions
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
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

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

  // Statistics
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

  // Show loading state while checking authentication OR loading data
  if (isAuthenticated === null || (isAuthenticated === true && loading)) {
    return <DashboardSkeleton />;
  }

  // Show auth modal if not authenticated
  if (!isAuthenticated) {
    return <KeyAuthModal onAuthSuccess={handleAuthSuccess} />;
  }

  // At this point: isAuthenticated === true AND loading === false

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800/30'>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm! z-50! lg:hidden'
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className='fixed top-0! right-0! bottom-0! w-64! bg-white dark:bg-gray-800 shadow-xl! p-6!'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex justify-between items-center mb-8!'>
              <h2 className='text-xl! font-bold text-gray-900 dark:text-white'>
                Menu
              </h2>
              <button onClick={() => setMobileMenuOpen(false)} className='p-2!'>
                <X className='w-5! h-5! text-gray-500 dark:text-gray-400' />
              </button>
            </div>
            <div className='space-y-4!'>
              <button
                onClick={() => {
                  setSelectedOrder(undefined);
                  setShowForm(true);
                  setMobileMenuOpen(false);
                }}
                className='w-full! flex items-center justify-center gap-2! px-5! py-3! bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl! hover:from-blue-700 hover:to-indigo-700 shadow-lg! font-semibold transition-all duration-200'
              >
                <Plus className='w-5! h-5!' />
                New Order
              </button>
              <button
                onClick={handleLogout}
                className='w-full! flex items-center justify-center gap-2! px-5! py-3! bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl! hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-all duration-200'
              >
                <LogOut className='w-4! h-4!' />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className='fixed w-full! top-0! z-40! bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg! border-b border-gray-200 dark:border-gray-800 shadow-sm!'>
        <div className='max-w-7xl mx-auto! px-4! sm:px-6! py-3! sm:py-4!'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-3! sm:gap-4!'>
              <div className='p-2! sm:p-3! bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl! sm:rounded-2xl! shadow-lg!'>
                <Package className='w-5! h-5! sm:w-7! sm:h-7! text-white' />
              </div>
              <div>
                <h1 className='text-lg! sm:text-xl! md:text-2xl! font-bold text-gray-900 dark:text-white'>
                  Isopod Orders
                </h1>
                <p className='text-gray-600 dark:text-gray-400 text-xs! sm:text-sm! mt-0.5! hidden sm:block!'>
                  Manage your isopod, springtails & snails orders
                </p>
              </div>
            </div>

            <div className='flex items-center gap-2! sm:gap-4!'>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className='lg:hidden p-2! text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg!'
              >
                <Menu className='w-5! h-5!' />
              </button>

              <div className='hidden lg:flex items-center gap-4!'>
                <button
                  onClick={() => {
                    setSelectedOrder(undefined);
                    setShowForm(true);
                  }}
                  className='flex items-center gap-2! px-5! py-3! bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl! hover:from-blue-700 hover:to-indigo-700 shadow-lg! hover:shadow-xl! transition-all duration-200 font-semibold group'
                >
                  <Plus className='w-5! h-5! group-hover:rotate-90 transition-transform duration-200' />
                  <span>New Order</span>
                </button>
                <button
                  onClick={handleLogout}
                  className='flex items-center gap-2! px-4! py-3! bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl! hover:bg-gray-200 dark:hover:bg-gray-700 shadow-sm! hover:shadow! transition-all duration-200 font-medium group'
                  title='Logout'
                >
                  <LogOut className='w-4! h-4! group-hover:-translate-x-0.5 transition-transform duration-200' />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto! mt-16! sm:mt-20! px-3! sm:px-4! md:px-6! py-4! sm:py-6! md:py-8!'>
        {/* Statistics */}
        <StatsCards stats={stats} />

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

        {/* Controls */}
        <DashboardControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          exportAll={exportAll}
          onExportAllChange={setExportAll}
          onExport={handleExport}
          exporting={exporting}
          ordersCount={orders.length}
          filteredOrdersCount={filteredOrders.length}
        />

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className='text-center py-12! sm:py-16! bg-white dark:bg-gray-800 rounded-xl! sm:rounded-2xl! shadow-md! border border-gray-100 dark:border-gray-700'>
            <div className='inline-flex items-center justify-center w-16! h-16! sm:w-20! sm:h-20! bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl! sm:rounded-2xl! mb-4! sm:mb-6!'>
              <Package className='w-8! h-8! sm:w-10! sm:h-10! text-gray-400 dark:text-gray-500' />
            </div>
            <h3 className='text-lg! sm:text-xl! font-semibold text-gray-900 dark:text-white mb-2!'>
              {searchQuery || statusFilter !== 'all'
                ? 'No orders found'
                : 'No orders yet'}
            </h3>
            <p className='text-gray-600 dark:text-gray-400 max-w-md! mx-auto! mb-6! text-sm! sm:text-base! px-4!'>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter to find what you are looking for.'
                : 'Get started by creating your first order!'}
            </p>
            <button
              onClick={() => {
                setSelectedOrder(undefined);
                setShowForm(true);
              }}
              className='inline-flex items-center gap-2! px-5! sm:px-6! py-2.5! sm:py-3! bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl! hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-md! hover:shadow-lg! transition-all duration-200 text-sm! sm:text-base!'
            >
              <Plus className='w-4! h-4! sm:w-5! sm:h-5!' />
              Create First Order
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4! sm:gap-6!'>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onEdit={setSelectedOrder}
                onDelete={setDeleteConfirm}
                onStatusUpdate={handleQuickStatusUpdate}
                deleteConfirm={deleteConfirm}
                onDeleteCancel={() => setDeleteConfirm(null)}
                onDeleteConfirm={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Footer Summary */}
        {filteredOrders.length > 0 && (
          <div className='mt-6! sm:mt-8! pt-4! sm:pt-6! border-t border-gray-200 dark:border-gray-700'>
            <div className='flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2! xs:gap-0! text-xs! sm:text-sm! text-gray-600 dark:text-gray-400'>
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
              <div className='text-xs! sm:text-sm! text-gray-500 dark:text-gray-400'>
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

