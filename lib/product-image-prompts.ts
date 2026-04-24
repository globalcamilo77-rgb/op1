/**
 * Prompts de IA para geração de imagens dos produtos.
 * Use esses prompts no Midjourney, DALL-E, Stable Diffusion ou similar.
 * Após gerar a imagem, cole a URL no painel /admin/imagens.
 */
export const PRODUCT_IMAGE_PROMPTS: Record<string, string> = {
  // ─── Cimento ───────────────────────────────────────────────
  'p-cim-1': `Professional product photography of a 50kg cement bag (Cimento Portland CP-32).
White and blue cement sack with large "32" number, standing upright on white background.
Clean, bright lighting, high definition, commercial photography style.
Shows texture of paper bag, product branding clearly visible.
Image size: 1000x1000px, PNG format, white background, professional shadows.`,

  'p-cim-2': `Professional product photo of CP-40 Portland cement 50kg bag.
White paper sack with "40" marking, standing on white isolated background.
Bright professional studio lighting, high resolution 1000x1000px.
Construction material photography style, realistic texture, sharp focus.
Commercial e-commerce quality image with subtle shadow for depth.`,

  'p-cim-3': `Product photography of white cement 50kg bag (Cimento Branco).
Pure white paper bag against white background with subtle shadows.
Professional lighting setup, 1000x1000px, high definition photo.
Shows pristine white color and paper texture clearly.
Construction materials e-commerce style photography.`,

  'p-cim-4': `Professional image of masonry cement 50kg bag.
Gray paper sack with "Alvenaria" text visible on white background.
Studio lighting, high quality 1000x1000px photo.
Clear product branding, realistic shadows, construction material style.
Ready for e-commerce website product listing.`,

  // ─── Tijolos e Blocos ──────────────────────────────────────
  'p-tij-1': `Close-up professional photo of a terracotta ceramic brick (Tijolo 6 furos).
Red-orange clay brick showing 6 holes clearly on white background.
Macro photography, high definition 1000x1000px, sharp focus on hole details.
Natural clay texture visible, professional lighting, construction material photo.
Single brick standing at slight angle to show dimension and holes clearly.`,

  'p-tij-2': `Professional product photo of 8-hole ceramic brick (Tijolo 8 furos).
Red clay brick with 8 holes visible on white isolated background.
High quality macro photography, 1000x1000px resolution, sharp details.
Shows texture of clay and hole pattern clearly.
Lighting creates subtle shadows for depth perception.
Construction material e-commerce photography.`,

  'p-tij-3': `Product photography of concrete block 14x19x39cm (Bloco de Concreto).
Gray concrete block on white background, showing rectangular shape clearly.
Professional studio lighting, 1000x1000px high definition.
Shows texture of concrete and dimensions clearly.
Front view angle with subtle shadows for three-dimensional appearance.
Construction materials catalog photo style.`,

  'p-tij-4': `Professional image of large concrete block 19x19x39cm.
Gray structural concrete block on white background.
Studio photography, 1000x1000px, high quality.
Clear view of block structure and material texture.
Isometric angle showing depth, professional shadows.
Building materials e-commerce product photo.`,

  // ─── Areia, Pedra, Cal e Gesso ─────────────────────────────
  'p-aren-1': `Product photo of fine dry sand (Areia Fina) in bulk bag.
Large white plastic 1000kg sack filled with fine golden-beige sand.
Shows sand texture, white background, bright professional lighting.
1000x1000px high definition, e-commerce style.
Bag filled and sealed, clear product branding visible.
Construction materials photography.`,

  'p-aren-2': `Product photograph of coarse sand (Areia Grossa) 1000kg bag.
White plastic sack filled with coarser granulated sand, golden brown color.
White isolated background, professional studio lighting, 1000x1000px.
Shows texture and grain size, product ready for construction.
E-commerce quality, clear and sharp image.`,

  'p-aren-3': `Professional product photo of crushed stone gravel brita #0 (1000kg bag).
White plastic sack filled with small crushed gray stones and pebbles.
White background, high definition 1000x1000px photo.
Shows stone texture and size clearly, professional lighting.
Construction material bulk product photography style.`,

  'p-aren-4': `Product photography of larger gravel brita #1 (1000kg).
White plastic bag filled with larger crushed stones (brita #1).
White isolated background, professional studio lighting, 1000x1000px.
Shows gray stone texture and larger size compared to #0.
Sharp focus, e-commerce construction materials photo.`,

  // ─── Aço para Construção ───────────────────────────────────
  'p-aco-1': `Professional product photo of steel rebar 5mm diameter 12 meters long.
Coiled or straight rebar on white background showing size.
High definition 1000x1000px, metal texture clear and sharp.
Shows ribbed surface of rebar for grip.
Professional construction materials photography, bright lighting.
Gray steel metal, realistic shadows.`,

  'p-aco-2': `Product image of steel rebar 8mm diameter 12m long.
Thicker rebar coil or lengths on white background.
1000x1000px professional photo, shows metal ribbed texture clearly.
Construction steel reinforcement product photography.
Bright studio lighting, realistic metal appearance.
High quality e-commerce image.`,

  'p-aco-3': `Professional photograph of thicker steel rebar 10mm diameter 12 meters.
Largest rebar diameter shown on white isolated background.
High definition 1000x1000px, metal texture visible.
Shows ribbed surface detail for concrete reinforcement.
Professional construction materials photo, studio lighting.
Gray steel metal appearance, sharp focus.`,

  'p-aco-6': `Product photo of steel mesh/welded wire fabric 15x15cm pattern.
Square grid mesh shown flat on white background.
Shows grid pattern clearly, 1000x1000px high definition.
Metal texture visible, professional lighting.
Construction reinforcement material photography.
Gray steel color, e-commerce quality image.`,

  // ─── Argamassas ────────────────────────────────────────────
  'p-arg-1': `Product photography of tile adhesive mortar AC-I 20kg bag.
Gray paper sack with "AC-I" text clearly visible.
White background, 1000x1000px high definition.
Shows paper bag texture and product branding.
Professional studio lighting, construction materials style.
Ready for e-commerce product listing.`,

  'p-arg-2': `Professional image of improved tile adhesive AC-II 20kg bag.
Gray paper sack with "AC-II" marking on white isolated background.
High quality 1000x1000px photo, bright lighting.
Clear product branding and bag texture.
Construction material adhesive photography style.`,

  'p-arg-3': `Product photo of construction mortar 20kg bag (Argamassa de Construção).
Gray-beige paper sack on white background.
1000x1000px high definition, professional lighting.
Shows product name and specifications clearly.
Building materials photography, e-commerce style.`,

  'p-arg-4': `Professional photograph of finish mortar emboço 20kg bag.
Paper sack with "Emboço" text visible on white background.
Studio lighting, 1000x1000px high quality.
Bag texture and branding clearly visible.
Construction finishing materials photography.`,

  // ─── Materiais Hidráulicos ─────────────────────────────────
  'p-hid-1': `Product photography of 500L plastic water tank (Caixa d'água).
Blue or black plastic rectangular tank on white background.
Shows full tank dimensions, 1000x1000px high definition.
Professional lighting, clear product shape.
Plumbing fixtures e-commerce photography.
Shows lid/opening area if visible, realistic plastic material.`,

  'p-hid-2': `Professional image of larger 1000L water tank (Caixa d'água).
Blue or black plastic storage tank on white isolated background.
1000x1000px high quality photo, bright studio lighting.
Shows tank size and shape clearly.
Plumbing/water systems product photography.
Realistic plastic appearance, product branding visible.`,

  'p-hid-3': `Product photo of 50mm diameter PVC pipe 6 meters length.
White PVC pipe shown on white background (end view showing 50mm diameter).
Or horizontal showing length. 1000x1000px high definition.
Shows pipe texture and size clearly.
Plumbing materials photography, professional lighting.
E-commerce quality image.`,

  'p-hid-4': `Professional photograph of larger 100mm diameter PVC pipe 6m long.
White plastic pipe on white background showing larger diameter.
1000x1000px high quality, bright lighting.
Shows pipe size and material texture.
Plumbing and drainage materials photo style.
Clear product details visible.`,

  // ─── Materiais Elétricos ───────────────────────────────────
  'p-ele-2': `Product photography of copper electrical wire 1.5mm² with insulation.
Coiled wire or spooled on white background showing red/yellow insulation.
1000x1000px high definition, shows wire gauge clearly.
Professional lighting, electrical materials photo.
Shows insulation color and wire diameter.
E-commerce electrical supplies photography.`,

  'p-ele-3': `Professional image of thicker copper wire 2.5mm² with plastic coating.
Coiled or shown on spool with bright colored insulation on white background.
1000x1000px high quality photo.
Shows thicker wire gauge compared to 1.5mm.
Electrical construction materials photography.
Clear insulation color and size visible.`,

  'p-ele-4': `Product photo of single-pole circuit breaker 25A (Disjuntor).
Black or gray plastic electrical breaker on white background.
Shows switch, terminals, and branding clearly.
1000x1000px high definition, professional lighting.
Electrical fixtures e-commerce photography.
Shows mounting rails and details.`,

  'p-ele-6': `Professional photograph of simple light switch 10A white.
White plastic switch plate on white background.
Shows toggle switch mechanism clearly. 1000x1000px high quality.
Bright studio lighting, sharp focus.
Electrical fixtures and switches photography.
E-commerce quality residential electrical product.`,

  'p-ele-7': `Product image of dual electrical outlet 10A white.
White plastic outlet plate with two socket holes on white background.
1000x1000px high definition photo, professional lighting.
Shows outlet design and mounting points clearly.
Residential electrical fixtures photography.
Sharp focus on socket details.`,

  // ─── Ferramentas ───────────────────────────────────────────
  'p-fra-5': `Professional product photo of 600g claw hammer (Martelo).
Hammer with wooden handle and metal head on white background.
Shows both claw and flat surfaces. 1000x1000px high definition.
Professional tool photography, sharp lighting.
Shows wooden texture and metal details clearly.
E-commerce construction tools photography.`,

  'p-fra-6': `Product photograph of Phillips head screwdriver #2 size.
Metal screwdriver with plastic/rubber grip handle on white background.
Shows tip shape clearly, 1000x1000px high quality.
Professional lighting, sharp focus on tip.
Hand tools photography, e-commerce style.
Shows grip material and size clearly.`,

  'p-fra-7': `Professional image of 7-inch universal pliers (Alicate Universal).
Combination pliers with red/black handles on white background.
Shows cutting jaw and pivot point clearly.
1000x1000px high definition photo.
Professional tool photography with bright lighting.
Shows grip texture and metal details.
E-commerce quality construction tool image.`,

  'p-fra-8': `Product photo of 60cm spirit level with bubbles.
Long aluminum or plastic level showing three bubble vials on white background.
1000x1000px high quality, shows level display clearly.
Professional lighting, sharp focus on bubbles.
Construction tools photography.
Shows handle and measurement markings.
E-commerce tools and equipment image.`,

  // ─── Ferragens ─────────────────────────────────────────────
  'p-fer-1': `Close-up product photo of hexagonal head bolt 8mm x 30mm.
Metal screw shown front view on white background showing hex head clearly.
1000x1000px macro photography, high definition.
Shows thread pattern and metal finish.
Professional hardware product photography.
Bright lighting, sharp focus on details.`,

  'p-fer-2': `Product image of self-tapping screw 3.5x30mm (Rosca Soberba).
Single metal screw shown with threads visible on white background.
1000x1000px high quality macro photo.
Shows pointed tip and thread pattern clearly.
Hardware fasteners photography.
Professional lighting, detailed texture visible.`,

  'p-fer-3': `Professional photo of plastic wall plug/anchor #6 size.
Small plastic expansion plug shown on white background.
Shows cylindrical shape and threading clearly.
1000x1000px high definition, macro photography.
Hardware fasteners product image.
Bright lighting, plastic texture visible.`,

  'p-fer-5': `Product photograph of cylinder lock 50mm (Fechadura Cilindro).
Brass or chrome lock mechanism on white background.
Shows keyhole and lock body clearly. 1000x1000px high definition.
Professional hardware photography, bright lighting.
Shows metal finish and details.
E-commerce door locks and hardware image.`,

  // ─── Louças e Metais ───────────────────────────────────────
  'p-lou-2': `Product photography of electric shower head 220V (Chuveiro Eletrônico).
White plastic shower fixture on white background.
Shows showerhead design and mounting area.
1000x1000px high quality photo, professional lighting.
Bathroom fixtures e-commerce photography.
Shows water ports and heating element area.
Sharp focus, realistic plastic material.`,

  'p-lou-3': `Professional image of white porcelain toilet bowl.
Complete toilet shown from side angle on white background.
1000x1000px high definition, bright studio lighting.
Shows white ceramic finish, seat mounting area clearly.
Bathroom fixtures product photography.
Shows toilet design and proportions clearly.
E-commerce bathroom products image.`,

  'p-lou-4': `Product photo of chrome kitchen faucet/tap.
Shiny chrome single-handle faucet on white background.
Shows spout angle and handle design clearly.
1000x1000px high quality photo, professional lighting.
Bathroom/kitchen fixtures photography.
Reflects light showing chrome finish quality.
E-commerce plumbing products image.`,

  'p-lou-5': `Professional photograph of stainless steel kitchen sink 60cm wide.
Shiny inox sink with single basin on white background.
Shows sink shape, drain area, and mounting details.
1000x1000px high definition, bright lighting.
Kitchen equipment photography, e-commerce style.
Shows stainless steel finish and shine.`,

  // ─── Pintura ───────────────────────────────────────────────
  'p-pin-6': `Product photo of 18-liter white acrylic paint can (Tinta Acrílica Branca).
Large white metal paint bucket/container on white background.
Shows handle, lid, and product branding clearly.
1000x1000px high definition photo.
Professional paint product photography.
Shows paint can label and size clearly.
E-commerce paint supplies image.`,

  'p-pin-7': `Professional image of colored acrylic paint 18L can.
Large metal paint bucket with color-coded label on white background.
Shows paint color through bucket (could be light blue, yellow, etc.).
1000x1000px high quality, bright lighting.
Paint supplies e-commerce photography.
Shows product label and size clearly.
Professional product image.`,

  'p-pin-4': `Product photograph of PVA wall filler 20kg bag (Massa PVA).
White paper sack with product branding on white background.
Shows bag texture and specifications clearly.
1000x1000px high definition photo.
Construction finishing materials photography.
Professional lighting, e-commerce style.
Shows weight and product name clearly.`,

  'p-pin-3': `Product photo of sandpaper sheet grade 120 (Lixa 120).
Single rectangular sandpaper sheet on white background showing grit.
Shows gray-tan sanding surface clearly. 1000x1000px high quality.
Professional lighting showing texture.
Construction finishing materials photography.
Shows sheet size and grit marking.
E-commerce tool accessories image.`,

  // ─── Telhas ────────────────────────────────────────────────
  'p-tel-1': `Product photography of 6mm fiber cement tile/sheet.
Large corrugated roofing sheet on white background showing wave pattern.
Shows corrugations and gray-white color clearly.
1000x1000px high definition photo.
Roofing materials product photography.
Professional lighting shows texture clearly.
E-commerce building materials image. Shows dimensions.`,

  'p-tel-2': `Professional image of thicker 8mm fiber cement roofing tile.
Corrugated gray-white sheet on white background.
Shows wave pattern and material thickness clearly.
1000x1000px high quality photo, bright lighting.
Roofing construction materials photography.
Shows thickness compared to 6mm version.
E-commerce quality building materials image.`,
}

/** Returns the AI prompt for a product, or a generic template if not found. */
export function getImagePrompt(productId: string, productName: string, category: string): string {
  return (
    PRODUCT_IMAGE_PROMPTS[productId] ??
    `Professional product photography of ${productName} (${category}).
Isolated white background, studio lighting, high definition 1000x1000px.
E-commerce product photo style, sharp focus, realistic appearance.
Shows product details, texture, and dimensions clearly.
Commercial quality image with subtle shadow.`
  )
}
