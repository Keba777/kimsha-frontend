export function formatETB(amount: number): string {
  return `ብር ${amount.toLocaleString('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-ET')
}
