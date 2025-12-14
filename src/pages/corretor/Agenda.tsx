import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getInspectionsByCorretor, getPropertyById } from '@/data/mockData';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  pending: 'bg-warning',
  in_progress: 'bg-accent',
  completed: 'bg-success',
};

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function CorretorAgenda() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const inspections = user ? getInspectionsByCorretor(user.id) : [];

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

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "relative aspect-square flex items-center justify-center rounded-lg text-sm transition-colors",
                    isCurrentMonth ? "text-foreground" : "text-muted-foreground/40",
                    isToday && "bg-primary text-primary-foreground font-bold",
                    !isToday && hasEvent && "font-medium",
                    !isToday && "hover:bg-muted"
                  )}
                >
                  {day.getDate()}
                  {hasEvent && !isToday && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-accent" />
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
          
          {todaysInspections.length === 0 ? (
            <div className="card-elevated p-6 text-center">
              <p className="text-muted-foreground">Nenhuma vistoria agendada para hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysInspections.map((inspection) => {
                const property = getPropertyById(inspection.propertyId);
                return (
                  <button
                    key={inspection.id}
                    onClick={() => navigate(`/corretor/inspection/${inspection.id}`)}
                    className="w-full card-elevated p-4 text-left hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-1 h-full rounded-full self-stretch",
                        statusColors[inspection.status]
                      )} />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {property?.building || property?.address}
                        </p>
                        <p className="text-sm text-muted-foreground">{property?.unit}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {inspection.scheduledTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {property?.neighborhood}
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
    </div>
  );
}
