import { Suspense } from 'react'
import LeadForm from '@/components/LeadForm'
import ScrollToFormButton from '@/components/ScrollToFormButton'

// Component to handle UTM parameters
function UTMHandler() {
  return (
    <Suspense fallback={<LeadFormFallback />}>
      <UTMHandlerInner />
    </Suspense>
  )
}

function UTMHandlerInner() {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    return (
      <LeadForm
        utm_campaign={urlParams.get('utm_campaign') || undefined}
        utm_source={urlParams.get('utm_source') || undefined}
        utm_medium={urlParams.get('utm_medium') || undefined}
        source="form"
      />
    )
  }

  return <LeadFormFallback />
}

function LeadFormFallback() {
  return (
    <LeadForm source="form" />
  )
}


export default function FloridaImpactWindows() {
  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-[#0B1F3A] via-[#0B1F3A] to-[#1a2d4a] text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A84C' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center">
            {/* Problem-First Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Your Windows Are<br />
              <span className="text-[#C9A84C]">Costing You $180+ Monthly</span><br />
              Here's The Fix
            </h1>

            {/* Value-Focused Subheadline */}
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 mb-8 max-w-4xl mx-auto font-medium">
              Turn energy waste into monthly savings with hurricane-rated impact windows<br />
              <span className="text-[#C9A84C]">20-40% energy savings + hurricane protection</span>
            </p>

            {/* Approval-Based CTA */}
            <ScrollToFormButton className="bg-[#C9A84C] hover:bg-[#b8973e] text-[#0B1F3A] px-8 py-4 rounded-lg text-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg">
              Apply for Limited Energy Audit (12 Slots This Month)
            </ScrollToFormButton>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm lg:text-base">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#C9A84C] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0B1F3A]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-semibold">Licensed & Insured</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#C9A84C] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0B1F3A]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-semibold">Free Estimates</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#C9A84C] rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0B1F3A]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-semibold">Miami-Dade Approved</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY NOW SECTION */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Storm Season Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-4">Storm Season Is Coming</h3>
              <p className="text-gray-600">
                Hurricane season runs June through November. Don't wait until it's too late —
                protect your family and home now.
              </p>
            </div>

            {/* Insurance Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-4">Insurance Discounts Available</h3>
              <p className="text-gray-600">
                Impact windows can save you 10-45% on your homeowner's insurance.
                The savings often pay for the installation.
              </p>
            </div>

            {/* Property Value Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-4">Property Value Increases</h3>
              <p className="text-gray-600">
                Impact windows add immediate value to your home and make it more attractive
                to future buyers in the Florida market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS WITH ROI SECTION */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0B1F3A] mb-4">
              Real Florida Homeowners, Real Savings
            </h2>
            <p className="text-xl text-gray-600">See how much neighbors are saving with impact windows</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#C9A84C] rounded-full flex items-center justify-center mr-4">
                  <span className="font-bold text-[#0B1F3A] text-lg">SM</span>
                </div>
                <div>
                  <p className="font-semibold text-[#0B1F3A]">Sarah M.</p>
                  <p className="text-gray-600 text-sm">Miami Beach</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">"Electric bill went from $285 to $165 per month. Plus got 22% insurance discount."</p>
              <p className="text-[#C9A84C] font-bold text-lg">Saved $2,880 first year</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#C9A84C] rounded-full flex items-center justify-center mr-4">
                  <span className="font-bold text-[#0B1F3A] text-lg">JD</span>
                </div>
                <div>
                  <p className="font-semibold text-[#0B1F3A]">John D.</p>
                  <p className="text-gray-600 text-sm">Tampa</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">"Cooling costs dropped 35%. Windows paid for themselves in 3 years through savings."</p>
              <p className="text-[#C9A84C] font-bold text-lg">$180 monthly savings</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#C9A84C] rounded-full flex items-center justify-center mr-4">
                  <span className="font-bold text-[#0B1F3A] text-lg">MR</span>
                </div>
                <div>
                  <p className="font-semibold text-[#0B1F3A]">Maria R.</p>
                  <p className="text-gray-600 text-sm">Fort Lauderdale</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">"House value increased $18,000 plus energy savings. Best investment we've made."</p>
              <p className="text-[#C9A84C] font-bold text-lg">145% ROI in 2 years</p>
            </div>
          </div>
        </div>
      </section>

      {/* FIT CHECK SECTION */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-[#0B1F3A] mb-8">
              Is This Right For Your Home?
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* NOT For You */}
              <div className="bg-red-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  This Is NOT For You If:
                </h3>
                <ul className="space-y-2 text-red-700">
                  <li>❌ You're planning to move within 2 years</li>
                  <li>❌ Your home was built after 2020</li>
                  <li>❌ You want the cheapest option regardless of quality</li>
                  <li>❌ You expect results without any maintenance</li>
                </ul>
              </div>

              {/* Perfect For You */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  This IS Perfect If:
                </h3>
                <ul className="space-y-2 text-green-700">
                  <li>✅ You own a Florida home built before 2015</li>
                  <li>✅ Your energy bills are $150+ monthly</li>
                  <li>✅ You want 20-40% energy savings + hurricane protection</li>
                  <li>✅ You're ready to invest in long-term home value</li>
                </ul>
              </div>
            </div>

            <div className="text-center mt-8">
              <ScrollToFormButton className="bg-[#C9A84C] hover:bg-[#b8973e] text-[#0B1F3A] px-8 py-4 rounded-lg text-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg">
                Yes, This Is Perfect For My Home
              </ScrollToFormButton>
            </div>
          </div>
        </div>
      </section>

      {/* LEAD CAPTURE FORM SECTION */}
      <section id="lead-form" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0B1F3A] to-[#1a2d4a] rounded-2xl shadow-2xl p-8 lg:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Apply For Your Energy Savings Audit
              </h2>
              <p className="text-xl text-gray-300">
                Limited to 12 qualifying homeowners this month<br />
                <span className="text-[#C9A84C] font-semibold">Complete assessment in 60 seconds</span>
              </p>
            </div>

            <UTMHandler />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0B1F3A] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg mb-2">
            Free quote service. A licensed Florida contractor will contact you within 24 hours.
          </p>
          <p className="text-gray-400">
            &copy; 2024 Florida Impact Windows. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
