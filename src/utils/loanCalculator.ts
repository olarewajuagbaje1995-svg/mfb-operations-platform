// Responsibility: repayment math for loan products, shared between the
// staff settings page and the public application form.
export type InterestMethod = 'flat' | 'reducing_balance'

export interface LoanCalculation {
  principal: number
  totalInterest: number
  processingFee: number
  monthlyRepayment: number
  totalRepayment: number
}

export function calculateLoan(
  principal: number,
  annualRatePercent: number,
  termMonths: number,
  interestMethod: string,
  processingFeePercent?: number,
): LoanCalculation {
  const p = Number(principal) || 0
  const rate = Number(annualRatePercent) || 0
  const months = Number(termMonths) || 0
  const feePercent = Number(processingFeePercent) || 0

  let totalInterest = 0
  let monthlyRepayment = 0
  let totalRepayment = 0

  const method = (interestMethod || 'flat').toLowerCase() as InterestMethod

  if (method === 'reducing_balance') {
    const r = (rate / 100) / 12
    if (r === 0) {
      monthlyRepayment = months > 0 ? p / months : 0
      totalRepayment = p
      totalInterest = 0
    } else {
      const pow = Math.pow(1 + r, months)
      monthlyRepayment = p * ((r * pow) / (pow - 1))
      totalRepayment = monthlyRepayment * months
      totalInterest = totalRepayment - p
    }
  } else {
    // Flat rate (default)
    totalInterest = p * (rate / 100) * (months / 12)
    totalRepayment = p + totalInterest
    monthlyRepayment = months > 0 ? totalRepayment / months : 0
  }

  const processingFee = p * (feePercent / 100)

  return {
    principal: p,
    totalInterest,
    processingFee,
    monthlyRepayment,
    totalRepayment,
  }
}
