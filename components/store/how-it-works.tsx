import Link from 'next/link'

const steps = [
  {
    number: 1,
    title: 'CONFIRME SEU ENDEREÇO DE ENTREGA',
    description:
      'Verifique e confirme seu endereço, buscaremos as melhores lojas e ofertas para a sua região.',
  },
  {
    number: 2,
    title: 'MONTE SEU CARRINHO',
    description:
      'Adicione seus produtos ao carrinho. Se tiver muitos produtos, utilize nosso Orçamento Relâmpago.',
  },
  {
    number: 3,
    title: 'FINALIZE O PEDIDO E RECEBA NA SUA OBRA!',
    description:
      'Escolha sua cotação e confirme o pedido. Receba seus produtos com rapidez e segurança, sem sair de casa e direto no local da obra!',
  },
]

export function HowItWorks() {
  return (
    <section className="max-w-6xl mx-auto my-10 px-5">
      <h2 className="text-2xl mb-8 text-foreground text-balance">
        Como funciona a <strong>AlfaConstrução!</strong>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {steps.map((step) => (
          <div key={step.number} className="text-center">
            <div className="w-12 h-12 bg-[var(--orange-primary)] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              {step.number}
            </div>
            <h3 className="text-sm font-bold mb-2 text-foreground">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center text-muted-foreground text-sm mb-6 font-medium">
        Mais de 67.000 pedidos entregues desde 2021 ⭐
      </div>

      <div className="text-center">
        <Link
          href="/produtos"
          className="bg-[var(--orange-primary)] text-white px-8 py-3 rounded font-bold text-sm inline-block hover:bg-[var(--orange-dark)] transition-colors"
        >
          VER PRODUTOS
        </Link>
      </div>
    </section>
  )
}
