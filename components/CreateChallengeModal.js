'use client';

import { useState, useEffect } from 'react';

export default function CreateChallengeModal({ onClose, onSubmit, existingChallenge = null }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Helper function to format date for input
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };
  
  const [formData, setFormData] = useState({
    title: existingChallenge?.title || '',
    description: existingChallenge?.description || '',
    targetWordCount: existingChallenge?.targetWordCount?.toString() || '',
    startDate: formatDateForInput(existingChallenge?.startDate),
    endDate: formatDateForInput(existingChallenge?.endDate),
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.targetWordCount || formData.targetWordCount <= 0) {
      newErrors.targetWordCount = 'Target word count must be greater than 0';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const action = existingChallenge ? 'update' : 'create';
      const data = {
        ...formData,
        targetWordCount: parseInt(formData.targetWordCount)
      };
      
      if (existingChallenge) {
        data.id = existingChallenge._id;
      }
      
      await onSubmit(action, data);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const defaultEndDate = nextMonth.toISOString().split('T')[0];

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-all duration-200 ${
      isOpen ? 'bg-black/50' : 'bg-black/0 pointer-events-none'
    }`}>
      <div className={`bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto transform transition-all duration-200 ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {existingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Challenge Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., November Novel Writing Challenge"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your writing challenge..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="targetWordCount" className="block text-sm font-medium text-gray-700 mb-1">
                Target Word Count *
              </label>
              <input
                type="number"
                id="targetWordCount"
                name="targetWordCount"
                value={formData.targetWordCount}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                  errors.targetWordCount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="50000"
              />
              {errors.targetWordCount && <p className="text-red-500 text-xs mt-1">{errors.targetWordCount}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate || today}
                  onChange={handleChange}
                  min={today}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate || defaultEndDate}
                  onChange={handleChange}
                  min={formData.startDate || today}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-black hover:text-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (existingChallenge ? 'Updating...' : 'Creating...') : (existingChallenge ? 'Update Challenge' : 'Create Challenge')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
