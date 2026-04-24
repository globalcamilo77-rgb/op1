import { InfoHero } from '@/components/store/info-hero'

export const metadata = {
  title: 'Termos de Uso | AlfaConstrução',
  description: 'Leia os termos de uso da plataforma AlfaConstrução.',
}

const ultimaAtualizacao = 'Abril de 2026'

const sections = [
  {
    title: '1. Aceitacao',
    text: 'Ao acessar ou utilizar a plataforma AlfaConstrução, voce declara que leu, entendeu e concorda com estes Termos de Uso e com a Politica de Privacidade. Se nao concordar com qualquer item, por favor, nao utilize a plataforma.',
  },
  {
    title: '2. Natureza da plataforma',
    text: 'A AlfaConstrução atua como marketplace, intermediando a oferta de produtos de lojistas parceiros. A compra e efetivada diretamente com o lojista selecionado, responsavel pela entrega, garantia e emissao de nota fiscal.',
  },
  {
    title: '3. Cadastro e uso da conta',
    text: 'Para realizar compras voce pode precisar fornecer dados pessoais. Voce se compromete a informar dados verdadeiros e atualizados, e a manter a confidencialidade das credenciais de acesso. Voce e responsavel pelo uso da sua conta.',
  },
  {
    title: '4. Pedidos, pagamentos e impostos',
    text: 'Os pedidos estao sujeitos a confirmacao de pagamento e disponibilidade de estoque. Os tributos devidos sao recolhidos pelo lojista parceiro, que emite a nota fiscal correspondente.',
  },
  {
    title: '5. Entregas',
    text: 'Os prazos de entrega sao estimativas e podem variar por categoria, volume e localidade. Atrasos causados por eventos de forca maior, ausencia no endereco ou informacoes incorretas nao sao de responsabilidade da plataforma.',
  },
  {
    title: '6. Trocas e devolucoes',
    text: 'Siga a Politica de Trocas e Devolucoes (/trocas). Em conformidade com o CDC, produtos comprados a distancia podem ser devolvidos em ate 7 dias a contar do recebimento.',
  },
  {
    title: '7. Propriedade intelectual',
    text: 'Todas as marcas, logotipos, textos, imagens e layouts sao de propriedade da AlfaConstrução ou licenciados, sendo vedada a reproducao sem autorizacao expressa.',
  },
  {
    title: '8. Limitacao de responsabilidade',
    text: 'A AlfaConstrução nao se responsabiliza por danos indiretos decorrentes do uso da plataforma, como lucros cessantes ou perda de dados. Em caso de falha operacional de lojista, atuamos como mediadora junto ao parceiro.',
  },
  {
    title: '9. Alteracoes destes termos',
    text: 'Podemos atualizar estes Termos a qualquer momento para refletir melhorias do servico ou obrigacoes legais. As alteracoes passam a valer a partir da publicacao nesta pagina.',
  },
  {
    title: '10. Contato',
    text: 'Duvidas sobre estes Termos podem ser enviadas para contato@alfaconstrucao.com.br ou pelo WhatsApp informado no rodape.',
  },
]

export default function TermosPage() {
  return (
    <>
      <InfoHero
        eyebrow="Documento legal"
        title="Termos de Uso"
        description={`Ultima atualizacao: ${ultimaAtualizacao}. Leia com atencao antes de continuar utilizando a plataforma.`}
        breadcrumbLabel="Termos de Uso"
      />

      <section className="px-5 py-12 md:py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          {sections.map((section) => (
            <article key={section.title}>
              <h2 className="text-lg font-bold text-foreground mb-2">{section.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
