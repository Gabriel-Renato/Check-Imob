import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ClipboardList, MapPin, ChevronRight, Filter, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { Inspection, Property } from '@/types';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

type FilterType = 'all' | 'pending' | 'in_progress' | 'completed';

const statusConfig: Record<string, { label: string; class: string; icon: typeof Clock }> = {
  pending: { label: 'Pendente', class: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  in_progress: { label: 'Em andamento', class: 'bg-accent/10 text-accent border-accent/30', icon: ClipboardList },
  completed: { label: 'Concluída', class: 'bg-success/10 text-success border-success/30', icon: CheckCircle2 },
  approved: { label: 'Aprovada', class: 'bg-success/10 text-success border-success/30', icon: CheckCircle2 },
  rejected: { label: 'Rejeitada', class: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
};

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'in_progress', label: 'Em andamento' },
  { key: 'completed', label: 'Concluídas' },
];

export default function CorretorInspectionsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [properties, setProperties] = useState<Record<string, Property>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inspectionsData, propertiesData] = await Promise.all([
        apiClient.getInspections(user?.id),
        apiClient.getProperties()
      ]);

      setInspections(inspectionsData as Inspection[]);
      
      // Criar mapa de propriedades por ID
      const propsMap: Record<string, Property> = {};
      (propertiesData as Property[]).forEach(prop => {
        propsMap[prop.id] = prop;
      });
      setProperties(propsMap);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPropertyById = (id: string) => properties[id];

  const filteredInspections = activeFilter === 'all' 
    ? inspections 
    : inspections.filter(i => i.status === activeFilter);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card px-4 pt-12 pb-4 border-b border-border sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vistorias</h1>
            <p className="text-sm text-muted-foreground">{inspections.length} vistorias atribuídas</p>
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                activeFilter === filter.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      {/* List */}
      <main className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4 animate-pulse" />
            <p className="text-muted-foreground">Carregando vistorias...</p>
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {activeFilter === 'all' 
                ? 'Nenhuma vistoria encontrada' 
                : `Nenhuma vistoria ${filters.find(f => f.key === activeFilter)?.label.toLowerCase()} encontrada`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInspections.map((inspection, index) => {
              const property = getPropertyById(inspection.propertyId);
              const status = statusConfig[inspection.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <button
                  key={inspection.id}
                  onClick={() => navigate(`/corretor/inspection/${inspection.id}`)}
                  className="w-full card-elevated p-4 text-left hover:shadow-md transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
                      status.class
                    )}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {property?.building || property?.address}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {property?.unit}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                      </div>
                        <div className="flex items-center flex-wrap gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {property?.neighborhood || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {inspection.scheduledDate} • {inspection.scheduledTime}
                        </div>
                        <span className={cn("px-2 py-0.5 rounded-full border text-xs font-medium", status.class)}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
