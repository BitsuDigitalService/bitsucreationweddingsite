export type GalleryCouple = 'sandeep_asha' | 'anand_sushila' | 'both';

export interface ParsedCategory {
  couple: GalleryCouple;
  folder: string;
}

/**
 * Parses a database/storage category string into couple and sub-folder names.
 * Supports backward compatibility for old category structures.
 */
export function parseCategory(category: string = ''): ParsedCategory {
  const normalized = category.trim();

  // If new double underscore convention is used: couple__folder
  if (normalized.includes('__')) {
    const [coupleStr, ...rest] = normalized.split('__');
    const folder = rest.join('__') || 'general';
    const couple: GalleryCouple = 
      coupleStr === 'sandeep_asha' || coupleStr === 'anand_sushila'
        ? coupleStr
        : 'both';
    return { couple, folder };
  }

  // Backward compatibility: check if it starts with couple names
  if (normalized.startsWith('sandeep_asha')) {
    const folder = normalized.replace('sandeep_asha', '').replace(/^[-_]+/, '') || 'general';
    return { couple: 'sandeep_asha', folder };
  }
  if (normalized.startsWith('anand_sushila')) {
    const folder = normalized.replace('anand_sushila', '').replace(/^[-_]+/, '') || 'general';
    return { couple: 'anand_sushila', folder };
  }

  // Default: treat as shared/both category
  return {
    couple: 'both',
    folder: normalized || 'general',
  };
}

/**
 * Formats couple and folder name into a database-safe category string.
 */
export function formatCategory(couple: GalleryCouple, folder: string): string {
  const cleanFolder = folder.trim().toLowerCase().replace(/\s+/g, '-');
  if (couple === 'both') {
    return cleanFolder;
  }
  return `${couple}__${cleanFolder}`;
}

/**
 * Returns a human-friendly label for the couple.
 */
export function getCoupleDisplay(couple: GalleryCouple): string {
  switch (couple) {
    case 'sandeep_asha':
      return 'Sandeep & Asha';
    case 'anand_sushila':
      return 'Anand & Sushila';
    case 'both':
      return 'All photos';
    default:
      return 'General';
  }
}
