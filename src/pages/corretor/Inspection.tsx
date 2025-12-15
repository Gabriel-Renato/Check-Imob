import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  Send,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { CardStatus, Inspection as InspectionType, Property, InspectionCard } from '@/types';
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
  status: CardStatus | null;
  observation: string;
  hasPhoto: boolean;
  photos?: Array<{ id: string; url: string }>;
}

export default function Inspection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inspection, setInspection] = useState<InspectionType | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [inspectionCards, setInspectionCards] = useState<InspectionCard[]>([]);
  const [cardStates, setCardStates] = useState<Record<string, CardData>>({});
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [showPhotoPrompt, setShowPhotoPrompt] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Determinar se é admin ou corretor baseado na rota
  const isAdmin = location.pathname.startsWith('/admin');
  const backUrl = isAdmin ? '/admin/inspections' : '/corretor';

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inspectionData, cardsData] = await Promise.all([
        apiClient.getInspection(id!),
        apiClient.getInspectionCards()
      ]);

      const inspectionObj = inspectionData as InspectionType;
      setInspection(inspectionObj);

      // Buscar propriedade
      if (inspectionObj.propertyId) {
        const prop = await apiClient.getProperty(inspectionObj.propertyId);
        setProperty(prop as Property);
      }

      // Definir cards
      setInspectionCards(cardsData as InspectionCard[]);

      // Inicializar estados dos cards a partir da vistoria
      const states: Record<string, CardData> = {};
      if (inspectionObj.cards) {
        inspectionObj.cards.forEach(card => {
          states[card.cardId] = {
            status: card.status || null,
            observation: card.observation || '',
            hasPhoto: card.photos && card.photos.length > 0,
            photos: card.photos || []
          };
        });
      }
      setCardStates(states);
    } catch (error) {
      console.error('Erro ao carregar vistoria:', error);
      toast.error('Erro ao carregar vistoria');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusSelect = async (cardId: string, status: CardStatus) => {
    const currentState = cardStates[cardId] || { status: null, observation: '', hasPhoto: false };
    
    if (status !== 'ok' && !currentState.hasPhoto) {
      setActiveCardId(cardId);
      setShowPhotoPrompt(true);
      return;
    }
    
    // Atualizar estado local
    setCardStates(prev => ({
      ...prev,
      [cardId]: { ...currentState, status }
    }));

    // Salvar na API
    await saveCardState(cardId, { ...currentState, status });
  };

  const saveCardState = async (cardId: string, state: CardData) => {
    if (!inspection || !id) return;

    try {
      const cards = inspection.cards || [];
      const cardIndex = cards.findIndex(c => c.cardId === cardId);
      
      const cardData = {
        cardId,
        status: state.status,
        observation: state.observation
      };

      let updatedCards = [...cards];
      if (cardIndex >= 0) {
        updatedCards[cardIndex] = { ...updatedCards[cardIndex], ...cardData };
      } else {
        updatedCards.push({ ...cardData, photos: [] });
      }

      await apiClient.updateInspection(id, {
        cards: updatedCards,
        status: 'in_progress'
      });
    } catch (error) {
      console.error('Erro ao salvar estado do card:', error);
      toast.error('Erro ao salvar alterações');
    }
  };

  const handlePhotoCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeCardId || !inspection?.id) return;

    try {
      setShowPhotoPrompt(false);
      toast.loading('Enviando foto...', { id: 'upload' });

      const result = await apiClient.uploadPhoto(inspection.id, activeCardId, file);
      
      // Atualizar estado do card
      const currentState = cardStates[activeCardId] || { status: null, observation: '', hasPhoto: false };
      setCardStates(prev => ({
        ...prev,
        [activeCardId]: { 
          ...currentState, 
          hasPhoto: true,
          photos: [...(currentState.photos || []), result]
        }
      }));

      // Atualizar vistoria
      const updatedCards = (inspection.cards || []).map(card => {
        if (card.cardId === activeCardId) {
          return {
            ...card,
            photos: [...(card.photos || []), result]
          };
        }
        return card;
      });

      await apiClient.updateInspection(inspection.id, { cards: updatedCards });

      toast.success('Foto enviada com sucesso!', { id: 'upload' });
      
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar foto', { id: 'upload' });
    }
  };

  const handleObservation = async (cardId: string, observation: string) => {
    const currentState = cardStates[cardId] || { status: null, observation: '', hasPhoto: false };
    
    setCardStates(prev => ({
      ...prev,
      [cardId]: { ...currentState, observation }
    }));

    // Salvar na API
    await saveCardState(cardId, { ...currentState, observation });
  };

  const allCardsCompleted = inspectionCards.every(card => {
    const state = cardStates[card.id];
    if (!state?.status) return false;
    if (state.status !== 'ok' && !state.hasPhoto) return false;
    return true;
  });

  const handleSubmit = async () => {
    if (!allCardsCompleted) {
      toast.error('Complete todos os ambientes antes de enviar');
      return;
    }

    if (!inspection || !id) return;

    try {
      setSaving(true);
      await apiClient.updateInspection(id, {
        status: 'completed'
      });
      
      toast.success('Vistoria enviada com sucesso!');
      navigate(backUrl);
    } catch (error) {
      console.error('Erro ao enviar vistoria:', error);
      toast.error('Erro ao enviar vistoria');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando vistoria...</p>
      </div>
    );
  }

  if (!inspection || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Vistoria não encontrada</p>
        <Button onClick={() => navigate(backUrl)} variant="outline">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <header className="bg-primary px-4 pt-12 pb-6 sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(backUrl)}
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
        {inspectionCards.map((card, index) => {
          const CardIcon = iconMap[card.icon] || Sofa;
          const state = cardStates[card.id];
          const isExpanded = activeCardId === card.id;
          
          // Obter fotos do card, seja do estado ou da vistoria
          const cardPhotos = state?.photos || 
            (inspection?.cards?.find(c => c.cardId === card.id)?.photos || []);
          
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
                          onClick={() => !isAdmin && handleStatusSelect(card.id, key)}
                          disabled={isAdmin}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                            isSelected 
                              ? `${config.class} ${config.borderClass}` 
                              : "border-border bg-background hover:border-muted-foreground/30",
                            isAdmin && "opacity-60 cursor-not-allowed"
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
                    <div className="mb-4 space-y-3">
                      {(state.hasPhoto && cardPhotos.length > 0) ? (
                        <>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/30">
                            <CheckCircle2 className="w-5 h-5 text-success" />
                            <span className="text-sm text-success font-medium">
                              {cardPhotos.length} {cardPhotos.length === 1 ? 'foto capturada' : 'fotos capturadas'}
                            </span>
                            {!isAdmin && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="ml-auto text-success"
                                onClick={() => {
                                  setActiveCardId(card.id);
                                  handlePhotoCapture();
                                }}
                              >
                                <Camera className="w-4 h-4 mr-1" />
                                Nova foto
                              </Button>
                            )}
                          </div>
                          {/* Photo Gallery */}
                          <div className="grid grid-cols-2 gap-3">
                            {cardPhotos.map((photo) => (
                              <button
                                key={photo.id}
                                onClick={() => setSelectedPhoto(photo)}
                                className="relative group cursor-pointer"
                              >
                                <img
                                  src={photo.url}
                                  alt="Foto da vistoria"
                                  className="w-full h-32 object-cover rounded-lg border border-border transition-transform group-hover:scale-105"
                                  onError={(e) => {
                                    console.error('Erro ao carregar imagem:', photo.url);
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ccc"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3EErro%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                                  <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        !isAdmin && (
                          <Button
                            variant="outline"
                            className="w-full h-20 border-dashed border-2"
                            onClick={() => {
                              setActiveCardId(card.id);
                              handlePhotoCapture();
                            }}
                          >
                            <Camera className="w-5 h-5 mr-2" />
                            Capturar foto do defeito
                          </Button>
                        )
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
                      onChange={(e) => !isAdmin && handleObservation(card.id, e.target.value)}
                      disabled={isAdmin}
                      readOnly={isAdmin}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </main>

      {/* Submit Button - Apenas para corretores */}
      {!isAdmin && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <Button
            size="lg"
            className="w-full h-14"
            onClick={handleSubmit}
            disabled={!allCardsCompleted || saving}
          >
            <Send className="w-5 h-5 mr-2" />
            {saving ? 'Enviando...' : 'Finalizar e Enviar Vistoria'}
          </Button>
        </div>
      )}

      {/* Photo Viewer Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none">
          {selectedPhoto && (
            <div className="relative">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedPhoto.url}
                alt="Foto da vistoria ampliada"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  console.error('Erro ao carregar imagem:', selectedPhoto.url);
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ccc"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3EErro%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                onClick={() => {
                  setShowPhotoPrompt(false);
                  handlePhotoCapture();
                }}
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
