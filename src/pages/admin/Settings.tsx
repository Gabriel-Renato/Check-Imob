import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Database, User, Shield, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminSettings() {
  const [systemName, setSystemName] = useState('Check Imob');
  const [systemVersion] = useState('1.0.0');
  const [dbStatus, setDbStatus] = useState<'Conectado' | 'Erro' | 'Testando'>('Conectado');
  const [passwordMinLength, setPasswordMinLength] = useState(8);
  const [sessionDuration, setSessionDuration] = useState(24);
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState<{
    systemName: boolean;
    passwordPolicy: boolean;
    session: boolean;
    logs: boolean;
  }>({
    systemName: false,
    passwordPolicy: false,
    session: false,
    logs: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [system, passwordPolicy, session] = await Promise.all([
        apiClient.getSystemSettings(),
        apiClient.getPasswordPolicy(),
        apiClient.getSessionSettings()
      ]);

      if (system && typeof system === 'object') {
        setSystemName(system.system_name || 'Check Imob');
      }
      if (passwordPolicy && typeof passwordPolicy === 'object') {
        setPasswordMinLength(passwordPolicy.min_length || 8);
      }
      if (session && typeof session === 'object') {
        setSessionDuration(session.duration_hours || 24);
      }

      // Testar conexão do banco
      testDatabase();
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const testDatabase = async () => {
    try {
      setDbStatus('Testando');
      const result = await apiClient.testDatabase();
      if (result && result.success) {
        setDbStatus('Conectado');
        toast.success('Conexão com banco de dados OK');
      } else {
        setDbStatus('Erro');
        toast.error('Erro ao conectar com banco de dados');
      }
    } catch (error) {
      setDbStatus('Erro');
      toast.error('Erro ao testar conexão');
    }
  };

  const handleUpdateSystemName = async (newName: string) => {
    try {
      await apiClient.updateSystemSetting('system_name', newName);
      setSystemName(newName);
      setDialogOpen({ ...dialogOpen, systemName: false });
      toast.success('Nome do sistema atualizado');
    } catch (error) {
      toast.error('Erro ao atualizar nome do sistema');
    }
  };

  const handleCreateBackup = async () => {
    try {
      setBackupLoading(true);
      const result = await apiClient.createBackup();
      if (result && result.success) {
        toast.success(`Backup criado: ${result.file} (${result.size_formatted})`);
      } else {
        toast.error('Erro ao criar backup');
      }
    } catch (error) {
      toast.error('Erro ao criar backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleUpdatePasswordPolicy = async (minLength: number) => {
    try {
      await apiClient.updatePasswordPolicy(minLength);
      setPasswordMinLength(minLength);
      setDialogOpen({ ...dialogOpen, passwordPolicy: false });
      toast.success('Política de senha atualizada');
    } catch (error) {
      toast.error('Erro ao atualizar política de senha');
    }
  };

  const handleUpdateSession = async (hours: number) => {
    try {
      await apiClient.updateSessionSettings(hours);
      setSessionDuration(hours);
      setDialogOpen({ ...dialogOpen, session: false });
      toast.success('Duração da sessão atualizada');
    } catch (error) {
      toast.error('Erro ao atualizar duração da sessão');
    }
  };

  const handleViewLogs = async () => {
    try {
      setDialogOpen({ ...dialogOpen, logs: true });
      // Os logs serão carregados no dialog
    } catch (error) {
      toast.error('Erro ao carregar logs');
    }
  };

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
                <p className="text-sm text-muted-foreground">{systemName}</p>
              </div>
              <Dialog open={dialogOpen.systemName} onOpenChange={(open) => setDialogOpen({ ...dialogOpen, systemName: open })}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Editar</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Nome do Sistema</DialogTitle>
                    <DialogDescription>
                      Altere o nome do sistema que aparece nas páginas
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="system-name">Nome</Label>
                      <Input
                        id="system-name"
                        value={systemName}
                        onChange={(e) => setSystemName(e.target.value)}
                        placeholder="Nome do sistema"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen({ ...dialogOpen, systemName: false })}>
                      Cancelar
                    </Button>
                    <Button onClick={() => handleUpdateSystemName(systemName)}>
                      Salvar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Versão</p>
                <p className="text-sm text-muted-foreground">{systemVersion}</p>
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
                <p className={cn(
                  "text-sm",
                  dbStatus === 'Conectado' && "text-[hsl(var(--success))]",
                  dbStatus === 'Erro' && "text-destructive",
                  dbStatus === 'Testando' && "text-muted-foreground"
                )}>
                  {dbStatus === 'Testando' && <Loader2 className="w-4 h-4 inline animate-spin mr-1" />}
                  {dbStatus}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={testDatabase} disabled={dbStatus === 'Testando'}>
                {dbStatus === 'Testando' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Testando...
                  </>
                ) : (
                  'Testar'
                )}
              </Button>
            </div>
            <Separator />
            <div>
              <p className="font-medium mb-2">Backup</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={handleCreateBackup}
                disabled={backupLoading}
              >
                {backupLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Backup'
                )}
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
                <p className="text-sm text-muted-foreground">Mínimo {passwordMinLength} caracteres</p>
              </div>
              <Dialog open={dialogOpen.passwordPolicy} onOpenChange={(open) => setDialogOpen({ ...dialogOpen, passwordPolicy: open })}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Configurar</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurar Política de Senha</DialogTitle>
                    <DialogDescription>
                      Defina o número mínimo de caracteres para senhas
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="min-length">Tamanho Mínimo</Label>
                      <Input
                        id="min-length"
                        type="number"
                        min="4"
                        max="32"
                        value={passwordMinLength}
                        onChange={(e) => setPasswordMinLength(parseInt(e.target.value) || 8)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen({ ...dialogOpen, passwordPolicy: false })}>
                      Cancelar
                    </Button>
                    <Button onClick={() => handleUpdatePasswordPolicy(passwordMinLength)}>
                      Salvar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sessão</p>
                <p className="text-sm text-muted-foreground">{sessionDuration} horas</p>
              </div>
              <Dialog open={dialogOpen.session} onOpenChange={(open) => setDialogOpen({ ...dialogOpen, session: open })}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">Alterar</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Alterar Duração da Sessão</DialogTitle>
                    <DialogDescription>
                      Defina por quantas horas a sessão permanece ativa
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="session-hours">Duração (horas)</Label>
                      <Input
                        id="session-hours"
                        type="number"
                        min="1"
                        max="168"
                        value={sessionDuration}
                        onChange={(e) => setSessionDuration(parseInt(e.target.value) || 24)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Mínimo: 1 hora | Máximo: 168 horas (7 dias)</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen({ ...dialogOpen, session: false })}>
                      Cancelar
                    </Button>
                    <Button onClick={() => handleUpdateSession(sessionDuration)}>
                      Salvar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                <p className="text-sm text-[hsl(var(--success))]">Ativado</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Logs de Acesso</p>
                <p className="text-sm text-muted-foreground">Ativado</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setDialogOpen({ ...dialogOpen, logs: true })}>
                Ver Logs
              </Button>
              <LogsDialog open={dialogOpen.logs} onOpenChange={(open) => setDialogOpen({ ...dialogOpen, logs: open })} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LogsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadLogs();
    }
  }, [open]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getAccessLogs(50);
      if (result && result.logs) {
        setLogs(result.logs);
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Logs de Acesso</DialogTitle>
          <DialogDescription>
            Histórico de ações e acessos ao sistema
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Carregando logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log encontrado
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg border bg-card text-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{log.user_name || log.email || 'Sistema'}</p>
                      <p className="text-muted-foreground text-xs">{log.action}</p>
                      {log.ip_address && (
                        <p className="text-muted-foreground text-xs">IP: {log.ip_address}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
