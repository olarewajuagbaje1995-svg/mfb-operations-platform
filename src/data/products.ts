// Responsibility: public financing product content. All figures, rates, terms and limits
// are intentionally left as editable placeholders — they must be confirmed by the business
// before publication. Do not invent interest rates, repayment periods, loan limits or fees.

export type ProductSlug =
  | 'sme-business-loans'
  | 'asset-backed-finance'
  | 'equipment-finance'
  | 'working-capital-finance'

export interface FinancingProduct {
  id: ProductSlug
  name: string
  tagline: string
  description: string
  heroImage?: string
  benefits: string[]
  howItWorks: string[]
  eligibility: string[]
  documents: string[]
  faqs: { question: string; answer: string }[]
  related: ProductSlug[]
}

export const financingProducts: Record<ProductSlug, FinancingProduct> = {
  'sme-business-loans': {
    id: 'sme-business-loans',
    name: 'SME Business Loans',
    tagline: 'Flexible financing to start, run or expand your business.',
    description:
      'A term financing solution for small and medium enterprises looking to grow operations, purchase stock, hire staff or strengthen working capital.',
    benefits: [
      'Flexible repayment structured around your business cash cycle.',
      'Quick credit review with transparent criteria.',
      'No hidden charges — all fees disclosed before acceptance.',
      'Funds paid directly into your business bank account.',
    ],
    howItWorks: [
      'Choose the SME Business Loan and tell us how much you need.',
      'Submit your business and personal details with supporting documents.',
      'Our credit team reviews your application and verifies your documents.',
      'Receive a financing decision and, if approved, funds are disbursed to your account.',
    ],
    eligibility: [
      'Registered business operating in Nigeria.',
      'At least one year of verifiable operations (product-specific).',
      'Valid government-issued identification for the business owner(s).',
      'Business bank statements or verifiable financial records.',
      'Meets product-specific credit and affordability assessment.',
    ],
    documents: [
      'Government-issued ID (National ID, Voter\'s card, Driver\'s licence or International Passport).',
      'Business registration documents (CAC certificate or business name registration).',
      'Proof of business address (utility bill or tenancy agreement).',
      'Bank statements for the business account (last 3–6 months).',
      'Tax clearance or other financial documents where applicable.',
    ],
    faqs: [
      {
        question: 'Who can apply for an SME Business Loan?',
        answer:
          'Registered Nigerian small and medium enterprises with verifiable operations and acceptable credit standing. Exact requirements are confirmed during application review.',
      },
      {
        question: 'How much can I borrow?',
        answer:
          'Financing amounts are tailored to your business needs and capacity. Speak with our team for current product limits — this information is pending business confirmation.',
      },
      {
        question: 'What is the interest rate?',
        answer:
          'Interest rates are confirmed at the time of your offer and depend on the product, tenor and risk assessment. We do not publish rates until verified by the business.',
      },
    ],
    related: ['asset-backed-finance', 'working-capital-finance'],
  },
  'asset-backed-finance': {
    id: 'asset-backed-finance',
    name: 'Asset-Backed Finance',
    tagline: 'Access financing using eligible business or personal assets as collateral.',
    description:
      'Financing secured against eligible assets such as property, equipment or inventory, enabling businesses to unlock higher funding amounts.',
    benefits: [
      'Higher funding amounts backed by eligible collateral.',
      'Use assets you already own to finance growth.',
      'Transparent collateral valuation and terms.',
      'Flexible repayment options aligned to your cash flow.',
    ],
    howItWorks: [
      'Identify the eligible asset you wish to use as collateral.',
      'Submit asset ownership documents with your application.',
      'Our team reviews the application and arranges collateral valuation.',
      'Receive a financing decision based on the verified asset value.',
    ],
    eligibility: [
      'Eligible collateral with clear ownership documentation.',
      'Registered business or verifiable enterprise in Nigeria.',
      'Valid government-issued identification.',
      'Asset must meet the institution\'s valuation and acceptability criteria.',
    ],
    documents: [
      'Government-issued ID of the applicant(s).',
      'Proof of ownership of the collateral (title documents, registration, etc.).',
      'Collateral valuation documents where available.',
      'Business registration documents (where applicable).',
      'Recent bank statements or financial records.',
    ],
    faqs: [
      {
        question: 'What assets can be used as collateral?',
        answer:
          'Eligible assets may include property, equipment, inventory or other assets acceptable to the institution. Final acceptability is confirmed during credit review.',
      },
      {
        question: 'Do I lose ownership of my asset?',
        answer:
          'No. The asset is used as security for the financing; ownership remains with you subject to the financing agreement terms.',
      },
    ],
    related: ['equipment-finance', 'sme-business-loans'],
  },
  'equipment-finance': {
    id: 'equipment-finance',
    name: 'Equipment Finance',
    tagline: 'Acquire machinery, tools and other productive assets to grow your operations.',
    description:
      'Financing to help businesses acquire machinery, tools, vehicles and other productive assets without paying the full cost upfront.',
    benefits: [
      'Acquire productive assets while preserving working capital.',
      'Financing structured around the useful life of the equipment.',
      'Supports business expansion and operational efficiency.',
      'Transparent repayment schedule.',
    ],
    howItWorks: [
      'Select the equipment you want to acquire and get a vendor quotation.',
      'Submit your equipment finance application with supporting documents.',
      'Our team reviews the application and equipment details.',
      'Funds are disbursed to support the equipment acquisition.',
    ],
    eligibility: [
      'Registered business operating in Nigeria.',
      'Valid vendor quotation or proforma invoice for the equipment.',
      'Valid government-issued identification.',
      'Business and financial records showing ability to repay.',
    ],
    documents: [
      'Government-issued ID of the applicant(s).',
      'Vendor quotation or proforma invoice for the equipment.',
      'Business registration documents.',
      'Bank statements or financial records (last 3–6 months).',
      'Proof of business address.',
    ],
    faqs: [
      {
        question: 'Can I finance used equipment?',
        answer:
          'Equipment eligibility is assessed case by case based on age, condition and value. Speak with our team about your specific equipment.',
      },
    ],
    related: ['sme-business-loans', 'working-capital-finance'],
  },
  'working-capital-finance': {
    id: 'working-capital-finance',
    name: 'Working Capital Finance',
    tagline: 'Keep your business running smoothly with short-term financing.',
    description:
      'Short-term financing to cover daily operational expenses, manage cash flow gaps and keep your business running between receivables.',
    benefits: [
      'Fast access to working capital for daily operations.',
      'Short-term tenor matched to your business cycle.',
      'Helps cover payroll, rent, inventory and supplier payments.',
      'Simple application with quick review.',
    ],
    howItWorks: [
      'Apply for the working capital amount your business needs.',
      'Submit business and financial information for review.',
      'Our credit team assesses your cash flow and repayment ability.',
      'Funds are disbursed to your business account upon approval.',
    ],
    eligibility: [
      'Registered business with verifiable trading history.',
      'Valid government-issued identification.',
      'Business bank statements showing cash flow.',
      'Acceptable credit and affordability assessment.',
    ],
    documents: [
      'Government-issued ID of the applicant(s).',
      'Business registration documents.',
      'Business bank statements (last 3–6 months).',
      'Proof of business address.',
      'Any additional documents requested during credit review.',
    ],
    faqs: [
      {
        question: 'How quickly can I get working capital?',
        answer:
          'Turnaround depends on document verification and credit review. We do not publish guaranteed timelines until confirmed by the business.',
      },
    ],
    related: ['sme-business-loans', 'asset-backed-finance'],
  },
}

export const productList = Object.values(financingProducts)
