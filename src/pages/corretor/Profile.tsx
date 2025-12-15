import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Shield,
  Edit,
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const menuItems = [
  { icon: Bell, label: 'Notificações', href: '#', onClick: () => toast.info('Funcionalidade em desenvolvimento') },
  { icon: Shield, label: 'Segurança', href: '#', onClick: () => toast.info('Funcionalidade em desenvolvimento') },
  { icon: HelpCircle, label: 'Ajuda e Suporte', href: '#', onClick: () => toast.info('Funcionalidade em desenvolvimento') },
];

export default function CorretorProfile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOpenEditDialog = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      newPassword: '',
      confirmPassword: '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Nome e e-mail são obrigatórios');
      return;
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    try {
      setSaving(true);
      
      const updateData: any = {
        name: formData.name,
        email: formData.email,
      };
      
      // Só atualizar senha se fornecida
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }
      
      const updatedUser = await apiClient.updateUser(user!.id, updateData);
      toast.success('Perfil atualizado com sucesso');
      
      // Atualizar usuário no contexto
      if (updatedUser) {
        updateUser(updatedUser as Partial<User>);
      }
      
      setEditDialogOpen(false);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error?.error || 'Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary px-4 pt-12 pb-8">
        <h1 className="text-xl font-bold text-primary-foreground mb-6">Perfil</h1>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full" />
            ) : (
              <span className="text-2xl font-bold text-primary-foreground">
                {user?.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-primary-foreground text-lg">{user?.name}</p>
            <p className="text-primary-foreground/70">Corretor</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenEditDialog}
            className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 -mt-4">
        {/* Info Card */}
        <div className="card-elevated p-4 mb-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Mail className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p className="font-medium text-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Função</p>
              <p className="font-medium text-foreground">Corretor</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="card-elevated overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={cn(
                "w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left",
                index !== menuItems.length - 1 && "border-b border-border"
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="flex-1 font-medium text-foreground">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair da conta
        </Button>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize suas informações pessoais
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Seu nome completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
              />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-4">Alterar Senha (opcional)</p>
              <p className="text-xs text-muted-foreground mb-4">
                Deixe em branco para manter a senha atual
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Digite novamente"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
