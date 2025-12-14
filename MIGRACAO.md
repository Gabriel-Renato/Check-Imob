# Migração de Supabase para MySQL + PHP

Este documento descreve a migração do backend de Supabase para MySQL com API PHP.

## Estrutura do Backend

O backend PHP foi criado na pasta `backend/` com a seguinte estrutura:

```
backend/
├── api/              # Endpoints da API
│   ├── auth/        # Autenticação
│   ├── users/       # Usuários
│   ├── properties/  # Propriedades
│   ├── inspections/ # Vistorias
│   ├── inspection-cards/ # Cartas de vistoria
│   └── dashboard/   # Estatísticas
├── config/          # Configurações
│   ├── database.php # Conexão com MySQL
│   └── cors.php     # Configuração CORS
├── database/        # Scripts SQL
│   └── schema.sql   # Estrutura do banco
└── uploads/         # Upload de fotos (criar manualmente)
```

## Instalação

### 1. Banco de Dados MySQL

Importe o schema do banco de dados:

```bash
mysql -u root -p < backend/database/schema.sql
```

Ou execute o SQL manualmente no seu cliente MySQL.

### 2. Configuração do Backend

Edite `backend/config/database.php` com suas credenciais:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'property_insight');
define('DB_USER', 'seu_usuario');
define('DB_PASS', 'sua_senha');
```

### 3. Diretório de Uploads

Crie o diretório de uploads e dê permissões:

```bash
mkdir -p backend/uploads
chmod 755 backend/uploads
```

### 4. Configuração do Frontend

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost/backend
```

Ajuste a URL conforme seu ambiente (desenvolvimento/produção).

### 5. Remover Dependência do Supabase

O Supabase já foi removido do `package.json`. Você pode remover os arquivos antigos:

```bash
rm -rf src/integrations/supabase
rm -rf supabase
```

## Endpoints da API

### Autenticação
- `POST /backend/api/auth/login.php` - Login
- `POST /backend/api/auth/verify.php` - Verificar token

### Usuários
- `GET /backend/api/users/index.php` - Listar usuários

### Propriedades
- `GET /backend/api/properties/index.php` - Listar propriedades
- `GET /backend/api/properties/get.php?id=1` - Obter propriedade
- `POST /backend/api/properties/index.php` - Criar propriedade

### Vistorias
- `GET /backend/api/inspections/index.php?corretor_id=1` - Listar vistorias
- `GET /backend/api/inspections/get.php?id=1` - Obter vistoria
- `POST /backend/api/inspections/index.php` - Criar vistoria
- `POST /backend/api/inspections/update.php` - Atualizar vistoria
- `POST /backend/api/inspections/upload-photo.php` - Upload de foto

### Outros
- `GET /backend/api/inspection-cards/index.php` - Listar cartas
- `GET /backend/api/dashboard/stats.php` - Estatísticas

## Usuários Padrão

O schema SQL inclui usuários padrão com a senha `password123`:

- Admin: `admin@vistoria.com` / `password123`
- Corretor: `ana.silva@vistoria.com` / `password123`
- Corretor: `pedro.oliveira@vistoria.com` / `password123`

**IMPORTANTE**: Altere as senhas em produção!

## Mudanças no Frontend

O frontend foi atualizado para:

1. Usar a nova API PHP através do serviço `src/services/api.ts`
2. Remover dependências do Supabase
3. Atualizar componentes para buscar dados da API:
   - `AuthContext` - Autenticação via API
   - `CorretorHome` - Lista de vistorias
   - `Inspection` - Detalhes da vistoria
   - `AdminDashboard` - Estatísticas e listas

## Notas Importantes

1. **Autenticação**: O sistema usa tokens simples (base64). Em produção, considere usar JWT adequado.

2. **CORS**: A configuração CORS permite todas as origens. Em produção, restrinja ao domínio do frontend.

3. **Uploads**: As fotos são salvas em `backend/uploads/`. Certifique-se de configurar permissões adequadas.

4. **Segurança**: Implemente validações adicionais e sanitização de dados em produção.

## Testando

1. Inicie o servidor PHP (se necessário):
```bash
php -S localhost:8000 -t backend
```

2. Configure a URL da API no `.env`:
```env
VITE_API_URL=http://localhost:8000
```

3. Inicie o frontend:
```bash
npm run dev
```

4. Acesse `http://localhost:5173` e faça login com um dos usuários padrão.

