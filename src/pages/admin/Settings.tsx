import { Settings as SettingsIcon, Database, User, Shield, Bell, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function AdminSettings() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sistema */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Sistema</CardTitle>
                <CardDescription>Configurações gerais do sistema</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Nome do Sistema</p>
                <p className="text-sm text-muted-foreground">Vistoria Pro</p>
              </div>
              <Button variant="outline" size="sm">Editar</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Versão</p>
                <p className="text-sm text-muted-foreground">1.0.0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banco de Dados */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Banco de Dados</CardTitle>
                <CardDescription>Informações de conexão</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-success">Conectado</p>
              </div>
              <Button variant="outline" size="sm">Testar</Button>
            </div>
            <Separator />
            <div>
              <p className="font-medium mb-2">Backup</p>
              <Button variant="outline" size="sm" className="w-full">
                Criar Backup
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usuários */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Usuários</CardTitle>
                <CardDescription>Gerenciar usuários e permissões</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Política de Senha</p>
                <p className="text-sm text-muted-foreground">Mínimo 8 caracteres</p>
              </div>
              <Button variant="outline" size="sm">Configurar</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sessão</p>
                <p className="text-sm text-muted-foreground">24 horas</p>
              </div>
              <Button variant="outline" size="sm">Alterar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Configurações de segurança</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SSL/HTTPS</p>
                <p className="text-sm text-success">Ativado</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Logs de Acesso</p>
                <p className="text-sm text-muted-foreground">Ativado</p>
              </div>
              <Button variant="outline" size="sm">Ver Logs</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

