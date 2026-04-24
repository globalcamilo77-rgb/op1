import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface StoreProduct {
  id: string
  name: string
  category: string
  subcategory?: string
  price: number
  stock: number
  description?: string
  image?: string
  active: boolean
}

interface ProductsState {
  products: StoreProduct[]
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
  { id: 'p-cim-1', name: 'Cimento Portland CP-32 50kg', category: 'Cimento', price: 32.5, stock: 1000, active: true, image: IMG.cement },
  { id: 'p-cim-2', name: 'Cimento Portland CP-40 50kg', category: 'Cimento', price: 35.8, stock: 800, active: true, image: IMG.cement },
  { id: 'p-cim-3', name: 'Cimento Branco 50kg', category: 'Cimento', price: 42.0, stock: 300, active: true, image: IMG.cement },
  { id: 'p-cim-4', name: 'Cimento de Alvenaria 50kg', category: 'Cimento', price: 28.9, stock: 650, active: true, image: IMG.cement },

  // ─── Argamassas ──────────────────────────────────────────
  { id: 'p-arg-1', name: 'Argamassa Colante AC-I 20kg', category: 'Argamassas', subcategory: 'Argamassas Colantes', price: 28.0, stock: 500, active: true, image: IMG.cement },
  { id: 'p-arg-2', name: 'Argamassa Colante AC-II 20kg', category: 'Argamassas', subcategory: 'Argamassas Colantes', price: 31.5, stock: 450, active: true, image: IMG.cement },
  { id: 'p-arg-3', name: 'Argamassa de Construção 20kg', category: 'Argamassas', subcategory: 'Argamassas para Construção', price: 24.9, stock: 400, active: true, image: IMG.cement },
  { id: 'p-arg-4', name: 'Argamassa de Emboço 20kg', category: 'Argamassas', subcategory: 'Argamassas para Construção', price: 26.5, stock: 380, active: true, image: IMG.cement },

  // ─── Rejuntes ────────────────────────────────────────────
  { id: 'p-rej-1', name: 'Rejunte Cerâmico 1kg', category: 'Rejuntes', subcategory: 'Rejuntes Cerâmicos', price: 12.5, stock: 600, active: true, image: IMG.tile },
  { id: 'p-rej-2', name: 'Rejunte Porcelanato Premium 1kg', category: 'Rejuntes', subcategory: 'Rejuntes Porcelanatos', price: 18.9, stock: 500, active: true, image: IMG.tile },

  // ─── Areia, Pedra, Cal e Gesso ───────────────────────────
  { id: 'p-aren-1', name: 'Areia Fina Seca 1000kg', category: 'Areia, Pedra, Cal e Gesso', subcategory: 'Areia', price: 45.0, stock: 200, active: true, image: IMG.sandFine },
  { id: 'p-aren-2', name: 'Areia Grossa 1000kg', category: 'Areia, Pedra, Cal e Gesso', subcategory: 'Areia', price: 42.5, stock: 200, active: true, image: IMG.gravel },
  { id: 'p-aren-3', name: 'Pedra Brita #0 1000kg', category: 'Areia, Pedra, Cal e Gesso', subcategory: 'Pedra', price: 55.0, stock: 150, active: true, image: IMG.gravel },
  { id: 'p-aren-4', name: 'Pedra Brita #1 1000kg', category: 'Areia, Pedra, Cal e Gesso', subcategory: 'Pedra', price: 50.0, stock: 150, active: true, image: IMG.gravel },
  { id: 'p-aren-5', name: 'Cal Hidratada 20kg', category: 'Areia, Pedra, Cal e Gesso', subcategory: 'Cal e Gesso', price: 18.9, stock: 250, active: true, image: IMG.cement },
  { id: 'p-aren-6', name: 'Gesso em Pó 40kg', category: 'Areia, Pedra, Cal e Gesso', subcategory: 'Cal e Gesso', price: 26.5, stock: 200, active: true, image: IMG.cement },

  // ─── Aço para Construção ─────────────────────────────────
  { id: 'p-aco-1', name: 'Vergalhão 5mm x 12m', category: 'Aço para Construção', subcategory: 'Vergalhão', price: 18.5, stock: 400, active: true, image: IMG.rebar },
  { id: 'p-aco-2', name: 'Vergalhão 8mm x 12m', category: 'Aço para Construção', subcategory: 'Vergalhão', price: 42.0, stock: 350, active: true, image: IMG.rebar },
  { id: 'p-aco-3', name: 'Vergalhão 10mm x 12m', category: 'Aço para Construção', subcategory: 'Vergalhão', price: 65.5, stock: 300, active: true, image: IMG.rebar },
  { id: 'p-aco-4', name: 'Coluna Pronta 4 ferros 8mm 12m', category: 'Aço para Construção', subcategory: 'Colunas e Sapatas', price: 145.0, stock: 80, active: true, image: IMG.rebar },
  { id: 'p-aco-5', name: 'Arame Recozido 18 BWG 1kg', category: 'Aço para Construção', subcategory: 'Arames', price: 14.9, stock: 250, active: true, image: IMG.cable },
  { id: 'p-aco-6', name: 'Malha de Aço 15x15', category: 'Aço para Construção', subcategory: 'Malha', price: 75.0, stock: 120, active: true, image: IMG.rebar },
  { id: 'p-aco-7', name: 'Treliça TG-12 12m', category: 'Aço para Construção', subcategory: 'Treliças', price: 95.0, stock: 100, active: true, image: IMG.rebar },
  { id: 'p-aco-8', name: 'Pregos 17x21 1kg', category: 'Aço para Construção', subcategory: 'Pregos', price: 12.0, stock: 500, active: true, image: IMG.screwdr },

  // ─── Tijolos e Blocos ────────────────────────────────────
  { id: 'p-tij-1', name: 'Tijolo Cerâmico 6 Furos (unid)', category: 'Tijolos e Blocos', subcategory: 'Tijolo Cerâmico', price: 1.2, stock: 20000, active: true, image: IMG.brick },
  { id: 'p-tij-2', name: 'Tijolo Cerâmico 8 Furos (unid)', category: 'Tijolos e Blocos', subcategory: 'Tijolo Cerâmico', price: 1.5, stock: 18000, active: true, image: IMG.brickWall },
  { id: 'p-tij-3', name: 'Bloco de Concreto 14x19x39 (unid)', category: 'Tijolos e Blocos', subcategory: 'Blocos de Concreto', price: 2.8, stock: 12000, active: true, image: IMG.concrete },
  { id: 'p-tij-4', name: 'Bloco de Concreto 19x19x39 (unid)', category: 'Tijolos e Blocos', subcategory: 'Blocos de Concreto', price: 3.5, stock: 10000, active: true, image: IMG.concrete },

  // ─── Impermeabilizantes ──────────────────────────────────
  { id: 'p-imp-1', name: 'Impermeabilizante Acrílico 18L', category: 'Impermeabilizantes', price: 189.0, stock: 80, active: true, image: IMG.paint },
  { id: 'p-imp-2', name: 'Manta Asfáltica 4mm 10m2', category: 'Impermeabilizantes', price: 320.0, stock: 60, active: true, image: IMG.roof },

  // ─── Telhas ──────────────────────────────────────────────
  { id: 'p-tel-1', name: 'Telha de Fibrocimento 6mm', category: 'Telhas', subcategory: 'Telha de Fibrocimento', price: 42.5, stock: 220, active: true, image: IMG.roof },
  { id: 'p-tel-2', name: 'Telha de Fibrocimento 8mm', category: 'Telhas', subcategory: 'Telha de Fibrocimento', price: 55.0, stock: 180, active: true, image: IMG.roof },

  // ─── Lajes ───────────────────────────────────────────────
  { id: 'p-laj-1', name: 'Laje Pré-Moldada H8 (m2)', category: 'Lajes', price: 75.0, stock: 200, active: true, image: IMG.concrete },
  { id: 'p-laj-2', name: 'Laje Treliçada H12 (m2)', category: 'Lajes', price: 95.0, stock: 150, active: true, image: IMG.rebar },

  // ─── Materiais Hidráulicos ───────────────────────────────
  { id: 'p-hid-1', name: 'Caixa d\'água 500L', category: 'Materiais Hidráulicos', subcategory: 'Caixas d\'água', price: 180.0, stock: 60, active: true, image: IMG.pipe },
  { id: 'p-hid-2', name: 'Caixa d\'água 1000L', category: 'Materiais Hidráulicos', subcategory: 'Caixas d\'água', price: 280.0, stock: 50, active: true, image: IMG.pipe },
  { id: 'p-hid-3', name: 'Tubo PVC 50mm 6 metros', category: 'Materiais Hidráulicos', subcategory: 'Tubos e Conexões', price: 45.0, stock: 200, active: true, image: IMG.pipe },
  { id: 'p-hid-4', name: 'Tubo PVC 100mm 6 metros', category: 'Materiais Hidráulicos', subcategory: 'Tubos e Conexões', price: 85.0, stock: 150, active: true, image: IMG.pipe },
  { id: 'p-hid-5', name: 'Caixa de Drenagem 30x30', category: 'Materiais Hidráulicos', subcategory: 'Drenagem', price: 65.0, stock: 80, active: true, image: IMG.pipe },
  { id: 'p-hid-6', name: 'Registro Esfera 1/2"', category: 'Materiais Hidráulicos', subcategory: 'Registros e Bases', price: 38.0, stock: 220, active: true, image: IMG.faucet },
  { id: 'p-hid-7', name: 'Cloro Líquido 5L', category: 'Materiais Hidráulicos', subcategory: 'Tratamento', price: 42.0, stock: 120, active: true, image: IMG.paint },

  // ─── Materiais Elétricos ─────────────────────────────────
  { id: 'p-ele-1', name: 'Plug Macho 10A', category: 'Materiais Elétricos', subcategory: 'Acessórios para Fios e Extensões', price: 8.5, stock: 400, active: true, image: IMG.cable },
  { id: 'p-ele-2', name: 'Fio de Cobre 1.5mm Rolo 100m', category: 'Materiais Elétricos', subcategory: 'Fios e Cabos', price: 85.0, stock: 100, active: true, image: IMG.cable },
  { id: 'p-ele-3', name: 'Fio de Cobre 2.5mm Rolo 100m', category: 'Materiais Elétricos', subcategory: 'Fios e Cabos', price: 145.0, stock: 80, active: true, image: IMG.cable },
  { id: 'p-ele-4', name: 'Disjuntor Monofásico 25A', category: 'Materiais Elétricos', subcategory: 'Disjuntores', price: 35.0, stock: 200, active: true, image: IMG.cable },
  { id: 'p-ele-5', name: 'Quadro de Distribuição 8 Disjuntores', category: 'Materiais Elétricos', subcategory: 'Quadros e Caixas', price: 145.0, stock: 70, active: true, image: IMG.cable },
  { id: 'p-ele-6', name: 'Interruptor Simples 10A', category: 'Materiais Elétricos', subcategory: 'Interruptores e Tomadas', price: 12.5, stock: 300, active: true, image: IMG.cable },
  { id: 'p-ele-7', name: 'Tomada Dupla 10A', category: 'Materiais Elétricos', subcategory: 'Interruptores e Tomadas', price: 18.0, stock: 280, active: true, image: IMG.cable },
  { id: 'p-ele-8', name: 'Fechadura Eletrônica Biométrica', category: 'Materiais Elétricos', subcategory: 'Controladores de Acesso', price: 489.0, stock: 25, active: true, image: IMG.padlock },
  { id: 'p-ele-9', name: 'Eletroduto Corrugado 25mm 50m', category: 'Materiais Elétricos', subcategory: 'Tubos e Eletrodutos', price: 95.0, stock: 90, active: true, image: IMG.pipe },

  // ─── Lonas ───────────────────────────────────────────────
  { id: 'p-lon-1', name: 'Lona Plástica Preta 4x100m', category: 'Lonas', price: 320.0, stock: 50, active: true, image: IMG.roof },
  { id: 'p-lon-2', name: 'Lona de Polietileno 6x10m', category: 'Lonas', price: 145.0, stock: 80, active: true, image: IMG.roof },

  // ─── Madeira para Construção ─────────────────────────────
  { id: 'p-mad-1', name: 'Caibro Pinus 5x6cm 3m', category: 'Madeira para Construção', price: 22.0, stock: 250, active: true, image: IMG.wood },
  { id: 'p-mad-2', name: 'Sarrafo Pinus 2.5x10cm 3m', category: 'Madeira para Construção', price: 14.0, stock: 320, active: true, image: IMG.wood },
  { id: 'p-mad-3', name: 'Tábua Pinus 2.5x30cm 3m', category: 'Madeira para Construção', price: 65.0, stock: 150, active: true, image: IMG.wood },

  // ─── Ferragens ───────────────────────────────────────────
  { id: 'p-fer-1', name: 'Parafuso Sextavado 8mm x 30mm', category: 'Ferragens', subcategory: 'Parafusos, Buchas e Fixação', price: 2.5, stock: 1500, active: true, image: IMG.screwdr },
  { id: 'p-fer-2', name: 'Parafuso Rosca Soberba 3.5x30 (cx 100un)', category: 'Ferragens', subcategory: 'Parafusos, Buchas e Fixação', price: 15.0, stock: 400, active: true, image: IMG.screwdr },
  { id: 'p-fer-3', name: 'Bucha Plástica #6 (pacote 100un)', category: 'Ferragens', subcategory: 'Parafusos, Buchas e Fixação', price: 8.0, stock: 600, active: true, image: IMG.screwdr },
  { id: 'p-fer-4', name: 'Cadeado 40mm Reforçado', category: 'Ferragens', subcategory: 'Proteção e Segurança', price: 32.0, stock: 220, active: true, image: IMG.padlock },
  { id: 'p-fer-5', name: 'Fechadura Cilindro 50mm', category: 'Ferragens', subcategory: 'Fechaduras e Acessórios', price: 42.0, stock: 180, active: true, image: IMG.padlock },
  { id: 'p-fer-6', name: 'Escada de Alumínio 6 degraus', category: 'Ferragens', subcategory: 'Escadas', price: 245.0, stock: 60, active: true, image: IMG.ladder },

  // ─── Ferramentas ─────────────────────────────────────────
  { id: 'p-fra-1', name: 'Maleta de Bits 32 peças', category: 'Ferramentas', subcategory: 'Acessórios e Peças de Reposição', price: 89.0, stock: 90, active: true, image: IMG.screwdr },
  { id: 'p-fra-2', name: 'Compressor de Ar 25L 2HP', category: 'Ferramentas', subcategory: 'Compressores e Ferramentas Industriais', price: 1290.0, stock: 18, active: true, image: IMG.drill },
  { id: 'p-fra-3', name: 'Furadeira de Impacto 650W', category: 'Ferramentas', subcategory: 'Ferramentas Elétricas', price: 289.0, stock: 60, active: true, image: IMG.drill },
  { id: 'p-fra-4', name: 'Capacete de Segurança Branco', category: 'Ferramentas', subcategory: 'EPI (Equipamentos de Proteção Individual)', price: 28.0, stock: 200, active: true, image: IMG.helmet },
  { id: 'p-fra-5', name: 'Martelo de Ouro 600g', category: 'Ferramentas', subcategory: 'Ferramentas Manuais', price: 35.0, stock: 180, active: true, image: IMG.hammer },
  { id: 'p-fra-6', name: 'Chave de Fenda #2', category: 'Ferramentas', subcategory: 'Ferramentas Manuais', price: 8.5, stock: 320, active: true, image: IMG.screwdr },
  { id: 'p-fra-7', name: 'Alicate Universal 7"', category: 'Ferramentas', subcategory: 'Ferramentas Manuais', price: 25.0, stock: 220, active: true, image: IMG.hammer },
  { id: 'p-fra-8', name: 'Nível de Bolha 60cm', category: 'Ferramentas', subcategory: 'Ferramentas Manuais', price: 45.0, stock: 140, active: true, image: IMG.screwdr },

  // ─── Louças e Metais ─────────────────────────────────────
  { id: 'p-lou-1', name: 'Sifão Sanfonado Universal', category: 'Louças e Metais', subcategory: 'Acessórios', price: 14.5, stock: 300, active: true, image: IMG.pipe },
  { id: 'p-lou-2', name: 'Chuveiro Eletrônico 220V', category: 'Louças e Metais', subcategory: 'Chuveiros', price: 120.0, stock: 90, active: true, image: IMG.shower },
  { id: 'p-lou-3', name: 'Vaso Sanitário Branco', category: 'Louças e Metais', subcategory: 'Louças', price: 180.0, stock: 70, active: true, image: IMG.toilet },
  { id: 'p-lou-4', name: 'Torneira de Cozinha Cromada', category: 'Louças e Metais', subcategory: 'Torneiras', price: 95.0, stock: 110, active: true, image: IMG.faucet },
  { id: 'p-lou-5', name: 'Pia de Cozinha Inox 60cm', category: 'Louças e Metais', subcategory: 'Pias', price: 220.0, stock: 50, active: true, image: IMG.sink },

  // ─── Móveis, Cozinha e Banheiro ──────────────────────────
  { id: 'p-mov-1', name: 'Gabinete para Banheiro 60cm', category: 'Móveis, Cozinha e Banheiro', price: 389.0, stock: 30, active: true, image: IMG.wood },
  { id: 'p-mov-2', name: 'Armário de Cozinha 4 Portas', category: 'Móveis, Cozinha e Banheiro', price: 689.0, stock: 22, active: true, image: IMG.wood },

  // ─── Revestimentos e Porcelanatos ────────────────────────
  { id: 'p-rev-1', name: 'Espaçador Cruzeta 3mm (saco 100un)', category: 'Revestimentos e Porcelanatos', subcategory: 'Acessórios e Ferramentas para Assentamentos', price: 18.0, stock: 320, active: true, image: IMG.tile },
  { id: 'p-rev-2', name: 'Rejunte Acrílico 1kg', category: 'Revestimentos e Porcelanatos', subcategory: 'Rejunte', price: 14.9, stock: 280, active: true, image: IMG.tile },
  { id: 'p-rev-3', name: 'Porcelanato Polido 60x60 cx 1.44m2', category: 'Revestimentos e Porcelanatos', subcategory: 'Porcelanatos', price: 89.9, stock: 200, active: true, image: IMG.tile },

  // ─── Pintura ─────────────────────────────────────────────
  { id: 'p-pin-1', name: 'Adesivo PVA 1kg', category: 'Pintura', subcategory: 'Adesivos', price: 22.0, stock: 200, active: true, image: IMG.paint },
  { id: 'p-pin-2', name: 'Removedor de Cimento 1L', category: 'Pintura', subcategory: 'Limpeza Pós Obra', price: 28.0, stock: 180, active: true, image: IMG.paint },
  { id: 'p-pin-3', name: 'Lixa 120 Folha', category: 'Pintura', subcategory: 'Lixas e Acessórios', price: 2.5, stock: 1200, active: true, image: IMG.concrete },
  { id: 'p-pin-4', name: 'Massa PVA 20kg', category: 'Pintura', subcategory: 'Massas, Fundos e Resinas', price: 42.0, stock: 240, active: true, image: IMG.cement },
  { id: 'p-pin-5', name: 'Rolo de Espuma 23cm', category: 'Pintura', subcategory: 'Pincéis, Trinchas, Rolos e Ferramentas', price: 18.0, stock: 320, active: true, image: IMG.roller },
  { id: 'p-pin-6', name: 'Tinta Acrílica Branca 18L', category: 'Pintura', subcategory: 'Tintas, Vernizes e Esmaltes', price: 85.0, stock: 200, active: true, image: IMG.paint },
  { id: 'p-pin-7', name: 'Tinta Acrílica Colorida 18L', category: 'Pintura', subcategory: 'Tintas, Vernizes e Esmaltes', price: 95.0, stock: 180, active: true, image: IMG.paint },
]

export const useProductsStore = create<ProductsState>()(
  persist(
    (set) => ({
      products: INITIAL_PRODUCTS,

      addProduct: (product) =>
        set((state) => ({
          products: [
            ...state.products,
            {
              ...product,
              id: `p-${Date.now()}`,
            },
          ],
        })),

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? { ...product, ...updates } : product,
          ),
        })),

      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        })),

      toggleActive: (id) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? { ...product, active: !product.active } : product,
          ),
        })),

      resetToSeed: () => set({ products: INITIAL_PRODUCTS }),
    }),
    {
      name: 'alfaconstrucao-products',
      version: 3,
    },
  ),
)
