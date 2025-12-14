# Como Fazer Upload da Pasta dist/

## Problema
A pasta `dist/` não está no servidor, por isso o site não funciona.

## Solução

### 1. Localizar a pasta dist/ local
A pasta `dist/` está em: `/var/www/html/property-insight/dist/`

### 2. Conteúdo que precisa ser enviado
A pasta `dist/` deve conter:
- `index.html` (arquivo principal)
- `assets/` (pasta com todos os JS e CSS)
  - `index-*.js`
  - `vendor-*.js`
  - `index-*.css`
- `favicon.ico`
- `logocheck-removebg-preview.png`
- `placeholder.svg`
- `robots.txt`

### 3. Onde fazer upload no servidor
No InfinityFree, a estrutura deve ser:
```
/home/vol6_3/infinityfree.com/if0_40682654/htdocs/
├── .htaccess
├── index.php
├── dist/          ← ESTA PASTA ESTÁ FALTANDO!
│   ├── index.html
│   ├── assets/
│   └── ...
├── backend/
└── assets/
```

### 4. Como fazer upload
1. Use um cliente FTP (FileZilla, WinSCP, etc.)
2. Conecte-se ao servidor InfinityFree
3. Navegue até: `/htdocs/`
4. Faça upload da pasta `dist/` completa (com todos os arquivos dentro)
5. Certifique-se de que a estrutura fique: `htdocs/dist/index.html`

### 5. Verificar após upload
Após fazer upload, acesse: `https://checkimobi.gt.tc/dist/index.html`

Se essa URL funcionar, o problema está resolvido!

### 6. Estrutura final esperada
```
htdocs/
├── .htaccess
├── index.php
├── dist/
│   ├── index.html          ← OBRIGATÓRIO
│   ├── assets/
│   │   ├── index-*.js      ← OBRIGATÓRIO
│   │   ├── vendor-*.js    ← OBRIGATÓRIO
│   │   └── index-*.css    ← OBRIGATÓRIO
│   ├── favicon.ico
│   └── ...
├── backend/
└── assets/
```

## Importante
- A pasta `dist/` deve estar no mesmo nível que `index.php` e `.htaccess`
- Todos os arquivos dentro de `dist/` devem ser enviados
- A pasta `assets/` dentro de `dist/` é essencial!

