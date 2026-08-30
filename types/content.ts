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
  variant?: string;
  powerCategory?: string;
  ratedRpm?: number;
  torqueNm?: number;
  coolingSystem?: string;
  airFilter?: string;
  clutchType?: string;
  forwardGears?: number;
  reverseGears?: number;
  steeringType?: string;
  brakeType?: string;
  maxForwardSpeedKmph?: number;
  ptoType?: string;
  ptoSpeeds?: string;
  hydraulicControls?: string;
  hydraulicPumpFlowLpm?: number;
  linkageCategory?: string;
  frontTyres?: string;
  rearTyres?: string;
  fuelTankLitres?: number;
  weightKg?: number;
  wheelbaseMm?: number;
  groundClearanceMm?: number;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  battery?: string;
  compatibleImplements?: string[];
  warranty?: string;
  serviceIntervalHours?: number;
  specificationNotes?: string;
  specificationSourceUrl?: string;
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
  inDemand?: boolean;
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
