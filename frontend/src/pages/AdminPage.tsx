import { useState } from 'react'
import { AnnouncementsManager } from '@/components/admin/AnnouncementsManager'
import { ModuleManager } from '@/components/admin/ModuleManager'
import { PendingQueue } from '@/components/admin/PendingQueue'
import { ResourceManager } from '@/components/admin/ResourceManager'
import { ResourceUploadManager } from '@/components/admin/ResourceUploadManager'
import { TimetableManager } from '@/components/admin/TimetableManager'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { MockBadge } from '@/components/feedback'
import {
  BookOpenIcon,
  CalendarIcon,
  FileTextIcon,
  GraduationCapIcon,
  MegaphoneIcon,
  UploadIcon,
} from '@/components/icons'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import {
  useAdminAnnouncements,
  useAdminMutations,
  useAdminStats,
  usePendingSubmissions,
} from '@/hooks/useAdmin'
import { useI18n } from '@/i18n'

type AdminTab =
  | 'queue'
  | 'modules'
  | 'resources'
  | 'timetables'
  | 'announcements'

export function AdminPage() {
  const { token } = useAdminAuth()
  const { t } = useI18n()

  const [tab, setTab] = useState<AdminTab>('queue')
  const [version, setVersion] = useState(0)

  const statsQuery = useAdminStats(token!, version)
  const pendingQuery = usePendingSubmissions(token!, version)
  const announcementsQuery = useAdminAnnouncements(token!, version)

  const mutations = useAdminMutations(token!)
  const bump = () => setVersion((v) => v + 1)

  const stats = statsQuery.data
  const isDemo = statsQuery.isMock

  const tabs: {
    id: AdminTab
    label: string
    icon: React.ComponentType<{ className?: string }>
    count?: number | null
  }[] = [
    {
      id: 'queue',
      label: t('admin.tabQueue'),
      icon: FileTextIcon,
      count: (pendingQuery.data ?? []).length,
    },
    { id: 'modules', label: t('admin.tabModules'), icon: BookOpenIcon },
    { id: 'resources', label: t('admin.tabResources'), icon: UploadIcon },
    { id: 'timetables', label: t('admin.tabTimetables'), icon: CalendarIcon },
    { id: 'announcements', label: t('admin.tabAnnouncements'), icon: MegaphoneIcon },
  ]

  return (
    <section className="bg-apple-bg py-10 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <Breadcrumbs
          items={[
            { label: t('nav.home'), to: '/' },
            { label: t('admin.title') },
          ]}
        />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-apple-text-primary sm:text-4xl">
              {t('admin.title')}
            </h1>
            <p className="mt-2 text-lg text-apple-text-secondary">
              {t('admin.subtitle')}
            </p>
          </div>
          {isDemo && <MockBadge />}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <MetricCard
            icon={<BookOpenIcon className="h-5.5 w-5.5" />}
            tone="blue"
            label={t('admin.statResources')}
            value={stats ? stats.totalResources : '…'}
          />
          <MetricCard
            icon={<FileTextIcon className="h-5.5 w-5.5" />}
            tone="amber"
            label={t('admin.statPending')}
            value={stats ? stats.pendingReviews : '…'}
          />
          <MetricCard
            icon={<GraduationCapIcon className="h-5.5 w-5.5" />}
            tone="green"
            label={t('admin.statStudents')}
            value={stats ? stats.totalStudents : '…'}
          />
        </div>

        <div className="mt-10 flex flex-wrap gap-2 border-b border-apple-border/60 pb-6">
          {tabs.map((item) => {
            const isActive = tab === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'border-signal-light bg-signal-light text-apple-text-primary'
                    : 'border-apple-border bg-apple-card text-apple-text-secondary hover:border-signal-light hover:bg-signal-light/40 hover:text-apple-text-primary'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.count != null && item.count > 0 && (
                  <span className="rounded-full bg-apple-blue-light px-1.5 py-0.5 text-[10px] font-bold leading-none text-apple-text-primary">
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-10">
          {tab === 'queue' && (
            <PendingQueue
              submissions={pendingQuery.data ?? []}
              loading={pendingQuery.loading}
              error={pendingQuery.error}
              onApprove={async (id) => {
                await mutations.approveSubmission(id)
                bump()
              }}
              onReject={async (id) => {
                await mutations.rejectSubmission(id)
                bump()
              }}
              onPreview={(id) => mutations.previewSubmission(id)}
            />
          )}

          {tab === 'modules' && (
            <ModuleManager token={token!} version={version} onChanged={bump} />
          )}

          {tab === 'resources' && (
            <div className="space-y-8">
              <ResourceUploadManager
                token={token!}
                version={version}
                onUploaded={bump}
              />
              <ResourceManager token={token!} onChanged={bump} />
            </div>
          )}

          {tab === 'timetables' && (
            <TimetableManager token={token!} onChanged={bump} />
          )}

          {tab === 'announcements' && (
            <AnnouncementsManager
              announcements={announcementsQuery.data ?? []}
              loading={announcementsQuery.loading}
              error={announcementsQuery.error}
              onCreate={async (payload) => {
                await mutations.createAnnouncementEntry(payload)
                bump()
              }}
              onUpdate={async (id, payload) => {
                await mutations.updateAnnouncementEntry(id, payload)
                bump()
              }}
              onDelete={async (id) => {
                await mutations.deleteAnnouncementEntry(id)
                bump()
              }}
            />
          )}
        </div>
      </div>
    </section>
  )
}

function MetricCard({
  icon,
  tone,
  label,
  value,
}: {
  icon: React.ReactNode
  tone: 'blue' | 'amber' | 'green'
  label: string
  value: number | string
}) {
  const tones = {
    blue: 'bg-apple-blue-light text-apple-text-primary',
    amber: 'bg-apple-blue-light text-apple-text-primary',
    green: 'bg-apple-blue-light text-apple-text-primary',
  }
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-apple-border bg-apple-card p-8 shadow-sm">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
      >
        {icon}
      </span>
      <div>
        <p className="text-3xl font-extrabold text-apple-text-primary">{value}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-apple-text-secondary">
          {label}
        </p>
      </div>
    </div>
  )
}
