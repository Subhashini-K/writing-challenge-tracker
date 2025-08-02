'use client';

import { useState, useEffect } from 'react';

export default function LogWritingModal({ challenge, onClose, onSubmit, existingLog = null }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Helper function to safely format date
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return new Date().toISOString().split('T')[0];
    
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };
  
  const [formData, setFormData] = useState({
    date: formatDateForInput(existingLog?.date),
    wordCount: existingLog?.wordCount?.toString() || '',
    notes: existingLog?.notes || '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const endDate = new Date(challenge?.endDate);
      const today = new Date();
      
      // Only validate if we have valid challenge dates - only check max date
      if (challenge?.endDate && !isNaN(endDate.getTime())) {
        // Allow dates up to min(challenge end, today)
        const maxAllowedDate = endDate < today ? endDate : today;
        
        if (selectedDate > maxAllowedDate) {
          newErrors.date = 'Date cannot be in the future or after the challenge end date';
        }
      }
    }

    if (!formData.wordCount || formData.wordCount < 0) {
      newErrors.wordCount = 'Word count must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 200); // Allow animation to complete
  };

  const handleDelete = async () => {
    if (!existingLog || !window.confirm('Are you sure you want to delete this writing log?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onSubmit('delete', {
        id: existingLog._id
      });
    } catch (error) {
      console.error('Error deleting log:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const action = existingLog ? 'update' : 'create';
      const data = {
        ...formData,
        wordCount: parseInt(formData.wordCount)
      };
      
      if (existingLog) {
        data.id = existingLog._id;
      }
      
      await onSubmit(action, data);
    } catch (error) {
      console.error('Error submitting log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Safe date formatting for challenge dates
  const safeFormatDate = (dateValue) => {
    if (!dateValue) return new Date().toISOString().split('T')[0];
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
    return date.toISOString().split('T')[0];
  };

  const challengeStartDate = safeFormatDate(challenge?.startDate);
  const today = new Date().toISOString().split('T')[0];
  const challengeEndDate = safeFormatDate(challenge?.endDate);
  const maxDate = challengeEndDate < today ? challengeEndDate : today;

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-all duration-200 ${
      isOpen ? 'bg-black/70' : 'bg-black/0 pointer-events-none'
    }`}>
      <div className={`bg-white rounded-lg max-w-md w-full transform transition-all duration-200 ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {existingLog ? 'Edit Writing Log' : 'Log Writing Progress'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting || isDeleting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Challenge Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-2">{challenge?.title || 'Loading...'}</h3>
            <p className="text-sm text-gray-600 mb-3">
              {challenge?.startDate && challenge?.endDate ? 
                `${formatDate(challenge.startDate)} - ${formatDate(challenge.endDate)}` : 
                'Loading dates...'
              }
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>{Math.min(Math.round(((challenge?.currentWordCount || 0) / (challenge?.targetWordCount || 1)) * 100), 100)}%</span>
              </div>
              <div className="bg-white rounded-full h-3 shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(((challenge?.currentWordCount || 0) / (challenge?.targetWordCount || 1)) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 text-center">
                {(challenge?.currentWordCount || 0).toLocaleString()} / {(challenge?.targetWordCount || 0).toLocaleString()} words
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                max={maxDate}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black transition-colors ${
                  errors.date ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>

            <div>
              <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700 mb-1">
                Words Written *
              </label>
              <input
                type="number"
                id="wordCount"
                name="wordCount"
                value={formData.wordCount}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black transition-colors ${
                  errors.wordCount ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="1000"
              />
              {errors.wordCount && <p className="text-red-500 text-xs mt-1">{errors.wordCount}</p>}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black hover:border-gray-400 transition-colors"
                placeholder="How did your writing session go?"
              />
            </div>

            <div className="flex justify-between space-x-3 pt-6">
              <div className="flex space-x-3">
                {existingLog && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting || isDeleting}
                    className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting || isDeleting}
                  className="px-4 py-2 text-black hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isDeleting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : existingLog ? 'Update Log' : 'Save Log'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
