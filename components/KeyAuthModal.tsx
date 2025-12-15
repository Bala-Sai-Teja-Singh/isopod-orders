/* eslint-disable @typescript-eslint/no-unused-vars */
// components/KeyAuthModal.tsx
'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';

interface KeyAuthModalProps {
  onAuthSuccess: () => void;
}

export default function KeyAuthModal({ onAuthSuccess }: KeyAuthModalProps) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });

      const data = await response.json();

      if (data.success) {
        // Store both auth state AND the key for API calls
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('accessKey', key); // This is crucial!
        onAuthSuccess();
      } else {
        setError(data.message || 'Invalid access key');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3! sm:p-4! md:p-6!'>
      <div className='bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl shadow-xl max-w-md w-full mx-3! sm:mx-4! p-5! sm:p-6! md:p-8!'>
        <div className='text-center mb-6! sm:mb-8!'>
          <div className='inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl mb-4! sm:mb-6!'>
            <Lock className='w-6 h-6 sm:w-8 sm:h-8 text-white' />
          </div>
          <h1 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2!'>
            Access Required
          </h1>
          <p className='text-gray-600 dark:text-gray-400 text-sm sm:text-base'>
            Enter your access key to use the application
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4! sm:space-y-6!'>
          <div>
            <label
              htmlFor='key'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2!'
            >
              Access Key
            </label>
            <input
              id='key'
              type='password'
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder='Enter your access key'
              className='w-full px-3! sm:px-4! py-2.5! sm:py-3! bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200 dark:text-white'
              autoFocus
              autoComplete='off'
            />
          </div>

          {error && (
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl p-3! sm:p-4!'>
              <p className='text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2!'>
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
                    d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                {error}
              </p>
            </div>
          )}

          <button
            type='submit'
            disabled={loading || !key.trim()}
            className='w-full py-2.5! sm:py-3! bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
          >
            {loading ? (
              <div className='flex items-center justify-center gap-2!'>
                <div className='animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white'></div>
                Verifying...
              </div>
            ) : (
              'Access Application'
            )}
          </button>
        </form>

        <div className='mt-4! sm:mt-6! pt-4! sm:pt-6! border-t border-gray-200 dark:border-gray-800'>
          <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
            Contact the administrator if you don't have an access key
          </p>
        </div>
      </div>
    </div>
  );
}
