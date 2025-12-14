import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight, CheckCircle2, ClipboardList, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { Inspection, Property } from '@/types';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const statusColors: Record<string, string> = {
  pending: 'bg-warning',
  in_progress: 'bg-accent',
  completed: 'bg-success',
  approved: 'bg-success',
  rejected: 'bg-destructive',
};

const statusConfig: Record<string, { label: string; class: string; icon: typeof Clock }> = {
  pending: { label: 'Pendente', class: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  in_progress: { label: 'Em andamento', class: 'bg-accent/10 text-accent border-accent/30', icon: ClipboardList },
  completed: { label: 'Concluída', class: 'bg-success/10 text-success border-success/30', icon: CheckCircle2 },
  approved: { label: 'Aprovada', class: 'bg-success/10 text-success border-success/30', icon: CheckCircle2 },
  rejected: { label: 'Rejeitada', class: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
};

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function CorretorAgenda() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [properties, setProperties] = useState<Record<string, Property>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDayInspections, setSelectedDayInspections] = useState<Inspection[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(new Date(year, month, -i));
    }
    days.reverse();

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(selectedDate);

  const hasInspection = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return inspections.some(i => i.scheduledDate === dateStr);
  };

  const getInspectionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return inspections.filter(i => i.scheduledDate === dateStr);
  };

  const handleDayClick = (day: Date) => {
    const dayInspections = getInspectionsForDate(day);
    setClickedDate(day);
    setSelectedDayInspections(dayInspections);
    setDialogOpen(dayInspections.length > 0);
  };

  const monthYear = selectedDate.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  const prevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const todaysInspections = getInspectionsForDate(new Date());
  const getPropertyById = (id: string) => properties[id];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card px-4 pt-12 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground mb-1">Agenda</h1>
        <p className="text-muted-foreground">Suas vistorias agendadas</p>
      </header>

      {/* Calendar */}
      <div className="p-4">
        <div className="card-elevated p-4 mb-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="font-semibold text-foreground capitalize">{monthYear}</h2>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              const hasEvent = hasInspection(day);
              const dayInspections = getInspectionsForDate(day);
              const inspectionCount = dayInspections.length;

              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors",
                    isCurrentMonth ? "text-foreground" : "text-muted-foreground/40",
                    isToday && "bg-primary text-primary-foreground font-bold",
                    !isToday && hasEvent && "font-medium hover:bg-muted/80",
                    !isToday && !hasEvent && "hover:bg-muted"
                  )}
                >
                  <span>{day.getDate()}</span>
                  {hasEvent && (
                    <div className="absolute bottom-1 flex items-center justify-center gap-0.5">
                      {inspectionCount > 1 ? (
                        <span className="text-[10px] font-semibold px-1 py-0.5 rounded bg-accent text-accent-foreground">
                          {inspectionCount}
                        </span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Today's inspections */}
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Hoje
          </h3>
          
          {loading ? (
            <div className="card-elevated p-6 text-center">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : todaysInspections.length === 0 ? (
            <div className="card-elevated p-6 text-center">
              <p className="text-muted-foreground">Nenhuma vistoria agendada para hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysInspections.map((inspection) => {
                const property = getPropertyById(inspection.propertyId);
                const status = statusConfig[inspection.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                
                return (
                  <button
                    key={inspection.id}
                    onClick={() => navigate(`/corretor/inspection/${inspection.id}`)}
                    className="w-full card-elevated p-4 text-left hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border",
                        status.class
                      )}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {property?.building || property?.address}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{property?.unit}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {inspection.scheduledTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {property?.neighborhood}
                          </span>
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
        </div>
      </div>

      {/* Dialog para mostrar vistorias do dia selecionado */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Vistorias - {clickedDate?.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
              })}
            </DialogTitle>
            <DialogDescription>
              {selectedDayInspections.length} {selectedDayInspections.length === 1 ? 'vistoria agendada' : 'vistorias agendadas'} para este dia
            </DialogDescription>
          </DialogHeader>
          
          {selectedDayInspections.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">Nenhuma vistoria agendada para este dia</p>
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {selectedDayInspections.map((inspection) => {
                const property = getPropertyById(inspection.propertyId);
                const status = statusConfig[inspection.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                
                return (
                  <button
                    key={inspection.id}
                    onClick={() => {
                      setDialogOpen(false);
                      navigate(`/corretor/inspection/${inspection.id}`);
                    }}
                    className="w-full card-elevated p-4 text-left hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border",
                        status.class
                      )}>
                        <StatusIcon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-lg mb-1">
                          {property?.building || property?.address}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {property?.unit} • {property?.neighborhood}, {property?.city}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {inspection.scheduledTime}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {property?.address}
                          </span>
                        </div>
                        <div className="mt-3">
                          <span className={cn("px-3 py-1 rounded-full border text-sm font-medium", status.class)}>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
