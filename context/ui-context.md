# UI Context

## Theme

Dark only. No light mode. The design language is a dark financial dashboard — near-black backgrounds, layered zinc surfaces, and emerald green as the primary accent. The app is called **FinanceFlow** and uses a wallet icon as its logo.

## Colors

All components must use Tailwind utility classes that map to these values. No hardcoded hex values.

| Role            | Tailwind Class         | Value     |
| --------------- | ---------------------- | --------- |
| Page background | `bg-zinc-950`          | `#09090b` |
| Surface / Card  | `bg-zinc-900`          | `#18181b` |
| Elevated card   | `bg-zinc-800`          | `#27272a` |
| Primary text    | `text-white`           | `#ffffff` |
| Muted text      | `text-zinc-400`        | `#a1a1aa` |
| Primary accent  | `bg-emerald-500`       | `#10b981` |
| Accent text     | `text-emerald-400`     | `#34d399` |
| Border          | `border-zinc-800`      | `#27272a` |
| Error / Red     | `text-red-400`         | `#f87171` |
| Success / Green | `text-emerald-400`     | `#34d399` |
| Warning / Yellow| `text-yellow-400`      | `#facc15` |

## Typography

| Role       | Tailwind Class               |
| ---------- | ---------------------------- |
| Page title | `text-2xl font-bold`         |
| Section    | `text-lg font-semibold`      |
| Body       | `text-sm text-zinc-300`      |
| Muted      | `text-xs text-zinc-400`      |
| Mono/code  | `font-mono text-emerald-400` |

## Border Radius

| Context           | Class         |
| ----------------- | ------------- |
| Buttons / badges  | `rounded-md`  |
| Cards / panels    | `rounded-xl`  |
| Modals / overlays | `rounded-2xl` |
| Avatar / icons    | `rounded-full`|

## Layout Patterns

- **App shell**: Fixed sidebar (w-64) on the left + scrollable main content on the right. Sidebar uses `fixed h-screen` and never scrolls. Main content uses `ml-64 overflow-y-auto h-screen`
- **Cards**: `bg-zinc-900 rounded-xl p-6 border border-zinc-800`
- **Modals**: Centered overlay with `backdrop-blur-sm bg-black/50`
- **Tables**: `bg-zinc-900` with `border-b border-zinc-800` row separators
- **Auth screens**: Centered card `max-w-md mx-auto` on `bg-zinc-950` full page

## Component Library

Tailwind CSS utility classes only. No shadcn/ui — components are built from scratch matching the v0-generated designs. Recharts for all charts.

## Icons

Lucide React. Stroke-based icons only.
- Inline / labels: `h-4 w-4`
- Buttons: `h-5 w-5`
- Nav sidebar: `h-5 w-5`
- Large / hero: `h-8 w-8`

## Sidebar Navigation

Links in order: Dashboard, Transactions, Budgets, AI Assistant, Alerts.
Active link: `bg-zinc-800 text-emerald-400`.
Inactive link: `text-zinc-400 hover:text-white hover:bg-zinc-800/50`.
User avatar + logout at bottom of sidebar.

## Charts (Recharts)

- Background: transparent
- Grid lines: `stroke="#27272a"`
- Axis text: `fill="#a1a1aa" fontSize={12}`
- Income line: `stroke="#10b981"`
- Expense line: `stroke="#f87171"`
- Donut chart colors: `["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"]`
