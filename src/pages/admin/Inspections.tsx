import { useEffect, useState } from 'react';
import { ClipboardList, Search, Clock, CheckCircle2, XCircle, AlertTriangle, Building2, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/services/api';
import { Inspection, Property, User as UserType } from '@/types';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; class: string; icon: typeof Clock }> = {
  pending: { label: 'Pendente', class: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
  in_progress: { label: 'Em andamento', class: 'bg-accent/10 text-accent border-accent/30', icon: ClipboardList },
  completed: { label: 'Concluída', class: 'bg-success/10 text-success border-success/30', icon: CheckCircle2 },
  approved: { label: 'Aprovada', class: 'bg-success/10 text-success border-success/30', icon: CheckCircle2 },
  rejected: { label: 'Rejeitada', class: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle },
};

export default function AdminInspections() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [corretores, setCorretores] = useState<UserType[]>([]);
  const [propertiesMap, setPropertiesMap] = useState<Record<string, Property>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    property_id: '',
    corretor_id: '',
    scheduled_date: '',
    scheduled_time: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inspectionsData, propertiesData, corretoresData] = await Promise.all([
        apiClient.getInspections(),
        apiClient.getProperties(),
        apiClient.getUsers('corretor')
      ]);

      setInspections(inspectionsData as Inspection[]);
      setProperties(propertiesData as Property[]);
      setCorretores(corretoresData as UserType[]);
      
      const propsMap: Record<string, Property> = {};
      (propertiesData as Property[]).forEach(prop => {
        propsMap[prop.id] = prop;
      });
      setPropertiesMap(propsMap);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      property_id: '',
      corretor_id: '',
      scheduled_date: '',
      scheduled_time: '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      property_id: '',
      corretor_id: '',
      scheduled_date: '',
      scheduled_time: '',
    });
  };

  const handleCreateInspection = async () => {
    if (!formData.property_id || !formData.corretor_id || !formData.scheduled_date || !formData.scheduled_time) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);
      await apiClient.createInspection({
        property_id: formData.property_id,
        corretor_id: formData.corretor_id,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
      });
      toast.success('Vistoria criada com sucesso');
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error('Erro ao criar vistoria:', error);
      toast.error(error?.error || 'Erro ao criar vistoria');
    } finally {
      setSaving(false);
    }
  };

  const getPropertyById = (id: string) => propertiesMap[id];

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = !searchTerm || (() => {
      const property = getPropertyById(inspection.propertyId);
      return property?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             property?.building?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             property?.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase());
    })();
    
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Vistorias</h1>
          <p className="text-muted-foreground mt-1">Gerencie todas as vistorias</p>
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Vistoria
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por imóvel, endereço ou bairro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'in_progress', 'completed'].map(status => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'Todas' : statusConfig[status]?.label || status}
            </Button>
          ))}
        </div>
      </div>

      {/* Inspections List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
          Carregando...
        </div>
      ) : filteredInspections.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' ? 'Nenhuma vistoria encontrada' : 'Nenhuma vistoria cadastrada'}
          </p>
        </div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="divide-y divide-border">
            {filteredInspections.map((inspection) => {
              const property = getPropertyById(inspection.propertyId);
              const corretor = corretores.find(c => c.id === inspection.corretorId) || 
                             (inspection as any).corretorName ? { name: (inspection as any).corretorName } : null;
              const status = statusConfig[inspection.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              
              return (
                <div key={inspection.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border", status.class)}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {property?.building || property?.address}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {property?.unit} • {property?.neighborhood}
                            {corretor && ` • ${corretor.name}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {inspection.scheduledDate} às {inspection.scheduledTime}
                        </span>
                        <span className={cn("px-2 py-1 rounded-full border text-xs font-medium", status.class)}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/admin/inspection/${inspection.id}`)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Inspection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Vistoria</DialogTitle>
            <DialogDescription>
              Crie uma nova vistoria e atribua a um corretor
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="property">Imóvel *</Label>
              <Select value={formData.property_id} onValueChange={(value) => setFormData({ ...formData, property_id: value })}>
                <SelectTrigger id="property">
                  <SelectValue placeholder="Selecione um imóvel" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.building || property.address} - {property.unit} ({property.neighborhood})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="corretor">Corretor *</Label>
              <Select value={formData.corretor_id} onValueChange={(value) => setFormData({ ...formData, corretor_id: value })}>
                <SelectTrigger id="corretor">
                  <SelectValue placeholder="Selecione um corretor" />
                </SelectTrigger>
                <SelectContent>
                  {corretores.map((corretor) => (
                    <SelectItem key={corretor.id} value={corretor.id}>
                      {corretor.name} ({corretor.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleCreateInspection} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Vistoria'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
