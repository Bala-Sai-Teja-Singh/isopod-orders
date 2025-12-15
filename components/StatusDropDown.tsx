import { useState, useEffect, useRef } from 'react';
import { Order } from '@/types/order';

interface StatusDropdownProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
}

export default function StatusDropdown({
  order,
  onStatusUpdate,
}: StatusDropdownProps) {
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

  const currentStatus = statusOptions.find((opt) => opt.value === order.status);

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsDropdownOpen(!isDropdownOpen);
        }}
        className={`inline-flex items-center gap-2! px-3! py-1! rounded-full text-xs font-semibold transition-all duration-200 hover:shadow-md! border ${currentStatus?.light} ${currentStatus?.dark}`}
      >
        <span>{currentStatus?.label}</span>
        <svg
          className={`w-3! h-3! transition-transform duration-200 ${
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
        <div className='absolute z-50 mt-2! w-40! bg-white dark:bg-gray-800 rounded-xl shadow-lg! border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-1'>
          <div className='p-1!'>
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusUpdate(order.id, option.value);
                  setIsDropdownOpen(false);
                }}
                className={`w-full! flex items-center gap-2! px-3! py-2.5! text-sm! rounded-lg! transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  order.status === option.value
                    ? 'font-semibold'
                    : 'font-normal'
                }`}
              >
                <div
                  className={`w-2! h-2! rounded-full! ${option.dot} dark:${option.dot}`}
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
