import { User, Property, InspectionCard, Inspection, DashboardStats } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ricardo Mendes',
    email: 'admin@vistoria.com',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Ana Carolina Silva',
    email: 'ana.silva@vistoria.com',
    role: 'corretor',
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@vistoria.com',
    role: 'corretor',
  },
];

export const mockProperties: Property[] = [
  {
    id: '1',
    address: 'Rua das Palmeiras, 234',
    unit: 'Apt 1201',
    building: 'Edifício Aurora',
    neighborhood: 'Jardins',
    city: 'São Paulo',
  },
  {
    id: '2',
    address: 'Av. Atlântica, 1500',
    unit: 'Apt 801',
    building: 'Ocean Tower',
    neighborhood: 'Copacabana',
    city: 'Rio de Janeiro',
  },
  {
    id: '3',
    address: 'Rua Oscar Freire, 890',
    unit: 'Apt 302',
    building: 'Residencial Prime',
    neighborhood: 'Pinheiros',
    city: 'São Paulo',
  },
  {
    id: '4',
    address: 'Alameda Santos, 1200',
    unit: 'Apt 1502',
    building: 'Metropolitan',
    neighborhood: 'Cerqueira César',
    city: 'São Paulo',
  },
];

export const mockInspectionCards: InspectionCard[] = [
  { id: '1', name: 'Sala de Estar', icon: 'sofa', order: 1 },
  { id: '2', name: 'Cozinha', icon: 'utensils', order: 2 },
  { id: '3', name: 'Quarto 1', icon: 'bed-double', order: 3 },
  { id: '4', name: 'Quarto 2', icon: 'bed-single', order: 4 },
  { id: '5', name: 'Banheiro Social', icon: 'bath', order: 5 },
  { id: '6', name: 'Suíte', icon: 'door-open', order: 6 },
  { id: '7', name: 'Varanda', icon: 'sun', order: 7 },
  { id: '8', name: 'Área de Serviço', icon: 'washing-machine', order: 8 },
];

export const mockInspections: Inspection[] = [
  {
    id: '1',
    propertyId: '1',
    corretorId: '2',
    scheduledDate: '2024-12-15',
    scheduledTime: '09:00',
    status: 'pending',
    cards: [],
    createdAt: '2024-12-10',
  },
  {
    id: '2',
    propertyId: '2',
    corretorId: '2',
    scheduledDate: '2024-12-16',
    scheduledTime: '14:00',
    status: 'in_progress',
    cards: [
      { cardId: '1', status: 'ok', observation: '', photos: [] },
      { cardId: '2', status: 'defect', observation: 'Torneira com vazamento', photos: [{ id: '1', url: '/placeholder.svg' }] },
    ],
    createdAt: '2024-12-10',
  },
  {
    id: '3',
    propertyId: '3',
    corretorId: '3',
    scheduledDate: '2024-12-14',
    scheduledTime: '10:30',
    status: 'completed',
    cards: mockInspectionCards.map(card => ({
      cardId: card.id,
      status: 'ok' as const,
      observation: '',
      photos: [],
    })),
    createdAt: '2024-12-08',
    completedAt: '2024-12-14',
  },
  {
    id: '4',
    propertyId: '4',
    corretorId: '2',
    scheduledDate: '2024-12-17',
    scheduledTime: '11:00',
    status: 'pending',
    cards: [],
    createdAt: '2024-12-12',
  },
];

export const mockDashboardStats: DashboardStats = {
  totalInspections: 24,
  pendingInspections: 8,
  completedInspections: 16,
  propertiesCount: 12,
  corretoresCount: 5,
};

export const getPropertyById = (id: string) => mockProperties.find(p => p.id === id);
export const getUserById = (id: string) => mockUsers.find(u => u.id === id);
export const getInspectionsByCorretor = (corretorId: string) => 
  mockInspections.filter(i => i.corretorId === corretorId);
