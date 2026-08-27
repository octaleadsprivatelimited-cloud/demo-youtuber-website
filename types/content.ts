export type TractorStatus = 'draft' | 'published' | 'featured' | 'upcoming' | 'archived';

export interface Tractor {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  brandName: string;
  brandSlug: string;
  model: string;
  condition?: 'new'|'used';
  tagline?: string;
  description?: string;
  hp: number;
  cylinders?: number;
  engineCapacityCc?: number;
  transmission: string;
  driveType?: '2WD' | '4WD';
  minPrice: number;
  maxPrice: number;
  fuelType?: string;
  liftingCapacityKg?: number;
  ptoHp?: number;
  image?: string;
  gallery?: string[];
  features?: string[];
  specifications?: Record<string, string | number>;
  searchTerms?: string[];
  searchPrefixes?: string[];
  status: TractorStatus;
  popular?: boolean;
  featured?: boolean;
  upcoming?: boolean;
  popularityScore?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  country?: string;
  modelCount?: number;
  status: 'draft' | 'published';
}

export interface TractorFilters {
  condition?: 'new'|'used';
  search?: string;
  brandId?: string;
  minHp?: number;
  maxHp?: number;
  transmission?: string;
  driveType?: string;
  maxPrice?: number;
  pageSize?: number;
}
