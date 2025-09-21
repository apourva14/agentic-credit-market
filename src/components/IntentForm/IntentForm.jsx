import React, { useState } from 'react'

const IntentForm = ({ onCreateIntent, currentRole, selectedCompany }) => {
  const [formData, setFormData] = useState({
    // Basic intent fields
    companyName: '',
    amount: '',
    duration: '',
    purpose: '',
    currency: 'USD',
    productType: 'business_line_of_credit',
    
    // Customer profile fields
    industry: '',
    annualRevenue: '',
    creditScore: '',
    esgProfile: '',
    
    // ESG preferences
    excludeHighCarbon: false,
    preferredGreenCertification: ''
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
      // Create intent with full schema
      const intent = {
        // Basic fields for backward compatibility
        companyName: formData.companyName.trim(),
        amount: parseInt(formData.amount),
        duration: parseInt(formData.duration),
        purpose: formData.purpose.trim(),
        
        // Full intent schema
        intent_id: `INTENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customer_id: formData.companyName.trim(),
        product_type: formData.productType,
        requested_amount: parseInt(formData.amount),
        currency: formData.currency,
        desired_term: parseInt(formData.duration),
        
        // Customer profile
        customer_profile: {
          industry: formData.industry || 'General Business',
          annual_revenue: formData.annualRevenue ? parseInt(formData.annualRevenue) : 1000000,
          credit_score: formData.creditScore ? parseInt(formData.creditScore) : 700,
          esg_profile: formData.esgProfile || 'Standard'
        },
        
        // ESG preferences
        esg_preferences: {
          exclude_high_carbon: formData.excludeHighCarbon,
          preferred_green_certification: formData.preferredGreenCertification || 'None'
        },
        
        // Additional fields for internal use
        industry: formData.industry || 'General Business',
        creditScore: formData.creditScore ? parseInt(formData.creditScore) : 700,
        esgProfile: formData.esgProfile || 'Standard',
        excludeHighCarbon: formData.excludeHighCarbon,
        greenCertification: formData.preferredGreenCertification || 'None',
        annualRevenue: formData.annualRevenue ? parseInt(formData.annualRevenue) : 1000000
      }
      
      await onCreateIntent(intent)
      
      // Reset form after successful submission (but keep company name if selected)
      setFormData({
        companyName: selectedCompany || '',
        amount: '',
        duration: '',
        purpose: '',
        currency: 'USD',
        productType: 'business_line_of_credit',
        industry: '',
        annualRevenue: '',
        creditScore: '',
        esgProfile: '',
        excludeHighCarbon: false,
        preferredGreenCertification: ''
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
            {/* Basic Credit Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>💳</span>
                Credit Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    Amount *
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 font-medium mr-2">
                      $
                    </span>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      className={`form-input flex-1 ${errors.amount ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : ''}`}
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
                
                {/* Industry */}
                <div className="space-y-1">
                  <label htmlFor="industry" className="form-label">
                    Industry
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    className="form-input"
                    value={formData.industry}
                    onChange={handleChange}
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Renewable Energy">Renewable Energy</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Financial Services">Financial Services</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              {/* Purpose */}
              <div className="mt-6 space-y-1">
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
            
            {/* Customer Profile */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>👤</span>
                Customer Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Annual Revenue */}
                <div className="space-y-1">
                  <label htmlFor="annualRevenue" className="form-label">
                    Annual Revenue
                  </label>
                  <div className="flex items-center">
                    <span className="text-gray-500 font-medium mr-2">
                      $
                    </span>
                    <input
                      type="number"
                      id="annualRevenue"
                      name="annualRevenue"
                      className="form-input flex-1"
                      value={formData.annualRevenue}
                      onChange={handleChange}
                      placeholder="1,000,000"
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>
                
                {/* Credit Score */}
                <div className="space-y-1">
                  <label htmlFor="creditScore" className="form-label">
                    Credit Score
                  </label>
                  <input
                    type="number"
                    id="creditScore"
                    name="creditScore"
                    className="form-input"
                    value={formData.creditScore}
                    onChange={handleChange}
                    placeholder="720"
                    min="300"
                    max="850"
                  />
                </div>
                
                {/* ESG Profile */}
                <div className="space-y-1">
                  <label htmlFor="esgProfile" className="form-label">
                    ESG Profile
                  </label>
                  <select
                    id="esgProfile"
                    name="esgProfile"
                    className="form-input"
                    value={formData.esgProfile}
                    onChange={handleChange}
                  >
                    <option value="">Select ESG Profile</option>
                    <option value="Standard">Standard</option>
                    <option value="CarbonNeutralCertified">Carbon Neutral Certified</option>
                    <option value="ISO14001Certified">ISO 14001 Certified</option>
                    <option value="B_Corp">B Corp Certified</option>
                    <option value="LEEDCertified">LEED Certified</option>
                    <option value="GreenBusiness">Green Business</option>
                  </select>
                </div>
                
                {/* Preferred Green Certification */}
                <div className="space-y-1">
                  <label htmlFor="preferredGreenCertification" className="form-label">
                    Preferred Green Certification
                  </label>
                  <select
                    id="preferredGreenCertification"
                    name="preferredGreenCertification"
                    className="form-input"
                    value={formData.preferredGreenCertification}
                    onChange={handleChange}
                  >
                    <option value="">No Preference</option>
                    <option value="GreenLoanPrinciples">Green Loan Principles</option>
                    <option value="SustainabilityLinkedLoan">Sustainability-Linked Loan</option>
                    <option value="GreenBondPrinciples">Green Bond Principles</option>
                    <option value="ClimateBondsInitiative">Climate Bonds Initiative</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              {/* Exclude High Carbon Checkbox */}
              <div className="mt-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="excludeHighCarbon"
                    name="excludeHighCarbon"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={formData.excludeHighCarbon}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      excludeHighCarbon: e.target.checked
                    }))}
                  />
                  <label htmlFor="excludeHighCarbon" className="text-sm font-medium text-white">
                    🌱 Exclude high carbon-emitting activities
                  </label>
                </div>
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