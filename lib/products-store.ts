import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface StoreProduct {
  id: string
  name: string
  category: string
  subcategory?: string
  brand?: string
  dimensions?: string
  price: number
  stock: number
  description?: string
  image?: string
  active: boolean
}

interface ProductsState {
  products: StoreProduct[]
  isLoading: boolean
  lastSynced: string | null
  loadFromSupabase: () => Promise<void>
  saveToSupabase: () => Promise<{ success?: boolean; error?: string }>
  addProduct: (product: Omit<StoreProduct, 'id'>) => void
  updateProduct: (id: string, updates: Partial<Omit<StoreProduct, 'id'>>) => void
  removeProduct: (id: string) => void
  toggleActive: (id: string) => void
  resetToSeed: () => void
}

// Unsplash CDN — imagens gratuitas (Unsplash License)
const U = (id: string) =>
  `https://images.unsplash.com/${id}?w=800&h=800&fit=crop&q=80&auto=format`

const IMG = {
  cement:    U('photo-1680357680725-f350480aee35'), // sacas de cimento empilhadas
  brick:     U('photo-1629608444154-6d052691632f'), // tijolo cerâmico vermelho close-up
  brickWall: U('photo-1495578942200-c5f5d2137def'), // parede de tijolos
  concrete:  U('photo-1617142854631-6989a56c7d64'), // blocos de concreto cinza
  rebar:     U('photo-1763771420303-0f11ccf613d1'), // vergalhão aço
  sandFine:  U('photo-1635604027975-0a0a34a35646'), // areia fina
  gravel:    U('photo-1745523685696-4e965dcfd9ae'), // pedra brita / cascalho
  cable:     U('photo-1517373116369-9bdb8cdc9f62'), // cabos elétricos coloridos
  paint:     U('photo-1621685682093-3b8016dcb57d'), // lata tinta branca com pincel
  roller:    U('photo-1516962080544-eac695c93791'), // rolo de pintura branco
  hammer:    U('photo-1586864387789-628af9feed72'), // martelo de garra preto/prata
  screwdr:   U('photo-1516279972890-1a8be6faca96'), // chaves de fenda variadas
  drill:     U('photo-1540104539488-92a51bbc0410'), // furadeira de impacto
  helmet:    U('photo-1552879890-3a06dd3a06c2'), // capacetes amarelos de segurança
  padlock:   U('photo-1582970816926-c8b60f417661'), // cadeado latão em grade
  shower:    U('photo-1566446896748-6075a87760c1'), // chuveiro prata / ducha
  faucet:    U('photo-1610278764397-388d11c35ddb'), // torneira cromada branca
  toilet:    U('photo-1589824783837-6169889fa20f'), // vaso sanitário branco
  sink:      U('photo-1602028915047-37269d1a73f7'), // pia inox cozinha
  pipe:      U('photo-1562448079-7557fc7f04e9'), // tubos PVC hidráulicos brancos
  wood:      U('photo-1520697703789-6ecd9fb2b991'), // tábuas de madeira marrom
  roof:      U('photo-1761342610509-9e4679dd558a'), // telhado metálico corrugado
  tile:      U('photo-1616307821995-5ae93f749e48'), // piso cerâmico branco e cinza
  ladder:    U('photo-1635082627989-dcd12a107364'), // escada apoiada em parede concreto
}

const INITIAL_PRODUCTS: StoreProduct[] = [
  // ─── Cimento ─────────────────────────────────────────────
  { id: 'p-cim-1', name: 'Cimento Portland CP-32 50kg', category: 'Cimento', brand: 'Votoran', dimensions: '50kg - Saco 40x60cm', description: 'Cimento Portland composto CP II-Z 32. Ideal para argamassas de assentamento, revestimento, concretos e contrapisos. Alta resistência inicial.', price: 32.5, stock: 1000, active: true, image: '/products/cimento-cp32.jpg' },
  { id: 'p-cim-2', name: 'Cimento Portland CP-40 50kg', category: 'Cimento', brand: 'Cauê', dimensions: '50kg - Saco 40x60cm', description: 'Cimento Portland de alta resistência CP II-E 40. Recomendado para estruturas que exigem resistência elevada em curto prazo. Ideal para concreto armado.', price: 35.8, stock: 800, active: true, image: '/products/cimento-cp32.jpg' },
  { id: 'p-cim-3', name: 'Cimento Branco 50kg', category: 'Cimento', brand: 'Votoran', dimensions: '50kg - Saco 40x60cm', description: 'Cimento Portland Branco Estrutural. Usado em acabamentos decorativos, rejuntes brancos e peças pré-moldadas aparentes. Cor branca uniforme.', price: 42.0, stock: 300, active: true, image: '/products/cimento-branco.jpg' },
  { id: 'p-cim-4', name: 'Cimento de Alvenaria 50kg', category: 'Cimento', brand: 'Nassau', dimensions: '50kg - Saco 40x60cm', description: 'Cimento para alvenaria estrutural e de vedação. Proporciona boa trabalhabilidade e aderência. Econômico para argamassas de assentamento.', price: 28.9, stock: 650, active: true, image: '/products/cimento-cp32.jpg' },

  // ─── Argamassas ──────────────────────────────────────────
  { id: 'p-arg-1', name: 'Argamassa Colante AC-I 20kg', category: 'Argamassas', subcategory: 'Argamassas Colantes', brand: 'Quartzolit', dimensions: '20kg - Saco 30x50cm', description: 'Argamassa colante para áreas internas. Indicada para assentamento de cerâmicas em pisos e paredes internas. Fácil aplicação e boa aderência.', price: 28.0, stock: 500, active: true, image: '/products/argamassa-colante.jpg' },
  { id: 'p-arg-2', name: 'Argamassa Colante AC-II 20kg', category: 'Argamassas', subcategory: 'Argamassas Colantes', brand: 'Weber', dimensions: '20kg - Saco 30x50cm', description: 'Argamassa colante para áreas externas e fachadas. Alta aderência e flexibilidade. Resistente a intempéries e variações térmicas.', price: 31.5, stock: 450, active: true, image: '/products/argamassa-colante.jpg' },
  { id: 'p-arg-3', name: 'Argamassa de Construção 20kg', category: 'Argamassas', subcategory: 'Argamassas para Construção', brand: 'Votomassa', dimensions: '20kg - Saco 30x50cm', description: 'Argamassa multiuso para construção. Ideal para assentamento de blocos, tijolos e revestimentos internos. Pronta para uso com adição de água.', price: 24.9, stock: 400, active: true, image: '/products/argamassa-colante.jpg' },
  { id: 'p-arg-4', name: 'Argamassa de Emboço 20kg', category: 'Argamassas', subcategory: 'Argamassas para Construção', brand: 'Quartzolit', dimensions: '20kg - Saco 30x50cm', description: 'Argamassa para emboço e reboco. Proporciona superfície lisa e uniforme para receber pintura ou revestimento cerâmico.', price: 26.5, stock: 380, active: true, image: '/products/argamassa-colante.jpg' },

  // ─── Rejuntes ────────────────────────────────────────────
  { id: 'p-rej-1', name: 'Rejunte Cerâmico 1kg', category: 'Rejuntes', subcategory: 'Rejuntes Cerâmicos', brand: 'Quartzolit', dimensions: '1kg - Embalagem 15x20cm', description: 'Rejunte flexível para cerâmicas. Disponível em várias cores. Resistente a fungos e fácil limpeza. Para juntas de 2 a 5mm.', price: 12.5, stock: 600, active: true, image: '/products/rejunte.jpg' },
  { id: 'p-rej-2', name: 'Rejunte Porcelanato Premium 1kg', category: 'Rejuntes', subcategory: 'Rejuntes Porcelanatos', brand: 'Weber', dimensions: '1kg - Embalagem 15x20cm', description: 'Rejunte epóxi para porcelanatos. Alta resistência química e mecânica. Impermeável e antimicrobiano. Para juntas de 1 a 10mm.', price: 18.9, stock: 500, active: true, image: '/products/rejunte.jpg' },

  // ─── Areia, Pedra, Cal e Gesso ───────────────────────────
  { id: 'p-aren-1', name: 'Areia Fina Seca 1000kg', category: 'Areia, Pedra, Cal e Gesso', subcategory: 'Areia', brand: 'Mineração São Paulo', dimensions: '1000kg - Big Bag 90x90x120cm', description: 'Areia fina lavada e peneirada. Ideal para reboco, argamassas de acabamento e assentamento de tijolos. Granulometria uniforme.', price: 45.0, stock: 200, active: true, image: '/products/areia-fina.jpg' },
  { id: 'p-aren-2', name: 'Areia Grossa 1000kg', category: 'Areia, Pedra, Cal e Gesso', subcategory: 'Areia', brand: 'Mineração São Paulo', dimensions: '1000kg - Big Bag 90x90x120cm', description: 'Areia grossa para concreto e contrapiso. Granulometria adequada para traços estruturais. Lavada e livre de impurezas.', price: 42.5, stock: 200, active: true, image: '/products/areia-fina.jpg' },
  { id: 'p-aren-3', name: 'Pedra Brita #0 1000kg', category: 'Areia, Pedra, Cal e Gesso', subcategory: 'Pedra', brand: 'Pedreira Central', dimensions: '1000kg - Big Bag 90x90x120cm - Granulometria 4.8-9.5mm', description: 'Brita 0 para concretos leves e argamassas. Granulometria fina ideal para lajes e vigas delgadas. Pedra britada de alta qualidade.', price: 55.0, stock: 150, active: true, image: '/products/brita.jpg' },
  { id: 'p-aren-4', name: 'Pedra Brita #1 1000kg', category: 'Areia, Pedra, Cal e Gesso', subcategory: 'Pedra', brand: 'Pedreira Central', dimensions: '1000kg - Big Bag 90x90x120cm - Granulometria 9.5-19mm', description: 'Brita 1 para concretos estruturais. A mais utilizada em construção civil. Ideal para fundações, pilares e vigas.', price: 50.0, stock: 150, active: true, image: '/products/brita.jpg' },
  { id: 'p-aren-5', name: 'Cal Hidratada 20kg', category: 'Areia, Pedra, Cal e Gesso', subcategory: 'Cal e Gesso', brand: 'Ical', dimensions: '20kg - Saco 30x50cm', description: 'Cal hidratada CH-I para argamassas. Proporciona plasticidade e trabalhabilidade às misturas. Indicada para rebocos e assentamentos.', price: 18.9, stock: 250, active: true, image: '/products/cal-hidratada.jpg' },
  { id: 'p-aren-6', name: 'Gesso em Pó 40kg', category: 'Areia, Pedra, Cal e Gesso', subcategory: 'Cal e Gesso', brand: 'Gypsum', dimensions: '40kg - Saco 40x60cm', description: 'Gesso para revestimento e acabamento. Secagem rápida e acabamento liso. Ideal para forros, molduras e divisórias.', price: 26.5, stock: 200, active: true, image: '/products/gesso.jpg' },

  // ─── Aço para Construção ─────────────────────────────────
  { id: 'p-aco-1', name: 'Vergalhão CA-50 5mm x 12m', category: 'Aço para Construção', subcategory: 'Vergalhão', brand: 'Gerdau', dimensions: '5mm diâmetro x 12m comprimento - 1.85kg', description: 'Vergalhão de aço CA-50 nervurado. Para armação de estruturas leves, lajes e contrapisos. Aço certificado conforme NBR 7480.', price: 18.5, stock: 400, active: true, image: '/products/vergalhao.jpg' },
  { id: 'p-aco-2', name: 'Vergalhão CA-50 8mm x 12m', category: 'Aço para Construção', subcategory: 'Vergalhão', brand: 'ArcelorMittal', dimensions: '8mm diâmetro x 12m comprimento - 4.74kg', description: 'Vergalhão de aço CA-50 para estruturas médias. Utilizado em vigas, pilares e fundações residenciais. Alta resistência e durabilidade.', price: 42.0, stock: 350, active: true, image: '/products/vergalhao.jpg' },
  { id: 'p-aco-3', name: 'Vergalhão CA-50 10mm x 12m', category: 'Aço para Construção', subcategory: 'Vergalhão', brand: 'Gerdau', dimensions: '10mm diâmetro x 12m comprimento - 7.4kg', description: 'Vergalhão de aço CA-50 para estruturas pesadas. Indicado para grandes vãos e estruturas que exigem maior resistência.', price: 65.5, stock: 300, active: true, image: '/products/vergalhao.jpg' },
  { id: 'p-aco-4', name: 'Coluna Pronta 4 ferros 8mm 12m', category: 'Aço para Construção', subcategory: 'Colunas e Sapatas', brand: 'Gerdau', dimensions: '4 barras 8mm x 12m - Estribos 5mm a cada 15cm', description: 'Armação pronta para coluna estrutural. 4 vergalhões de 8mm com estribos soldados. Facilita e agiliza a execução da obra.', price: 145.0, stock: 80, active: true, image: '/products/vergalhao.jpg' },
  { id: 'p-aco-5', name: 'Arame Recozido 18 BWG 1kg', category: 'Aço para Construção', subcategory: 'Arames', brand: 'Belgo', dimensions: '1kg - Rolo 1.24mm diâmetro - ~80m', description: 'Arame recozido para amarração de ferragens. Maleável e resistente. Essencial para fixação de vergalhões e armaduras.', price: 14.9, stock: 250, active: true, image: '/products/arame-recozido.jpg' },
  { id: 'p-aco-6', name: 'Malha de Aço 15x15cm Q-92', category: 'Aço para Construção', subcategory: 'Malha', brand: 'Gerdau', dimensions: '2.45m x 6m - Malha 15x15cm - Fio 4.2mm', description: 'Tela soldada para armação de lajes e pisos. Malha 15x15cm com arame de 4.2mm. Dispensa amarração e acelera a obra.', price: 75.0, stock: 120, active: true, image: '/products/vergalhao.jpg' },
  { id: 'p-aco-7', name: 'Treliça TG-12 12m', category: 'Aço para Construção', subcategory: 'Treliças', brand: 'ArcelorMittal', dimensions: '12m comprimento - Altura 12cm - Largura 9cm', description: 'Treliça para laje nervurada. Sistema industrializado para lajes de grande vão. Reduz peso próprio e consumo de concreto.', price: 95.0, stock: 100, active: true, image: '/products/vergalhao.jpg' },
  { id: 'p-aco-8', name: 'Pregos 17x21 1kg', category: 'Aço para Construção', subcategory: 'Pregos', brand: 'Gerdau', dimensions: '1kg - Prego 17x21 (4.8x55mm) - ~110 unidades', description: 'Pregos de aço polido para construção. Cabeça chata e ponta afiada. Utilizados em formas, andaimes e estruturas provisórias.', price: 12.0, stock: 500, active: true, image: '/products/pregos.jpg' },

  // ─── Tijolos e Blocos ────────────────────────────────────
  { id: 'p-tij-1', name: 'Tijolo Cerâmico 6 Furos', category: 'Tijolos e Blocos', subcategory: 'Tijolo Cerâmico', brand: 'Cerâmica Lorenzetti', dimensions: '9x14x19cm - Peso 2.3kg', description: 'Tijolo cerâmico de vedação com 6 furos. Ideal para paredes internas e externas. Bom isolamento térmico e acústico.', price: 1.2, stock: 20000, active: true, image: '/products/tijolo-ceramico.jpg' },
  { id: 'p-tij-2', name: 'Tijolo Cerâmico 8 Furos', category: 'Tijolos e Blocos', subcategory: 'Tijolo Cerâmico', brand: 'Cerâmica Lorenzetti', dimensions: '9x19x19cm - Peso 3.2kg', description: 'Tijolo cerâmico de vedação com 8 furos. Maior área de cobertura por unidade. Reduz tempo de execução da alvenaria.', price: 1.5, stock: 18000, active: true, image: '/products/tijolo-ceramico.jpg' },
  { id: 'p-tij-3', name: 'Bloco de Concreto 14x19x39', category: 'Tijolos e Blocos', subcategory: 'Blocos de Concreto', brand: 'Tatu Pré-Moldados', dimensions: '14x19x39cm - Peso 10kg', description: 'Bloco estrutural de concreto classe A. Para alvenaria estrutural e de vedação. Resistência mínima de 6 MPa.', price: 2.8, stock: 12000, active: true, image: '/products/bloco-concreto.jpg' },
  { id: 'p-tij-4', name: 'Bloco de Concreto 19x19x39', category: 'Tijolos e Blocos', subcategory: 'Blocos de Concreto', brand: 'Tatu Pré-Moldados', dimensions: '19x19x39cm - Peso 14kg', description: 'Bloco estrutural de concreto classe A. Para construções de maior porte. Alta resistência à compressão e durabilidade.', price: 3.5, stock: 10000, active: true, image: '/products/bloco-concreto.jpg' },

  // ─── Impermeabilizantes ──────────────────────────────────
  { id: 'p-imp-1', name: 'Impermeabilizante Acrílico 18L', category: 'Impermeabilizantes', brand: 'Vedacit', dimensions: '18 litros - Lata 30x30x35cm', description: 'Impermeabilizante acrílico para lajes e paredes. Flexível e resistente a raios UV. Reflete calor e reduz temperatura interna.', price: 189.0, stock: 80, active: true, image: '/products/impermeabilizante.jpg' },
  { id: 'p-imp-2', name: 'Manta Asfáltica 4mm 10m²', category: 'Impermeabilizantes', brand: 'Denver', dimensions: '10m² - Rolo 1m x 10m - Espessura 4mm', description: 'Manta asfáltica aluminizada para impermeabilização de lajes. Aplicação com maçarico. Proteção contra infiltrações.', price: 320.0, stock: 60, active: true, image: '/products/manta-asfaltica.jpg' },

  // ─── Telhas ──────────────────────────────────────────────
  { id: 'p-tel-1', name: 'Telha de Fibrocimento 6mm', category: 'Telhas', subcategory: 'Telha de Fibrocimento', brand: 'Eternit', dimensions: '1.83m x 1.10m x 6mm - Peso 25kg', description: 'Telha ondulada de fibrocimento CRFS. Sem amianto. Resistente a intempéries e de fácil instalação. 5 ondas.', price: 42.5, stock: 220, active: true, image: '/products/telha-fibrocimento.jpg' },
  { id: 'p-tel-2', name: 'Telha de Fibrocimento 8mm', category: 'Telhas', subcategory: 'Telha de Fibrocimento', brand: 'Brasilit', dimensions: '2.44m x 1.10m x 8mm - Peso 42kg', description: 'Telha ondulada reforçada de fibrocimento. Maior resistência mecânica para vãos maiores. Sem amianto, ecológica.', price: 55.0, stock: 180, active: true, image: '/products/telha-fibrocimento.jpg' },

  // ─── Lajes ───────────────────────────────────────────────
  { id: 'p-laj-1', name: 'Laje Pré-Moldada H8 (m²)', category: 'Lajes', brand: 'Lajes Brasil', dimensions: 'Vigota 8cm altura x 3m - EPS 30x8x100cm', description: 'Sistema de laje pré-moldada com vigotas e EPS. Altura total 8cm + capa. Para vãos de até 3,5m. Leve e econômica.', price: 75.0, stock: 200, active: true, image: '/products/bloco-concreto.jpg' },
  { id: 'p-laj-2', name: 'Laje Treliçada H12 (m²)', category: 'Lajes', brand: 'Lajes Brasil', dimensions: 'Vigota 12cm altura x 4m - EPS 40x12x100cm', description: 'Laje treliçada para vãos maiores até 5m. Maior resistência estrutural. Ideal para garagens e salões.', price: 95.0, stock: 150, active: true, image: '/products/vergalhao.jpg' },

  // ─── Materiais Hidráulicos ───────────────────────────────
  { id: 'p-hid-1', name: 'Caixa d\'água 500L', category: 'Materiais Hidráulicos', subcategory: 'Caixas d\'água', brand: 'Fortlev', dimensions: '500 litros - 108cm diâmetro x 72cm altura', description: 'Caixa d\'água em polietileno com tampa rosqueável. Proteção UV e antibacteriana. Tampa com trava de segurança.', price: 180.0, stock: 60, active: true, image: '/products/caixa-dagua.jpg' },
  { id: 'p-hid-2', name: 'Caixa d\'água 1000L', category: 'Materiais Hidráulicos', subcategory: 'Caixas d\'água', brand: 'Tigre', dimensions: '1000 litros - 127cm diâmetro x 93cm altura', description: 'Caixa d\'água de polietileno para residências. Tampa com rosca e filtro. Mantém água fresca e livre de contaminação.', price: 280.0, stock: 50, active: true, image: '/products/caixa-dagua.jpg' },
  { id: 'p-hid-3', name: 'Tubo PVC Esgoto 50mm 6m', category: 'Materiais Hidráulicos', subcategory: 'Tubos e Conexões', brand: 'Tigre', dimensions: '50mm diâmetro x 6m comprimento', description: 'Tubo PVC para esgoto série normal. Conexão ponta e bolsa com anel de vedação. Resistente a produtos químicos.', price: 45.0, stock: 200, active: true, image: '/products/tubo-pvc.jpg' },
  { id: 'p-hid-4', name: 'Tubo PVC Esgoto 100mm 6m', category: 'Materiais Hidráulicos', subcategory: 'Tubos e Conexões', brand: 'Amanco', dimensions: '100mm diâmetro x 6m comprimento', description: 'Tubo PVC para esgoto primário e colunas. Paredes reforçadas para maior resistência. Sistema ponta e bolsa.', price: 85.0, stock: 150, active: true, image: '/products/tubo-pvc.jpg' },
  { id: 'p-hid-5', name: 'Caixa Sifonada 30x30', category: 'Materiais Hidráulicos', subcategory: 'Drenagem', brand: 'Tigre', dimensions: '30x30cm - Saída 50mm', description: 'Caixa sifonada com grelha quadrada. Evita retorno de gases e odores. Para ralos de banheiros e áreas de serviço.', price: 65.0, stock: 80, active: true, image: '/products/tubo-pvc.jpg' },
  { id: 'p-hid-6', name: 'Registro Esfera PVC 1/2"', category: 'Materiais Hidráulicos', subcategory: 'Registros e Bases', brand: 'Tigre', dimensions: '1/2 polegada - Rosca BSP', description: 'Registro de esfera em PVC para água fria. Abertura total de 90°. Fácil manutenção e alta durabilidade.', price: 38.0, stock: 220, active: true, image: '/products/torneira.jpg' },
  { id: 'p-hid-7', name: 'Cloro Líquido 5L', category: 'Materiais Hidráulicos', subcategory: 'Tratamento', brand: 'Hidroazul', dimensions: '5 litros - Galão 15x15x25cm', description: 'Hipoclorito de sódio para tratamento de água. Concentração 10-12%. Para caixas d\'água e piscinas.', price: 42.0, stock: 120, active: true, image: '/products/impermeabilizante.jpg' },

  // ─── Materiais Elétricos ─────────────────────────────────
  { id: 'p-ele-1', name: 'Plug Macho 2P+T 10A', category: 'Materiais Elétricos', subcategory: 'Acessórios para Fios e Extensões', brand: 'Fame', dimensions: '10A/250V - Padrão NBR 14136', description: 'Plug macho com 3 pinos novo padrão brasileiro. Corpo em termoplástico antichama. Para cabos de até 1,5mm².', price: 8.5, stock: 400, active: true, image: '/products/interruptor.jpg' },
  { id: 'p-ele-2', name: 'Fio Flexível 1.5mm² 100m', category: 'Materiais Elétricos', subcategory: 'Fios e Cabos', brand: 'Sil', dimensions: '1.5mm² - Rolo 100m - 450/750V', description: 'Fio de cobre flexível com isolamento em PVC. Para circuitos de iluminação. Antichama e atóxico. Várias cores.', price: 85.0, stock: 100, active: true, image: '/products/fio-eletrico.jpg' },
  { id: 'p-ele-3', name: 'Fio Flexível 2.5mm² 100m', category: 'Materiais Elétricos', subcategory: 'Fios e Cabos', brand: 'Prysmian', dimensions: '2.5mm² - Rolo 100m - 450/750V', description: 'Fio de cobre flexível para circuitos de tomadas. Suporta até 21A. Isolamento duplo e antichama.', price: 145.0, stock: 80, active: true, image: '/products/fio-eletrico.jpg' },
  { id: 'p-ele-4', name: 'Disjuntor DIN Unipolar 25A', category: 'Materiais Elétricos', subcategory: 'Disjuntores', brand: 'Siemens', dimensions: '1 módulo DIN - Curva C - 25A/230V', description: 'Mini disjuntor termomagnético unipolar. Proteção contra sobrecarga e curto-circuito. Capacidade de ruptura 3kA.', price: 35.0, stock: 200, active: true, image: '/products/disjuntor.jpg' },
  { id: 'p-ele-5', name: 'Quadro Distribuição 8 Disjuntores', category: 'Materiais Elétricos', subcategory: 'Quadros e Caixas', brand: 'Tigre', dimensions: '8 módulos DIN - Embutir 20x16x8cm', description: 'Quadro de distribuição para embutir. Porta com visor fumê. Barramento de fase e neutro incluso.', price: 145.0, stock: 70, active: true, image: '/products/disjuntor.jpg' },
  { id: 'p-ele-6', name: 'Interruptor Simples 10A', category: 'Materiais Elétricos', subcategory: 'Interruptores e Tomadas', brand: 'Tramontina', dimensions: '10A/250V - 4x2" - Branco', description: 'Interruptor simples de embutir linha Liz. Tecla ampla e silenciosa. Fabricado em policarbonato resistente.', price: 12.5, stock: 300, active: true, image: '/products/interruptor.jpg' },
  { id: 'p-ele-7', name: 'Tomada Dupla 2P+T 10A', category: 'Materiais Elétricos', subcategory: 'Interruptores e Tomadas', brand: 'Tramontina', dimensions: '10A/250V - 4x2" - Branco', description: 'Tomada dupla novo padrão brasileiro. Contatos reforçados em latão. Espelho em termoplástico branco.', price: 18.0, stock: 280, active: true, image: '/products/interruptor.jpg' },
  { id: 'p-ele-8', name: 'Fechadura Digital Biométrica', category: 'Materiais Elétricos', subcategory: 'Controladores de Acesso', brand: 'Yale', dimensions: 'Para portas 35-55mm - 4 pilhas AA', description: 'Fechadura eletrônica com leitor biométrico e senha. Armazena até 100 digitais. Acabamento cromado escovado.', price: 489.0, stock: 25, active: true, image: '/products/cadeado.jpg' },
  { id: 'p-ele-9', name: 'Eletroduto Corrugado 25mm 50m', category: 'Materiais Elétricos', subcategory: 'Tubos e Eletrodutos', brand: 'Tigre', dimensions: '25mm diâmetro x 50m - Flexível', description: 'Eletroduto corrugado flexível em PVC. Para embutir em lajes e paredes. Antichama e resistente a impactos.', price: 95.0, stock: 90, active: true, image: '/products/tubo-pvc.jpg' },

  // ─── Lonas ──────�������────────────────────────────────────────
  { id: 'p-lon-1', name: 'Lona Plástica Preta 4x100m', category: 'Lonas', brand: 'Lonax', dimensions: '4m largura x 100m comprimento - 100 micras', description: 'Lona plástica preta para contrapiso e proteção. Evita subida de umidade. Ideal para hortas e coberturas provisórias.', price: 320.0, stock: 50, active: true, image: '/products/lona-plastica.jpg' },
  { id: 'p-lon-2', name: 'Lona Polietileno 6x10m', category: 'Lonas', brand: 'Lona Forte', dimensions: '6x10m - 150 micras - Azul/Amarela', description: 'Lona reforçada com ilhoses nas bordas. Proteção contra sol e chuva. Para coberturas de obras e materiais.', price: 145.0, stock: 80, active: true, image: '/products/lona-plastica.jpg' },

  // ─── Madeira para Construção ─────────────────────────────
  { id: 'p-mad-1', name: 'Caibro Pinus 5x6cm 3m', category: 'Madeira para Construção', brand: 'Madepar', dimensions: '5x6cm seção x 3m comprimento', description: 'Caibro de pinus tratado para telhados. Madeira de reflorestamento certificada. Leve e fácil de trabalhar.', price: 22.0, stock: 250, active: true, image: '/products/madeira-caibro.jpg' },
  { id: 'p-mad-2', name: 'Sarrafo Pinus 2.5x10cm 3m', category: 'Madeira para Construção', brand: 'Madepar', dimensions: '2.5x10cm seção x 3m comprimento', description: 'Sarrafo de pinus para ripas e estruturas leves. Aplainado em todas as faces. Ideal para forros e divisórias.', price: 14.0, stock: 320, active: true, image: '/products/madeira-caibro.jpg' },
  { id: 'p-mad-3', name: 'Tábua Pinus 2.5x30cm 3m', category: 'Madeira para Construção', brand: 'Madepar', dimensions: '2.5x30cm seção x 3m comprimento', description: 'Tábua de pinus para formas e andaimes. Madeira seca e sem nós grandes. Múltiplos usos na construção.', price: 65.0, stock: 150, active: true, image: '/products/madeira-caibro.jpg' },

  // ─── Ferragens ───────────────────────────────────────────
  { id: 'p-fer-1', name: 'Parafuso Sextavado 8x30mm', category: 'Ferragens', subcategory: 'Parafusos, Buchas e Fixação', brand: 'Ciser', dimensions: '8mm diâmetro x 30mm - Rosca parcial', description: 'Parafuso sextavado zincado classe 8.8. Para fixações estruturais em madeira e metal. Cabeça para chave 13mm.', price: 2.5, stock: 1500, active: true, image: '/products/parafusos.jpg' },
  { id: 'p-fer-2', name: 'Parafuso Soberba 3.5x30 cx100', category: 'Ferragens', subcategory: 'Parafusos, Buchas e Fixação', brand: 'Jomarca', dimensions: '3.5mm x 30mm - Caixa com 100 unidades', description: 'Parafuso auto-atarraxante para madeira. Cabeça Phillips zincada. Ponta afiada para fácil penetração.', price: 15.0, stock: 400, active: true, image: '/products/parafusos.jpg' },
  { id: 'p-fer-3', name: 'Bucha Plástica S6 pct100', category: 'Ferragens', subcategory: 'Parafusos, Buchas e Fixação', brand: 'Fischer', dimensions: '6mm diâmetro - Pacote 100 unidades', description: 'Bucha de nylon para alvenaria e concreto. Para parafusos de 3,5 a 4mm. Expansão uniforme e firme.', price: 8.0, stock: 600, active: true, image: '/products/parafusos.jpg' },
  { id: 'p-fer-4', name: 'Cadeado 40mm Reforçado', category: 'Ferragens', subcategory: 'Proteção e Segurança', brand: 'Papaiz', dimensions: '40mm largura - Haste 6mm - 2 chaves', description: 'Cadeado de latão maciço com haste de aço temperado. Mecanismo de segredo de 4 pinos. Resistente a intempéries.', price: 32.0, stock: 220, active: true, image: '/products/cadeado.jpg' },
  { id: 'p-fer-5', name: 'Fechadura Cilindro 50mm', category: 'Ferragens', subcategory: 'Fechaduras e Acessórios', brand: 'Stam', dimensions: '50mm entre furos - Para portas 35-45mm', description: 'Fechadura de cilindro para portas internas. Acabamento cromado. Inclui maçanetas, espelhos e chaves.', price: 42.0, stock: 180, active: true, image: '/products/cadeado.jpg' },
  { id: 'p-fer-6', name: 'Escada Alumínio 6 Degraus', category: 'Ferragens', subcategory: 'Escadas', brand: 'Mor', dimensions: '6 degraus - Altura 1.8m - Capacidade 120kg', description: 'Escada doméstica em alumínio leve. Pés antiderrapantes. Fácil de transportar e armazenar. Certificada pelo Inmetro.', price: 245.0, stock: 60, active: true, image: '/products/escada-aluminio.jpg' },

  // ─── Ferramentas ─────────────────────────────────────────
  { id: 'p-fra-1', name: 'Maleta de Bits 32 Peças', category: 'Ferramentas', subcategory: 'Acessórios e Peças de Reposição', brand: 'Bosch', dimensions: 'Bits 25mm - Estojo plástico 15x10x5cm', description: 'Kit de pontas para parafusadeira. Inclui Phillips, fenda, Torx e Allen. Aço cromo-vanádio de alta dureza.', price: 89.0, stock: 90, active: true, image: '/products/parafusos.jpg' },
  { id: 'p-fra-2', name: 'Compressor de Ar 25L 2HP', category: 'Ferramentas', subcategory: 'Compressores e Ferramentas Industriais', brand: 'Schulz', dimensions: '25 litros - 8.5 PCM - 116 PSI', description: 'Compressor de ar portátil para pintura e pequenas oficinas. Motor 2HP monofásico. Tanque horizontal.', price: 1290.0, stock: 18, active: true, image: '/products/furadeira.jpg' },
  { id: 'p-fra-3', name: 'Furadeira Impacto 650W', category: 'Ferramentas', subcategory: 'Ferramentas Elétricas', brand: 'DeWalt', dimensions: '650W - 0-2800 RPM - Mandril 13mm', description: 'Furadeira de impacto profissional. Velocidade variável e reversão. Para concreto, metal e madeira.', price: 289.0, stock: 60, active: true, image: '/products/furadeira.jpg' },
  { id: 'p-fra-4', name: 'Capacete Segurança Branco', category: 'Ferramentas', subcategory: 'EPI (Equipamentos de Proteção Individual)', brand: '3M', dimensions: 'Ajustável 52-64cm - Classe A', description: 'Capacete de segurança com carneira de polietileno. Suspensão com ajuste tipo catraca. Proteção contra impactos.', price: 28.0, stock: 200, active: true, image: '/products/capacete-seguranca.jpg' },
  { id: 'p-fra-5', name: 'Martelo Unha 600g', category: 'Ferramentas', subcategory: 'Ferramentas Manuais', brand: 'Tramontina', dimensions: '600g cabeça - Cabo 33cm', description: 'Martelo de unha em aço forjado. Cabo de madeira envernizada. Superfície de impacto temperada.', price: 35.0, stock: 180, active: true, image: '/products/martelo.jpg' },
  { id: 'p-fra-6', name: 'Chave de Fenda 1/4" x 6"', category: 'Ferramentas', subcategory: 'Ferramentas Manuais', brand: 'Tramontina', dimensions: 'Ponta 6mm - Haste 150mm', description: 'Chave de fenda com haste em aço cromo-vanádio. Cabo ergonômico em polipropileno. Ponta magnetizada.', price: 8.5, stock: 320, active: true, image: '/products/parafusos.jpg' },
  { id: 'p-fra-7', name: 'Alicate Universal 8"', category: 'Ferramentas', subcategory: 'Ferramentas Manuais', brand: 'Gedore', dimensions: '8 polegadas (200mm) - Isolado 1000V', description: 'Alicate universal profissional. Corta fios e cabos. Aço especial temperado. Cabo isolado para eletricista.', price: 25.0, stock: 220, active: true, image: '/products/martelo.jpg' },
  { id: 'p-fra-8', name: 'Nível de Bolha 60cm', category: 'Ferramentas', subcategory: 'Ferramentas Manuais', brand: 'Stanley', dimensions: '60cm comprimento - 3 bolhas', description: 'Nível de alumínio com 3 bolhas (horizontal, vertical e 45°). Base magnética. Precisão de 0,5mm/m.', price: 45.0, stock: 140, active: true, image: '/products/martelo.jpg' },

  // ─── Louças e Metais ─────────────────────────────────────
  { id: 'p-lou-1', name: 'Sifão Sanfonado Universal', category: 'Louças e Metais', subcategory: 'Acessórios', brand: 'Astra', dimensions: '1.1/2" x 1.1/4" - Extensível 40-80cm', description: 'Sifão flexível universal em polipropileno. Conexão para lavatório e tanque. Extensível e f��cil instalação.', price: 14.5, stock: 300, active: true, image: '/products/tubo-pvc.jpg' },
  { id: 'p-lou-2', name: 'Chuveiro Eletrônico 220V', category: 'Louças e Metais', subcategory: 'Chuveiros', brand: 'Lorenzetti', dimensions: '220V - 7500W - 4 temperaturas', description: 'Chuveiro elétrico com controle eletrônico de temperatura. Resistência blindada. Design moderno cromado.', price: 120.0, stock: 90, active: true, image: '/products/chuveiro.jpg' },
  { id: 'p-lou-3', name: 'Vaso Sanitário Branco', category: 'Louças e Metais', subcategory: 'Louças', brand: 'Deca', dimensions: 'Convencional - 38x52x39cm - 6L descarga', description: 'Vaso sanitário de louça com caixa acoplada. Sistema dual flush 3/6L. Fixação ao piso inclusa.', price: 180.0, stock: 70, active: true, image: '/products/vaso-sanitario.jpg' },
  { id: 'p-lou-4', name: 'Torneira Cozinha Bica Alta', category: 'Louças e Metais', subcategory: 'Torneiras', brand: 'Docol', dimensions: 'Bica 24cm - Bancada - Cromada', description: 'Torneira de cozinha com bica alta móvel. Acabamento cromado. Arejador antivandalismo. Fácil limpeza.', price: 95.0, stock: 110, active: true, image: '/products/torneira.jpg' },
  { id: 'p-lou-5', name: 'Pia Inox 60cm Cuba Simples', category: 'Louças e Metais', subcategory: 'Pias', brand: 'Tramontina', dimensions: '60x50cm - Cuba 40x34x14cm', description: 'Pia de cozinha em aço inox AISI 304. Cuba funda com válvula. Acabamento acetinado anti-manchas.', price: 220.0, stock: 50, active: true, image: '/products/pia-inox.jpg' },

  // ─── Móveis, Cozinha e Banheiro ──────────────────────────
  { id: 'p-mov-1', name: 'Gabinete Banheiro 60cm', category: 'Móveis, Cozinha e Banheiro', brand: 'Cozimax', dimensions: '60x44x80cm - MDF 15mm - 2 portas', description: 'Gabinete para banheiro em MDF com acabamento UV. Espaço para pia de semi-encaixe. Pés ajustáveis.', price: 389.0, stock: 30, active: true, image: '/products/madeira-caibro.jpg' },
  { id: 'p-mov-2', name: 'Armário Cozinha 4 Portas', category: 'Móveis, Cozinha e Banheiro', brand: 'Bertolini', dimensions: '120x31x70cm - MDF 15mm - 2 prateleiras', description: 'Armário aéreo para cozinha em MDF. 4 portas com dobradiças metálicas. Acabamento branco brilhante.', price: 689.0, stock: 22, active: true, image: '/products/madeira-caibro.jpg' },

  // ─── Revestimentos e Porcelanatos ────────────────────────
  { id: 'p-rev-1', name: 'Espaçador Cruzeta 3mm pct100', category: 'Revestimentos e Porcelanatos', subcategory: 'Acessórios e Ferramentas para Assentamentos', brand: 'Cortag', dimensions: '3mm - Pacote 100 unidades', description: 'Espaçador plástico tipo cruzeta. Para juntas uniformes em pisos e paredes. Reutilizável e resistente.', price: 18.0, stock: 320, active: true, image: '/products/rejunte.jpg' },
  { id: 'p-rev-2', name: 'Rejunte Acrílico 1kg', category: 'Revestimentos e Porcelanatos', subcategory: 'Rejunte', brand: 'Quartzolit', dimensions: '1kg - Rende 1-3m² dependendo da junta', description: 'Rejunte flexível acrílico antifungos. Para áreas internas e externas. Várias cores disponíveis.', price: 14.9, stock: 280, active: true, image: '/products/rejunte.jpg' },
  { id: 'p-rev-3', name: 'Porcelanato Polido 60x60 cx', category: 'Revestimentos e Porcelanatos', subcategory: 'Porcelanatos', brand: 'Portinari', dimensions: '60x60cm - Caixa 1.44m² (4 peças) - 10mm espessura', description: 'Porcelanato retificado polido brilhante. PEI 4 para alto tráfego. Acabamento sofisticado tipo mármore.', price: 89.9, stock: 200, active: true, image: '/products/porcelanato.jpg' },

  // ─── Pintura ─────────────────────────────────────────────
  { id: 'p-pin-1', name: 'Cola PVA 1kg', category: 'Pintura', subcategory: 'Adesivos', brand: 'Cascorez', dimensions: '1kg - Embalagem plástica', description: 'Cola branca PVA para uso geral. Ideal para madeira, papel e artesanato. Secagem transparente.', price: 22.0, stock: 200, active: true, image: '/products/tinta-acrilica.jpg' },
  { id: 'p-pin-2', name: 'Removedor de Cimento 1L', category: 'Pintura', subcategory: 'Limpeza Pós Obra', brand: 'W&W', dimensions: '1 litro - Frasco spray', description: 'Removedor de resíduos de cimento, argamassa e rejunte. Não agride pisos cerâmicos. Biodegradável.', price: 28.0, stock: 180, active: true, image: '/products/impermeabilizante.jpg' },
  { id: 'p-pin-3', name: 'Lixa Massa 120 Folha', category: 'Pintura', subcategory: 'Lixas e Acessórios', brand: 'Norton', dimensions: '225x275mm - Grão 120 - Uso manual', description: 'Lixa d\'água para massa corrida e preparação de superfícies. Granulometria média para acabamento.', price: 2.5, stock: 1200, active: true, image: '/products/areia-fina.jpg' },
  { id: 'p-pin-4', name: 'Massa Corrida PVA 20kg', category: 'Pintura', subcategory: 'Massas, Fundos e Resinas', brand: 'Suvinil', dimensions: '20kg - Lata 30x30x25cm', description: 'Massa para correção de imperfeições em paredes internas. Fácil lixamento. Prepara para pintura.', price: 42.0, stock: 240, active: true, image: '/products/tinta-acrilica.jpg' },
  { id: 'p-pin-5', name: 'Rolo de Lã 23cm', category: 'Pintura', subcategory: 'Pincéis, Trinchas, Rolos e Ferramentas', brand: 'Atlas', dimensions: '23cm largura - Pelo 12mm - Com suporte', description: 'Rolo de lã de carneiro para pintura. Alta absorção e acabamento uniforme. Para tintas látex e acrílicas.', price: 18.0, stock: 320, active: true, image: '/products/rolo-pintura.jpg' },
  { id: 'p-pin-6', name: 'Tinta Acrílica Premium Branco 18L', category: 'Pintura', subcategory: 'Tintas, Vernizes e Esmaltes', brand: 'Suvinil', dimensions: '18 litros - Rende 260m²/demão', description: 'Tinta acrílica premium branco neve fosco. Lavável e resistente. Para paredes internas e externas.', price: 85.0, stock: 200, active: true, image: '/products/tinta-acrilica.jpg' },
  { id: 'p-pin-7', name: 'Tinta Acrílica Cores 18L', category: 'Pintura', subcategory: 'Tintas, Vernizes e Esmaltes', brand: 'Coral', dimensions: '18 litros - Rende 220m²/demão', description: 'Tinta acrílica em diversas cores do catálogo. Alto rendimento e cobertura. Acabamento acetinado.', price: 95.0, stock: 180, active: true, image: '/products/tinta-acrilica.jpg' },
]

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: INITIAL_PRODUCTS,
      isLoading: false,
      lastSynced: null,

      // Carregar produtos do Supabase
      loadFromSupabase: async () => {
        set({ isLoading: true })
        try {
          const res = await fetch('/api/products')
          const data = await res.json()
          if (data.products && data.products.length > 0) {
            set({ 
              products: data.products.map((p: any) => ({
                id: p.id,
                name: p.name,
                category: p.category,
                subcategory: p.subcategory || undefined,
                brand: p.brand || undefined,
                dimensions: p.dimensions || undefined,
                price: Number(p.price) || 0,
                stock: p.stock || 0,
                description: p.description || undefined,
                image: p.image || undefined,
                active: p.active !== false,
              })),
              lastSynced: new Date().toISOString(),
            })
          }
        } catch (error) {
          console.error('Erro ao carregar produtos do Supabase:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      // Salvar todos os produtos no Supabase
      saveToSupabase: async () => {
        const { products } = get()
        try {
          const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products }),
          })
          const data = await res.json()
          if (data.success) {
            set({ lastSynced: new Date().toISOString() })
          }
          return { success: !!data.success, error: data.error }
        } catch (error) {
          console.error('Erro ao salvar produtos no Supabase:', error)
          return { error: 'Falha ao salvar' }
        }
      },

      addProduct: (product) => {
        const newProduct = {
          ...product,
          id: `p-${Date.now()}`,
        }
        set((state) => ({
          products: [...state.products, newProduct],
        }))
        // Salvar automaticamente no Supabase
        fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: [newProduct] }),
        }).catch(console.error)
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? { ...product, ...updates } : product,
          ),
        }))
        // Atualizar automaticamente no Supabase
        const product = get().products.find((p) => p.id === id)
        if (product) {
          fetch('/api/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...product, ...updates, id }),
          }).catch(console.error)
        }
      },

      removeProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        }))
        // Deletar do Supabase
        fetch(`/api/products?id=${id}`, {
          method: 'DELETE',
        }).catch(console.error)
      },

      toggleActive: (id) => {
        const product = get().products.find((p) => p.id === id)
        if (product) {
          const newActive = !product.active
          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? { ...p, active: newActive } : p,
            ),
          }))
          // Atualizar no Supabase
          fetch('/api/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, active: newActive }),
          }).catch(console.error)
        }
      },

      resetToSeed: () => set({ products: INITIAL_PRODUCTS }),
    }),
    {
      name: 'alfaconstrucao-products',
      version: 7,
      // Quando a versão muda, limpa os produtos antigos do localStorage
      migrate: (persistedState: unknown) => {
        return { products: [], isLoading: false, lastSynced: null }
      },
    },
  ),
)
