@echo off
setlocal

:: Criar a estrutura de pastas
mkdir pages
mkdir layout
mkdir routes

:: Criar arquivos na pasta pages
cd pages
type nul > Login.tsx
type nul > Home.tsx
type nul > Clients.tsx
type nul > Categories.tsx
type nul > Products.tsx
type nul > Reports.tsx
type nul > Charts.tsx
type nul > POS.tsx
type nul > Users.tsx
cd ..

:: Criar arquivo na pasta layout
cd layout
type nul > MainLayout.tsx
cd ..

:: Criar arquivo na pasta routes
cd routes
type nul > AppRoutes.tsx
cd ..

echo Estrutura de arquivos criada com sucesso!
endlocal