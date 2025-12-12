/* eslint-disable @typescript-eslint/no-explicit-any */
// components/OrderForm.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderItem, CreateOrderInput } from '@/types/order';
import {
  X,
  Plus,
  Trash2,
  Package,
  User,
  Truck,
  Check,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderFormProps {
  order?: Order;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OrderForm({
  order,
  onSuccess,
  onCancel,
}: OrderFormProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<CreateOrderInput>({
    customer_name: '',
    phone: '',
    email: '',
    social_media_handle: '',
    address: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    quantity_total: 0,
    courier_service: '',
    courier_receipt: '',
    sent_date: '',
    shipping_charges: 0,
    payment_amount: 0,
    status: 'pending',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form if editing
  useEffect(() => {
    if (order) {
      setFormData({
        customer_name: order.customer_name,
        phone: order.phone,
        email: order.email || '',
        social_media_handle: order.social_media_handle || '',
        address: order.address,
        items: order.items,
        quantity_total: order.quantity_total,
        courier_service: order.courier_service,
        courier_receipt: order.courier_receipt || '',
        sent_date: order.sent_date || '',
        shipping_charges: order.shipping_charges || 0,
        payment_amount: order.payment_amount,
        status: order.status,
        notes: order.notes || '',
      });
    }
  }, [order]);

  // Calculate totals
  useEffect(() => {
    const itemsTotal = formData.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
      0
    );
    const totalQuantity = formData.items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    const totalAmount = itemsTotal + (formData.shipping_charges || 0);

    setFormData((prev) => ({
      ...prev,
      quantity_total: totalQuantity,
      payment_amount: totalAmount,
    }));
  }, [formData.items, formData.shipping_charges]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Only close if clicking on the backdrop (fixed container)
      if (
        modalRef.current &&
        !modalRef.current.contains(target) &&
        target.classList.contains('fixed') && // Click on the backdrop
        target.dataset.modalBackdrop === 'true' // Add data attribute for better identification
      ) {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCancel]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.customer_name.trim()) {
        newErrors.customer_name = 'Customer name is required';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Enter a valid 10-digit phone number';
      }
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Enter a valid email address';
      }
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }
    }

    if (step === 2) {
      formData.items.forEach((item, index) => {
        if (!item.name.trim()) {
          newErrors[`items[${index}].name`] = 'Item name is required';
        }
        if (!item.quantity || item.quantity < 1) {
          newErrors[`items[${index}].quantity`] = 'Quantity must be at least 1';
        }
        // allow zero price if needed but validate non-negative
        if (item.price == null || item.price < 0) {
          newErrors[`items[${index}].price`] = 'Price must be 0 or positive';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const prevStep = () => {
    setActiveStep(Math.max(activeStep - 1, 1));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const updateItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  // Updated handleSubmit: advances steps when activeStep < 3, finalizes only on last step
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If not on last step, validate and advance
    if (activeStep < 3) {
      if (!validateStep(activeStep)) return;
      setActiveStep((s) => Math.min(s + 1, 3));
      setErrors((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { submit, ...rest } = prev;
        return rest;
      });
      return;
    }

    // Final submit flow
    if (!validateStep(activeStep)) return;

    setLoading(true);
    try {
      // Get the access key from sessionStorage
      const accessKey = sessionStorage.getItem('accessKey');

      if (!accessKey) {
        // If no access key, user needs to re-authenticate
        throw new Error('Authentication required. Please login again.');
      }

      const url = order ? `/api/orders/${order.id}` : '/api/orders';
      const method = order ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessKey}`,
        },
        body: JSON.stringify(formData),
      });

      // Handle unauthorized response
      if (response.status === 401) {
        // Clear authentication and reload page to show auth modal
        sessionStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('accessKey');
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to save order');
      }

      onSuccess();
    } catch (err: any) {
      setErrors({ submit: err.message });

      // If it's an auth error, you might want to redirect or show auth modal
      if (
        err.message.includes('Authentication') ||
        err.message.includes('Session expired')
      ) {
        // Wait a moment then reload to show auth modal
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };
  const steps = [
    { number: 1, title: 'Customer Details', icon: User },
    { number: 2, title: 'Order Items', icon: Package },
    { number: 3, title: 'Shipping & Payment', icon: Truck },
  ];

  return (
    <div
      className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6! z-50 overflow-y-auto'
      // Mark backdrop so outside-click handler can detect it
      data-modal-backdrop='true'
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        ref={modalRef}
        className='bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8! overflow-hidden border border-gray-100'
      >
        {/* Header */}
        <div className='sticky top-0 bg-linear-to-r from-gray-50 to-white border-b border-gray-200 px-8! py-6! rounded-t-3xl flex justify-between items-center z-10'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>
              {order ? 'Edit Order' : 'Create New Order'}
            </h2>
            <p className='text-gray-600 text-sm mt-1!'>
              {order
                ? 'Update order details and tracking information'
                : 'Fill in the details below to create a new order'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className='p-2! hover:bg-gray-100 rounded-xl transition-colors duration-200'
            type='button'
            aria-label='Close'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className='px-8! py-6! bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-b border-gray-100'>
          <div className='flex items-center justify-between'>
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.number === activeStep;
              const isCompleted = step.number < activeStep;

              return (
                <React.Fragment key={step.number}>
                  <div className='flex items-center gap-4! px-4!'>
                    <div
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 shadow-sm ${
                        isActive
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : isCompleted
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-gray-200 bg-white text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className='w-6 h-6' />
                      ) : (
                        <Icon className='w-5 h-5' />
                      )}
                      <div className='absolute -bottom-6! left-1/2 transform -translate-x-1/2 whitespace-nowrap'>
                        <span
                          className={`text-xs font-semibold ${
                            isActive
                              ? 'text-blue-600'
                              : isCompleted
                              ? 'text-emerald-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className='flex-1 mx-4!'>
                      <div
                        className={`h-1! rounded-full ${
                          step.number < activeStep
                            ? 'bg-linear-to-r from-emerald-400 to-emerald-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            // Prevent Enter from submitting the form when focus is on inputs (allow Enter in textarea)
            const target = e.target as HTMLElement;
            if (e.key === 'Enter') {
              const tag = target.tagName;
              // allow Enter in textarea and contenteditable elements
              if (
                tag !== 'TEXTAREA' &&
                !(target as HTMLElement).isContentEditable
              ) {
                e.preventDefault();
              }
            }
          }}
          className='p-8!'
        >
          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className='mb-6! p-4! bg-linear-to-r from-rose-50 to-pink-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-3! shadow-sm'
            >
              <div className='w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center shrink-0'>
                <svg
                  className='w-3 h-3 text-rose-600'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <span className='text-sm font-medium'>{errors.submit}</span>
            </motion.div>
          )}

          <AnimatePresence mode='wait'>
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Customer Information */}
              {activeStep === 1 && (
                <div className='space-y-8!'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6!'>
                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900'>
                        Customer Name <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='text'
                        value={formData.customer_name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            customer_name: e.target.value,
                          }))
                        }
                        className={`w-full px-4! py-3! bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-sm transition-all duration-200 ${
                          errors.customer_name
                            ? 'border-rose-500 bg-rose-50/50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder='John Doe'
                      />
                      {errors.customer_name && (
                        <p className='mt-1! text-xs text-rose-600 font-medium'>
                          {errors.customer_name}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900'>
                        Phone Number <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='tel'
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        className={`w-full px-4! py-3! bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-sm transition-all duration-200 ${
                          errors.phone
                            ? 'border-rose-500 bg-rose-50/50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder='9876543210'
                      />
                      {errors.phone && (
                        <p className='mt-1! text-xs text-rose-600 font-medium'>
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900'>
                        Email Address
                      </label>
                      <input
                        type='email'
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className={`w-full px-4! py-3! bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-sm transition-all duration-200 ${
                          errors.email
                            ? 'border-rose-500 bg-rose-50/50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder='john@example.com'
                      />
                      {errors.email && (
                        <p className='mt-1! text-xs text-rose-600 font-medium'>
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900'>
                        Social Media Handle
                      </label>
                      <input
                        type='text'
                        value={formData.social_media_handle}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            social_media_handle: e.target.value,
                          }))
                        }
                        className='w-full px-4! py-3! bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-sm transition-all duration-200'
                        placeholder='@username'
                      />
                    </div>

                    <div className='md:col-span-2 space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900'>
                        Delivery Address <span className='text-red-500'>*</span>
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        rows={3}
                        className={`w-full px-4! py-3! bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-sm transition-all duration-200 resize-none ${
                          errors.address
                            ? 'border-rose-500 bg-rose-50/50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder='Enter complete delivery address with pincode'
                      />
                      {errors.address && (
                        <p className='mt-1! text-xs text-rose-600 font-medium'>
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Order Items */}
              {activeStep === 2 && (
                <div className='space-y-8!'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        Order Items
                      </h3>
                      <p className='text-gray-600 text-sm mt-1!'>
                        Add items, quantities, and prices
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={addItem}
                      className='inline-flex items-center gap-2! px-4! py-2.5! bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200'
                    >
                      <Plus className='w-4 h-4' />
                      Add Item
                    </button>
                  </div>

                  <div className='space-y-4!'>
                    {formData.items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='border border-gray-100 rounded-xl p-4! hover:border-gray-200 transition-all duration-200 bg-white shadow-sm hover:shadow-md'
                      >
                        <div className='grid grid-cols-1 md:grid-cols-12 gap-4! items-end'>
                          <div className='md:col-span-5 space-y-2!'>
                            <label className='block text-xs font-semibold text-gray-700'>
                              Item Name <span className='text-red-500'>*</span>
                            </label>
                            <input
                              type='text'
                              placeholder='e.g., Dairy Cow Isopods (10 count)'
                              value={item.name}
                              onChange={(e) =>
                                updateItem(index, 'name', e.target.value)
                              }
                              className={`w-full px-3! py-2.5! bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                                errors[`items[${index}].name`]
                                  ? 'border-rose-500 bg-rose-50/50'
                                  : 'border-gray-200'
                              }`}
                            />
                            {errors[`items[${index}].name`] && (
                              <p className='mt-1! text-xs text-rose-600 font-medium'>
                                {errors[`items[${index}].name`]}
                              </p>
                            )}
                          </div>

                          <div className='md:col-span-3 space-y-2!'>
                            <label className='block text-xs font-semibold text-gray-700'>
                              Quantity <span className='text-red-500'>*</span>
                            </label>
                            <input
                              type='number'
                              placeholder='1'
                              value={item.quantity === 0 ? '' : item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  'quantity',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              min='1'
                              className={`w-full px-3! py-2.5! bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                                errors[`items[${index}].quantity`]
                                  ? 'border-rose-500 bg-rose-50/50'
                                  : 'border-gray-200'
                              }`}
                            />
                            {errors[`items[${index}].quantity`] && (
                              <p className='mt-1! text-xs text-rose-600 font-medium'>
                                {errors[`items[${index}].quantity`]}
                              </p>
                            )}
                          </div>

                          <div className='md:col-span-3 space-y-2!'>
                            <label className='block text-xs font-semibold text-gray-700'>
                              Price (₹) <span className='text-red-500'>*</span>
                            </label>
                            <input
                              type='number'
                              placeholder='0.00'
                              value={item.price === 0 ? '' : item.price}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  'price',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              min='0'
                              step='0.01'
                              className={`w-full px-3! py-2.5! bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                                errors[`items[${index}].price`]
                                  ? 'border-rose-500 bg-rose-50/50'
                                  : 'border-gray-200'
                              }`}
                            />
                            {errors[`items[${index}].price`] && (
                              <p className='mt-1! text-xs text-rose-600 font-medium'>
                                {errors[`items[${index}].price`]}
                              </p>
                            )}
                          </div>

                          <div className='md:col-span-1'>
                            {formData.items.length > 1 && (
                              <button
                                type='button'
                                onClick={() => removeItem(index)}
                                className='w-full p-2.5! text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200'
                                title='Remove item'
                              >
                                <Trash2 className='w-4 h-4 mx-auto!' />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Summary Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6! shadow-sm'
                  >
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6!'>
                      <div className='text-center'>
                        <div className='text-sm font-medium text-gray-700'>
                          Total Items
                        </div>
                        <div className='text-2xl font-bold text-gray-900 mt-2!'>
                          {formData.quantity_total}
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-sm font-medium text-gray-700'>
                          Items Total
                        </div>
                        <div className='text-2xl font-bold text-gray-900 mt-2!'>
                          ₹
                          {formData.items
                            .reduce(
                              (sum, item) => sum + item.quantity * item.price,
                              0
                            )
                            .toFixed(2)}
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-sm font-medium text-gray-700'>
                          Order Total
                        </div>
                        <div className='text-3xl font-bold text-blue-600 mt-2!'>
                          ₹{formData.payment_amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Step 3: Shipping & Payment */}
              {activeStep === 3 && (
                <div className='space-y-8!'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6!'>
                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900'>
                        Courier Service <span className='text-red-500'>*</span>
                      </label>
                      <select
                        value={formData.courier_service}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            courier_service: e.target.value,
                          }))
                        }
                        className='w-full px-4! py-3! bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-sm transition-all duration-200'
                      >
                        <option value=''>Select courier</option>
                        <option value='Blue Dart'>Blue Dart</option>
                        <option value='Professional Couriers'>
                          Professional Couriers
                        </option>
                        <option value='DTDC'>DTDC</option>
                        <option value='Delhivery'>Delhivery</option>
                        <option value='India Post'>India Post</option>
                        <option value='Other'>Other</option>
                      </select>
                    </div>

                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900'>
                        Tracking Number
                      </label>
                      <input
                        type='text'
                        value={formData.courier_receipt}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            courier_receipt: e.target.value,
                          }))
                        }
                        className='w-full px-4! py-3! bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-sm transition-all duration-200'
                        placeholder='Enter tracking number'
                      />
                    </div>

                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900'>
                        Sent Date
                      </label>
                      <input
                        type='date'
                        value={formData.sent_date}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            sent_date: e.target.value,
                          }))
                        }
                        className='w-full px-4! py-3! bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-sm transition-all duration-200'
                      />
                    </div>

                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900'>
                        Order Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: e.target.value as any,
                          }))
                        }
                        className='w-full px-4! py-3! bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-sm transition-all duration-200'
                      >
                        <option value='pending'>Pending</option>
                        <option value='shipped'>Shipped</option>
                        <option value='delivered'>Delivered</option>
                        <option value='cancelled'>Cancelled</option>
                      </select>
                    </div>

                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900'>
                        Shipping Charges (₹)
                      </label>
                      <input
                        type='number'
                        value={
                          formData.shipping_charges === 0
                            ? ''
                            : formData.shipping_charges
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            shipping_charges: parseFloat(e.target.value) || 0,
                          }))
                        }
                        min='0'
                        step='0.01'
                        placeholder='0.00'
                        className='w-full px-4! py-3! bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-sm transition-all duration-200'
                      />
                    </div>

                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900'>
                        Payment Amount (₹){' '}
                        <span className='text-red-500'>*</span>
                      </label>
                      <input
                        type='number'
                        value={
                          formData.payment_amount === 0
                            ? ''
                            : formData.payment_amount
                        }
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            payment_amount: parseFloat(e.target.value) || 0,
                          }))
                        }
                        min='0'
                        step='0.01'
                        placeholder='0.00'
                        className='w-full px-4! py-3! bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-sm transition-all duration-200'
                      />
                    </div>

                    <div className='md:col-span-2 space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900'>
                        Notes & Instructions
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        rows={3}
                        placeholder='Any additional notes or special instructions for this order...'
                        className='w-full px-4! py-3! bg-white border border-gray-200 hover:border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 text-sm transition-all duration-200 resize-none'
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Action Buttons */}
          <div className='flex justify-between items-center pt-8! mt-8! border-t border-gray-100'>
            <div>
              {activeStep > 1 && (
                <button
                  type='button'
                  onClick={prevStep}
                  disabled={loading}
                  className='px-6! py-3! border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Back
                </button>
              )}
            </div>

            <div className='flex gap-3!'>
              <button
                type='button'
                onClick={onCancel}
                disabled={loading}
                className='px-6! py-3! border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Cancel
              </button>

              {activeStep < 3 ? (
                <button
                  type='submit' // use submit so Enter triggers same flow
                  disabled={loading}
                  className='px-6! py-3! bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2!'
                >
                  Continue
                  <ChevronRight className='w-4 h-4' />
                </button>
              ) : (
                <button
                  type='submit'
                  disabled={loading}
                  className='px-6! py-3! bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2!'
                >
                  {loading ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                      Saving...
                    </>
                  ) : order ? (
                    'Update Order'
                  ) : (
                    'Create Order'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
