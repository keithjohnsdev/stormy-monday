import { getUpcomingShows } from '@/lib/shows'
import { getUpcomingEvents } from '@/lib/events'
import Hero from '@/components/home/Hero'
import InfoStrip from '@/components/home/InfoStrip'
import UpcomingShows from '@/components/home/UpcomingShows'
import PressStrip from '@/components/home/PressStrip'

export default function HomePage() {
  const shows  = getUpcomingShows()
  const events = getUpcomingEvents()

  return (
    <>
      <Hero />
      <InfoStrip />
      <UpcomingShows shows={shows} events={events} />
      <PressStrip />
    </>
  )
}
