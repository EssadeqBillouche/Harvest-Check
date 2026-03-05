// ─── Farmer (Agriculteur) ────────────────────────────────────────────────────

export interface Farmer {
  id: string;
  uid: string; // Firebase Auth UID
  email: string;
  displayName: string;
  phone: string;
  address: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

export type FarmerFormData = Omit<Farmer, 'id' | 'uid' | 'createdAt' | 'updatedAt'>;

// ─── Parcel (Parcelle) ──────────────────────────────────────────────────────

export type ParcelStatus = 'active' | 'fallow' | 'archived';

export interface Parcel {
  id: string;
  farmerId: string;
  name: string;
  surface: number; // in hectares
  location: string;
  status: ParcelStatus;
  createdAt: string;
  updatedAt: string;
}

export type ParcelFormData = Omit<Parcel, 'id' | 'farmerId' | 'createdAt' | 'updatedAt'>;

// ─── Zone ────────────────────────────────────────────────────────────────────

export interface Zone {
  id: string;
  parcelId: string;
  name: string;
  surface: number; // in hectares (subset of parcel surface)
  createdAt: string;
  updatedAt: string;
}

export type ZoneFormData = Omit<Zone, 'id' | 'parcelId' | 'createdAt' | 'updatedAt'>;

// ─── Culture ─────────────────────────────────────────────────────────────────

export type CultureStatus = 'planned' | 'growing' | 'harvested' | 'failed';

export type CultureType =
  | 'cereals'
  | 'vegetables'
  | 'fruits'
  | 'legumes'
  | 'oilseeds'
  | 'other';

export interface Culture {
  id: string;
  parcelId: string;
  zoneId: string;
  name: string;
  type: CultureType;
  plantingDate: string; // ISO date
  expectedHarvestDate: string; // ISO date
  status: CultureStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type CultureFormData = Omit<Culture, 'id' | 'parcelId' | 'zoneId' | 'createdAt' | 'updatedAt'>;

// ─── Harvest (Récolte) ──────────────────────────────────────────────────────

export type HarvestQuality = 'excellent' | 'good' | 'average' | 'poor';

export interface Harvest {
  id: string;
  parcelId: string;
  zoneId: string;
  cultureId: string;
  date: string; // ISO date
  weight: number; // in kg
  quality: HarvestQuality;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type HarvestFormData = Omit<Harvest, 'id' | 'parcelId' | 'zoneId' | 'cultureId' | 'createdAt' | 'updatedAt'>;

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthState {
  user: Farmer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Common ──────────────────────────────────────────────────────────────────

export interface SelectOption {
  label: string;
  value: string;
}
