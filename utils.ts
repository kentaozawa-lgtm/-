import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export function getStatusLabel(status: 'draft' | 'rejected' | 'approved' | 'exported'): string {
  const labels = {
    draft: '下書き',
    rejected: '修正してください',
    approved: '確認OK',
    exported: '出力済み',
  }
  return labels[status]
}

export function getStatusVariant(status: 'draft' | 'rejected' | 'approved' | 'exported'): 'default' | 'destructive' | 'outline' | 'secondary' {
  const variants = {
    draft: 'outline' as const,
    rejected: 'destructive' as const,
    approved: 'default' as const,
    exported: 'secondary' as const,
  }
  return variants[status]
}
