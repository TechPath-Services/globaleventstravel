import { useState, useEffect, type FormEvent } from 'react';
import { leadsApi, type LeadData } from '@/lib/api';
import { useTrekOptions } from '@/lib/useTrekOptions';
import { LEAD_FORM_CONFIG } from '@/lib/constants';

interface FormData {
  name: string;
  email: string;
  whatsapp: string;
  trek: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  whatsapp?: string;
  trek?: string;
}

interface MobileStickyFormProps {
  variant?: 'full' | 'minimal';
  /** Preselect the trek when the form is opened from a trek-detail page. */
  trekSlug?: string;
  trekName?: string;
  formTitle?: string;
  formSubtitle?: string;
  ctaText?: string;
  privacyText?: string;
  successMessage?: string;
}

export default function MobileStickyForm({
  variant = 'minimal',
  trekSlug,
  trekName,
  formTitle = LEAD_FORM_CONFIG.formTitle,
  formSubtitle = LEAD_FORM_CONFIG.formSubtitle,
  ctaText = LEAD_FORM_CONFIG.ctaText,
  privacyText = LEAD_FORM_CONFIG.privacyText,
  successMessage = LEAD_FORM_CONFIG.successMessage,
}: MobileStickyFormProps) {
  const { trekOptions, loading: trekLoading } = useTrekOptions();
  const isMinimal = variant === 'minimal';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    whatsapp: '',
    trek: trekSlug || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Hide sticky bar when scrolled to top (hero is visible)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Open modal when navigated to #whatsapp-form on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkHash = () => {
      const isMobile = window.matchMedia('(max-width: 1023px)').matches;
      if (isMobile && window.location.hash === '#whatsapp-form') {
        setIsModalOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!isMinimal) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
    } else if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.whatsapp.replace(/\D/g, ''))) {
      newErrors.whatsapp = 'Enter valid 10-digit Indian number';
    }

    if (!formData.trek) {
      newErrors.trek = 'Please select a trek';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Get trek name from options
      const trekOption = trekOptions.find(opt => opt.value === formData.trek);
      
      // Submit to API
      const leadData: LeadData = {
        name: formData.name,
        email: formData.email.trim() || undefined,
        whatsapp: formData.whatsapp,
        trek_slug: formData.trek,
        trek_name: trekName || trekOption?.label,
        source: 'mobile_sticky',
      };
      
      await leadsApi.create(leadData);
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting lead:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleWhatsAppChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    handleChange('whatsapp', digits);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (isSuccess) {
      // Reset form after closing success state
      setFormData({ name: '', email: '', whatsapp: '', trek: '' });
      setIsSuccess(false);
    }
  };

  return (
    <>
      {/* Sticky Bottom Bar - Only visible on mobile when scrolled.
          Right padding reserves space for the CDN "Ask From Riya" badge. */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] py-3 pl-3 pr-[9.5rem] safe-area-bottom">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-200 flex items-center justify-center gap-1.5 text-sm sm:text-base"
          >
            <span>Get Itinerary</span>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="lg:hidden fixed inset-0 z-[100]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Content - Slides up from bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slideUp safe-area-bottom">
            {/* Handle bar */}
            <div className="sticky top-0 bg-white pt-3 pb-2 px-4 border-b border-gray-100 z-10">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto" />
            </div>

            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close form"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6">
              {isSuccess ? (
                /* Success State */
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-600 mb-6">
                    {successMessage}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-6">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="font-medium text-lg">Check your WhatsApp</span>
                  </div>
                  <button
                    onClick={closeModal}
                    className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Form */
                <>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{formTitle}</h3>
                    <p className="text-gray-600">{formSubtitle}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label htmlFor="mobile-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="mobile-name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Enter your name"
                        className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                          errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-orange-500'
                        }`}
                      />
                      {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                    </div>

                    {/* Email - optional in minimal, required in full */}
                    <div>
                      <label htmlFor="mobile-email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address {isMinimal && <span className="text-gray-400 font-normal">(optional)</span>}
                      </label>
                      <input
                        type="email"
                        id="mobile-email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="your@email.com"
                        className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                          errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-orange-500'
                        }`}
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label htmlFor="mobile-whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">+91</span>
                        <input
                          type="tel"
                          id="mobile-whatsapp"
                          value={formData.whatsapp}
                          onChange={(e) => handleWhatsAppChange(e.target.value)}
                          placeholder="96000 36667"
                          className={`w-full pl-14 pr-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                            errors.whatsapp ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-orange-500'
                          }`}
                        />
                      </div>
                      {errors.whatsapp && <p className="mt-1 text-xs text-red-500">{errors.whatsapp}</p>}
                    </div>

                    {/* Trek Select */}
                    <div>
                      <label htmlFor="mobile-trek" className="block text-sm font-medium text-gray-700 mb-1">
                        Interested Trek
                      </label>
                      <select
                        id="mobile-trek"
                        value={formData.trek}
                        onChange={(e) => handleChange('trek', e.target.value)}
                        disabled={trekLoading}
                        className={`w-full px-4 py-3 border rounded-xl text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                          errors.trek ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-orange-500'
                        } ${!formData.trek ? 'text-gray-400' : ''} disabled:opacity-70 disabled:cursor-not-allowed`}
                      >
                        {trekOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.trek && <p className="mt-1 text-xs text-red-500">{errors.trek}</p>}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>{ctaText}</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Error Message */}
                  {submitError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{submitError}</p>
                    </div>
                  )}

                  {/* Trust Badge */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>{privacyText}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS for animation */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
        .safe-area-bottom {
          padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
        }
      `}</style>
    </>
  );
}

