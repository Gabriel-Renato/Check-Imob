# Backend PHP - Property Insight

## Instalação

1. Importar o banco de dados:
```bash
mysql -u root -p < database/schema.sql
```

2. Configurar conexão do banco de dados em `config/database.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'property_insight');
define('DB_USER', 'root');
define('DB_PASS', 'sua_senha');
```

3. Criar diretório de uploads:
```bash
mkdir -p uploads
chmod 755 uploads
```

## Endpoints da API

### Autenticação
- `POST /api/auth/login.php` - Login
- `POST /api/auth/verify.php` - Verificar token

### Usuários
- `GET /api/users/index.php` - Listar usuários (opcional: ?role=corretor)

### Propriedades
- `GET /api/properties/index.php` - Listar propriedades
- `GET /api/properties/get.php?id=1` - Obter propriedade
- `POST /api/properties/index.php` - Criar propriedade

### Vistorias
- `GET /api/inspections/index.php?corretor_id=1` - Listar vistorias
- `GET /api/inspections/get.php?id=1` - Obter vistoria
- `POST /api/inspections/index.php` - Criar vistoria
- `POST /api/inspections/update.php` - Atualizar vistoria
- `POST /api/inspections/upload-photo.php` - Upload de foto

### Cartas de Vistoria
- `GET /api/inspection-cards/index.php` - Listar cartas

### Dashboard
- `GET /api/dashboard/stats.php` - Estatísticas

## Exemplo de uso

### Login
```bash
curl -X POST http://localhost/backend/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vistoria.com","password":"password123"}'
```

### Criar propriedade
```bash
curl -X POST http://localhost/backend/api/properties/index.php \
  -H "Content-Type: application/json" \
  -d '{
    "address":"Rua das Flores, 123",
    "unit":"Apt 101",
    "building":"Edifício Central",
    "neighborhood":"Centro",
    "city":"São Paulo"
  }'
```

## Notas

- Em produção, altere as senhas padrão dos usuários
- Configure CORS adequadamente para o domínio do frontend
- Use uma biblioteca JWT adequada para autenticação em produção
- Configure permissões adequadas para o diretório de uploads

