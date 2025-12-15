# Checklist de Verificação - Produção

## ✅ Configurações Feitas

1. **.env.production** criado com:
   ```
   VITE_API_URL=https://checkimobi.gt.tc/backend
   ```

2. **.htaccess** configurado para:
   - Servir arquivos de `dist/`
   - Redirecionar `/backend/*` para pasta backend
   - Servir `index.html` para todas as rotas (SPA)

3. **Build** executado com sucesso

## 🔍 Verificações Necessárias

### 1. Verificar se o site carrega
- Acesse: https://checkimobi.gt.tc/
- Deve mostrar a tela de login, não tela branca

### 2. Verificar Console do Navegador (F12)
- Sem erros de carregamento de JavaScript
- Sem erros 404 para assets
- API_URL deve ser: `https://checkimobi.gt.tc/backend`

### 3. Verificar Network (F12 > Network)
- Assets carregando de `/assets/...`
- Requests para API indo para `/backend/api/...`

### 4. Testar API
```bash
curl https://checkimobi.gt.tc/backend/api/dashboard/stats.php
```

## 🐛 Se ainda estiver dando tela branca:

1. **Limpar cache do navegador**: Ctrl+Shift+R (hard refresh)

2. **Verificar logs do Apache**:
   ```bash
   tail -f /var/log/apache2/error.log
   ```

3. **Verificar permissões**:
   ```bash
   chmod 755 dist
   chmod 644 dist/index.html
   chmod -R 755 dist/assets
   ```

4. **Fazer rebuild**:
   ```bash
   rm -rf dist
   npm run build
   ```

5. **Verificar se mod_rewrite está habilitado**:
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

## 📝 Próximos Passos

Se tudo estiver funcionando:
- ✅ Site carrega
- ✅ Login funciona
- ✅ API responde

Se ainda houver problemas:
- Verificar logs do Apache
- Verificar Console do navegador
- Verificar se mod_rewrite está ativo


