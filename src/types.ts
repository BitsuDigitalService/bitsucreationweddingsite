export interface FamilyDetails {
  father: string;
  mother: string;
  village: string;
  po: string;
  ps: string;
  district: string;
  pin: string;
}

export interface Couple {
  name1: string;
  name2: string;
  story: string;
  imageUrl: string;
  family1?: FamilyDetails;
  family2?: FamilyDetails;
}

export interface EventDetail {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  icon: string;
}

export interface GalleryItem {
  url: string;
  category: string;
  title: string;
}

export type BagStatus = 'active' | 'collected' | 'deleted';

export interface WeddingBag {
  id: string;
  unique_tag_code: string;
  guest_name: string;
  phone_number: string;
  room_name: string;
  bag_image: string;
  bag_status: BagStatus;
  created_at: string;
  collected_at?: string | null;
  print_status?: 'pending' | 'printed';
  scan_count?: number;
  last_scanned_at?: string | null;
}
