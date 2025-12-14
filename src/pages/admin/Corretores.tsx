import { useEffect, useState } from 'react';
import { Users, Plus, Search, Mail, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/services/api';
import { User as UserType } from '@/types';
import { cn } from '@/lib/utils';

export default function AdminCorretores() {
  const [corretores, setCorretores] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    } finally {
      setLoading(false);
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
        <Button>
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
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
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
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

