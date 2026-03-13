export interface SerializedProduct {
  id: number
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  imageUrl: string | null
  imageAlt: string
  sales: number
  views: number
}

export interface SerializedCategory {
  id: number
  name: string
  slug: string
}

export interface NavLink {
  href: string
  label: string
}

export interface ProductFilters {
  categoria?: string
  buscar?: string
  precioMin?: string
  precioMax?: string
  categoryId?: number | null
}
