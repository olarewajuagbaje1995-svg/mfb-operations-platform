// Responsibility: single source of truth for the CLOBAN FINANCE public brand identity.
// Update this file when brand details change; every public page and component reads from it here.
// Contact details must match the official brand registration — do not invent alternatives.

export const brand = {
  name: 'CLOBAN FINANCE',
  tagline: 'Financing Enterprises. Building Prosperity.',
  industry: 'SME Financing | Asset-Backed Lending | Business Growth',

  phone: '+234 907 000 0000',
  email: 'info@clobansfinance.com',
  hq: 'Kuje, Abuja',
  address: 'Head Office, Kuje, Abuja, FCT, Nigeria',
  website: 'https://www.clobanfinance.com',

  logo: {
    primary: '/brand/image.png',
    white: '/brand/cloban-finance-logo-white.svg',
    fallback: '/brand/cloban-finance-logo.svg',
    favicon: '/brand/favicon.svg',
  },

  hero: '/brand/hero-sme-owner.jpg',

  colors: {
    navy: '#0B2F5B',
    blue: '#003061',
    deep: '#061E45',
    gold: '#F5B927',
    goldLight: '#FBD850',
    light: '#F1F6FE',
    pale: '#EAF2FD',
    white: '#FFFFFF',
    textMain: '#101828',
    textSecondary: '#667085',
    border: '#DCE5F1',
  },

  navigation: [
    { label: 'Home', to: '/' },
    {
      label: 'About Us',
      to: '/about',
      items: [{ label: 'Management & Leadership', to: '/management' }],
    },
    { label: 'Our Products', to: '/products' },
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'Eligibility', to: '/eligibility' },
    { label: 'Track Application', to: '/track' },
    { label: 'Contact Us', to: '/contact' },
  ],

  cta: { label: 'Apply for Financing', to: '/apply' },

  products: [
    {
      id: 'sme-business-loans',
      name: 'SME Business Loans',
      description: 'Flexible financing to start, run or expand your business.',
    },
    {
      id: 'asset-backed-finance',
      name: 'Asset-Backed Finance',
      description: 'Access financing using eligible business or personal assets as collateral.',
    },
    {
      id: 'equipment-finance',
      name: 'Equipment Finance',
      description: 'Acquire machinery, tools and other productive assets to grow your operations.',
    },
    {
      id: 'working-capital-finance',
      name: 'Working Capital Finance',
      description: 'Keep your business running smoothly with short-term financing.',
    },
  ],

  social: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
  },
}
