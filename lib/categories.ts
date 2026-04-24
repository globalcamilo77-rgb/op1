export interface CategoryDefinition {
  id: string
  name: string
  slug: string
  icon: string
  subcategories?: string[]
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'cimento',
    name: 'Cimento',
    slug: 'cimento',
    icon: 'Box',
  },
  {
    id: 'argamassas',
    name: 'Argamassas',
    slug: 'argamassas',
    icon: 'Boxes',
    subcategories: ['Argamassas Colantes', 'Argamassas para Construcao'],
  },
  {
    id: 'rejuntes',
    name: 'Rejuntes',
    slug: 'rejuntes',
    icon: 'Palette',
    subcategories: ['Rejuntes Ceramicos', 'Rejuntes Porcelanatos'],
  },
  {
    id: 'areia-pedra',
    name: 'Areia, Pedra, Cal e Gesso',
    slug: 'areia-pedra-cal-gesso',
    icon: 'Mountain',
    subcategories: ['Areia', 'Pedra', 'Cal e Gesso'],
  },
  {
    id: 'aco',
    name: 'Aco para Construcao',
    slug: 'aco',
    icon: 'Wrench',
    subcategories: [
      'Vergalhao',
      'Colunas e Sapatas',
      'Arames',
      'Malha',
      'Trelicas',
      'Pregos',
    ],
  },
  {
    id: 'tijolos',
    name: 'Tijolos e Blocos',
    slug: 'tijolos-blocos',
    icon: 'Square',
    subcategories: ['Tijolo Ceramico', 'Blocos de Concreto'],
  },
  {
    id: 'impermeabilizantes',
    name: 'Impermeabilizantes',
    slug: 'impermeabilizantes',
    icon: 'ShieldCheck',
  },
  {
    id: 'telhas',
    name: 'Telhas',
    slug: 'telhas',
    icon: 'Home',
    subcategories: ['Telha de Fibrocimento'],
  },
  {
    id: 'lajes',
    name: 'Lajes',
    slug: 'lajes',
    icon: 'Layers',
  },
  {
    id: 'hidraulicos',
    name: 'Materiais Hidraulicos',
    slug: 'hidraulicos',
    icon: 'Droplets',
    subcategories: [
      'Caixas dagua',
      'Tubos e Conexoes',
      'Drenagem',
      'Registros e Bases',
      'Tratamento',
    ],
  },
  {
    id: 'eletricos',
    name: 'Materiais Eletricos',
    slug: 'eletricos',
    icon: 'Zap',
    subcategories: [
      'Acessorios para Fios e Extensoes',
      'Fios e Cabos',
      'Disjuntores',
      'Quadros e Caixas',
      'Interruptores e Tomadas',
      'Controladores de Acesso',
      'Tubos e Eletrodutos',
    ],
  },
  {
    id: 'lonas',
    name: 'Lonas',
    slug: 'lonas',
    icon: 'Tent',
  },
  {
    id: 'madeira',
    name: 'Madeira para Construcao',
    slug: 'madeira',
    icon: 'Trees',
  },
  {
    id: 'ferragens',
    name: 'Ferragens',
    slug: 'ferragens',
    icon: 'Cog',
    subcategories: [
      'Parafusos, Buchas e Fixacao',
      'Protecao e Seguranca',
      'Fechaduras e Acessorios',
      'Escadas',
    ],
  },
  {
    id: 'ferramentas',
    name: 'Ferramentas',
    slug: 'ferramentas',
    icon: 'Hammer',
    subcategories: [
      'Acessorios e Pecas de Reposicao',
      'Compressores e Ferramentas Industriais',
      'Ferramentas Eletricas',
      'EPI (Equipamentos de Protecao Individual)',
      'Ferramentas Manuais',
    ],
  },
  {
    id: 'loucas-metais',
    name: 'Loucas e Metais',
    slug: 'loucas-metais',
    icon: 'Bath',
    subcategories: ['Acessorios', 'Chuveiros', 'Loucas', 'Torneiras', 'Pias'],
  },
  {
    id: 'moveis',
    name: 'Moveis, Cozinha e Banheiro',
    slug: 'moveis-cozinha-banheiro',
    icon: 'Sofa',
  },
  {
    id: 'revestimentos',
    name: 'Revestimentos e Porcelanatos',
    slug: 'revestimentos',
    icon: 'LayoutGrid',
    subcategories: [
      'Acessorios e Ferramentas para Assentamentos',
      'Rejunte',
      'Porcelanatos',
    ],
  },
  {
    id: 'pintura',
    name: 'Pintura',
    slug: 'pintura',
    icon: 'Paintbrush',
    subcategories: [
      'Adesivos',
      'Limpeza Pos Obra',
      'Lixas e Acessorios',
      'Massas, Fundos e Resinas',
      'Pinceis, Trinchas, Rolos e Ferramentas',
      'Tintas, Vernizes e Esmaltes',
    ],
  },
]

export function getCategoryByName(name: string): CategoryDefinition | undefined {
  return CATEGORIES.find((category) => category.name === name)
}
