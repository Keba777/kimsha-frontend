import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'h:mm a')
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d, yyyy')
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function elapsedMinutes(from: string | Date): number {
  return Math.floor((Date.now() - new Date(from).getTime()) / 60000)
}
