#!/bin/bash

# Script de Setup para Desenvolvimento Local
# Este script configura o ambiente de desenvolvimento rapidamente

echo "🚀 Configurando ambiente de desenvolvimento Vibefy..."

# Verificar se o .env.local já existe
if [ -f ".env.local" ]; then
    echo "✅ Arquivo .env.local já existe"
else
    echo "📝 Criando arquivo .env.local..."
    cp .env.example .env.local
    echo "✅ Arquivo .env.local criado com credenciais de desenvolvimento"
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo "✅ Dependências instaladas"
else
    echo "✅ Dependências já instaladas"
fi

# Verificar se o banco está configurado
echo "🗄️  Verificando configuração do banco..."
if npm run verify:setup > /dev/null 2>&1; then
    echo "✅ Banco de dados já configurado"
else
    echo "🔧 Configurando banco de dados..."
    npm run setup:db
    npm run populate:data
    echo "✅ Banco de dados configurado"
fi

echo ""
echo "🎉 Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "   1. npm run dev          # Iniciar servidor de desenvolvimento"
echo "   2. npm run create:admin # Criar usuário admin (opcional)"
echo ""
echo "🔐 Credenciais de desenvolvimento já configuradas no .env.local"
echo "🌐 Aplicação estará disponível em http://localhost:5173"
