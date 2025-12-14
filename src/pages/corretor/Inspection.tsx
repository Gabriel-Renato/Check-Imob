import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Camera,
  ChevronRight,
  MapPin,
  Clock,
  Sofa,
  UtensilsCrossed,
  BedDouble,
  Bath,
  Sun,
  WashingMachine,
  DoorOpen,
  Bed,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { mockInspections, mockInspectionCards, getPropertyById } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { CardStatus } from '@/types';
import { toast } from 'sonner';

const iconMap: Record<string, typeof Sofa> = {
  'sofa': Sofa,
  'utensils': UtensilsCrossed,
  'bed-double': BedDouble,
  'bed-single': Bed,
  'bath': Bath,
  'door-open': DoorOpen,
  'sun': Sun,
  'washing-machine': WashingMachine,
};

const statusConfig = {
  ok: { 
    label: 'Ok', 
    icon: CheckCircle2, 
    class: 'bg-success text-success-foreground',
    borderClass: 'border-success',
  },
  defect: { 
    label: 'Com defeito', 
    icon: AlertTriangle, 
    class: 'bg-warning text-warning-foreground',
    borderClass: 'border-warning',
  },
  non_compliant: { 
    label: 'Não conforme', 
    icon: XCircle, 
    class: 'bg-destructive text-destructive-foreground',
    borderClass: 'border-destructive',
  },
};

interface CardData {
  status: CardStatus;
  observation: string;
  hasPhoto: boolean;
}

export default function Inspection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inspection = mockInspections.find(i => i.id === id);
  const property = inspection ? getPropertyById(inspection.propertyId) : null;
  
  const [cardStates, setCardStates] = useState<Record<string, CardData>>({});
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [showPhotoPrompt, setShowPhotoPrompt] = useState(false);

  if (!inspection || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Vistoria não encontrada</p>
      </div>
    );
  }

  const handleStatusSelect = (cardId: string, status: CardStatus) => {
    const currentState = cardStates[cardId] || { status: null, observation: '', hasPhoto: false };
    
    if (status !== 'ok' && !currentState.hasPhoto) {
      setActiveCardId(cardId);
      setShowPhotoPrompt(true);
    }
    
    setCardStates(prev => ({
      ...prev,
      [cardId]: { ...currentState, status }
    }));
  };

  const handlePhotoCapture = (cardId: string) => {
    // Simulate photo capture
    setCardStates(prev => ({
      ...prev,
      [cardId]: { ...prev[cardId], hasPhoto: true }
    }));
    setShowPhotoPrompt(false);
    toast.success('Foto capturada com sucesso!');
  };

  const handleObservation = (cardId: string, observation: string) => {
    setCardStates(prev => ({
      ...prev,
      [cardId]: { ...prev[cardId], observation }
    }));
  };

  const allCardsCompleted = mockInspectionCards.every(card => {
    const state = cardStates[card.id];
    if (!state?.status) return false;
    if (state.status !== 'ok' && !state.hasPhoto) return false;
    return true;
  });

  const handleSubmit = () => {
    if (!allCardsCompleted) {
      toast.error('Complete todos os ambientes antes de enviar');
      return;
    }
    toast.success('Vistoria enviada com sucesso!');
    navigate('/corretor');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary px-4 pt-12 pb-6 sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/corretor')}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-primary-foreground">
              {property.building || property.address}
            </h1>
            <p className="text-sm text-primary-foreground/70">{property.unit}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-primary-foreground/70">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {property.neighborhood}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {inspection.scheduledTime}
          </div>
        </div>
      </header>

      {/* Cards List */}
      <main className="px-4 py-6 space-y-4">
        {mockInspectionCards.map((card, index) => {
          const CardIcon = iconMap[card.icon] || Sofa;
          const state = cardStates[card.id];
          const isExpanded = activeCardId === card.id;
          
          return (
            <div
              key={card.id}
              className="card-elevated overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Card Header */}
              <button
                onClick={() => setActiveCardId(isExpanded ? null : card.id)}
                className="w-full p-4 flex items-center gap-4"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  state?.status 
                    ? statusConfig[state.status].class
                    : "bg-muted"
                )}>
                  <CardIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{card.name}</p>
                  {state?.status && (
                    <p className={cn(
                      "text-sm",
                      state.status === 'ok' ? 'text-success' : 
                      state.status === 'defect' ? 'text-warning' : 'text-destructive'
                    )}>
                      {statusConfig[state.status].label}
                      {state.hasPhoto && ' • Foto anexada'}
                    </p>
                  )}
                </div>
                <ChevronRight className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform duration-200",
                  isExpanded && "rotate-90"
                )} />
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-border animate-fade-in">
                  {/* Status Buttons */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {(Object.entries(statusConfig) as [CardStatus, typeof statusConfig.ok][]).map(([key, config]) => {
                      const StatusIcon = config.icon;
                      const isSelected = state?.status === key;
                      return (
                        <button
                          key={key}
                          onClick={() => handleStatusSelect(card.id, key)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                            isSelected 
                              ? `${config.class} ${config.borderClass}` 
                              : "border-border bg-background hover:border-muted-foreground/30"
                          )}
                        >
                          <StatusIcon className="w-5 h-5" />
                          <span className="text-xs font-medium">{config.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Photo capture for defects */}
                  {state?.status && state.status !== 'ok' && (
                    <div className="mb-4">
                      {state.hasPhoto ? (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/30">
                          <CheckCircle2 className="w-5 h-5 text-success" />
                          <span className="text-sm text-success font-medium">Foto capturada</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="ml-auto text-success"
                            onClick={() => handlePhotoCapture(card.id)}
                          >
                            <Camera className="w-4 h-4 mr-1" />
                            Nova foto
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-20 border-dashed border-2"
                          onClick={() => handlePhotoCapture(card.id)}
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          Capturar foto do defeito
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Observation */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Observação (opcional)
                    </label>
                    <Textarea
                      placeholder="Descreva detalhes adicionais..."
                      value={state?.observation || ''}
                      onChange={(e) => handleObservation(card.id, e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </main>

      {/* Submit Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <Button
          size="lg"
          className="w-full h-14"
          onClick={handleSubmit}
          disabled={!allCardsCompleted}
        >
          <Send className="w-5 h-5 mr-2" />
          Finalizar e Enviar Vistoria
        </Button>
      </div>

      {/* Photo Prompt Modal */}
      {showPhotoPrompt && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl p-6 animate-slide-in-bottom">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Foto obrigatória
            </h3>
            <p className="text-muted-foreground mb-6">
              Para registrar um defeito ou não conformidade, é necessário anexar uma foto.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPhotoPrompt(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={() => activeCardId && handlePhotoCapture(activeCardId)}
              >
                <Camera className="w-4 h-4 mr-2" />
                Capturar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
