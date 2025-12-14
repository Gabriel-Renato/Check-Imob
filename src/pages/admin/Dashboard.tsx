import { useEffect, useState } from 'react';
import { 
  ClipboardList, 
  Building2, 
  Users, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/services/api';
import { Inspection, Property, DashboardStats } from '@/types';
import { cn } from '@/lib/utils';

const statusLabels: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pendente', class: 'bg-warning/10 text-warning' },
  in_progress: { label: 'Em andamento', class: 'bg-accent/10 text-accent' },
  completed: { label: 'Concluída', class: 'bg-success/10 text-success' },
  approved: { label: 'Aprovada', class: 'bg-success/10 text-success' },
  rejected: { label: 'Rejeitada', class: 'bg-destructive/10 text-destructive' },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInspections: 0,
    pendingInspections: 0,
    completedInspections: 0,
    propertiesCount: 0,
    corretoresCount: 0,
  });
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, inspectionsData, propertiesData] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getInspections(),
        apiClient.getProperties()
      ]);

      setStats(statsData as DashboardStats);
      setInspections((inspectionsData as Inspection[]).slice(0, 4));
      setProperties((propertiesData as Property[]).slice(0, 4));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPropertyById = (id: string) => properties.find(p => p.id === id);

  const statsConfig = [
    {
      label: 'Total de Vistorias',
      value: stats.totalInspections,
      icon: ClipboardList,
      trend: '+12%',
      trendUp: true,
      color: 'bg-accent/10 text-accent',
    },
    {
      label: 'Vistorias Pendentes',
      value: stats.pendingInspections,
      icon: Clock,
      trend: '-5%',
      trendUp: false,
      color: 'bg-warning/10 text-warning',
    },
    {
      label: 'Concluídas',
      value: stats.completedInspections,
      icon: CheckCircle2,
      trend: '+8%',
      trendUp: true,
      color: 'bg-success/10 text-success',
    },
    {
      label: 'Imóveis Cadastrados',
      value: stats.propertiesCount,
      icon: Building2,
      trend: '+3',
      trendUp: true,
      color: 'bg-primary/10 text-primary',
    },
  ];
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral das vistorias e imóveis</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Últimos 30 dias
          </Button>
          <Button>
            Nova Vistoria
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat, index) => (
          <div
            key={stat.label}
            className="card-elevated p-5 hover:shadow-md transition-all duration-200"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                stat.trendUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              )}>
                <TrendingUp className={cn("w-3 h-3", !stat.trendUp && "rotate-180")} />
                {stat.trend}
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Inspections & Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inspections */}
        <div className="card-elevated">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Vistorias Recentes</h2>
            <Button variant="ghost" size="sm" className="text-accent">
              Ver todas
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Carregando...</div>
            ) : inspections.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">Nenhuma vistoria encontrada</div>
            ) : (
              inspections.map((inspection) => {
                const property = getPropertyById(inspection.propertyId);
                const status = statusLabels[inspection.status] || statusLabels.pending;
                return (
                  <div key={inspection.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {property?.building || property?.address}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {property?.unit} • {property?.neighborhood}
                        </p>
                      </div>
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap", status.class)}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{inspection.scheduledDate}</span>
                      <span>{inspection.scheduledTime}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Properties */}
        <div className="card-elevated">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Imóveis</h2>
            <Button variant="ghost" size="sm" className="text-accent">
              Ver todos
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Carregando...</div>
            ) : properties.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">Nenhum imóvel encontrado</div>
            ) : (
              properties.map((property) => (
                <div key={property.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {property.building || property.address}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {property.unit} • {property.neighborhood}, {property.city}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
