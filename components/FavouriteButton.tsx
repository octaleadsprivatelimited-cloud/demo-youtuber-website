'use client';
import type { FavouriteRecord } from '@/services/phase-three';

export function FavouriteButton({ itemId, itemType, title, href, image, compact = false }: Omit<FavouriteRecord, 'id'|'userId'|'createdAt'> & { compact?: boolean }) {
  void itemId; void itemType; void title; void href; void image; void compact;
  return null;
}
