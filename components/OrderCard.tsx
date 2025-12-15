import { Order } from '@/types/order';
import { Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import StatusDropdown from './StatusDropDown';

interface OrderCardProps {
  order: Order;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  deleteConfirm: string | null;
  onDeleteCancel: () => void;
  onDeleteConfirm: (id: string) => void;
}

export default function OrderCard({
  order,
  onEdit,
  onDelete,
  onStatusUpdate,
  deleteConfirm,
  onDeleteCancel,
  onDeleteConfirm,
}: OrderCardProps) {
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className='bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md! hover:shadow-lg! transition-all duration-200 overflow-hidden border border-gray-100 dark:border-gray-700 group'>
      <div className='p-4! sm:p-6!'>
        {/* Header */}
        <div className='flex flex-col lg:flex-row lg:items-start justify-between gap-4! sm:gap-6! mb-4! sm:mb-6!'>
          <div className='flex-1!'>
            <div className='flex flex-col xs:flex-row xs:items-center gap-2! xs:gap-4! mb-3!'>
              <h3 className='text-lg! sm:text-xl! font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate'>
                {order.customer_name}
              </h3>
              <StatusDropdown order={order} onStatusUpdate={onStatusUpdate} />
            </div>
            <div className='flex flex-col xs:flex-row xs:items-center gap-2! xs:gap-6! text-xs! sm:text-sm! text-gray-600 dark:text-gray-400'>
              <span className='flex items-center gap-1!'>
                <svg
                  className='w-3! h-3! sm:w-4! sm:h-4!'
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
                {format(new Date(order.created_at), 'MMM dd, yyyy • hh:mm a')}
              </span>
              {order.sent_date && (
                <span className='flex items-center gap-1!'>
                  <svg
                    className='w-3! h-3! sm:w-4! sm:h-4!'
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
                  Sent: {format(new Date(order.sent_date), 'MMM dd, yyyy')}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center gap-2! self-end xs:self-center mt-2! xs:mt-0!'>
            <button
              onClick={() => onEdit(order)}
              className='p-2! text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg! sm:rounded-xl! transition-colors duration-200'
              title='Edit order'
            >
              <Edit className='w-4! h-4! sm:w-5! sm:h-5!' />
            </button>
            <button
              onClick={() => onDelete(order.id)}
              className='p-2! text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg! sm:rounded-xl! transition-colors duration-200'
              title='Delete order'
            >
              <Trash2 className='w-4! h-4! sm:w-5! sm:h-5!' />
            </button>
          </div>
        </div>

        {/* Desktop Details */}
        <div className='hidden lg:grid grid-cols-1 md:grid-cols-3 gap-4! sm:gap-6! mb-4! sm:mb-6!'>
          {/* Contact Information */}
          <div className='space-y-2! sm:space-y-3!'>
            <div className='text-xs! sm:text-sm! font-medium text-gray-700 dark:text-gray-300'>
              Contact Information
            </div>
            <div className='space-y-1! sm:space-y-2!'>
              <div className='flex items-center gap-2! text-xs! sm:text-sm!'>
                <Phone className='w-3! h-3! sm:w-4! sm:h-4! text-gray-500 dark:text-gray-400' />
                <span className='font-medium dark:text-gray-300'>
                  {order.phone}
                </span>
              </div>
              {order.email && (
                <div className='flex items-center gap-2! text-xs! sm:text-sm!'>
                  <Mail className='w-3! h-3! sm:w-4! sm:h-4! text-gray-500 dark:text-gray-400' />
                  <span className='text-gray-900 dark:text-gray-300 truncate'>
                    {order.email}
                  </span>
                </div>
              )}
              {order.social_media_handle && (
                <div className='flex items-center gap-2! text-xs! sm:text-sm!'>
                  <span className='text-gray-500 dark:text-gray-400'>💬</span>
                  <span className='text-gray-900 dark:text-gray-300 truncate'>
                    {order.social_media_handle}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Details */}
          <div className='space-y-2! sm:space-y-3!'>
            <div className='text-xs! sm:text-sm! font-medium text-gray-700 dark:text-gray-300'>
              Shipping Details
            </div>
            <div className='space-y-1! sm:space-y-2!'>
              <div className='text-xs! sm:text-sm!'>
                <span className='text-gray-500 dark:text-gray-400'>
                  Courier:
                </span>
                <span className='font-medium ml-1! sm:ml-2! dark:text-gray-300'>
                  {order.courier_service}
                </span>
              </div>
              {order.courier_receipt && (
                <div className='text-xs! sm:text-sm!'>
                  <span className='text-gray-500 dark:text-gray-400'>
                    Tracking:
                  </span>
                  <span className='font-medium ml-1! sm:ml-2! dark:text-gray-300'>
                    {order.courier_receipt}
                  </span>
                </div>
              )}
              <div className='text-xs! sm:text-sm! text-gray-600 dark:text-gray-400 line-clamp-2'>
                <MapPin className='w-3! h-3! sm:w-4! sm:h-4! inline-block mr-1!' />
                {order.address}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className='space-y-2! sm:space-y-3!'>
            <div className='text-xs! sm:text-sm! font-medium text-gray-700 dark:text-gray-300'>
              Order Summary
            </div>
            <div className='space-y-1! sm:space-y-2!'>
              <div className='flex justify-between text-xs! sm:text-sm!'>
                <span className='text-gray-500 dark:text-gray-400'>Items:</span>
                <span className='font-medium dark:text-gray-300'>
                  ₹{itemsTotal.toFixed(2)}
                </span>
              </div>
              <div className='flex justify-between text-xs! sm:text-sm!'>
                <span className='text-gray-500 dark:text-gray-400'>
                  Shipping:
                </span>
                <span className='font-medium dark:text-gray-300'>
                  {order.shipping_charges
                    ? ` ₹${order.shipping_charges.toFixed(2)}`
                    : ' N/A'}
                </span>
              </div>
              <div className='flex justify-between text-xs! sm:text-sm! pt-2! border-t dark:border-gray-700'>
                <span className='text-gray-700 dark:text-gray-300 font-semibold'>
                  Total:
                </span>
                <span className='text-sm! sm:text-lg! font-bold text-blue-600 dark:text-blue-400'>
                  ₹{order.payment_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className='mb-4! sm:mb-6!'>
          <div className='text-xs! sm:text-sm! font-medium text-gray-700 dark:text-gray-300 mb-2! sm:mb-3!'>
            Order Items ({order.items.length})
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2! sm:gap-3!'>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className='bg-linear-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg! sm:rounded-xl! p-3! sm:p-4! hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200'
              >
                <div className='flex justify-between items-start'>
                  <div className='max-w-[60%]'>
                    <div className='font-medium text-gray-900 dark:text-white text-sm! sm:text-base! truncate'>
                      {item.name}
                    </div>
                    <div className='text-xs! text-gray-600 dark:text-gray-400 mt-1!'>
                      Qty: {item.quantity}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='font-bold text-gray-900 dark:text-white text-sm! sm:text-base!'>
                      ₹{item.price.toFixed(2)}
                    </div>
                    <div className='text-xs! text-gray-500 dark:text-gray-400'>
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className='bg-linear-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg! sm:rounded-xl! p-3! sm:p-4!'>
            <div className='text-xs! sm:text-sm! font-medium text-gray-700 dark:text-gray-300 mb-1! sm:mb-2! flex items-center gap-2!'>
              <svg
                className='w-3! h-3! sm:w-4! sm:h-4!'
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
            <p className='text-gray-600 dark:text-gray-400 text-xs! sm:text-sm! line-clamp-3'>
              {order.notes}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm === order.id && (
        <div className='border-t border-rose-200 dark:border-rose-800 bg-linear-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 px-4! sm:px-6! py-3! sm:py-4! flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3! sm:gap-4!'>
          <div className='flex items-center gap-3!'>
            <div className='w-8! h-8! sm:w-10! sm:h-10! rounded-full! bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center'>
              <Trash2 className='w-4! h-4! sm:w-5! sm:h-5! text-rose-600 dark:text-rose-400' />
            </div>
            <div>
              <div className='font-semibold text-rose-800 dark:text-rose-300 text-sm! sm:text-base!'>
                Delete Order
              </div>
              <div className='text-xs! sm:text-sm! text-rose-600 dark:text-rose-400'>
                This action cannot be undone.
              </div>
            </div>
          </div>
          <div className='flex gap-2! sm:gap-3! w-full! sm:w-auto!'>
            <button
              onClick={onDeleteCancel}
              className='flex-1! sm:flex-none px-4! py-2! sm:py-2.5! bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg! text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors duration-200 text-sm!'
            >
              Cancel
            </button>
            <button
              onClick={() => onDeleteConfirm(order.id)}
              className='flex-1! sm:flex-none px-4! py-2! sm:py-2.5! bg-linear-to-r from-rose-600 to-rose-700 text-white rounded-lg! hover:from-rose-700 hover:to-rose-800 font-medium shadow-md! transition-all duration-200 text-sm!'
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
