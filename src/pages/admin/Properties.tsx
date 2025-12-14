import { useEffect, useState } from 'react';
import { Building2, Plus, Search, MapPin, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/services/api';
import { Property } from '@/types';
import { cn } from '@/lib/utils';

export default function AdminProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getProperties();
      setProperties(data as Property[]);
    } catch (error) {
      console.error('Erro ao carregar propriedades:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(prop =>
    prop.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.building?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prop.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Imóveis</h1>
          <p className="text-muted-foreground mt-1">Gerencie todos os imóveis cadastrados</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Imóvel
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por endereço, prédio, bairro ou cidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Properties List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'Nenhum imóvel encontrado' : 'Nenhum imóvel cadastrado'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <div key={property.id} className="card-elevated p-5 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon-sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  {property.building || property.address}
                </h3>
                <p className="text-sm text-muted-foreground">{property.unit}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{property.neighborhood}, {property.city}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

