/**
 * Chart palette — a fixed ordered set of hex colors drawn from the design
 * system's semantic tokens. Used by all analytics charts.
 *
 * These are the exact hex values of the Tailwind token shades listed in the
 * comments. Hard-coded here to avoid requiring tailwindcss/colors at runtime
 * (which breaks in Vite's ESM environment).
 */
export const CHART_COLORS = [
  '#6366f1', // indigo-500  (primary-500)
  '#8b5cf6', // violet-500  (ai-500)
  '#0ea5e9', // sky-500     (info-500)
  '#10b981', // emerald-500 (success-500)
  '#f59e0b', // amber-500   (warning-500)
  '#fb7185', // rose-400    (danger-400)
  '#94a3b8', // slate-400   (secondary-400)
  '#14b8a6', // teal-500
];

