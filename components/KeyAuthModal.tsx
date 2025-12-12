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
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4!'>
      <div className='bg-white rounded-2xl shadow-xl max-w-md w-full p-8!'>
        <div className='text-center mb-8!'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6!'>
            <Lock className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2!'>
            Access Required
          </h1>
          <p className='text-gray-600'>
            Enter your access key to use the application
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6!'>
          <div>
            <label
              htmlFor='key'
              className='block text-sm font-medium text-gray-700 mb-2!'
            >
              Access Key
            </label>
            <input
              id='key'
              type='password'
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder='Enter your access key'
              className='w-full px-4! py-3! bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200'
              autoFocus
            />
          </div>

          {error && (
            <div className='bg-red-50 border border-red-200 rounded-xl p-4!'>
              <p className='text-red-600 text-sm font-medium'>{error}</p>
            </div>
          )}

          <button
            type='submit'
            disabled={loading || !key.trim()}
            className='w-full py-3! bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <div className='flex items-center justify-center'>
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3!'></div>
                Verifying...
              </div>
            ) : (
              'Access Application'
            )}
          </button>
        </form>

        <div className='mt-6! pt-6! border-t border-gray-200'>
          <p className='text-xs text-gray-500 text-center'>
            Contact the administrator if you do not have an access key
          </p>
        </div>
      </div>
    </div>
  );
}
