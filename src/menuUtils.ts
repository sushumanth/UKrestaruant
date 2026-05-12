import type { MenuItem } from '@/types';

export const formatMenuRating = (rating?: number | null) => Number(rating ?? 0).toFixed(1);

export const formatMenuPrice = (price?: number | null) => Number(price ?? 0).toFixed(2);

export const getVisibleMenuItems = (
  menuItems: MenuItem[],
  searchQuery: string,
  activeCategory: string | 'all',
): MenuItem[] => {
  const query = searchQuery.trim().toLowerCase();
  const visibleItems: MenuItem[] = [];

  for (const item of menuItems) {
    if (!item.isActive) {
      continue;
    }

    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesQuery =
      !query ||
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);

    if (matchesCategory && matchesQuery) {
      visibleItems.push(item);
    }
  }

  return visibleItems.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
};