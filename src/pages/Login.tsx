import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, ArrowRight, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';

type LoginMode = 'admin' | 'corretor';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<LoginMode>('corretor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate(mode === 'admin' ? '/admin' : '/corretor');
      } else {
        setError('Credenciais inválidas');
      }
    } catch {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (type: 'admin' | 'corretor') => {
    if (type === 'admin') {
      setEmail('admin@vistoria.com');
    } else {
      setEmail('ana.silva@vistoria.com');
    }
    setMode(type);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-navy-dark" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 lg:p-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center p-2">
              <Logo size={40} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-primary-foreground">Vistoria Pro</h1>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-6">
            Sistema profissional de vistorias imobiliárias
          </h2>
          
          <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-md">
            Gerencie suas vistorias de forma eficiente, registre defeitos com fotos anotadas 
            e gere relatórios profissionais em segundos.
          </p>

          <div className="mt-12 flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground">500+</p>
              <p className="text-sm text-primary-foreground/70">Vistorias realizadas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground">50+</p>
              <p className="text-sm text-primary-foreground/70">Imóveis cadastrados</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-foreground">98%</p>
              <p className="text-sm text-primary-foreground/70">Satisfação</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center p-1.5">
              <Logo size={32} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Vistoria Pro</h1>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo de volta</h2>
            <p className="text-muted-foreground">Entre com suas credenciais para continuar</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg mb-6">
            <button
              type="button"
              onClick={() => quickLogin('corretor')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200",
                mode === 'corretor'
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="w-4 h-4" />
              Corretor
            </button>
            <button
              type="button"
              onClick={() => quickLogin('admin')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200",
                mode === 'admin'
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-12"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse-soft">Entrando...</span>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Esqueceu sua senha?{' '}
            <a href="#" className="text-accent hover:underline font-medium">
              Recuperar acesso
            </a>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Demo:</strong> Clique em Corretor ou Admin para preencher automaticamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
