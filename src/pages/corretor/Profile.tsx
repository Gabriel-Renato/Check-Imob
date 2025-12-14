import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Bell, label: 'Notificações', href: '#' },
  { icon: Shield, label: 'Segurança', href: '#' },
  { icon: HelpCircle, label: 'Ajuda e Suporte', href: '#' },
];

export default function CorretorProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary px-4 pt-12 pb-8">
        <h1 className="text-xl font-bold text-primary-foreground mb-6">Perfil</h1>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">
              {user?.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-semibold text-primary-foreground text-lg">{user?.name}</p>
            <p className="text-primary-foreground/70">Corretor</p>
          </div>
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
              <Phone className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium text-foreground">(11) 99999-9999</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="card-elevated overflow-hidden mb-6">
          {menuItems.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors",
                index !== menuItems.length - 1 && "border-b border-border"
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <item.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="flex-1 font-medium text-foreground">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </a>
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
    </div>
  );
}
