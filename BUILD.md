# Guia de Build e Deploy

## Desenvolvimento

Para desenvolvimento local:

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.development .env

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:8080` e a API em `http://localhost/backend`

## Produção

### 1. Build do Frontend

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.production .env

# Fazer build de produção
npm run build
```

O build será gerado na pasta `dist/`

### 2. Estrutura de Deploy

```
/var/www/html/property-insight/
├── backend/              # Backend PHP
│   ├── api/
│   ├── config/
│   ├── database/
│   └── uploads/
├── dist/                 # Build do frontend (gerado)
│   ├── index.html
│   ├── assets/
│   └── ...
├── .htaccess            # Configuração Apache
└── index.php            # Ponto de entrada (opcional)
```

### 3. Configuração do Apache

O arquivo `.htaccess` já está configurado para:

- Servir o frontend React (SPA) através de `index.html`
- Redirecionar requisições `/backend/*` para a pasta backend
- Configurar cache e compressão
- Adicionar headers de segurança

### 4. Permissões

Certifique-se de que as permissões estão corretas:

```bash
# Permissões para uploads
chmod 755 backend/uploads
chown www-data:www-data backend/uploads

# Permissões gerais
chmod 755 backend
chmod 644 .htaccess
```

### 5. Variáveis de Ambiente

#### Desenvolvimento (`.env.development`):
```
VITE_API_URL=http://localhost/backend
```

#### Produção (`.env.production`):
```
VITE_API_URL=/backend
```

**Importante**: Em produção, use caminhos relativos (`/backend`) para que funcione independente do domínio.

### 6. Configuração do Banco de Dados

1. Importe o schema:
```bash
mysql -u root -p < backend/database/schema.sql
```

2. Configure as credenciais em `backend/config/database.php`

### 7. Testar em Produção

1. Acesse o site pelo navegador
2. Verifique se o frontend carrega corretamente
3. Teste o login
4. Verifique se as requisições à API estão funcionando (abrir DevTools > Network)

### Troubleshooting

**Frontend não carrega:**
- Verifique se o build foi executado (`dist/` existe)
- Verifique se o `.htaccess` está funcionando
- Verifique permissões de arquivos

**API não responde:**
- Verifique se o PHP está configurado
- Verifique se o módulo `mod_rewrite` está habilitado
- Verifique logs do Apache

**Upload de fotos não funciona:**
- Verifique permissões da pasta `backend/uploads`
- Verifique se o PHP permite uploads (`upload_max_filesize` e `post_max_size`)



