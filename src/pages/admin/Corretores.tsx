import { useEffect, useState } from 'react';
import { Users, Plus, Search, Mail, Shield, User, Edit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiClient } from '@/services/api';
import { User as UserType } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminCorretores() {
  const [corretores, setCorretores] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCorretor, setEditingCorretor] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'corretor' as 'admin' | 'corretor',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCorretores();
  }, []);

  const loadCorretores = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getUsers('corretor');
      setCorretores(data as UserType[]);
    } catch (error) {
      console.error('Erro ao carregar corretores:', error);
      toast.error('Erro ao carregar corretores');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (corretor?: UserType) => {
    if (corretor) {
      setEditingCorretor(corretor);
      setFormData({
        name: corretor.name || '',
        email: corretor.email || '',
        password: '', // Não mostrar senha existente
        role: corretor.role || 'corretor',
      });
    } else {
      setEditingCorretor(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'corretor',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCorretor(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'corretor',
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!editingCorretor && !formData.password) {
      toast.error('A senha é obrigatória para novos corretores');
      return;
    }

    try {
      setSaving(true);
      
      if (editingCorretor) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        
        // Só atualizar senha se fornecida
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await apiClient.updateUser(editingCorretor.id, updateData);
        toast.success('Corretor atualizado com sucesso');
      } else {
        await apiClient.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'corretor',
        });
        toast.success('Corretor criado com sucesso');
      }
      
      handleCloseDialog();
      loadCorretores();
    } catch (error: any) {
      console.error('Erro ao salvar corretor:', error);
      toast.error(error?.error || 'Erro ao salvar corretor');
    } finally {
      setSaving(false);
    }
  };

  const filteredCorretores = corretores.filter(corretor =>
    corretor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    corretor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Corretores</h1>
          <p className="text-muted-foreground mt-1">Gerencie os corretores do sistema</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Corretor
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Corretores List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
          Carregando...
        </div>
      ) : filteredCorretores.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'Nenhum corretor encontrado' : 'Nenhum corretor cadastrado'}
          </p>
        </div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <div className="divide-y divide-border">
            {filteredCorretores.map((corretor) => (
              <div key={corretor.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {corretor.avatar ? (
                      <img src={corretor.avatar} alt={corretor.name} className="w-12 h-12 rounded-full" />
                    ) : (
                      <span className="text-lg font-semibold text-primary">
                        {corretor.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">{corretor.name}</p>
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{corretor.email}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleOpenDialog(corretor)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCorretor ? 'Editar Corretor' : 'Novo Corretor'}</DialogTitle>
            <DialogDescription>
              {editingCorretor ? 'Atualize as informações do corretor' : 'Adicione um novo corretor ao sistema'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do corretor"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">
                Senha {editingCorretor ? '(deixe em branco para manter a atual)' : '*'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingCorretor ? "Nova senha (opcional)" : "Senha"}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                editingCorretor ? 'Atualizar' : 'Criar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
