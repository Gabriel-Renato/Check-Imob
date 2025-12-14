# Configuração de Build e Ambiente

## Arquivos de Ambiente

Crie os seguintes arquivos manualmente (não estão no git por segurança):

### `.env.development`
```env
VITE_API_URL=http://localhost/backend
```

### `.env.production`
```env
VITE_API_URL=/backend
```

## Como Usar

### Desenvolvimento

1. Crie o arquivo `.env.development`:
```bash
echo "VITE_API_URL=http://localhost/backend" > .env.development
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

### Produção

1. Crie o arquivo `.env.production`:
```bash
echo "VITE_API_URL=/backend" > .env.production
```

2. Faça o build:
```bash
npm run build
```

3. O build será gerado na pasta `dist/` e será servido automaticamente pelo `.htaccess`

## Estrutura Final

```
property-insight/
├── backend/          # Backend PHP
├── dist/            # Build do frontend (gerado após npm run build)
├── src/             # Código fonte do frontend
├── .htaccess        # Configuração Apache
├── index.php        # Ponto de entrada (opcional)
└── .env.*           # Variáveis de ambiente (criar manualmente)
```

## Notas

- Em desenvolvimento, use `http://localhost/backend` para a API
- Em produção, use `/backend` (caminho relativo) para funcionar em qualquer domínio
- O `.htaccess` já está configurado para servir o frontend e redirecionar `/backend/*` corretamente

