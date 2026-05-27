import { content } from '@/content'
import ContentEditorClient from './ContentEditorClient'

export const metadata = { robots: 'noindex, nofollow' }

export default function ContentPage() {
  return <ContentEditorClient initialData={content} />
}
