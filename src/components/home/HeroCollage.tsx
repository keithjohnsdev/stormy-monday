import Image from 'next/image'

// Sources: Miami New Times + TimeOut Miami (press photography, Cleveland Jennings)
// TODO: replace with James's own photography before launch
const photos = [
  {
    src: 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/2026/03/CP1A255401.jpg',
    alt: 'The bar at Stormy Monday, Miami Beach',
    className: 'absolute top-[4%] left-[3%] w-[60%] aspect-[4/3] z-10',
    animation: 'floatA 12s ease-in-out infinite',
    delay: '0s',
  },
  {
    src: 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/2026/03/stormy-monday-e1772473529632.png',
    alt: 'James MacInnes and Chef Seth Blumenthal',
    className: 'absolute top-[2%] right-[3%] w-[36%] aspect-[3/4] z-20',
    animation: 'floatB 14s ease-in-out infinite',
    delay: '-4s',
  },
  {
    src: 'https://www.miaminewtimes.com/wp-content/uploads/sites/4/2026/03/storymy-monday-2-e1772473503670.jpg',
    alt: 'Inside Stormy Monday, 820 Alton Road',
    className: 'absolute top-[44%] left-[7%] w-[52%] aspect-[4/3] z-10',
    animation: 'floatC 16s ease-in-out infinite',
    delay: '-7s',
  },
  {
    src: 'https://media.timeout.com/images/106379421/750/422/image.jpg',
    alt: 'Stormy Monday — as seen in TimeOut Miami',
    className: 'absolute bottom-[3%] right-[2%] w-[62%] aspect-[16/9] z-20',
    animation: 'floatD 13s ease-in-out infinite',
    delay: '-5s',
  },
]

export default function HeroCollage() {
  return (
    <div className="relative w-full h-full">
      {photos.map(({ src, alt, className, animation, delay }) => (
        <div
          key={src}
          className={`${className} overflow-hidden`}
          style={{
            animation,
            animationDelay: delay,
            boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
          }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="30vw"
          />
        </div>
      ))}
    </div>
  )
}
