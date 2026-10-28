import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

// Responsibility: Public banking homepage for Merit Microfinance Bank Nigeria (MFBn).

const formatNaira = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)

const products = [
  {
    number: '01',
    title: 'Business Growth Loan',
    category: 'FOR ENTERPRISES & TRADERS',
    description:
      'Expand your stock, upgrade your shop, or scale your trade with flexible working capital.',
    icon: '📈',
    tone: 'bg-emerald-50 text-emerald-800',
    href: '/products',
  },
  {
    number: '02',
    title: 'SME Working Capital',
    category: 'FOR SMALL BUSINESSES',
    description:
      'Smooth out cash flow fluctuations and manage daily operational expenses effortlessly.',
    icon: '⚡',
    tone: 'bg-amber-50 text-amber-800',
    href: '/products',
  },
  {
    number: '03',
    title: 'Personal Advance',
    category: 'FOR SALARIED & INDIVIDUALS',
    description:
      'Quick financial support for urgent personal needs, school fees, or planned milestones.',
    icon: '💼',
    tone: 'bg-blue-50 text-blue-800',
    href: '/products',
  },
]

const dailyTips = [
  {
    category: 'TRADER WISDOM',
    title: 'Separate your daily market sales from personal cash.',
    body:
      'Always keep a clear record of what comes in and what goes out. Knowing your exact profit helps your business grow sustainably.',
    action: 'Review your business cash flow',
  },
  {
    category: 'SMART BORROWING',
    title: 'Borrow with a clear repayment plan in mind.',
    body:
      'Match your loan tenure with your cash cycle so that repayments never put pressure on your daily livelihood.',
    action: 'Try the repayment calculator',
  },
  {
    category: 'SAVINGS HABIT',
    title: 'Consistency beats size when building capital.',
    body:
      'Putting aside even a small amount daily adds up to significant capital for your next big stock purchase.',
    action: 'Explore savings goals',
  },
]

const faqs = [
  {
    question: 'Who is eligible for a Merit MFBn loan?',
    answer:
      'Any verified business owner, trader, or salary earner with valid identification and a steady income source can apply.',
  },
  {
    question: 'What documents do I need to submit?',
    answer:
      'You will typically need a valid government-issued ID, proof of address, and recent bank statements or business records.',
  },
  {
    question: 'How fast is loan disbursement?',
    answer:
      'Once your application clears credit verification and final approval, funds are disbursed directly into your bank account within 24 to 48 hours.',
  },
  {
    question: 'How can I track my loan application?',
    answer:
      'Use our online Tracking portal with your unique application reference and tracking code to view live status updates instantly.',
  },
]

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string
  title: string
  description: string
  centered?: boolean
}) {
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted sm:text-base">{description}</p>
    </div>
  )
}

export default function HomePage() {
  const [amount, setAmount] = useState(500000)
  const [months, setMonths] = useState(6)
  const [monthlyRate, setMonthlyRate] = useState(3)
  const [calculationMethod, setCalculationMethod] = useState<'flat' | 'reducing'>('reducing')
  const [activeWorkflowTab, setActiveWorkflowTab] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const dailyTip = useMemo(() => {
    const dayNumber = Math.floor(Date.now() / 86400000)
    return dailyTips[dayNumber % dailyTips.length]
  }, [])

  const repayment = useMemo(() => {
    const principal = amount
    const monthlyInterestRate = monthlyRate / 100

    if (calculationMethod === 'flat') {
      const totalInterest = principal * monthlyInterestRate * months
      return {
        monthly: (principal + totalInterest) / months,
        total: principal + totalInterest,
        interest: totalInterest,
      }
    }

    if (monthlyInterestRate === 0) {
      return {
        monthly: principal / months,
        total: principal,
        interest: 0,
      }
    }

    const monthly =
      (principal * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -months))

    return {
      monthly,
      total: monthly * months,
      interest: monthly * months - principal,
    }
  }, [amount, months, monthlyRate, calculationMethod])

  const workflowSteps = [
    {
      title: '1. Apply Online',
      desc: 'Fill out our straightforward digital form with your business or personal details in under 5 minutes.',
      icon: '📝',
    },
    {
      title: '2. Upload Documents',
      desc: 'Securely upload your identification and supporting documents right from your phone or computer.',
      icon: '📄',
    },
    {
      title: '3. Fast Credit Review',
      desc: 'Our credit experts evaluate your application promptly with transparent criteria.',
      icon: '⚡',
    },
    {
      title: '4. Direct Disbursement',
      desc: 'Get approved and receive funds instantly into your bank account to power your goals.',
      icon: '🎉',
    },
  ]

  return (
    <main className="space-y-12 overflow-hidden pb-16 sm:space-y-16">
      {/* HERO SECTION */}
      <section className="relative isolate pt-6 pb-12 sm:pt-10 sm:pb-16 bg-gradient-to-br from-stone-50 via-white to-emerald-50/60 border-b border-slate-100">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Merit Microfinance Bank Nigeria (MFBn) — Licensed & Trusted
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl lg:text-5xl leading-tight">
              Empowering Nigerian entrepreneurs & <span className="text-emerald-700">growing businesses.</span>
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              From local market traders to expanding SMEs and salaried professionals, <strong className="text-navy-900">Merit MFBn</strong> delivers fast, reliable, and transparent financial solutions designed for your success.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/apply"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-900/10 transition hover:bg-emerald-800"
              >
                Apply For a Loan →
              </Link>
              <Link
                to="/track"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-navy-900 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                Track Application
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-6 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">✓ Zero Hidden Fees</span>
              <span className="flex items-center gap-1.5">✓ 24-48hr Disbursement</span>
              <span className="flex items-center gap-1.5">✓ Secure & Confidential</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl shadow-lg border border-white">
                  <img
                    src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=700&q=80"
                    alt="Confident African business woman entrepreneur"
                    className="h-44 w-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="overflow-hidden rounded-2xl shadow-lg border border-white bg-navy-900 p-5 text-white flex flex-col justify-center">
                  <p className="text-2xl font-bold text-emerald-400">₦2B+</p>
                  <p className="text-xs text-slate-300 mt-1">Disbursed to local traders & growing businesses</p>
                </div>
              </div>
              <div className="space-y-4 pt-6">
                <div className="overflow-hidden rounded-2xl shadow-lg border border-white bg-emerald-800 p-5 text-white flex flex-col justify-center">
                  <p className="text-xl font-bold">Fast Approval</p>
                  <p className="text-xs text-emerald-100 mt-1">Get credit decisions quickly without stress.</p>
                </div>
                <div className="overflow-hidden rounded-2xl shadow-lg border border-white">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80"
                    alt="Corporate African professional in modern office"
                    className="h-44 w-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST HIGHLIGHTS BAR */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:grid-cols-3">
          {[
            { icon: '🇳🇬', title: 'Proudly Nigerian', text: 'Tailored specifically for the realities of local commerce and enterprise.' },
            { icon: '🔒', title: 'Secure & Licensed', text: 'Strict adherence to microfinance banking standards and data protection.' },
            { icon: '🤝', title: 'Dedicated Support', text: 'Friendly loan advisors ready to guide you through every milestone.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-2">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-navy-900">{item.title}</h3>
                <p className="mt-0.5 text-xs text-muted leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ROOTED IN OUR COMMUNITIES SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Rooted in Our Communities"
          title="From the local market to the corporate office."
          description="Nigeria runs on the ambition of its people. We are building a banking experience that understands the trader opening her shop at dawn, the entrepreneur managing a growing team, and the professional planning the next step."
        />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=85"
                alt="Small-business owners working together"
                loading="lazy"
                className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Small businesses</p>
              <h3 className="mt-2 text-lg font-bold text-navy-900">Support for everyday enterprise</h3>
              <p className="mt-2 text-sm leading-6 text-muted">For shop owners, service providers, and entrepreneurs building something that lasts.</p>
            </div>
          </article>

          <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=85"
                alt="Fresh produce at a busy food market"
                loading="lazy"
                className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Market traders</p>
              <h3 className="mt-2 text-lg font-bold text-navy-900">Finance that understands trade</h3>
              <p className="mt-2 text-sm leading-6 text-muted">Designed around the realities of buying stock, serving customers, and managing daily cash flow.</p>
            </div>
          </article>

          <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=85"
                alt="A diverse team collaborating in a workplace"
                loading="lazy"
                className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Growing teams</p>
              <h3 className="mt-2 text-lg font-bold text-navy-900">Room to grow with confidence</h3>
              <p className="mt-2 text-sm leading-6 text-muted">For businesses ready to improve operations, invest in people, and serve more customers.</p>
            </div>
          </article>

          <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=85"
                alt="Professional woman in business attire"
                loading="lazy"
                className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Professionals</p>
              <h3 className="mt-2 text-lg font-bold text-navy-900">A partner for your next move</h3>
              <p className="mt-2 text-sm leading-6 text-muted">Practical financial options for salaried customers balancing responsibilities and future goals.</p>
            </div>
          </article>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Our Loan Portfolio"
            title="Financial products built for your goals."
            description="Explore straightforward loan options designed to support your trade, business expansion, or personal needs."
          />
          <Link to="/products" className="text-sm font-semibold text-emerald-800 hover:text-emerald-950">
            View all products →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {products.map((product) => (
            <div key={product.number} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${product.tone}`}>
                  {product.icon}
                </span>
                <span className="text-xs font-bold text-slate-300">{product.number}</span>
              </div>
              <p className="mt-5 text-[10px] font-bold tracking-wider text-emerald-800">{product.category}</p>
              <h3 className="mt-1.5 text-xl font-bold text-navy-900">{product.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">{product.description}</p>
              <Link to={product.href} className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 hover:text-emerald-800">
                Learn more & requirements →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* REPAYMENT ESTIMATOR TOOL */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                Interactive Tool
              </span>
              <h2 className="mt-3 text-2xl font-bold text-navy-900 sm:text-3xl">
                Plan your loan repayment with absolute clarity.
              </h2>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                Slide and adjust your loan amount and tenure to estimate your monthly instalments instantly before applying.
              </p>

              <div className="mt-6 space-y-3">
                {['No hidden processing surprises', 'Transparent reducing-balance calculations', 'Flexible repayment timelines'].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <span className="text-emerald-700 font-bold">✓</span> {t}
                  </div>
                ))}
              </div>

              <Link to="/apply" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">
                Start Your Application Now →
              </Link>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 sm:p-6">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span>Requested Amount</span>
                  <span className="text-base font-bold text-navy-900">{formatNaira(amount)}</span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={2000000}
                  step={50000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-3 w-full accent-emerald-700 cursor-pointer"
                />
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span>Monthly Interest Rate</span>
                  <span className="font-bold text-navy-900">{monthlyRate}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={0.5}
                  value={monthlyRate}
                  onChange={(e) => setMonthlyRate(Number(e.target.value))}
                  className="mt-3 w-full accent-emerald-700 cursor-pointer"
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-700">Tenure (Months)</label>
                  <select
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-navy-900 outline-none focus:border-emerald-600"
                  >
                    {[3, 6, 9, 12, 18, 24].map((m) => (
                      <option key={m} value={m}>{m} months</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">Method</label>
                  <select
                    value={calculationMethod}
                    onChange={(e) => setCalculationMethod(e.target.value as 'flat' | 'reducing')}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-navy-900 outline-none focus:border-emerald-600"
                  >
                    <option value="reducing">Reducing balance</option>
                    <option value="flat">Flat rate</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-navy-900 p-4 text-white">
                <p className="text-[11px] text-slate-300">Estimated Monthly Instalment</p>
                <p className="mt-1 text-2xl font-bold">{formatNaira(repayment.monthly)}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-xs">
                  <div>
                    <span className="text-slate-400">Total Repayment:</span>
                    <p className="font-semibold">{formatNaira(repayment.total)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Interest:</span>
                    <p className="font-semibold">{formatNaira(repayment.interest)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC WORKFLOW SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Simple Workflow"
          title="How to get funded in 4 easy steps."
          description="We made our digital onboarding frictionless so you can focus on growing your trade."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((step, idx) => (
            <div
              key={step.title}
              onClick={() => setActiveWorkflowTab(idx)}
              className={`cursor-pointer rounded-2xl border p-5 transition duration-200 ${
                activeWorkflowTab === idx
                  ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-1 ring-emerald-600'
                  : 'border-slate-200 bg-white hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{step.icon}</span>
                <span className="text-xs font-bold text-slate-400">0{idx + 1}</span>
              </div>
              <h3 className="mt-4 font-bold text-navy-900">{step.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DAILY TIP STRIP */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-900 text-white p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="rounded-full bg-emerald-800 px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-200 uppercase">
                {dailyTip.category}
              </span>
              <h3 className="mt-3 text-xl font-bold sm:text-2xl">{dailyTip.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-200 sm:text-sm max-w-2xl">
                {dailyTip.body}
              </p>
            </div>
            <div>
              <Link to="/products" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-navy-900 transition hover:bg-emerald-50 shadow-sm">
                {dailyTip.action} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Got Questions?"
          title="Frequently asked questions."
          description="Everything you need to know about our microfinance loans and support."
          centered
        />

        <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div key={faq.question} className="py-1">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-navy-900"
                >
                  <span>{faq.question}</span>
                  <span className="text-lg">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <p className="pb-4 text-xs leading-relaxed text-muted">
                    {faq.answer}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}