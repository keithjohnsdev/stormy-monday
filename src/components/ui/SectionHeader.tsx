interface Props {
  eyebrow?: string
  heading: string
  subheading?: string
  center?: boolean
}

export default function SectionHeader({ eyebrow, heading, subheading, center = false }: Props) {
  return (
    <div className={center ? 'text-center' : ''}>
      {eyebrow && (
        <p className="text-xs tracking-widest uppercase text-storm-gold mb-3">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl md:text-4xl text-storm-cream">{heading}</h2>
      <div className={`gold-divider ${center ? 'mx-auto' : ''}`} />
      {subheading && (
        <p className="text-storm-muted leading-relaxed max-w-xl">{subheading}</p>
      )}
    </div>
  )
}
