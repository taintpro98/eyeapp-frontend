import { PageHeader } from '@/components/PageHeader'
import { SectionCard } from '@/components/SectionCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PlanBadge } from '@/components/PlanBadge'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchBootstrap } from '@/api/bootstrap'

export function SettingsPage() {
  const navigate = useNavigate()
  const { data: bootstrap } = useQuery({ queryKey: ['bootstrap'], queryFn: fetchBootstrap })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      <SectionCard title="Profile" subtitle="Your account information">
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium text-text-secondary">Display name</label>
            <Input
              defaultValue={bootstrap?.user.displayName}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">Email</label>
            <Input
              placeholder="alex@example.com"
              type="email"
              className="mt-1"
            />
          </div>
          <Button>Save changes</Button>
        </div>
      </SectionCard>

      <SectionCard title="Security" subtitle="Password and authentication">
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium text-text-secondary">Current password</label>
            <Input type="password" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">New password</label>
            <Input type="password" className="mt-1" />
          </div>
          <Button variant="outline">Update password</Button>
        </div>
      </SectionCard>

      <SectionCard title="Plan & Entitlements" subtitle="Your subscription summary">
        <div className="flex items-center gap-3">
          <PlanBadge
            label={bootstrap?.subscription.planCode ?? 'free'}
            variant={
              bootstrap?.subscription.planCode === 'pro'
                ? 'pro'
                : bootstrap?.subscription.planCode === 'premium'
                ? 'premium'
                : 'default'
            }
          />
          <span className="text-sm text-text-secondary">
            Status: {bootstrap?.subscription.status}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigate('/app/billing')}>
            Manage billing
          </Button>
        </div>
      </SectionCard>
    </div>
  )
}
