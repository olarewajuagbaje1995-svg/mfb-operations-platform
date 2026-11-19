import { ShieldCheck, Users, Target, Handshake } from 'lucide-react'

interface TrustIndicatorProps {
  icon: React.ElementType
  title: string
  text: string
}

// Responsibility: single trust benefit row with icon.
export function TrustIndicator({ icon: Icon, title, text }: TrustIndicatorProps) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-pale text-brand-gold">
        <Icon size={22} />
      </div>
      <div>
        <h3 className="font-bold text-brand-navy">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-brand-text-secondary">{text}</p>
      </div>
    </div>
  )
}

export const TRUST_INDICATORS: TrustIndicatorProps[] = [
  {
    icon: ShieldCheck,
    title: 'Trusted & Transparent',
    text: 'Clear terms and responsible financing you can rely on.',
  },
  {
    icon: Users,
    title: 'Efficient Processing',
    text: 'A transparent application and review process built around your business.',
  },
  {
    icon: Target,
    title: 'Dedicated Support',
    text: 'Professional assistance for customers at every stage.',
  },
  {
    icon: Handshake,
    title: 'Secure & Compliant',
    text: 'Responsible handling of your personal and business information.',
  },
]
