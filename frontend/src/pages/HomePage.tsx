import { Hero } from '@/components/homepage/Hero'
import { AnnouncementTicker } from '@/components/homepage/AnnouncementTicker'
import { LibraryCTA } from '@/components/homepage/LibraryCTA'
import { IIIA_ANNOUNCEMENTS } from '@/data/iiia'

export function HomePage() {
  return (
    <>
      <Hero />
      <AnnouncementTicker announcements={IIIA_ANNOUNCEMENTS} />
      <LibraryCTA />
    </>
  )
}
