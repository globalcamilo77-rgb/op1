import type { Metadata } from 'next'
import { CheckCircle2, Clock } from 'lucide-react'
import { StoreHeader } from '@/components/store/header'
import { Footer } from '@/components/store/footer'

export const metadata: Metadata = {
  title: 'Pagamento confirmado · AlfaConstrução',
  description: 'Seu pagamento foi confirmado. Em breve nossa equipe vai entrar em contato.',
  robots: { index: false, follow: false },
}

/**
 * Pagina mostrada para clientes cujo IP foi bloqueado depois de um PIX
 * confirmado (1h de bloqueio padrao). O texto evita a palavra "bloqueado"
 * para nao alarmar quem acabou de pagar.
 */
export default function BlockedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="max-w-lg w-full bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <CheckCircle2 size={28} />
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-balance">
            Pagamento recebido com sucesso!
          </h1>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            A nossa equipe ja recebeu a confirmacao do seu PIX. Em poucos minutos um dos
            atendentes vai chamar voce no WhatsApp para combinar o detalhe da entrega.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Clock size={14} />
            Acesso temporariamente bloqueado por 1 hora
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Por seguranca da operacao, novos pedidos pelo mesmo dispositivo sao liberados em 1h.
            Se precisar de algo, fale com a gente direto pelo WhatsApp do atendimento.
          </p>

          <a
            href="https://wa.me/551145724545?text=Acabei%20de%20pagar%20meu%20PIX%20e%20gostaria%20de%20confirmar%20a%20entrega"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-[var(--success,_theme(colors.emerald.600))] hover:bg-emerald-700 text-white px-5 py-3 rounded-md font-bold text-sm transition-colors"
          >
            Falar no WhatsApp
          </a>
        </div>
      </main>

      <Footer />
    </div>
  )
}
