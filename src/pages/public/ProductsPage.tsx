import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActiveProducts, getPublicOrg } from '@/services/publicApi'
import { supabase } from '@/lib/supabase'
import { Spinner, Alert, EmptyState } from '@/components/feedback'
import { formatNaira } from '@/utils/format'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loanTypes, setLoanTypes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All Products')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const org = await getPublicOrg('demo-mfb')
        const orgId = org?.id || 'demo-mfb'

        const [productsData, typesRes] = await Promise.all([
          getActiveProducts(orgId),
          supabase.from('loan_types').select('*')
        ])

        setProducts(productsData || [])
        setLoanTypes(typesRes.data || [])
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Failed to load loan products.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Robust category resolver: If it's MSA-01 or Salary Advance, force "Salary"
  const getProductCategory = (p: any) => {
    if (p.code === 'MSA-01' || (p.name && p.name.toLowerCase().includes('salary'))) {
      return 'Salary'
    }
    return p.category || p.type || p.product_type || 'Salary'
  }

  // Build dynamic categories list
  const categoryNames = [
    ...loanTypes.map((t) => t.name?.trim()),
    ...products.map((p) => getProductCategory(p)?.trim())
  ].filter(Boolean)

  const dynamicCategories = ['All Products', ...Array.from(new Set(categoryNames))]

  // Bulletproof filtering for category & search
  const filteredProducts = products.filter((product) => {
    const prodCat = getProductCategory(product).trim().toLowerCase()
    const selectedCat = selectedCategory.trim().toLowerCase()
    const q = searchQuery.toLowerCase().trim()

    if (q) {
      return (
        (product.name && product.name.toLowerCase().includes(q)) ||
        (product.code && product.code.toLowerCase().includes(q)) ||
        (product.description && product.description.toLowerCase().includes(q)) ||
        prodCat.includes(q)
      )
    }

    if (selectedCat === 'all products') return true
    return prodCat === selectedCat
  })

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FAF9]">
        <Spinner label="Loading available loan products..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FBFA] pb-24 space-y-16">
      
      {/* SECTION 1: RADIANT HERO */}
      <div className="relative w-full bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 py-20 sm:py-28 text-white overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[600px] h-[600px] rounded-full bg-teal-400/15 blur-3xl pointer-events-none" />

        <div className="w-full px-4 sm:px-8 lg:px-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2.5 rounded-full bg-emerald-700/80 px-4 py-2 text-xs font-bold text-emerald-100 border border-emerald-500/40 shadow-lg backdrop-blur-md">
                <span className="text-sm animate-bounce">🇳🇬</span>
                <span>Merit Microfinance Bank Nigeria • Financial Growth</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
                Achieve more with <span className="text-emerald-300 underline decoration-emerald-400/50 underline-offset-8">joyful</span> financing.
              </h1>
              
              <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal max-w-2xl">
                Empowering your ambitions with fast, transparent, and friendly micro-loans designed to celebrate every step of your personal or business success.
              </p>

              <div className="pt-4 flex flex-wrap gap-4">
                <a 
                  href="#products-grid" 
                  className="rounded-2xl bg-white text-emerald-950 font-extrabold px-8 py-4 text-sm shadow-xl hover:bg-emerald-50 transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
                >
                  Explore loan products <span>↓</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white/25 group transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=900" 
                  alt="Happy Nigerian Business Owner" 
                  className="w-full h-[400px] object-cover object-top transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: CATALOGUE WITH SEARCH & CATEGORY PILLS */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10" id="products-grid">
        
        <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/80 pb-6">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Transparent Offers</span>
              <h2 className="text-2xl sm:text-3xl font-black text-navy-900 mt-1">Explore available loans</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">Search by keyword or select a category below.</p>
            </div>

            {/* LIVE SEARCH BAR */}
            <div className="w-full md:w-80">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search products by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-10 text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {dynamicCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat)
                  setSearchQuery('')
                }}
                className={`rounded-full px-6 py-3 text-xs font-bold capitalize transition-all shadow-sm ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 scale-105' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        {error ? (
          <div className="mx-auto max-w-2xl">
            <Alert tone="error">{error}</Alert>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mx-auto max-w-xl py-12">
            <EmptyState 
              title="No matching loan products" 
              description="No active loan products match your search query or selected category filter. Try clearing your search or selecting 'All Products'."
            />
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group"
              >
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center justify-center rounded-xl bg-emerald-50 px-3.5 py-1.5 text-xs font-extrabold text-emerald-800 border border-emerald-100">
                      {product.code}
                    </span>
                    <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-100">
                      {getProductCategory(product)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-navy-900 group-hover:text-emerald-700 transition-colors">{product.name}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-3">
                      {product.description || 'Flexible credit solution designed to support your financial objectives.'}
                    </p>
                  </div>

                  <div className="space-y-3.5 rounded-2xl bg-emerald-50/40 p-4 border border-emerald-100/60">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Amount Range</span>
                      <span className="font-bold text-navy-900 font-mono">
                        {formatNaira(product.min_amount)} - {formatNaira(product.max_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Repayment Term</span>
                      <span className="font-bold text-navy-900">
                        {product.min_term_months} - {product.max_term_months} months
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Interest Rate</span>
                      <span className="font-bold text-emerald-800">
                        {product.annual_interest_pct}% / yr ({product.interest_method})
                      </span>
                    </div>
                  </div>

                  {product.eligibility_notes && (
                    <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 text-xs text-slate-700 space-y-0.5">
                      <p className="font-bold text-[10px] uppercase tracking-wider text-slate-500">Eligibility Note</p>
                      <p className="text-[11px] leading-relaxed line-clamp-2">{product.eligibility_notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-slate-100 bg-slate-50/80 p-6">
                  <Link 
                    to={`/apply?product=${product.id}`}
                    className="flex w-full items-center justify-center rounded-2xl bg-emerald-700 hover:bg-emerald-800 px-4 py-4 text-xs font-bold text-white shadow-lg shadow-emerald-900/10 transition-all hover:scale-[1.02]"
                  >
                    View details & apply →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}