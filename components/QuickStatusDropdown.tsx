'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface QuickStatusDropdownProps {
  currentStatus: string;
  orderId: string;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'shipped', label: 'Shipped', color: 'text-blue-600 bg-blue-50' },
  {
    value: 'delivered',
    label: 'Delivered',
    color: 'text-emerald-600 bg-emerald-50',
  },
  { value: 'cancelled', label: 'Cancelled', color: 'text-rose-600 bg-rose-50' },
];

export default function QuickStatusDropdown({
  currentStatus,
  orderId,
  onStatusUpdate,
}: QuickStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentStatusOption = statusOptions.find(
    (opt) => opt.value === currentStatus
  );

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md ${currentStatusOption?.color} border border-transparent hover:border-current/20`}
      >
        <span>{currentStatusOption?.label}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className='absolute z-50 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1'>
          <div className='p-2'>
            <div className='px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
              Update Status
            </div>
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onStatusUpdate(orderId, option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors duration-200 hover:bg-gray-50 ${
                  currentStatus === option.value
                    ? 'font-semibold'
                    : 'font-normal'
                }`}
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      option.color.split(' ')[0]
                    }`}
                  />
                  <span className={option.color.split(' ')[0]}>
                    {option.label}
                  </span>
                </div>
                {currentStatus === option.value && (
                  <Check className='w-4 h-4 text-current' />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
