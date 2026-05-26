# StoreFront SaaS - TODO

## Fase 1: Schema de Banco de Dados e Estrutura Multi-tenant
- [x] Criar tabelas: stores, categories, products, orders, order_items
- [x] Implementar relacionamentos e constraints
- [x] Gerar e aplicar migrações via drizzle-kit

## Fase 2: Autenticação de Lojistas e Sistema de Lojas
- [x] Implementar criação de nova loja para lojista autenticado
- [x] Criar procedimento para obter dados da loja do usuário
- [x] Implementar slug único para cada loja
- [x] Criar página de criação de loja após login

## Fase 3: Painel Administrativo - Gerenciamento de Produtos
- [x] Criar layout do dashboard do lojista
- [x] Implementar CRUD de categorias
- [x] Implementar CRUD de produtos com upload de imagem
- [x] Criar formulários de edição de produtos
- [x] Adicionar validações de entrada

## Fase 4: Vitrine Pública da Loja
- [x] Criar rota dinâmica /loja/[slug] para lojas públicas
- [x] Implementar exibição de informações da loja (logo, nome, endereço, WhatsApp)
- [x] Criar grid de produtos com filtro por categoria
- [x] Implementar carrinho de compras (estado local)
- [x] Adicionar controle de quantidade de produtos
- [x] Criar UI elegante e responsiva para vitrine

## Fase 5: Finalização de Pedido via WhatsApp
- [x] Implementar geração de mensagem formatada do pedido
- [x] Criar URL de redirecionamento para WhatsApp
- [x] Implementar salvamento do pedido no banco de dados
- [x] Adicionar validação de dados do cliente (nome, endereço)
- [x] Criar CheckoutDialog com formulário completo
- [x] Integrar checkout com mutation tRPC

## Fase 6: Landing Page Pública
- [x] Criar landing page com apresentação da plataforma
- [x] Adicionar CTA para criação de nova loja
- [x] Implementar seção de benefícios
- [x] Criar design elegante e sofisticado
- [x] Adicionar demonstração visual da plataforma

## Fase 7: Painel de Pedidos do Lojista
- [x] Criar página de histórico de pedidos
- [ ] Implementar filtros e busca de pedidos
- [ ] Adicionar controle de status de pedidos
- [ ] Criar visualização detalhada de cada pedido
- [ ] Implementar notificações de novos pedidos

## Fase 8: Configuração da Loja
- [x] Criar página de configurações da loja
- [x] Implementar edição de nome, logo, cor de destaque
- [x] Adicionar configuração de número do WhatsApp
- [x] Implementar edição de endereço da loja

## Fase 9: Testes e Polimento
- [x] Escrever testes vitest para procedimentos críticos
- [x] Escrever testes de validação de checkout
- [x] Testar fluxo completo de compra (checkout + WhatsApp)
- [ ] Validar responsividade em dispositivos móveis
- [ ] Otimizar performance

## Fase 10: Publicação
- [ ] Criar checkpoint final
- [ ] Fazer push para repositório GitHub
