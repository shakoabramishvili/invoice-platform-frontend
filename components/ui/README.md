# UI Components

This directory contains reusable UI components built with Radix UI primitives, Tailwind CSS, and class-variance-authority, following shadcn/ui patterns.

## Components

### Form Components
- **Button** (`button.tsx`) - Button with variants (default, destructive, outline, secondary, ghost, link) and sizes (default, sm, lg, icon)
- **Input** (`input.tsx`) - Text input field component
- **Label** (`label.tsx`) - Form label component
- **Checkbox** (`checkbox.tsx`) - Checkbox input component
- **Select** (`select.tsx`) - Select dropdown with search support

### Layout Components
- **Card** (`card.tsx`) - Card container with Header, Title, Description, Content, and Footer subcomponents
- **Table** (`table.tsx`) - Table with Header, Body, Row, Head, Cell, and Caption subcomponents
- **Tabs** (`tabs.tsx`) - Tabbed interface with List, Trigger, and Content components

### Overlay Components
- **Dialog** (`dialog.tsx`) - Modal dialog with overlay, close button, header, footer, and content areas
- **Dropdown Menu** (`dropdown-menu.tsx`) - Dropdown menu with items, checkboxes, radio buttons, and separators
- **Popover** (`popover.tsx`) - Popover component for floating content
- **Tooltip** (`tooltip.tsx`) - Tooltip component for hover information

### Feedback Components
- **Toast** (`toast.tsx`, `toaster.tsx`) - Toast notification system with Provider, Viewport, and message variants
- **Badge** (`badge.tsx`) - Status indicator badge with variants (default, secondary, destructive, outline)
- **Skeleton** (`skeleton.tsx`) - Loading skeleton component for placeholder content

## Usage Examples

### Button
\`\`\`tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Click me</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="outline" size="lg">Cancel</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
\`\`\`

### Card
\`\`\`tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description here</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
\`\`\`

### Dialog
\`\`\`tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <div>Dialog content</div>
  </DialogContent>
</Dialog>
\`\`\`

### Toast
\`\`\`tsx
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

// In your component
const { toast } = useToast();

toast({
  title: "Success",
  description: "Your action was completed successfully.",
});

toast({
  variant: "destructive",
  title: "Error",
  description: "Something went wrong.",
});

// Add <Toaster /> to your root layout
\`\`\`

### Table
\`\`\`tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Item 1</TableCell>
      <TableCell><Badge>Active</Badge></TableCell>
    </TableRow>
  </TableBody>
</Table>
\`\`\`

### Select
\`\`\`tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
\`\`\`

### Badge
\`\`\`tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Draft</Badge>
\`\`\`

### Skeleton
\`\`\`tsx
import { Skeleton } from '@/components/ui/skeleton';

<Skeleton className="h-12 w-full" />
<Skeleton className="h-4 w-[250px]" />
\`\`\`

## Dependencies

All components use:
- **Radix UI** - Unstyled, accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **class-variance-authority** - Type-safe variant system
- **lucide-react** - Icon library
- **clsx** and **tailwind-merge** - Utility for merging class names

## Customization

All components are fully customizable through:
1. **Variants** - Use predefined variants via props
2. **className** - Override styles with Tailwind classes
3. **Slots** - Some components support the `asChild` prop for composition
4. **Theme** - Customize colors via Tailwind config

## Accessibility

All components are built on Radix UI primitives, ensuring:
- Keyboard navigation support
- Screen reader compatibility
- ARIA attribute handling
- Focus management
- Proper semantic HTML
