import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  MapPin,
  ChevronRight,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getInspectionsByCorretor, getPropertyById } from '@/data/mockData';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; class: string; icon: typeof Clock }> = {
  pending: { label: 'Pendente', class: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  in_progress: { label: 'Em andamento', class: 'bg-accent/10 text-accent border-accent/30', icon: ClipboardList },
  completed: { label: 'Concluída', class: 'bg-success/10 text-success border-success/30', icon: CheckCircle2 },
};

export default function CorretorHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const inspections = user ? getInspectionsByCorretor(user.id) : [];

  const pendingCount = inspections.filter(i => i.status === 'pending').length;
  const inProgressCount = inspections.filter(i => i.status === 'in_progress').length;

  const today = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary px-4 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm capitalize">{today}</p>
            <h1 className="text-xl font-bold text-primary-foreground mt-1">
              Olá, {user?.name.split(' ')[0]}!
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <span className="text-primary-foreground font-semibold">
              {user?.name.charAt(0)}
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-3">
          <div className="flex-1 bg-primary-foreground/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-primary-foreground/70 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Pendentes</span>
            </div>
            <p className="text-2xl font-bold text-primary-foreground">{pendingCount}</p>
          </div>
          <div className="flex-1 bg-primary-foreground/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-primary-foreground/70 mb-1">
              <ClipboardList className="w-4 h-4" />
              <span className="text-xs">Em andamento</span>
            </div>
            <p className="text-2xl font-bold text-primary-foreground">{inProgressCount}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 -mt-4">
        {/* Quick action */}
        <div className="card-elevated p-4 mb-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Próxima vistoria</p>
                <p className="text-sm text-muted-foreground">Hoje às 09:00</p>
              </div>
            </div>
            <Button size="sm">
              Iniciar
            </Button>
          </div>
        </div>

        {/* Inspections list */}
        <div className="mb-6">
          <h2 className="font-semibold text-foreground mb-4">Suas Vistorias</h2>
          <div className="space-y-3">
            {inspections.map((inspection, index) => {
              const property = getPropertyById(inspection.propertyId);
              const status = statusConfig[inspection.status];
              const StatusIcon = status.icon;
              
              return (
                <button
                  key={inspection.id}
                  onClick={() => navigate(`/corretor/inspection/${inspection.id}`)}
                  className="w-full card-elevated p-4 text-left hover:shadow-md transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
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
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {property?.neighborhood}
                        </div>
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full border",
                          status.class
                        )}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
