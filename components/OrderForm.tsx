
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
  ChevronLeft,
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        modalRef.current &&
        !modalRef.current.contains(target) &&
        target.classList.contains('fixed') &&
        target.dataset.modalBackdrop === 'true'
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

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep((s) => Math.min(s + 1, 3));
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeStep < 3) {
      nextStep();
      return;
    }

    if (!validateStep(activeStep)) return;

    setLoading(true);
    try {
      const accessKey = sessionStorage.getItem('accessKey');

      if (!accessKey) {
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

      if (response.status === 401) {
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

      if (
        err.message.includes('Authentication') ||
        err.message.includes('Session expired')
      ) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Customer', icon: User },
    { number: 2, title: 'Items', icon: Package },
    { number: 3, title: 'Shipping', icon: Truck },
  ];

  return (
    <div
      className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2! sm:p-4! md:p-6! z-50 overflow-y-auto'
      data-modal-backdrop='true'
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        ref={modalRef}
        className='bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl max-w-full w-full md:max-w-4xl h-[90vh] sm:h-auto my-4! overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col'
      >
        {/* Header */}
        <div className='sticky top-0 bg-linear-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-800 px-4! sm:px-6! md:px-8! py-4! sm:py-5! md:py-6! rounded-t-xl sm:rounded-t-2xl md:rounded-t-3xl flex justify-between items-center z-10 shrink-0'>
          <div className='min-w-0'>
            <h2 className='text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate'>
              {order ? 'Edit Order' : 'Create New Order'}
            </h2>
            <p className='text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-0.5! truncate'>
              {order
                ? 'Update order details and tracking information'
                : 'Fill in the details below to create a new order'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className='p-2! hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg sm:rounded-xl transition-colors duration-200 shrink-0'
            type='button'
            aria-label='Close'
          >
            <X className='w-5 h-5 text-gray-500 dark:text-gray-400' />
          </button>
        </div>

        {/* Mobile Step Navigation */}
        <div className='lg:hidden px-4! sm:px-6! py-3! border-b border-gray-100 dark:border-gray-800 flex items-center justify-between'>
          <button
            onClick={prevStep}
            disabled={activeStep === 1}
            className={`flex items-center gap-2! px-3! py-2! rounded-lg transition-all duration-200 ${
              activeStep === 1
                ? 'opacity-50 cursor-not-allowed text-gray-400'
                : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
          >
            <ChevronLeft className='w-4 h-4' />
            <span className='text-sm font-medium'>Back</span>
          </button>

          <div className='flex items-center gap-2!'>
            {steps.map((step) => (
              <div
                key={step.number}
                className={`w-2 h-2 rounded-full ${
                  step.number === activeStep
                    ? 'bg-blue-600 dark:bg-blue-400'
                    : step.number < activeStep
                    ? 'bg-emerald-600 dark:bg-emerald-400'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={activeStep < 3 ? nextStep : handleSubmit}
            disabled={loading}
            className='flex items-center gap-2! px-3! py-2! text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200'
          >
            <span>
              {activeStep < 3 ? 'Next' : loading ? 'Saving...' : 'Save'}
            </span>
            {activeStep < 3 && <ChevronRight className='w-4 h-4' />}
          </button>
        </div>

        {/* Steps Indicator - Desktop */}
        <div className='hidden lg:block px-6! md:px-8! py-4! md:py-6! bg-linear-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-100 dark:border-gray-800'>
          <div className='flex items-center justify-between'>
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.number === activeStep;
              const isCompleted = step.number < activeStep;

              return (
                <React.Fragment key={step.number}>
                  <div className='flex items-center gap-3! md:gap-4! px-3! md:px-4!'>
                    <div
                      className={`relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border-2 shadow-sm ${
                        isActive
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : isCompleted
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className='w-5 h-5 md:w-6 md:h-6' />
                      ) : (
                        <Icon className='w-4 h-4 md:w-5 md:h-5' />
                      )}
                      <div className='absolute -bottom-6! left-1/2 transform -translate-x-1/2 whitespace-nowrap'>
                        <span
                          className={`text-xs font-semibold ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-400'
                              : isCompleted
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className='flex-1 mx-2! md:mx-4!'>
                      <div
                        className={`h-1! rounded-full ${
                          step.number < activeStep
                            ? 'bg-linear-to-r from-emerald-400 to-emerald-500'
                            : 'bg-gray-200 dark:bg-gray-700'
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
            const target = e.target as HTMLElement;
            if (e.key === 'Enter') {
              const tag = target.tagName;
              if (
                tag !== 'TEXTAREA' &&
                !(target as HTMLElement).isContentEditable
              ) {
                e.preventDefault();
              }
            }
          }}
          className='p-4! sm:p-6! md:p-8! overflow-y-auto flex-1'
        >
          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className='mb-4! sm:mb-6! p-3! sm:p-4! bg-linear-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg sm:rounded-xl flex items-start gap-3! shadow-sm'
            >
              <div className='w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0 mt-0.5!'>
                <svg
                  className='w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-600 dark:text-rose-400'
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
              <span className='text-sm font-medium flex-1'>
                {errors.submit}
              </span>
            </motion.div>
          )}

          <AnimatePresence mode='wait'>
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className='h-full'
            >
              {/* Step 1: Customer Information */}
              {activeStep === 1 && (
                <div className='space-y-4! sm:space-y-6! md:space-y-8!'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4! sm:gap-6!'>
                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900 dark:text-white'>
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
                        className={`w-full px-3! sm:px-4! py-2.5! sm:py-3! bg-white dark:bg-gray-800 border rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 text-sm transition-all duration-200 ${
                          errors.customer_name
                            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        placeholder='John Doe'
                      />
                      {errors.customer_name && (
                        <p className='mt-1! text-xs text-rose-600 dark:text-rose-400 font-medium'>
                          {errors.customer_name}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900 dark:text-white'>
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
                        className={`w-full px-3! sm:px-4! py-2.5! sm:py-3! bg-white dark:bg-gray-800 border rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 text-sm transition-all duration-200 ${
                          errors.phone
                            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        placeholder='9876543210'
                      />
                      {errors.phone && (
                        <p className='mt-1! text-xs text-rose-600 dark:text-rose-400 font-medium'>
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900 dark:text-white'>
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
                        className={`w-full px-3! sm:px-4! py-2.5! sm:py-3! bg-white dark:bg-gray-800 border rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 text-sm transition-all duration-200 ${
                          errors.email
                            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        placeholder='john@example.com'
                      />
                      {errors.email && (
                        <p className='mt-1! text-xs text-rose-600 dark:text-rose-400 font-medium'>
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900 dark:text-white'>
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
                        className='w-full px-3! sm:px-4! py-2.5! sm:py-3! bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 text-sm transition-all duration-200'
                        placeholder='@username'
                      />
                    </div>

                    <div className='sm:col-span-2 space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900 dark:text-white'>
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
                        className={`w-full px-3! sm:px-4! py-2.5! sm:py-3! bg-white dark:bg-gray-800 border rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 text-sm transition-all duration-200 resize-none ${
                          errors.address
                            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        placeholder='Enter complete delivery address with pincode'
                      />
                      {errors.address && (
                        <p className='mt-1! text-xs text-rose-600 dark:text-rose-400 font-medium'>
                          {errors.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Order Items */}
              {activeStep === 2 && (
                <div className='space-y-4! sm:space-y-6! md:space-y-8!'>
                  <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3! sm:gap-0'>
                    <div>
                      <h3 className='text-base sm:text-lg font-semibold text-gray-900 dark:text-white'>
                        Order Items
                      </h3>
                      <p className='text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-0.5!'>
                        Add items, quantities, and prices
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={addItem}
                      className='inline-flex items-center justify-center gap-2! px-3! sm:px-4! py-2! sm:py-2.5! bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto'
                    >
                      <Plus className='w-3 h-3 sm:w-4 sm:h-4' />
                      Add Item
                    </button>
                  </div>

                  <div className='space-y-3! sm:space-y-4!'>
                    {formData.items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='border border-gray-100 dark:border-gray-800 rounded-lg sm:rounded-xl p-3! sm:p-4! hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md'
                      >
                        <div className='grid grid-cols-1 xs:grid-cols-12 gap-3! sm:gap-4! items-end'>
                          <div className='xs:col-span-5 space-y-2!'>
                            <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300'>
                              Item Name <span className='text-red-500'>*</span>
                            </label>
                            <input
                              type='text'
                              placeholder='e.g., Dairy Cow Isopods (10 count)'
                              value={item.name}
                              onChange={(e) =>
                                updateItem(index, 'name', e.target.value)
                              }
                              className={`w-full px-2.5! sm:px-3! py-2! sm:py-2.5! bg-white dark:bg-gray-800 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                                errors[`items[${index}].name`]
                                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/20'
                                  : 'border-gray-200 dark:border-gray-700'
                              }`}
                            />
                            {errors[`items[${index}].name`] && (
                              <p className='mt-1! text-xs text-rose-600 dark:text-rose-400 font-medium'>
                                {errors[`items[${index}].name`]}
                              </p>
                            )}
                          </div>

                          <div className='xs:col-span-3 space-y-2!'>
                            <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300'>
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
                              className={`w-full px-2.5! sm:px-3! py-2! sm:py-2.5! bg-white dark:bg-gray-800 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                                errors[`items[${index}].quantity`]
                                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/20'
                                  : 'border-gray-200 dark:border-gray-700'
                              }`}
                            />
                            {errors[`items[${index}].quantity`] && (
                              <p className='mt-1! text-xs text-rose-600 dark:text-rose-400 font-medium'>
                                {errors[`items[${index}].quantity`]}
                              </p>
                            )}
                          </div>

                          <div className='xs:col-span-3 space-y-2!'>
                            <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300'>
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
                              className={`w-full px-2.5! sm:px-3! py-2! sm:py-2.5! bg-white dark:bg-gray-800 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all ${
                                errors[`items[${index}].price`]
                                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/20'
                                  : 'border-gray-200 dark:border-gray-700'
                              }`}
                            />
                            {errors[`items[${index}].price`] && (
                              <p className='mt-1! text-xs text-rose-600 dark:text-rose-400 font-medium'>
                                {errors[`items[${index}].price`]}
                              </p>
                            )}
                          </div>

                          <div className='xs:col-span-1'>
                            {formData.items.length > 1 && (
                              <button
                                type='button'
                                onClick={() => removeItem(index)}
                                className='w-full p-2! text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors duration-200 flex items-center justify-center'
                                title='Remove item'
                              >
                                <Trash2 className='w-3 h-3 sm:w-4 sm:h-4' />
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
                    className='bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg sm:rounded-xl p-4! sm:p-6! shadow-sm'
                  >
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4! sm:gap-6!'>
                      <div className='text-center'>
                        <div className='text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300'>
                          Total Items
                        </div>
                        <div className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1! sm:mt-2!'>
                          {formData.quantity_total}
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300'>
                          Items Total
                        </div>
                        <div className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1! sm:mt-2!'>
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
                        <div className='text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300'>
                          Order Total
                        </div>
                        <div className='text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1! sm:mt-2!'>
                          ₹{formData.payment_amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Step 3: Shipping & Payment */}
              {activeStep === 3 && (
                <div className='space-y-4! sm:space-y-6! md:space-y-8!'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4! sm:gap-6!'>
                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900 dark:text-white'>
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
                        className='w-full px-3! sm:px-4! py-2.5! sm:py-3! bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 text-sm transition-all duration-200'
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
                      <label className='block text-sm font-semibold text-gray-900 dark:text-white'>
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
                        className='w-full px-3! sm:px-4! py-2.5! sm:py-3! bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 text-sm transition-all duration-200'
                        placeholder='Enter tracking number'
                      />
                    </div>

                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900 dark:text-white'>
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
                        className='w-full px-3! sm:px-4! py-2.5! sm:py-3! bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 text-sm transition-all duration-200'
                      />
                    </div>

                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900 dark:text-white'>
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
                        className='w-full px-3! sm:px-4! py-2.5! sm:py-3! bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 text-sm transition-all duration-200'
                      >
                        <option value='pending'>Pending</option>
                        <option value='shipped'>Shipped</option>
                        <option value='delivered'>Delivered</option>
                        <option value='cancelled'>Cancelled</option>
                      </select>
                    </div>

                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900 dark:text-white'>
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
                        className='w-full px-3! sm:px-4! py-2.5! sm:py-3! bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 text-sm transition-all duration-200'
                      />
                    </div>

                    <div className='space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900 dark:text-white'>
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
                        className='w-full px-3! sm:px-4! py-2.5! sm:py-3! bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 text-sm transition-all duration-200'
                      />
                    </div>

                    <div className='sm:col-span-2 space-y-2!'>
                      <label className='block text-sm font-semibold text-gray-900 dark:text-white'>
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
                        className='w-full px-3! sm:px-4! py-2.5! sm:py-3! bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 text-sm transition-all duration-200 resize-none'
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </form>

        {/* Action Buttons - Desktop */}
        <div className='hidden lg:flex justify-between items-center pt-4! sm:pt-6! md:pt-8! mt-4! sm:mt-6! md:mt-8! border-t border-gray-100 dark:border-gray-800 px-6! md:px-8! py-4! sm:py-5! md:py-6! shrink-0'>
          <div>
            {activeStep > 1 && (
              <button
                type='button'
                onClick={prevStep}
                disabled={loading}
                className='px-5! sm:px-6! py-2.5! sm:py-3! border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
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
              className='px-5! sm:px-6! py-2.5! sm:py-3! border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Cancel
            </button>

            {activeStep < 3 ? (
              <button
                type='button'
                onClick={nextStep}
                disabled={loading}
                className='px-5! sm:px-6! py-2.5! sm:py-3! bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2!'
              >
                Continue
                <ChevronRight className='w-4 h-4' />
              </button>
            ) : (
              <button
                type='button'
                onClick={handleSubmit}
                disabled={loading}
                className='px-5! sm:px-6! py-2.5! sm:py-3! bg-linear-to-r from-emerald-600 to-emerald-700 text-white rounded-lg sm:rounded-xl hover:from-emerald-700 hover:to-emerald-800 font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2!'
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
      </motion.div>
    </div>
  );
}
