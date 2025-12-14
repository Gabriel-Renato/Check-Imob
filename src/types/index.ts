export type UserRole = 'admin' | 'corretor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Property {
  id: string;
  address: string;
  unit: string;
  building?: string;
  neighborhood: string;
  city: string;
  imageUrl?: string;
}

export interface InspectionCard {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export type InspectionStatus = 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected';
export type CardStatus = 'ok' | 'defect' | 'non_compliant' | null;

export interface CardInspection {
  cardId: string;
  status: CardStatus;
  observation?: string;
  photos: InspectionPhoto[];
}

export interface InspectionPhoto {
  id: string;
  url: string;
  annotations?: PhotoAnnotation[];
}

export interface PhotoAnnotation {
  type: 'circle' | 'arrow' | 'point';
  x: number;
  y: number;
  radius?: number;
  endX?: number;
  endY?: number;
}

export interface Inspection {
  id: string;
  propertyId: string;
  corretorId: string;
  scheduledDate: string;
  scheduledTime: string;
  status: InspectionStatus;
  cards: CardInspection[];
  createdAt: string;
  completedAt?: string;
}

export interface DashboardStats {
  totalInspections: number;
  pendingInspections: number;
  completedInspections: number;
  propertiesCount: number;
  corretoresCount: number;
}
