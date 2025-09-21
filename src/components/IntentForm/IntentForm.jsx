import React, { useState } from 'react'

const IntentForm = ({ onCreateIntent, currentRole, selectedCompany }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    amount: '',
    duration: '',
    purpose: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Auto-populate company name when selectedCompany changes
  React.useEffect(() => {
    if (currentRole === 'company' && selectedCompany) {
      setFormData(prev => ({
        ...prev,
        companyName: selectedCompany
      }))
    }
  }, [selectedCompany, currentRole])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Valid amount is required'
    }
    
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Valid duration is required'
    }
    
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await onCreateIntent({
        companyName: formData.companyName.trim(),
        amount: parseInt(formData.amount),
        duration: parseInt(formData.duration),
        purpose: formData.purpose.trim()
      })
      
      // Reset form after successful submission (but keep company name if selected)
      setFormData({
        companyName: selectedCompany || '',
        amount: '',
        duration: '',
        purpose: ''
      })
      
    } catch (error) {
      console.error('Error creating intent:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't show form if company role but no company selected
  if (currentRole === 'company' && !selectedCompany) {
    return (
      <section className="py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="card max-w-4xl mx-auto overflow-hidden animate-fade-in">
            <div className="px-6 py-8 text-center">
              <div className="text-4xl mb-4">🏢</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Company Selection Required
              </h2>
              <p className="text-gray-600">
                Please select a company from the header to create credit intents.
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const isCompanyNameDisabled = currentRole === 'company' && selectedCompany

  return (
    <section className="py-6 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="card max-w-4xl mx-auto overflow-hidden animate-fade-in">
          {/* Card Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Create New Credit Intent
            </h2>
            <p className="text-sm text-gray-600">
              Submit a new credit line request to the marketplace
              {selectedCompany && (
                <span className="ml-1 font-medium">for {selectedCompany}</span>
              )}
            </p>
          </div>
          
          {/* Form */}
          <form className="p-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Company Name */}
              <div className="space-y-1">
                <label htmlFor="companyName" className="form-label">
                  Company Name *
                  {isCompanyNameDisabled && (
                    <span className="ml-1 text-xs text-gray-500">(Auto-selected)</span>
                  )}
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  className={`form-input ${
                    isCompanyNameDisabled ? 'bg-gray-50 cursor-not-allowed' : ''
                  } ${errors.companyName ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : ''}`}
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  disabled={isCompanyNameDisabled}
                  required
                />
                {errors.companyName && (
                  <p className="text-danger-600 text-sm font-medium flex items-center gap-1">
                    <span className="text-xs">⚠️</span>
                    {errors.companyName}
                  </p>
                )}
              </div>
              
              {/* Amount */}
              <div className="space-y-1">
                <label htmlFor="amount" className="form-label">
                  Amount ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    className={`form-input pl-8 ${errors.amount ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : ''}`}
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="500,000"
                    min="1000"
                    step="1000"
                    required
                  />
                </div>
                {errors.amount && (
                  <p className="text-danger-600 text-sm font-medium flex items-center gap-1">
                    <span className="text-xs">⚠️</span>
                    {errors.amount}
                  </p>
                )}
              </div>
              
              {/* Duration */}
              <div className="space-y-1">
                <label htmlFor="duration" className="form-label">
                  Duration (months) *
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  className={`form-input ${errors.duration ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : ''}`}
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="12"
                  min="1"
                  max="120"
                  required
                />
                {errors.duration && (
                  <p className="text-danger-600 text-sm font-medium flex items-center gap-1">
                    <span className="text-xs">⚠️</span>
                    {errors.duration}
                  </p>
                )}
              </div>
              
              {/* Purpose */}
              <div className="md:col-span-2 space-y-1">
                <label htmlFor="purpose" className="form-label">
                  Purpose *
                </label>
                <textarea
                  id="purpose"
                  name="purpose"
                  className={`form-input resize-none ${errors.purpose ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : ''}`}
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="Describe the purpose of this credit line..."
                  rows="3"
                  required
                />
                {errors.purpose && (
                  <p className="text-danger-600 text-sm font-medium flex items-center gap-1">
                    <span className="text-xs">⚠️</span>
                    {errors.purpose}
                  </p>
                )}
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                className={`btn btn-primary min-w-40 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:scale-105'}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Intent'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default IntentForm