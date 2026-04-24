# Integracao com Supabase

Este projeto ja vem com o cliente Supabase preparado. Siga os passos abaixo para conectar.

## 1. Criar o projeto no Supabase

1. Acesse https://supabase.com/ e crie um projeto.
2. Aguarde a provisao (demora 1-2 minutos).

## 2. Pegar as credenciais

Em **Project settings > API**, copie:

- `Project URL`
- `anon public API key`

## 3. Configurar variaveis de ambiente

Na raiz do projeto, crie o arquivo `.env.local` (ou copie o `.env.local.example`) e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Depois reinicie o `npm run dev`.

## 4. Criar as tabelas

No Supabase, abra **Database > SQL Editor** e rode o conteudo do arquivo:

```
supabase/migrations/0001_init.sql
```

Isso cria as tabelas:

- `products`
- `whatsapp_contacts`, `whatsapp_settings`
- `orders`, `order_items`
- `service_areas`

E as policies de RLS basicas (publico le, autenticado escreve).

## 5. Sincronizar produtos

1. Faca login como admin.
2. Abra `/admin/produtos`.
3. Clique em **Enviar para Supabase** para subir o catalogo local.
4. Use **Baixar do Supabase** para puxar o catalogo remoto.

Os dois botoes ficam no topo da tela e so aparecem quando o Supabase esta configurado.
