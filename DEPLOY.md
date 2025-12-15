# Guia de Deploy para Produção

## URL de Produção
**https://checkimobi.gt.tc/**

## Configuração

### 1. Variáveis de Ambiente

O arquivo `.env.production` já está configurado:
```env
VITE_API_URL=https://checkimobi.gt.tc/backend
```

### 2. Fazer Build de Produção

```bash
# Garantir que está usando as variáveis de produção
export NODE_ENV=production

# Fazer build
npm run build
```

Ou use o script:
```bash
./build-production.sh
```

### 3. Verificar Estrutura

Após o build, a estrutura deve ser:
```
property-insight/
├── dist/              # ✅ Build do frontend
│   ├── index.html
│   ├── assets/
│   └── ...
├── backend/           # ✅ Backend PHP
└── .htaccess         # ✅ Configurado para servir dist/
```

### 4. Permissões

```bash
# Garantir permissões corretas
chmod 755 dist
chmod 644 dist/index.html
chmod 755 backend
chmod 755 backend/uploads
```

### 5. Testar

1. Acesse: https://checkimobi.gt.tc/
2. Abra o DevTools (F12) e verifique o Console
3. Verifique se não há erros de carregamento de assets
4. Teste o login

## Troubleshooting

### Tela Branca

**Possíveis causas:**
1. Build não foi executado → Execute `npm run build`
2. Assets não estão sendo servidos → Verifique `.htaccess`
3. Erros de JavaScript → Verifique o Console do navegador
4. CORS ou problemas de API → Verifique Network tab

**Solução:**
```bash
# 1. Limpar e fazer novo build
rm -rf dist
npm run build

# 2. Verificar se os arquivos existem
ls -la dist/

# 3. Verificar logs do Apache
tail -f /var/log/apache2/error.log
```

### Assets não carregam

Verifique se os caminhos no `.htaccess` estão corretos. O `.htaccess` deve:
- Servir `/assets/*` de `dist/assets/`
- Servir `/favicon.ico` de `dist/favicon.ico`
- Servir todas as rotas para `dist/index.html`

### API não funciona

Verifique:
1. Se `VITE_API_URL` está correto no `.env.production`
2. Se o build foi feito após configurar o `.env.production`
3. Se o backend está respondendo em `/backend`

```bash
# Testar API diretamente
curl https://checkimobi.gt.tc/backend/api/dashboard/stats.php
```

### Rebuild Necessário

Sempre que mudar:
- Código do frontend
- Variáveis de ambiente (`.env.production`)
- Configurações do Vite

Execute novamente:
```bash
npm run build
```



