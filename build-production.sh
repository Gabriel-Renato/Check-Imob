#!/bin/bash
# Script para build de produção

echo "🔨 Fazendo build de produção..."

# Usar variáveis de produção
export NODE_ENV=production

# Fazer build
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo "📁 Arquivos gerados em: dist/"
    echo ""
    echo "⚠️  Verifique se o .htaccess está configurado corretamente"
    echo "⚠️  Verifique se a URL da API está correta em .env.production"
else
    echo "❌ Erro no build!"
    exit 1
fi


