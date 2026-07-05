import { useState } from 'react';
import {
  // Form & Input
  Button, Input, Textarea, Select, Checkbox, RadioGroup,
  Switch, SearchInput, FileUpload, DateTimeInput,
  // Data display
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Badge, StatusBadge,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Avatar, ProgressBar, StatCard, EmptyState, Skeleton,
  // Overlays & navigation
  Spinner, Modal, Tooltip,
  DropdownMenu, DropdownMenuItem,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Pagination,
} from '../components/ui';

import { APPLICATION_STATUS, JOB_STATUS } from '../lib/statusConfig';
import { useToast } from '../lib/ToastContext';

import {
  Briefcase, Users, Clock, TrendingUp,
  Eye, Edit2, Trash2, MoreHorizontal,
  CheckCircle, Info, UserPlus, FileText,
  ChevronDown,
} from 'lucide-react';

/* ─── Sample data ────────────────────────────────────────────────────────── */

const CANDIDATES = [
  { id: 1, name: 'Priya Sharma',     role: 'Senior React Developer',   status: 'interview_scheduled', score: 87 },
  { id: 2, name: 'Marcus Chen',      role: 'Product Designer',         status: 'under_review',        score: 62 },
  { id: 3, name: 'Ayasha Redcloud',  role: 'Data Analyst',             status: 'applied',             score: 34 },
  { id: 4, name: 'Luca Ferreira',    role: 'DevOps Engineer',          status: 'offer_extended',      score: 91 },
  { id: 5, name: 'Sophie Müller',    role: 'Engineering Manager',      status: 'rejected',            score: 48 },
];

/* ─── Section wrapper ────────────────────────────────────────────────────── */

function Section({ id, title, children }) {
  return (
    <section id={id} className="space-y-6">
      <div className="border-b-2 border-primary-100 pb-3">
        <h2 className="text-h2 text-secondary-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SubSection({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-h4 text-secondary-600 font-semibold">{title}</h3>
      {children}
    </div>
  );
}

/* ─── 1. Colors ──────────────────────────────────────────────────────────── */

const TOKEN_SHADES = [50, 100, 300, 500, 700, 900];
const TOKENS = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'ai'];

// Tailwind safelist workaround: hardcode the bg class strings so Tailwind
// includes them in the build. (Dynamic class generation is purged at build time.)
const TOKEN_BG = {
  primary:   { 50:'bg-primary-50',   100:'bg-primary-100',   300:'bg-primary-300',   500:'bg-primary-500',   700:'bg-primary-700',   900:'bg-primary-900'   },
  secondary: { 50:'bg-secondary-50', 100:'bg-secondary-100', 300:'bg-secondary-300', 500:'bg-secondary-500', 700:'bg-secondary-700', 900:'bg-secondary-900' },
  success:   { 50:'bg-success-50',   100:'bg-success-100',   300:'bg-success-300',   500:'bg-success-500',   700:'bg-success-700',   900:'bg-success-900'   },
  danger:    { 50:'bg-danger-50',    100:'bg-danger-100',    300:'bg-danger-300',    500:'bg-danger-500',    700:'bg-danger-700',    900:'bg-danger-900'    },
  warning:   { 50:'bg-warning-50',   100:'bg-warning-100',   300:'bg-warning-300',   500:'bg-warning-500',   700:'bg-warning-700',   900:'bg-warning-900'   },
  info:      { 50:'bg-info-50',      100:'bg-info-100',      300:'bg-info-300',      500:'bg-info-500',      700:'bg-info-700',      900:'bg-info-900'      },
  ai:        { 50:'bg-ai-50',        100:'bg-ai-100',        300:'bg-ai-300',        500:'bg-ai-500',        700:'bg-ai-700',        900:'bg-ai-900'        },
};

// Chart colors as plain hex values (avoids the require() issue in chartColors.js)
const CHART_HEX = ['#6366f1','#8b5cf6','#0ea5e9','#10b981','#f59e0b','#fb7185','#94a3b8','#14b8a6'];
const CHART_LABELS = ['indigo-500','violet-500','sky-500','emerald-500','amber-500','rose-400','slate-400','teal-500'];

function ColorSection() {
  return (
    <Section id="colors" title="1 · Colors">
      <div className="space-y-5">
        {TOKENS.map((token) => (
          <div key={token} className="flex items-center gap-1.5 flex-wrap">
            <span className="w-24 shrink-0 text-caption font-semibold text-secondary-500 uppercase tracking-wide">
              {token}
            </span>
            {TOKEN_SHADES.map((shade) => (
              <div key={shade} className="flex flex-col items-center gap-1">
                <div className={`h-12 w-16 rounded-lg ${TOKEN_BG[token][shade]} border border-black/5`} />
                <span className="text-caption text-secondary-500">{token}-{shade}</span>
              </div>
            ))}
          </div>
        ))}

        {/* Chart palette */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="w-24 shrink-0 text-caption font-semibold text-secondary-500 uppercase tracking-wide">
            chart
          </span>
          {CHART_HEX.map((hex, i) => (
            <div key={hex} className="flex flex-col items-center gap-1">
              <div className="h-12 w-16 rounded-lg border border-black/5" style={{ backgroundColor: hex }} />
              <span className="text-caption text-secondary-500">{CHART_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── 2. Typography ──────────────────────────────────────────────────────── */

const TYPE_TOKENS = [
  { token: 'display',  cls: 'text-display'  },
  { token: 'h1',       cls: 'text-h1'       },
  { token: 'h2',       cls: 'text-h2'       },
  { token: 'h3',       cls: 'text-h3'       },
  { token: 'h4',       cls: 'text-h4'       },
  { token: 'body-lg',  cls: 'text-body-lg'  },
  { token: 'body-sm',  cls: 'text-body-sm'  },
  { token: 'caption',  cls: 'text-caption'  },
  { token: 'overline', cls: 'text-overline uppercase tracking-wide' },
];

function TypographySection() {
  return (
    <Section id="typography" title="2 · Typography">
      <div className="space-y-4">
        {TYPE_TOKENS.map(({ token, cls }) => (
          <div key={token} className="flex items-baseline gap-6">
            <span className="w-24 shrink-0 font-mono text-caption text-secondary-400">
              {token}
            </span>
            <span className={cls}>The quick brown fox jumps over the lazy dog</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ─── 3. Buttons ─────────────────────────────────────────────────────────── */

const BTN_VARIANTS = ['primary','secondary','outline','danger','ghost','ai'];
const BTN_SIZES    = ['sm','md','lg'];

function ButtonsSection() {
  return (
    <Section id="buttons" title="3 · Buttons">
      <SubSection title="All variants × all sizes">
        <div className="space-y-3">
          {BTN_SIZES.map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-3">
              <span className="w-8 shrink-0 font-mono text-caption text-secondary-400">{size}</span>
              {BTN_VARIANTS.map((variant) => (
                <Button key={variant} variant={variant} size={size}>
                  {variant}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </SubSection>

      <SubSection title="Disabled state">
        <div className="flex flex-wrap items-center gap-3">
          {BTN_VARIANTS.map((v) => (
            <Button key={v} variant={v} disabled>
              {v}
            </Button>
          ))}
        </div>
      </SubSection>

      <SubSection title="Loading state">
        <div className="flex flex-wrap items-center gap-3">
          {BTN_VARIANTS.map((v) => (
            <Button key={v} variant={v} isLoading>
              {v}
            </Button>
          ))}
        </div>
      </SubSection>

      <SubSection title="With icons">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary"    leftIcon={<UserPlus size={16} strokeWidth={1.75} />}>Add Candidate</Button>
          <Button variant="outline"    rightIcon={<ChevronDown size={16} strokeWidth={1.75} />}>Filter</Button>
          <Button variant="ai"         leftIcon={<CheckCircle size={16} strokeWidth={1.75} />}>Get AI Match Score</Button>
          <Button variant="danger"     leftIcon={<Trash2 size={16} strokeWidth={1.75} />}>Delete Posting</Button>
        </div>
      </SubSection>
    </Section>
  );
}

/* ─── 4. Form Fields ─────────────────────────────────────────────────────── */

function FormFieldsSection() {
  const [searchVal, setSearchVal]   = useState('');
  const [checked1, setChecked1]     = useState(false);
  const [checked2, setChecked2]     = useState(true);
  const [radioVal, setRadioVal]     = useState('full-time');
  const [switchOn, setSwitchOn]     = useState(false);
  const [switchOff, setSwitchOff]   = useState(true);
  const [uploadFile, setUploadFile] = useState(null);

  return (
    <Section id="form-fields" title="4 · Form Fields">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <Input label="Job Title" placeholder="e.g. Senior Product Manager" />
        <Input
          label="LinkedIn Profile URL"
          placeholder="https://linkedin.com/in/…"
          error="Please enter a valid LinkedIn URL."
        />
        <Input
          label="Years of Experience"
          type="number"
          placeholder="0"
          helperText="Total years in any relevant role."
        />
        <Textarea
          label="Cover Letter"
          placeholder="Tell us why you're a great fit…"
          helperText="Max 500 words."
          autoResize
        />
        <Select
          label="Department"
          placeholder="Select a department"
          options={[
            { value: 'engineering', label: 'Engineering' },
            { value: 'design',      label: 'Design' },
            { value: 'product',     label: 'Product' },
            { value: 'hr',          label: 'Human Resources' },
            { value: 'finance',     label: 'Finance' },
          ]}
        />
        <Select
          label="Seniority Level"
          placeholder="Choose level"
          error="This field is required."
          options={[
            { value: 'junior',    label: 'Junior (0–2 yrs)' },
            { value: 'mid',       label: 'Mid (3–5 yrs)' },
            { value: 'senior',    label: 'Senior (6–10 yrs)' },
            { value: 'lead',      label: 'Lead / Principal' },
          ]}
        />
        <div className="space-y-3">
          <Checkbox
            label="Open to relocation"
            checked={checked1}
            onChange={(e) => setChecked1(e.target.checked)}
          />
          <Checkbox
            label="Available for remote work"
            checked={checked2}
            onChange={(e) => setChecked2(e.target.checked)}
          />
          <Checkbox
            label="Indeterminate (select-all row)"
            checked={false}
            indeterminate
            onChange={() => {}}
          />
        </div>
        <RadioGroup
          label="Employment Type"
          name="employment-type"
          value={radioVal}
          onChange={setRadioVal}
          options={[
            { value: 'full-time',  label: 'Full-time' },
            { value: 'part-time',  label: 'Part-time' },
            { value: 'contract',   label: 'Contract / Freelance' },
          ]}
        />
        <div className="space-y-3">
          <Switch
            label="Email notifications enabled"
            checked={switchOff}
            onChange={(e) => setSwitchOff(e.target.checked)}
          />
          <Switch
            label="Calendar sync (off)"
            checked={switchOn}
            onChange={(e) => setSwitchOn(e.target.checked)}
          />
          <Switch label="Disabled toggle" checked={false} onChange={() => {}} disabled />
        </div>
        <SearchInput
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Search candidates…"
        />
        <DateTimeInput
          label="Interview Scheduled At"
          min={new Date().toISOString().slice(0, 16)}
          helperText="Must be in the future."
        />
      </div>
      <div className="max-w-sm mt-4">
        <FileUpload
          onFileSelect={setUploadFile}
          currentFile={uploadFile}
          accept=".pdf,.doc,.docx"
          maxSizeMB={5}
        />
      </div>
    </Section>
  );
}

/* ─── 5. Badges & Status ─────────────────────────────────────────────────── */

const BADGE_VARIANTS = ['primary','secondary','success','danger','warning','info','ai'];

function BadgesSection() {
  return (
    <Section id="badges" title="5 · Badges & Status">
      <SubSection title="Badge — all variants (light style)">
        <div className="flex flex-wrap gap-3">
          {BADGE_VARIANTS.map((v) => (
            <Badge key={v} variant={v}>{v}</Badge>
          ))}
          <Badge variant="primary" size="sm">small</Badge>
          <Badge variant="ai" icon={<CheckCircle size={11} strokeWidth={1.75} />}>AI Matched</Badge>
        </div>
      </SubSection>

      <SubSection title="StatusBadge — APPLICATION_STATUS">
        <div className="flex flex-wrap gap-3">
          {Object.keys(APPLICATION_STATUS).map((key) => (
            <StatusBadge key={key} status={key} type="application" />
          ))}
        </div>
      </SubSection>

      <SubSection title="StatusBadge — JOB_STATUS">
        <div className="flex flex-wrap gap-3">
          {Object.keys(JOB_STATUS).map((key) => (
            <StatusBadge key={key} status={key} type="job" />
          ))}
        </div>
      </SubSection>
    </Section>
  );
}

/* ─── 6. Cards ───────────────────────────────────────────────────────────── */

function CardsSection() {
  return (
    <Section id="cards" title="6 · Cards">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {/* Default card */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Priya Sharma</CardTitle>
              <CardDescription>Senior React Developer · 8 yrs exp.</CardDescription>
            </div>
            <StatusBadge status="interview_scheduled" type="application" />
          </CardHeader>
          <CardContent>
            <p className="text-body-sm text-secondary-700">
              Strong background in design-system architecture and accessibility. Led the
              component library migration at her previous company from MUI to a custom
              in-house system.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" leftIcon={<Eye size={14} strokeWidth={1.75} />}>View Profile</Button>
            <Button variant="primary" size="sm">Schedule Interview</Button>
          </CardFooter>
        </Card>

        {/* Hoverable card */}
        <Card hoverable>
          <CardHeader>
            <div>
              <CardTitle>Marcus Chen</CardTitle>
              <CardDescription>Product Designer · 5 yrs exp.</CardDescription>
            </div>
            <StatusBadge status="under_review" type="application" />
          </CardHeader>
          <CardContent>
            <p className="text-body-sm text-secondary-700">
              Portfolio includes end-to-end product design for two Y-combinator startups.
              Proficient in Figma, Framer, and user research methodologies.
            </p>
          </CardContent>
          <CardFooter>
            <span className="text-caption text-secondary-400 italic">Hoverable — try hovering this card</span>
          </CardFooter>
        </Card>
      </div>
    </Section>
  );
}

/* ─── 7. Table ───────────────────────────────────────────────────────────── */

function CandidateTable({ density }) {
  return (
    <Table density={density}>
      <TableHeader>
        <TableRow isHeader>
          <TableHead>Candidate</TableHead>
          <TableHead>Role Applied For</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>AI Score</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {CANDIDATES.map((c) => (
          <TableRow key={c.id}>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <Avatar name={c.name} size="sm" />
                <span className="font-semibold text-secondary-900">{c.name}</span>
              </div>
            </TableCell>
            <TableCell>{c.role}</TableCell>
            <TableCell>
              <StatusBadge status={c.status} type="application" size="sm" />
            </TableCell>
            <TableCell numeric>
              <div className="flex items-center justify-end gap-2 min-w-[120px]">
                <ProgressBar value={c.score} size="sm" className="flex-1" />
                <span className="text-caption tabular-nums text-secondary-600 w-8 text-right">{c.score}</span>
              </div>
            </TableCell>
            <TableCell>
              <DropdownMenu
                align="right"
                trigger={
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal size={15} strokeWidth={1.75} />
                  </Button>
                }
              >
                <DropdownMenuItem icon={<Eye size={14} strokeWidth={1.75} />}>
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem icon={<Edit2 size={14} strokeWidth={1.75} />}>
                  Edit Application
                </DropdownMenuItem>
                <DropdownMenuItem icon={<Trash2 size={14} strokeWidth={1.75} />} danger>
                  Reject Candidate
                </DropdownMenuItem>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function TableSection() {
  return (
    <Section id="table" title="7 · Table">
      <SubSection title='density="comfortable" (default)'>
        <div className="rounded-xl border border-secondary-200 overflow-hidden">
          <CandidateTable density="comfortable" />
        </div>
      </SubSection>
      <SubSection title='density="compact"'>
        <div className="rounded-xl border border-secondary-200 overflow-hidden">
          <CandidateTable density="compact" />
        </div>
      </SubSection>
    </Section>
  );
}

/* ─── 8. Avatar ──────────────────────────────────────────────────────────── */

const AVATAR_NAMES = [
  'Priya Sharma', 'Marcus Chen', 'Ayasha Redcloud', 'Luca Ferreira', 'Sophie Müller',
];

function AvatarSection() {
  return (
    <Section id="avatar" title="8 · Avatar">
      {(['sm','md','lg']).map((size) => (
        <div key={size} className="flex items-center gap-4 flex-wrap">
          <span className="w-8 font-mono text-caption text-secondary-400">{size}</span>
          {AVATAR_NAMES.map((name) => (
            <Tooltip key={name} content={name} position="bottom">
              <Avatar name={name} size={size} />
            </Tooltip>
          ))}
        </div>
      ))}
    </Section>
  );
}

/* ─── 9. ProgressBar ─────────────────────────────────────────────────────── */

function ProgressSection() {
  return (
    <Section id="progress" title="9 · ProgressBar">
      <div className="max-w-sm space-y-4">
        <div className="space-y-1">
          <span className="text-caption text-secondary-500">25 → danger</span>
          <ProgressBar value={25} showLabel size="md" />
        </div>
        <div className="space-y-1">
          <span className="text-caption text-secondary-500">55 → warning</span>
          <ProgressBar value={55} showLabel size="md" />
        </div>
        <div className="space-y-1">
          <span className="text-caption text-secondary-500">90 → success</span>
          <ProgressBar value={90} showLabel size="md" />
        </div>
      </div>
    </Section>
  );
}

/* ─── 10. StatCard ───────────────────────────────────────────────────────── */

function StatCardsSection() {
  return (
    <Section id="statcards" title="10 · StatCard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Open Positions"
          value="24"
          icon={Briefcase}
          trend={{ direction: 'up', value: '+3 this week' }}
        />
        <StatCard
          label="Active Candidates"
          value="382"
          icon={Users}
          trend={{ direction: 'up', value: '+47 this month' }}
        />
        <StatCard
          label="Avg. Days to Hire"
          value="18.4"
          icon={Clock}
          trend={{ direction: 'down', value: '−2.1 days' }}
          trendUpIsGood={false}
        />
        <StatCard
          label="Offer Acceptance Rate"
          value="91%"
          icon={TrendingUp}
          trend={{ direction: 'down', value: '−4% vs last qtr' }}
        />
      </div>
    </Section>
  );
}

/* ─── 11. EmptyState & Skeleton ──────────────────────────────────────────── */

function EmptySkeletonSection() {
  return (
    <Section id="empty-skeleton" title="11 · EmptyState & Skeleton">
      <SubSection title="EmptyState">
        <div className="border border-secondary-200 rounded-xl">
          <EmptyState
            icon={UserPlus}
            title="No candidates yet — let's find some great talent"
            description="Post your first job opening and start receiving applications from qualified candidates."
            action={{ label: 'Post a Job', onClick: () => {} }}
          />
        </div>
      </SubSection>

      <SubSection title="Skeleton variants (shimmer visible on load)">
        <div className="max-w-sm space-y-3">
          {/* Text line skeletons */}
          <Skeleton variant="text" width="80%" height="1rem" />
          <Skeleton variant="text" width="60%" height="0.75rem" />
          <Skeleton variant="text" width="90%" height="0.75rem" />

          {/* Candidate card skeleton */}
          <div className="flex items-center gap-3 mt-4">
            <Skeleton variant="circle" width="40px" height="40px" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="50%" height="1rem" />
              <Skeleton variant="text" width="70%" height="0.75rem" />
            </div>
          </div>

          {/* Rect skeleton (card/image placeholder) */}
          <Skeleton variant="rect" width="100%" height="120px" />
        </div>
      </SubSection>
    </Section>
  );
}

/* ─── 12. Spinner ────────────────────────────────────────────────────────── */

function SpinnerSection() {
  return (
    <Section id="spinner" title="12 · Spinner">
      <SubSection title="Standalone (inherits text color from wrapper)">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <Spinner size="sm" className="text-primary-500" />
            <span className="text-caption text-secondary-500">sm</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Spinner size="md" className="text-primary-500" />
            <span className="text-caption text-secondary-500">md</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Spinner size="lg" className="text-primary-500" />
            <span className="text-caption text-secondary-500">lg</span>
          </div>
        </div>
      </SubSection>

      <SubSection title="Inside solid buttons (should be white)">
        <div className="flex items-center gap-3">
          <Button variant="primary"    isLoading size="sm">Saving…</Button>
          <Button variant="primary"    isLoading size="md">Saving…</Button>
          <Button variant="danger"     isLoading size="md">Deleting…</Button>
          <Button variant="ai"         isLoading size="md">Analyzing…</Button>
        </div>
      </SubSection>
    </Section>
  );
}

/* ─── 13. Interactive Overlays ───────────────────────────────────────────── */

function OverlaysSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  return (
    <Section id="overlays" title="13 · Interactive Overlays">
      {/* Modal */}
      <SubSection title="Modal">
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          Open Modal
        </Button>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Confirm Interview Schedule"
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>Confirm Interview</Button>
            </>
          }
        >
          <p className="text-body-sm text-secondary-700">
            You are about to schedule a technical interview with{' '}
            <strong>Priya Sharma</strong> for the{' '}
            <strong>Senior React Developer</strong> position.
          </p>
          <p className="mt-3 text-body-sm text-secondary-700">
            A calendar invite will be sent to both parties. You can reschedule up to
            24 hours before the interview.
          </p>
        </Modal>
      </SubSection>

      {/* Toast */}
      <SubSection title="Toast (click to fire each variant)">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() => toast({ title: 'Profile saved', description: 'Changes are live.', variant: 'success' })}
          >
            🟢 Success toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast({ title: 'Action failed', description: 'Could not save changes. Try again.', variant: 'danger' })}
          >
            🔴 Danger toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast({ title: 'Missing info', description: 'Some required fields are incomplete.', variant: 'warning' })}
          >
            🟡 Warning toast
          </Button>
          <Button
            variant="secondary"
            onClick={() => toast({ title: 'Application received', description: 'We\'ll review and respond within 3 days.', variant: 'info' })}
          >
            🔵 Info toast
          </Button>
        </div>
        <p className="text-caption text-secondary-400 mt-2">
          ✓ ToastProvider is already applied in main.jsx — this page renders inside it.
        </p>
      </SubSection>

      {/* Tooltip */}
      <SubSection title="Tooltip (hover or focus each button)">
        <div className="flex items-center gap-6 py-8">
          <Tooltip content="View full candidate profile" position="top">
            <Button variant="outline" size="sm" leftIcon={<Eye size={14} strokeWidth={1.75} />}>
              View (top)
            </Button>
          </Tooltip>
          <Tooltip content="Edit application details" position="bottom">
            <Button variant="outline" size="sm" leftIcon={<Edit2 size={14} strokeWidth={1.75} />}>
              Edit (bottom)
            </Button>
          </Tooltip>
          <Tooltip content="Download resume PDF" position="left">
            <Button variant="outline" size="sm" leftIcon={<FileText size={14} strokeWidth={1.75} />}>
              Resume (left)
            </Button>
          </Tooltip>
          <Tooltip content="Get AI recommendations" position="right">
            <Button variant="ai" size="sm">
              AI (right)
            </Button>
          </Tooltip>
        </div>
      </SubSection>

      {/* Dropdown */}
      <SubSection title="DropdownMenu (keyboard: ↑↓ navigate, Escape to close)">
        <DropdownMenu
          trigger={
            <Button variant="outline" rightIcon={<ChevronDown size={14} strokeWidth={1.75} />}>
              Candidate Actions
            </Button>
          }
        >
          <DropdownMenuItem icon={<Eye size={14} strokeWidth={1.75} />} onClick={() => {}}>
            View Profile
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Edit2 size={14} strokeWidth={1.75} />} onClick={() => {}}>
            Edit Application
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Info size={14} strokeWidth={1.75} />} onClick={() => {}}>
            Request More Info
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Trash2 size={14} strokeWidth={1.75} />} onClick={() => {}} danger>
            Reject & Archive
          </DropdownMenuItem>
        </DropdownMenu>
      </SubSection>
    </Section>
  );
}

/* ─── 14. Tabs ───────────────────────────────────────────────────────────── */

function TabsSection() {
  return (
    <Section id="tabs" title="14 · Tabs">
      <Tabs defaultValue="overview" className="max-w-2xl">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardContent>
              <p className="text-body-sm text-secondary-700">
                <strong>Priya Sharma</strong> is a Senior React Developer with 8 years of
                experience building scalable design systems and accessible component
                libraries. She holds a B.Sc. in Computer Science from IIT Bombay.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="experience">
          <Card>
            <CardContent>
              <ul className="space-y-2 text-body-sm text-secondary-700">
                <li>• <strong>2020–present</strong>: Lead Frontend Engineer @ FinTech Corp</li>
                <li>• <strong>2017–2020</strong>: UI Developer @ E-Commerce Startup</li>
                <li>• <strong>2015–2017</strong>: Junior Developer @ Agency XYZ</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assessments">
          <Card>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'React & TypeScript', score: 92 },
                  { label: 'System Design',      score: 78 },
                  { label: 'Communication',      score: 85 },
                ].map(({ label, score }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="w-40 text-body-sm text-secondary-700 shrink-0">{label}</span>
                    <ProgressBar value={score} showLabel className="flex-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Section>
  );
}

/* ─── 15. Pagination ─────────────────────────────────────────────────────── */

function PaginationSection() {
  const [page, setPage] = useState(6);
  return (
    <Section id="pagination" title="15 · Pagination">
      <div className="space-y-2">
        <Pagination
          currentPage={page}
          totalPages={12}
          onPageChange={setPage}
          siblingCount={1}
        />
        <p className="text-caption text-secondary-400">
          Current page: <strong>{page}</strong> of 12
          &nbsp;·&nbsp;Click page numbers to observe ellipsis behaviour near the edges.
        </p>
      </div>
    </Section>
  );
}

/* ─── Page root ──────────────────────────────────────────────────────────── */

export default function StyleGuide() {
  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Sticky nav header */}
      <header className="sticky top-0 z-sticky bg-white border-b border-secondary-200 px-8 py-3 flex items-center gap-3">
        <span className="text-h4 text-secondary-900 font-semibold">
          🎨 Design System — Component Showcase
        </span>
        <span className="text-caption text-secondary-400 ml-auto">
          Dev / reference — not user-facing
        </span>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-20">
        <ColorSection />
        <TypographySection />
        <ButtonsSection />
        <FormFieldsSection />
        <BadgesSection />
        <CardsSection />
        <TableSection />
        <AvatarSection />
        <ProgressSection />
        <StatCardsSection />
        <EmptySkeletonSection />
        <SpinnerSection />
        <OverlaysSection />
        <TabsSection />
        <PaginationSection />
      </main>
    </div>
  );
}
