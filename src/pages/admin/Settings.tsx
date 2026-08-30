import React, { useState } from 'react';
import { toast } from 'sonner';
import { SaveIcon } from 'lucide-react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Button } from '../../components/ui/Button';
import { Field, Select, TextInput } from '../../components/ui/Field';
import { Panel, PanelHeader } from '../../components/ui/States';
import { SegmentedControl, Switch } from '../../components/ui/Switch';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface PlatformSettings {
  institution: string;
  supportEmail: string;
  defaultDuration: number;
  defaultPassingScore: number;
  negativeMarking: boolean;
  requireAcknowledgement: boolean;
  sessionTimeoutMinutes: number;
  twoFactor: boolean;
  auditRetentionDays: number;
}

const initialSettings: PlatformSettings = {
  institution: 'Northfield Institute of Technology',
  supportEmail: 'assessments@northfield.edu',
  defaultDuration: 60,
  defaultPassingScore: 60,
  negativeMarking: true,
  requireAcknowledgement: true,
  sessionTimeoutMinutes: 30,
  twoFactor: false,
  auditRetentionDays: 365
};

export function Settings() {
  const { admin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings);
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(settings) !== JSON.stringify(initialSettings);
  const set = <K extends keyof PlatformSettings,>(key: K, value: PlatformSettings[K]) =>
  setSettings((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
    toast.success('Settings saved');
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Platform defaults, appearance, and administrator security."
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Settings' }]}
        actions={
        <Button variant="primary" disabled={!dirty} loading={saving} onClick={() => void save()}>
            <SaveIcon aria-hidden className="h-4 w-4" />
            Save settings
          </Button>
        } />
      

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Organisation" description="Shown on candidate-facing screens and emails" />
            <div className="space-y-4 p-5">
              <Field label="Institution name">
                {({ id }) =>
                <TextInput id={id} value={settings.institution} onChange={(event) => set('institution', event.target.value)} />
                }
              </Field>
              <Field label="Support email" hint="Candidates are directed here when they cannot enter an exam.">
                {({ id }) =>
                <TextInput
                  id={id}
                  type="email"
                  value={settings.supportEmail}
                  onChange={(event) => set('supportEmail', event.target.value)} />

                }
              </Field>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Appearance" description="Applies to the administrator console and exam portal" />
            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm font-medium text-ink">Theme</p>
                <p className="mt-0.5 text-xs text-muted">Dark mode keeps the red accent and raises surface contrast.</p>
              </div>
              <SegmentedControl
                label="Theme"
                value={theme}
                onChange={(next) => {
                  if (next !== theme) toggleTheme();
                }}
                options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' }]
                } />
              
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHeader title="Examination defaults" description="Applied to every newly created examination" />
            <div className="p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Default duration (minutes)">
                  {({ id }) =>
                  <TextInput
                    id={id}
                    type="number"
                    min={1}
                    value={settings.defaultDuration}
                    onChange={(event) => set('defaultDuration', Math.max(1, Number(event.target.value) || 1))} />

                  }
                </Field>
                <Field label="Default passing score (%)">
                  {({ id }) =>
                  <TextInput
                    id={id}
                    type="number"
                    min={1}
                    max={100}
                    value={settings.defaultPassingScore}
                    onChange={(event) =>
                    set('defaultPassingScore', Math.min(100, Math.max(1, Number(event.target.value) || 1)))
                    } />

                  }
                </Field>
              </div>
              <div className="mt-2 divide-y divide-line border-t border-line">
                <Switch
                  label="Negative marking on by default"
                  checked={settings.negativeMarking}
                  onChange={(value) => set('negativeMarking', value)} />
                
                <Switch
                  label="Require instruction acknowledgement"
                  description="Candidates must confirm they have read the instructions before the timer starts."
                  checked={settings.requireAcknowledgement}
                  onChange={(value) => set('requireAcknowledgement', value)} />
                
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Administrator security" description="Applies to console sessions and audit logging" />
            <div className="p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Session timeout">
                  {({ id }) =>
                  <Select
                    id={id}
                    value={String(settings.sessionTimeoutMinutes)}
                    onChange={(event) => set('sessionTimeoutMinutes', Number(event.target.value))}>
                    
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="480">8 hours</option>
                    </Select>
                  }
                </Field>
                <Field label="Audit log retention">
                  {({ id }) =>
                  <Select
                    id={id}
                    value={String(settings.auditRetentionDays)}
                    onChange={(event) => set('auditRetentionDays', Number(event.target.value))}>
                    
                      <option value="90">90 days</option>
                      <option value="365">1 year</option>
                      <option value="1095">3 years</option>
                    </Select>
                  }
                </Field>
              </div>
              <div className="mt-2 divide-y divide-line border-t border-line">
                <Switch
                  label="Require two-factor authentication"
                  description="Administrators must confirm sign-in with an authenticator app."
                  checked={settings.twoFactor}
                  onChange={(value) => set('twoFactor', value)} />
                
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Signed in as" />
            <dl className="divide-y divide-line">
              {[
              ['Name', admin?.name ?? '—'],
              ['Email', admin?.email ?? '—'],
              ['Role', admin?.role ?? '—']].
              map(([label, value]) =>
              <div key={label} className="flex items-center justify-between gap-4 px-5 py-3">
                  <dt className="text-sm text-muted">{label}</dt>
                  <dd className="text-sm font-medium text-ink">{value}</dd>
                </div>
              )}
            </dl>
          </Panel>
        </div>
      </div>
    </>);

}