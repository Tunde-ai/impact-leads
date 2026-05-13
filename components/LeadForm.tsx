'use client'

import { useState } from 'react'

interface LeadFormData {
  full_name: string
  phone: string
  email: string
  address: string
  city: string
  zip: string
  window_count: string
  door_count: string
  urgency: string
  homeowner: string
  notes: string
}

interface LeadFormProps {
  utm_campaign?: string
  utm_source?: string
  utm_medium?: string
  source?: string
}

export default function LeadForm({ utm_campaign, utm_source, utm_medium, source }: LeadFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    window_count: '',
    door_count: '',
    urgency: '',
    homeowner: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Convert form data to match API expectations
      const submitData = {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        zip: formData.zip,
        window_count: formData.window_count ? parseInt(formData.window_count) : null,
        door_count: formData.door_count === 'None' ? 0 : parseInt(formData.door_count) || null,
        urgency: formData.urgency,
        homeowner: formData.homeowner === 'Yes',
        notes: formData.notes || null,
        source,
        utm_campaign,
        utm_source,
        utm_medium
      }

      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit lead')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto p-8 bg-green-50 border border-green-200 rounded-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-green-800 mb-2">You're all set!</h3>
          <p className="text-green-700 text-lg">
            Expect a call within 24 hours.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="md:col-span-2">
          <label htmlFor="full_name" className="block text-sm font-semibold text-white mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            required
            value={formData.full_name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent text-gray-900 text-lg"
            placeholder="Enter your full name"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-white mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent text-gray-900 text-lg"
            placeholder="(305) 555-0123"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent text-gray-900 text-lg"
            placeholder="your@email.com"
          />
        </div>

        {/* Property Address */}
        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-semibold text-white mb-2">
            Property Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent text-gray-900 text-lg"
            placeholder="123 Ocean Drive"
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-semibold text-white mb-2">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            value={formData.city}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent text-gray-900 text-lg"
            placeholder="Miami"
          />
        </div>

        {/* ZIP Code */}
        <div>
          <label htmlFor="zip" className="block text-sm font-semibold text-white mb-2">
            ZIP Code *
          </label>
          <input
            type="text"
            id="zip"
            name="zip"
            required
            value={formData.zip}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent text-gray-900 text-lg"
            placeholder="33101"
          />
        </div>

        {/* Window Count */}
        <div>
          <label htmlFor="window_count" className="block text-sm font-semibold text-white mb-2">
            How many windows need replacing?
          </label>
          <select
            id="window_count"
            name="window_count"
            value={formData.window_count}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent text-gray-900 text-lg"
          >
            <option value="">Select windows</option>
            <option value="1-5">1-5 windows</option>
            <option value="6-10">6-10 windows</option>
            <option value="11-20">11-20 windows</option>
            <option value="20+">20+ windows</option>
          </select>
        </div>

        {/* Door Count */}
        <div>
          <label htmlFor="door_count" className="block text-sm font-semibold text-white mb-2">
            Any doors?
          </label>
          <select
            id="door_count"
            name="door_count"
            value={formData.door_count}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent text-gray-900 text-lg"
          >
            <option value="">Select doors</option>
            <option value="None">None</option>
            <option value="1-2">1-2 doors</option>
            <option value="3+">3+ doors</option>
          </select>
        </div>

        {/* Urgency */}
        <div>
          <label htmlFor="urgency" className="block text-sm font-semibold text-white mb-2">
            How soon do you need this done?
          </label>
          <select
            id="urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent text-gray-900 text-lg"
          >
            <option value="">Select timeframe</option>
            <option value="asap">ASAP</option>
            <option value="1-3months">Within 3 months</option>
            <option value="just-looking">Just getting quotes</option>
          </select>
        </div>

        {/* Homeowner */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Are you the homeowner?
          </label>
          <div className="space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="homeowner"
                value="Yes"
                checked={formData.homeowner === 'Yes'}
                onChange={handleChange}
                className="h-4 w-4 text-[#C9A84C] focus:ring-[#C9A84C] border-gray-300"
              />
              <span className="ml-2 text-white">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="homeowner"
                value="No"
                checked={formData.homeowner === 'No'}
                onChange={handleChange}
                className="h-4 w-4 text-[#C9A84C] focus:ring-[#C9A84C] border-gray-300"
              />
              <span className="ml-2 text-white">No</span>
            </label>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="md:col-span-2">
          <label htmlFor="notes" className="block text-sm font-semibold text-white mb-2">
            Additional notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any specific requirements or questions..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent resize-none text-gray-900 text-lg"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#C9A84C] hover:bg-[#b8973e] text-[#0B1F3A] py-4 px-6 rounded-lg text-xl font-bold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
      >
        {isSubmitting ? 'Submitting...' : 'Get My Free Quote'}
      </button>
    </form>
  )
}