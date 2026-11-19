import { useState } from 'react'
import { brand } from '../../config/brand'

interface BrandLogoProps {
  variant?: 'primary' | 'white'
  height?: number
  className?: string
}

// Responsibility: reusable CLOBAN FINANCE logo. Uses the official image when available,
// falls back to a text treatment when the image fails to load. Replace the files under
// public/brand/ to update the logo everywhere it is used.
export default function BrandLogo({
  variant = 'primary',
  height = 58,
  className = '',
}: BrandLogoProps) {
  const [srcIndex, setSrcIndex] = useState(0)
  const [imageFailed, setImageFailed] = useState(false)

  // Primary brand image first, then the SVG fallback, then a text treatment.
  const sources = variant === 'white'
    ? [brand.logo.white, brand.logo.fallback]
    : [brand.logo.primary, brand.logo.fallback]
  const logoSrc = sources[srcIndex]

  if (imageFailed) {
    return (
      <span
        className={className}
        style={{
          color: variant === 'white' ? '#FFFFFF' : brand.colors.navy,
          fontWeight: 800,
          fontSize: 22,
          fontFamily: 'Manrope, sans-serif',
          letterSpacing: '-0.02em',
          display: 'block',
          whiteSpace: 'nowrap',
        }}
      >
        {brand.name}
      </span>
    )
  }

  return (
    <img
      src={logoSrc}
      alt={brand.name}
      height={height}
      className={className}
      style={{
        width: 'auto',
        maxWidth: '100%',
        height,
        objectFit: 'contain',
        display: 'block',
      }}
      onError={() => {
        if (srcIndex < sources.length - 1) {
          setSrcIndex(srcIndex + 1)
        } else {
          setImageFailed(true)
        }
      }}
    />
  )
}
