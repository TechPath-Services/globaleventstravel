import { useState, type FormEvent } from 'react';
import { leadsApi, type LeadData } from '@/lib/api';
import {
  deliverItineraryPdf,
  releaseDownloadTab,
  reserveDownloadTab,
  resolveItineraryPdfUrl,
  type ItineraryDelivery,
} from '@/lib/itinerary-download';
import ItineraryDownloadButton from '@/components/forms/ItineraryDownloadButton';

interface TrekLeadFormProps {
  trekName: string;
  trekSlug: string;
  trekPrice: string;
  source?: string;
  variant?: 'trek' | 'expedition';
  /** Existing itinerary PDF URL. Omitted or blank keeps the success message only. */
  itineraryPdfUrl?: string | null;
}

interface FormData {
  name: string;
  email: string;
  whatsapp: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  whatsapp?: string;
}

export default function TrekLeadForm({
  trekName,
  trekSlug,
  trekPrice,
  source = 'trek_page',
  variant = 'trek',
  itineraryPdfUrl,
}: TrekLeadFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    whatsapp: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [itineraryDelivery, setItineraryDelivery] = useState<ItineraryDelivery | null>(null);

  // Calculate form completion progress (3 fields for this form)
  const filledFields = Object.values(formData).filter(Boolean).length;
  const progress = (filledFields / 3) * 100;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.whatsapp.replace(/\D/g, ''))) {
      newErrors.whatsapp = 'Enter valid 10-digit Indian number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Reserve the fallback tab before the lead request. Popup blockers reject
    // window.open once this handler has awaited the API.
    const pdfUrl = resolveItineraryPdfUrl(itineraryPdfUrl);
    const reserved = pdfUrl ? reserveDownloadTab() : null;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Submit to API
      const leadData: LeadData = {
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        trek_slug: trekSlug,
        trek_name: trekName,
        source: source || 'trek_page',
      };
      
      await leadsApi.create(leadData);

      try {
        const delivery = await deliverItineraryPdf({
          url: pdfUrl,
          name: trekName,
          kind: variant,
          trekSlug,
          source,
          reserved,
        });
        setItineraryDelivery(delivery.method === 'skipped' ? null : delivery);
      } catch (downloadError) {
        releaseDownloadTab(reserved);
        console.error('Itinerary download failed:', downloadError);
      }
      setIsSuccess(true);
    } catch (error) {
      releaseDownloadTab(reserved);
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

  const isExpedition = variant === 'expedition';

  if (isSuccess) {
    return (
      <div className="rounded-xl p-6 shadow-sm bg-white border border-gray-200">
        <div className="text-center py-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${isExpedition ? 'bg-primary-100' : 'bg-green-100'}`}>
            <svg className={`w-7 h-7 ${isExpedition ? 'text-primary-500' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2 text-gray-900">Thank You!</h3>
          <p className="text-sm mb-4 text-gray-600">
            {isExpedition
              ? `We've received your application for ${trekName}. Our team will contact you within 24-48 hours.`
              : `Your ${trekName} itinerary will be sent to your WhatsApp shortly.`}
          </p>
          <div className={`flex items-center justify-center gap-2 font-medium text-sm ${isExpedition ? 'text-primary-600' : 'text-green-600'}`}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>{isExpedition ? 'We\'ll contact you soon' : 'Check your WhatsApp'}</span>
          </div>
          {itineraryDelivery && (
            <ItineraryDownloadButton
              delivery={itineraryDelivery}
              trekSlug={trekSlug}
              source={source}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 shadow-sm bg-white border ${isExpedition ? 'border-secondary-200' : 'border-gray-200'}`}>
      {/* Header with Price */}
      <div className="text-center mb-4 pb-4 border-b border-gray-100">
        <div className="text-sm mb-1 text-gray-500">Starting from</div>
        <div className="text-3xl font-bold text-gray-900">{trekPrice}</div>
        <div className="text-sm text-gray-500">per person</div>
      </div>

      {/* Form Title */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold mb-1 text-gray-900">
          {isExpedition ? 'Apply for this Expedition' : 'Get Free Itinerary'}
        </h3>
        <p className="text-xs text-gray-500">
          {isExpedition ? 'Express your interest. We\'ll review and contact you.' : 'Detailed plan sent to WhatsApp'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Completion</span>
          <span>{filledFields}/3</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name Field */}
        <div>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Your Name"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
              errors.name
                ? 'border-red-400 bg-red-50 text-gray-900 placeholder-gray-400'
                : 'border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Email Address"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
              errors.email
                ? 'border-red-400 bg-red-50 text-gray-900 placeholder-gray-400'
                : 'border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'
            }`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* WhatsApp Field */}
        <div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">+91</span>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => handleWhatsAppChange(e.target.value)}
              placeholder="WhatsApp Number"
              className={`w-full pl-11 pr-3 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
                errors.whatsapp
                  ? 'border-red-400 bg-red-50 text-gray-900 placeholder-gray-400'
                  : 'border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'
              }`}
            />
          </div>
          {errors.whatsapp && <p className="mt-1 text-xs text-red-500">{errors.whatsapp}</p>}
        </div>

        {/* Selected Trek/Expedition (Read-only) */}
        <div className="px-3 py-2.5 rounded-lg bg-primary-50 border border-primary-200">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium text-primary-700">{trekName}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold rounded-lg shadow-md shadow-orange-500/25 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>{isExpedition ? 'Apply Now' : 'Get Instant Itinerary'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {submitError && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{submitError}</p>
        </div>
      )}

      {/* Trust Badge */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>100% Safe & Secure</span>
      </div>

      {/* What's Included */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs mb-2 text-gray-500">
          {isExpedition ? 'Next steps:' : "What you'll get:"}
        </p>
        <div className="space-y-1.5">
          {(isExpedition
            ? ['Application review', 'Experience verification', 'Expedition details', 'Personalized briefing']
            : ['Day-by-day itinerary', 'Packing checklist', 'Budget breakdown', 'Expert tips']
          ).map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-xs text-gray-600">
              <svg className="w-3 h-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cancellation Policy / Note */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>
            {isExpedition
              ? 'Our team reviews each application carefully'
              : 'Free cancellation up to 15 days before'}
          </span>
        </div>
      </div>
    </div>
  );
}

