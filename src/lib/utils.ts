import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, symbol = '$'): string {
  return `${symbol}${price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function resolveSort(ordenar?: string): string {
  const map: Record<string, string> = {
    'destacado': '-createdAt',
    'mas-vendidos': '-sales',
    'a-z': 'name',
    'z-a': '-name',
    'precio-asc': 'price',
    'precio-desc': '-price',
    'mas-antiguo': 'createdAt',
    'mas-reciente': '-createdAt',
  }
  return map[ordenar ?? ''] ?? '-createdAt'
}
