export interface ParsedQuery {
  category?: string;
  categorySlug?: string;
  service?: string;
  serviceId?: string;
  city?: string;
  intent: 'search' | 'book' | 'inquiry' | 'urgent';
  suggestedReply: string;
  matchedKeywords: string[];
}

const CITIES = ['jaipur', 'delhi', 'mumbai', 'bangalore', 'pune', 'bhopal', 'lucknow', 'ahmedabad'];

export function parseNaturalLanguageQuery(query: string): ParsedQuery {
  const lower = query.toLowerCase().trim();
  const keywords: string[] = [];
  let category = '';
  let categorySlug = '';
  let service = '';
  let serviceId = '';
  let city = '';

  if (!lower) {
    return {
      intent: 'search',
      suggestedReply: 'Tell me what service you need and I will match it to the right professionals.',
      matchedKeywords: []
    };
  }

  const intent: 'search' | 'book' | 'inquiry' | 'urgent' =
    /(urgent|emergency|asap|immediately|right now|today|within an hour)/.test(lower)
      ? 'urgent'
      : /(book|booking|hire|schedule|reserve|appointment|need someone|want someone)/.test(lower)
        ? 'book'
        : /(how much|what is|can you|do you|is there|where can|which|when|why|cost|price|quote)/.test(lower)
          ? 'inquiry'
          : 'search';

  // Detect city
  for (const c of CITIES) {
    if (lower.includes(c)) {
      city = c.charAt(0).toUpperCase() + c.slice(1);
      keywords.push(city);
      break;
    }
  }

  const pushKeyword = (value: string) => {
    if (value && !keywords.includes(value)) keywords.push(value);
  };

  // 1. Education Intent
  if (lower.includes('math') || lower.includes('calculus') || lower.includes('algebra')) {
    category = 'EDUCATION';
    categorySlug = 'education';
    service = 'Mathematics Tutor';
    serviceId = 'srv-edu-1';
    pushKeyword('Mathematics');
  } else if (lower.includes('coding') || lower.includes('python') || lower.includes('java') || lower.includes('react') || lower.includes('programmer')) {
    category = 'EDUCATION';
    categorySlug = 'education';
    service = 'Coding Tutor';
    serviceId = 'srv-edu-2';
    pushKeyword('Coding');
  } else if (lower.includes('tutor') || lower.includes('teacher') || lower.includes('coaching') || lower.includes('exam')) {
    category = 'EDUCATION';
    categorySlug = 'education';
    service = 'Home & Online Tutoring';
    pushKeyword('Tutor');
  }

  // 2. Healthcare Intent
  else if (lower.includes('nurse') || lower.includes('patient care') || lower.includes('injection') || lower.includes('saline')) {
    category = 'HEALTHCARE';
    categorySlug = 'healthcare';
    service = 'Nurse at Home';
    serviceId = 'srv-hlth-1';
    pushKeyword('Nursing');
  } else if (lower.includes('physio') || lower.includes('back pain') || lower.includes('knee pain') || lower.includes('paralysis')) {
    category = 'HEALTHCARE';
    categorySlug = 'healthcare';
    service = 'Physiotherapy at Home';
    serviceId = 'srv-hlth-2';
    pushKeyword('Physiotherapy');
  } else if (lower.includes('elderly') || lower.includes('old age') || lower.includes('senior citizen')) {
    category = 'HEALTHCARE';
    categorySlug = 'healthcare';
    service = 'Elderly Care & Attendant';
    serviceId = 'srv-hlth-3';
    pushKeyword('Elderly Care');
  }

  // 3. Home Services Intent
  else if (lower.includes('ac not cooling') || lower.includes('ac repair') || lower.includes('air conditioner') || lower.includes('ac servicing')) {
    category = 'HOME SERVICES';
    categorySlug = 'home-services';
    service = 'AC Repair & Service';
    serviceId = 'srv-home-1';
    pushKeyword('AC Repair');
  } else if (lower.includes('electrician') || lower.includes('wiring') || lower.includes('short circuit') || lower.includes('mcb')) {
    category = 'HOME SERVICES';
    categorySlug = 'home-services';
    service = 'Electrician Services';
    serviceId = 'srv-home-2';
    pushKeyword('Electrician');
  }   else if (lower.includes('plumber') || lower.includes('tap leak') || lower.includes('pipe') || lower.includes('water tank')) {
    category = 'HOME SERVICES';
    categorySlug = 'home-services';
    service = 'Plumbing Work';
    pushKeyword('Plumber');
  } else if (lower.includes('cleaning') || lower.includes('deep clean') || lower.includes('sanitization')) {
    category = 'HOME SERVICES';
    categorySlug = 'home-services';
    service = 'Deep Home Cleaning';
    serviceId = 'srv-home-3';
    pushKeyword('Cleaning');
  }
  // 4. Digital Marketing & IT Intent
  else if (lower.includes('website') || lower.includes('web design') || lower.includes('app dev') || lower.includes('react')) {
    category = 'DIGITAL MARKETING & IT';
    categorySlug = 'digital-marketing-it';
    service = 'Website Development';
    serviceId = 'srv-dig-1';
    pushKeyword('Web Development');
  } else if (lower.includes('instagram') || lower.includes('social media') || lower.includes('reels') || lower.includes('facebook page')) {
    category = 'DIGITAL MARKETING & IT';
    categorySlug = 'digital-marketing-it';
    service = 'Social Media Management';
    serviceId = 'srv-dig-3';
    pushKeyword('Social Media');
  } else if (lower.includes('seo') || lower.includes('google ads') || lower.includes('ranking')) {
    category = 'DIGITAL MARKETING & IT';
    categorySlug = 'digital-marketing-it';
    service = 'SEO & Google Ads Management';
    serviceId = 'srv-dig-2';
    pushKeyword('SEO');
  }

  // 5. Event Management Intent
  else if (lower.includes('wedding photo') || lower.includes('cinematic') || lower.includes('videographer') || lower.includes('pre-wedding')) {
    category = 'EVENT MANAGEMENT';
    categorySlug = 'event-management';
    service = 'Wedding Photography & Videography';
    serviceId = 'srv-evnt-1';
    pushKeyword('Photography');
  } else if (lower.includes('wedding') || lower.includes('mandap') || lower.includes('decor') || lower.includes('event planner')) {
    category = 'EVENT MANAGEMENT';
    categorySlug = 'event-management';
    service = 'Wedding Planning & Decoration';
    serviceId = 'srv-evnt-2';
    pushKeyword('Wedding Planning');
  }

  // Generate Vistara AI assistant response based on intent
  let suggestedReply = `I found matching options for "${query}". Explore verified professionals below.`;
  if (intent === 'urgent') {
    suggestedReply = `I can help you find a verified professional quickly for this urgent request${city ? ` in ${city}` : ''}.`;
  } else if (category && service) {
    suggestedReply = `I understand you are looking for ${service} in ${category}${city ? ` near ${city}` : ''}. Here are top-rated verified experts available right now!`;
  } else if (category) {
    suggestedReply = `I matched your request to ${category}. Let me connect you with certified professionals!`;
  }

  return {
    category,
    categorySlug,
    service,
    serviceId,
    city,
    intent,
    suggestedReply,
    matchedKeywords: keywords
  };
}
