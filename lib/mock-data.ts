import type { Category, Product, Order, Customer, Vendor, DashboardMetrics, Report, Backup } from './types'

export const categories: Category[] = [
  { id: '1', name: 'WhatsApp de Ofertas', icon: 'MessageCircle', slug: 'whatsapp', productCount: 0 },
  { id: '2', name: 'Promocoes', icon: 'Gift', slug: 'promocoes', productCount: 0 },
  { id: '3', name: 'Cimento', icon: 'Box', slug: 'cimento', productCount: 0 },
  { id: '4', name: 'Argamassas', icon: 'Boxes', slug: 'argamassas', productCount: 0 },
  { id: '5', name: 'Rejuntes', icon: 'Palette', slug: 'rejuntes', productCount: 0 },
  { id: '6', name: 'Areia e Pedra', icon: 'Mountain', slug: 'areia-pedra', productCount: 0 },
  { id: '7', name: 'Aco', icon: 'Wrench', slug: 'aco', productCount: 0 },
  { id: '8', name: 'Tijolos', icon: 'Square', slug: 'tijolos', productCount: 0 },
  { id: '9', name: 'Hidraulicos', icon: 'Droplets', slug: 'hidraulicos', productCount: 0 },
  { id: '10', name: 'Eletricos', icon: 'Zap', slug: 'eletricos', productCount: 0 },
]

export const products: Product[] = []

export const orders: Order[] = []

export const customers: Customer[] = []

export const vendors: Vendor[] = []

export const dashboardMetrics: DashboardMetrics = {
  totalOrders: 0,
  totalRevenue: 0,
  activeCustomers: 0,
  totalVendors: 0,
  ordersGrowth: '0%',
  revenueGrowth: '0%',
  customersGrowth: '0%',
  vendorsGrowth: '0',
}

export const reports: Report[] = []

export const backups: Backup[] = []

export const cities = [
  'Aguas de Sao Pedro', 'Americana', 'Aracoiaba da Serra', 'Aruja', 'Barueri',
  'Cabreuva', 'Cacapava', 'Cajamar', 'Campinas', 'Campo Limpo Paulista',
  'Carapicuiba', 'Charqueada', 'Embu das Artes', 'Engenheiro Coelho',
  'Ferraz de Vasconcelos', 'Francisco Morato', 'Franco da Rocha', 'Guararema',
  'Guaratingueta', 'Guarulhos', 'Hortolandia', 'Indaiatuba', 'Ipero', 'Ipeuna',
  'Iracemapolis', 'Itapevi', 'Itaquaquecetuba', 'Itatiba', 'Itu', 'Itupeva',
  'Jacarei', 'Jambeiro', 'Jandira', 'Jarinu', 'Jundiai', 'Limeira', 'Louveira',
  'Monte Mor', 'Nova Odessa', 'Osasco', 'Paulinia', 'Pindamonhangaba', 'Piracicaba',
  'Poa', 'Rio Claro', 'Rio das Pedras', 'Salto', 'Salto de Pirapora',
  'Santa Barbara D\'Oeste', 'Santana de Parnaiba', 'Sao Jose dos Campos',
  'Sao Pedro', 'Sorocaba', 'Sumare', 'Suzano', 'Taboao da Serra', 'Taubate',
  'Valinhos', 'Varzea Paulista', 'Vinhedo', 'Votorantim',
]

export const brands = [
  { id: '1', name: 'Votoran', initial: 'V' },
  { id: '2', name: 'Quartzolit', initial: 'Q' },
  { id: '3', name: 'Tigre', initial: 'T' },
  { id: '4', name: 'Gerdau', initial: 'G' },
  { id: '5', name: 'Votomassa', initial: 'VM' },
  { id: '6', name: 'Forlev', initial: 'F' },
  { id: '7', name: 'Caue', initial: 'C' },
]

export const features = [
  { icon: 'DollarSign', title: 'PRODUTOS MAIS BARATOS', subtitle: 'na sua região' },
  { icon: 'Store', title: 'RETIRE NA LOJA', subtitle: 'quando quiser' },
  { icon: 'Truck', title: 'ENTREGA RÁPIDA', subtitle: '(expressa)' },
  { icon: 'Package', title: 'FRETE GRÁTIS', subtitle: '(consulte os critérios)' },
  { icon: 'CheckCircle', title: 'COMPRA', subtitle: 'garantida' },
  { icon: 'Zap', title: 'ORÇAMENTO', subtitle: 'relâmpago' },
]

export const faqItems = [
  {
    question: 'A AlfaConstrução possui loja física?',
    answer: 'Não. A AlfaConstrução é uma plataforma online de marketplace que reúne os melhores lojistas da região. Ao utilizar a plataforma AlfaConstrução o consumidor estará comprando de lojas físicas que farão a entrega no endereço da sua obra.',
  },
  {
    question: 'A AlfaConstrução avalia o perfil dos lojistas que fazem parte da plataforma?',
    answer: 'A plataforma AlfaConstrução trabalha somente com lojistas convidados que passaram por um rigoroso processo de seleção. Além disso, após início das suas vendas pela plataforma, a AlfaConstrução monitora continuamente as avaliações dos consumidores a respeito desse lojista.',
  },
  {
    question: 'Como cancelar uma compra?',
    answer: 'Caso deseje cancelar uma compra você deverá entrar em contato conosco pelo telefone 0800 333 6272 ou pelo WhatsApp (11) 4572-4545.',
  },
  {
    question: 'Quais são os meios de pagamentos disponíveis?',
    answer: 'Você pode pagar direto na plataforma utilizando cartão de crédito, ou pagar na entrega via PIX, cartão de crédito ou débito diretamente para o lojista responsável.',
  },
]
