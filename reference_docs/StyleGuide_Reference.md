# RecruiterAI Design System Reference

This document serves as a reference for the RecruiterAI design system, extracted from `StyleGuide.jsx`.

## 1. Colors
The system relies on functional color tokens: `primary`, `secondary`, `success`, `danger`, `warning`, `info`, and `ai`. Each token has shades: `50`, `100`, `300`, `500`, `700`, `900`.

- **Primary**: Brand color.
- **Secondary**: Neutral colors for backgrounds, text, and borders (e.g. `bg-secondary-50`).
- **AI**: Specialized token for AI features (e.g. `bg-ai-50`, `text-ai-500`).
- **Chart Palette**: Specialized hex codes for charts (`#6366f1`, etc.).

## 2. Typography
Use specific typography classes instead of raw text sizes:
- `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-h4` for headings.
- `text-body-lg`, `text-body-sm` for paragraph text.
- `text-caption` for small descriptive text.
- `text-overline uppercase tracking-wide` for overlines.

## 3. UI Components (imported from `../components/ui`)

### Buttons (`<Button>`)
- **Variants**: `primary`, `secondary`, `outline`, `danger`, `ghost`, `ai`
- **Sizes**: `sm`, `md`, `lg`
- **Props**: `isLoading`, `disabled`, `leftIcon`, `rightIcon`

### Badges (`<Badge>`, `<StatusBadge>`)
- **Variants**: `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `ai`
- **Sizes**: `sm`, `md`
- **StatusBadge**: Specialized for mapping statuses. Requires `status` and `type="application|job"`.

### Cards (`<Card>`)
- **Subcomponents**: `<CardHeader>`, `<CardTitle>`, `<CardDescription>`, `<CardContent>`, `<CardFooter>`
- **Props**: `hoverable` (adds interactive hover styles and elevation)

### Tables (`<Table>`)
- **Props**: `density="comfortable|compact"`
- **Subcomponents**: `<TableHeader>`, `<TableRow isHeader>`, `<TableHead>`, `<TableBody>`, `<TableCell>`

### Form Fields
- `<Input label="..." placeholder="..." />`
- `<Textarea label="..." autoResize />`
- `<Select label="..." options={[{label, value}]} />`
- `<Checkbox>`, `<RadioGroup>`, `<Switch>`, `<SearchInput>`, `<DateTimeInput>`, `<FileUpload>`

### Indicators & Avatars
- **Avatar**: `<Avatar name="..." size="sm|md|lg" />`
- **ProgressBar**: `<ProgressBar value={...} showLabel size="sm|md" />`
- **Spinner**: `<Spinner size="sm|md|lg" className="text-primary-500" />`
- **StatCard**: `<StatCard label="..." value="..." icon={Icon} trend={{ direction: 'up', value: '...' }} />`

### Layout & Overlays
- **Modal**: `<Modal isOpen={...} onClose={...} title="..." size="md" footer={...}>`
- **Tooltip**: `<Tooltip content="..." position="top|bottom|left|right">`
- **DropdownMenu**: `<DropdownMenu trigger={<Button>...<Button>}>` containing `<DropdownMenuItem>`
- **Tabs**: `<Tabs defaultValue="...">`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>`
- **EmptyState**: `<EmptyState icon={Icon} title="..." description="..." action={{ label: '...', onClick: ... }} />`
- **Skeleton**: `<Skeleton variant="text|circle|rect" />`

## 4. Icons
The design system exclusively uses `lucide-react` icons (e.g., `Briefcase`, `Users`, `CheckCircle`, `MoreHorizontal`, `Eye`, `Trash2`). Always pass icons as React nodes when used in component props (e.g., `leftIcon={<Eye size={16} />}`).
