import { useEffect, useState } from 'react';
import { ClipboardList, Search, Clock, CheckCircle2, XCircle, AlertTriangle, Building2, Plus, Loader2, Printer } from 'lucide-react';
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

  const handlePrintInspection = async (inspectionId: string) => {
    try {
      toast.info('Gerando relatório...');
      
      // Buscar dados completos da vistoria
      const [inspectionData, cardsData] = await Promise.all([
        apiClient.getInspection(inspectionId),
        apiClient.getInspectionCards()
      ]);

      const inspection = inspectionData as Inspection;
      const property = getPropertyById(inspection.propertyId);
      const corretor = corretores.find(c => c.id === inspection.corretorId) || 
                      (inspection as any).corretorName ? { name: (inspection as any).corretorName, email: '' } : null;

      // Criar HTML para impressão
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Erro ao abrir janela de impressão. Verifique se os pop-ups estão bloqueados.');
        return;
      }

      const statusLabels: Record<string, string> = {
        pending: 'Pendente',
        in_progress: 'Em andamento',
        completed: 'Concluída',
        approved: 'Aprovada',
        rejected: 'Rejeitada',
      };

      const cardStatusLabels: Record<string, string> = {
        ok: 'Ok',
        defect: 'Com defeito',
        non_compliant: 'Não conforme',
      };

      const cardStatusColors: Record<string, string> = {
        ok: '#10b981',
        defect: '#f59e0b',
        non_compliant: '#ef4444',
      };

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Relatório de Vistoria - ${property?.building || property?.address || 'N/A'}</title>
          <style>
            @page {
              margin: 1cm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #333;
              padding: 20px;
            }
            .header {
              border-bottom: 3px solid #667eea;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo-section {
              display: flex;
              align-items: center;
              gap: 15px;
              margin-bottom: 15px;
            }
            .logo-section h1 {
              color: #667eea;
              font-size: 24pt;
              font-weight: bold;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-box {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #667eea;
            }
            .info-box h3 {
              color: #667eea;
              font-size: 10pt;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-box p {
              font-size: 11pt;
              color: #333;
              margin: 4px 0;
            }
            .card-section {
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .card {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
              background: #fff;
            }
            .card-header {
              display: flex;
              align-items: center;
              gap: 15px;
              margin-bottom: 15px;
              padding-bottom: 15px;
              border-bottom: 2px solid #e5e7eb;
            }
            .card-icon {
              width: 40px;
              height: 40px;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              background: #f3f4f6;
            }
            .card-title {
              font-size: 14pt;
              font-weight: bold;
              color: #111827;
            }
            .card-status {
              margin-left: auto;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 10pt;
              font-weight: 600;
            }
            .card-status.ok { background: #d1fae5; color: #065f46; }
            .card-status.defect { background: #fef3c7; color: #92400e; }
            .card-status.non_compliant { background: #fee2e2; color: #991b1b; }
            .observation {
              background: #f9fafb;
              padding: 12px;
              border-radius: 6px;
              margin: 15px 0;
              border-left: 3px solid #667eea;
            }
            .observation-label {
              font-size: 9pt;
              color: #6b7280;
              text-transform: uppercase;
              margin-bottom: 5px;
              font-weight: 600;
            }
            .photos-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              margin-top: 15px;
            }
            .photo-item {
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              overflow: hidden;
              page-break-inside: avoid;
            }
            .photo-item img {
              width: 100%;
              height: 200px;
              object-fit: cover;
              display: block;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              font-size: 9pt;
              color: #6b7280;
            }
            @media print {
              body { padding: 0; }
              .card { page-break-inside: avoid; }
              .photo-item { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-section">
              <h1>Check Imob</h1>
            </div>
            <h2 style="color: #111827; font-size: 18pt; margin-top: 10px;">Relatório de Vistoria</h2>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <h3>Informações do Imóvel</h3>
              <p><strong>Edifício:</strong> ${property?.building || 'N/A'}</p>
              <p><strong>Endereço:</strong> ${property?.address || 'N/A'}</p>
              <p><strong>Unidade:</strong> ${property?.unit || 'N/A'}</p>
              <p><strong>Bairro:</strong> ${property?.neighborhood || 'N/A'}</p>
              <p><strong>Cidade:</strong> ${property?.city || 'N/A'}</p>
            </div>
            <div class="info-box">
              <h3>Informações da Vistoria</h3>
              <p><strong>Data:</strong> ${inspection.scheduledDate}</p>
              <p><strong>Hora:</strong> ${inspection.scheduledTime}</p>
              <p><strong>Status:</strong> ${statusLabels[inspection.status] || inspection.status}</p>
              <p><strong>Corretor:</strong> ${corretor?.name || 'N/A'}</p>
              ${corretor?.email ? `<p><strong>E-mail:</strong> ${corretor.email}</p>` : ''}
            </div>
          </div>

          ${inspection.cards && inspection.cards.length > 0 ? `
            <h2 style="color: #111827; font-size: 16pt; margin: 30px 0 20px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              Ambientes Inspecionados
            </h2>
            ${inspection.cards.map((card: any, index: number) => {
              const cardInfo = cardsData.find((c: any) => c.id === card.cardId);
              const statusLabel = cardStatusLabels[card.status] || 'Não informado';
              const statusClass = card.status || 'pending';
              
              return `
                <div class="card-section">
                  <div class="card">
                    <div class="card-header">
                      <div class="card-icon">🏠</div>
                      <div class="card-title">${cardInfo?.name || `Ambiente ${index + 1}`}</div>
                      <div class="card-status ${statusClass}">${statusLabel}</div>
                    </div>
                    
                    ${card.observation ? `
                      <div class="observation">
                        <div class="observation-label">Observação</div>
                        <p>${card.observation}</p>
                      </div>
                    ` : ''}
                    
                    ${card.photos && card.photos.length > 0 ? `
                      <div style="margin-top: 15px;">
                        <div class="observation-label">Fotos (${card.photos.length})</div>
                        <div class="photos-grid">
                          ${card.photos.map((photo: any) => `
                            <div class="photo-item">
                              <img src="${photo.url}" alt="Foto da vistoria" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\'%3E%3Crect width=\\'200\\' height=\\'200\\' fill=\\'%23ccc\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' fill=\\'%23999\\'%3EErro%3C/text%3E%3C/svg%3E';" />
                            </div>
                          `).join('')}
                        </div>
                      </div>
                    ` : '<p style="color: #9ca3af; font-style: italic; margin-top: 10px;">Nenhuma foto anexada</p>'}
                  </div>
                </div>
              `;
            }).join('')}
          ` : '<p style="color: #9ca3af; font-style: italic;">Nenhum ambiente foi inspecionado ainda.</p>'}

          <div class="footer">
            <p>Relatório gerado em ${new Date().toLocaleString('pt-BR')}</p>
            <p>Check Imob - Sistema de Gestão de Vistorias</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);

      printWindow.document.close();
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório de impressão');
    }
  };

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
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/admin/inspection/${inspection.id}`)}
                      >
                        Ver Detalhes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePrintInspection(inspection.id)}
                      >
                        <Printer className="w-4 h-4 mr-1" />
                        Imprimir
                      </Button>
                    </div>
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
