import { 
  Users, Shield, Users2, Box, Tag, DollarSign, Percent, 
  Target, CreditCard, Key, Webhook, FileText, Activity 
} from 'lucide-react';

export const moduleDefinitions = {
  // GRUPO 2
  users: {
    title: "Usuários",
    description: "Gerencie os usuários do sistema e seus acessos.",
    icon: Users,
    columns: [
      { key: 'name', label: 'Nome' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Cargo' },
      { key: 'team', label: 'Equipe' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'lastAccess', label: 'Último Acesso', type: 'date' }
    ],
    fields: [
      { name: 'name', label: 'Nome Completo', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'role', label: 'Cargo', type: 'select', options: ['Admin', 'Gerente', 'Vendedor', 'Supervisor'] },
      { name: 'team', label: 'Equipe', type: 'select', options: ['Vendas A', 'Vendas B', 'Suporte'] },
      { name: 'status', label: 'Status', type: 'select', options: ['Ativo', 'Inativo'] }
    ]
  },
  permissions: {
    title: "Permissões",
    description: "Defina o que cada perfil pode fazer no sistema.",
    icon: Shield,
    columns: [
      { key: 'module', label: 'Módulo' },
      { key: 'action', label: 'Ação' },
      { key: 'description', label: 'Descrição' }
    ]
  },
  profiles: {
    title: "Perfis de Acesso",
    description: "Crie grupos de permissões reutilizáveis.",
    icon: Shield,
    columns: [
      { key: 'name', label: 'Perfil' },
      { key: 'description', label: 'Descrição' },
      { key: 'usersCount', label: 'Usuários' }
    ]
  },
  
  // GRUPO 3
  teams: {
    title: "Equipes",
    description: "Organize seus usuários em times.",
    icon: Users2,
    columns: [
      { key: 'name', label: 'Nome da Equipe' },
      { key: 'supervisor', label: 'Supervisor' },
      { key: 'membersCount', label: 'Membros' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    fields: [
      { name: 'name', label: 'Nome da Equipe', type: 'text', required: true },
      { name: 'supervisor', label: 'Supervisor', type: 'select', options: ['Carlos Silva', 'Ana Souza'] },
      { name: 'description', label: 'Descrição', type: 'textarea' }
    ]
  },

  // GRUPO 4
  products: {
    title: "Produtos",
    description: "Catálogo de produtos e serviços.",
    icon: Box,
    columns: [
      { key: 'sku', label: 'SKU', type: 'mono' },
      { key: 'name', label: 'Produto' },
      { key: 'category', label: 'Categoria' },
      { key: 'price', label: 'Preço', type: 'currency' },
      { key: 'stock', label: 'Estoque' },
      { key: 'status', label: 'Status', type: 'badge' }
    ],
    fields: [
      { name: 'sku', label: 'SKU', type: 'text', required: true },
      { name: 'name', label: 'Nome do Produto', type: 'text', required: true },
      { name: 'category', label: 'Categoria', type: 'select', options: ['Eletrônicos', 'Serviços', 'Acessórios'] },
      { name: 'price', label: 'Preço Base', type: 'number', required: true },
      { name: 'stock', label: 'Estoque Inicial', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['Ativo', 'Inativo', 'Rascunho'] }
    ]
  },
  categories: {
    title: "Categorias",
    description: "Organização hierárquica de produtos.",
    icon: Tag,
    columns: [
      { key: 'name', label: 'Nome' },
      { key: 'description', label: 'Descrição' },
      { key: 'productsCount', label: 'Produtos' }
    ]
  },
  prices: {
    title: "Tabela de Preços",
    description: "Gestão de precificação e margens.",
    icon: DollarSign,
    columns: [
      { key: 'product', label: 'Produto' },
      { key: 'basePrice', label: 'Custo', type: 'currency' },
      { key: 'salePrice', label: 'Venda', type: 'currency' },
      { key: 'margin', label: 'Margem', type: 'percent' }
    ]
  },
  discounts: {
    title: "Descontos",
    description: "Regras de descontos automáticos.",
    icon: Percent,
    columns: [
      { key: 'name', label: 'Regra' },
      { key: 'type', label: 'Tipo' },
      { key: 'value', label: 'Valor' },
      { key: 'active', label: 'Ativo', type: 'boolean' }
    ]
  },
  taxes: {
    title: "Impostos",
    description: "Configuração fiscal.",
    icon: FileText,
    columns: [
      { key: 'name', label: 'Imposto' },
      { key: 'percentage', label: 'Alíquota', type: 'percent' },
      { key: 'type', label: 'Tipo' }
    ]
  },

  // GRUPO 5
  goals: {
    title: "Metas",
    description: "Definição e acompanhamento de metas.",
    icon: Target,
    columns: [
      { key: 'period', label: 'Período' },
      { key: 'seller', label: 'Responsável' },
      { key: 'target', label: 'Meta', type: 'currency' },
      { key: 'realized', label: 'Realizado', type: 'currency' },
      { key: 'percentage', label: '% Atingimento', type: 'progress' }
    ],
    fields: [
      { name: 'period', label: 'Período', type: 'text' },
      { name: 'seller', label: 'Vendedor/Equipe', type: 'select', options: ['Time A', 'João'] },
      { name: 'target', label: 'Valor da Meta', type: 'number' }
    ]
  },
  commissions: {
    title: "Comissões",
    description: "Regras de comissionamento.",
    icon: CreditCard,
    columns: [
      { key: 'name', label: 'Regra' },
      { key: 'percentage', label: 'Percentual', type: 'percent' },
      { key: 'condition', label: 'Condição' },
      { key: 'active', label: 'Ativa', type: 'boolean' }
    ]
  },

  // GRUPO 6
  apikeys: {
    title: "API Keys",
    description: "Chaves de acesso para API externa.",
    icon: Key,
    columns: [
      { key: 'name', label: 'Nome' },
      { key: 'key', label: 'Chave (Masked)', type: 'mono' },
      { key: 'created', label: 'Criada em', type: 'date' },
      { key: 'lastUsed', label: 'Último Uso', type: 'date' }
    ]
  },
  webhooks: {
    title: "Webhooks",
    description: "Notificações de eventos em tempo real.",
    icon: Webhook,
    columns: [
      { key: 'url', label: 'URL de Destino' },
      { key: 'event', label: 'Evento' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'lastTrigger', label: 'Último Disparo', type: 'date' }
    ]
  },

  // GRUPO 7
  logs: {
    title: "Logs do Sistema",
    description: "Histórico de eventos e erros.",
    icon: Activity,
    columns: [
      { key: 'date', label: 'Data/Hora', type: 'datetime' },
      { key: 'user', label: 'Usuário' },
      { key: 'action', label: 'Ação' },
      { key: 'module', label: 'Módulo' },
      { key: 'status', label: 'Status', type: 'badge' }
    ]
  },
  audit: {
    title: "Auditoria",
    description: "Trilha de auditoria detalhada.",
    icon: Shield,
    columns: [
      { key: 'date', label: 'Timestamp', type: 'datetime' },
      { key: 'user', label: 'Autor' },
      { key: 'action', label: 'Operação' },
      { key: 'details', label: 'Detalhes' },
      { key: 'ip', label: 'IP' }
    ]
  }
};