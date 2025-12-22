import React from 'react'
import UnifiedNav from '../UnifiedNav'
import { ContactForm } from '../components/ContactForm'

export const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNav currentPage="contact" />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Contact Us
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              We'd love to hear from you. Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
            </p>
          </div>

          <ContactForm />

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">📍</div>
              <h3 className="text-lg font-medium text-gray-900">Location</h3>
              <p className="mt-2 text-base text-gray-500">
                Evergreen Beauty Lounge<br />
                Arlington, TX
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">📧</div>
              <h3 className="text-lg font-medium text-gray-900">Email</h3>
              <p className="mt-2 text-base text-gray-500">
                support@mail.ebl.beauty
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-lg font-medium text-gray-900">Partnerships</h3>
              <p className="mt-2 text-base text-gray-500">
                partners@mail.ebl.beauty
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
