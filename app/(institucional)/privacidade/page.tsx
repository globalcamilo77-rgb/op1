import { InfoHero } from '@/components/store/info-hero'

export const metadata = {
  title: 'Politica de Privacidade | AlfaConstrução',
  description: 'Saiba como a AlfaConstrução coleta, usa e protege os seus dados pessoais.',
}

const ultimaAtualizacao = 'Abril de 2026'

const sections = [
  {
    title: '1. Dados que coletamos',
    text: 'Coletamos dados que voce fornece diretamente (nome, CPF/CNPJ, endereco, contato) e dados tecnicos (cookies, IP, pagina de origem, dispositivo) para prestar, melhorar e personalizar a plataforma.',
  },
  {
    title: '2. Como usamos seus dados',
    text: 'Utilizamos os dados para: processar pedidos, emitir notas fiscais, prestar atendimento, prevenir fraudes, personalizar ofertas, cumprir obrigacoes legais e comunicar novidades (quando autorizado).',
  },
  {
    title: '3. Bases legais (LGPD)',
    text: 'Tratamos seus dados com base em: execucao de contrato, cumprimento de obrigacao legal, legitimo interesse (ex.: prevenir fraude) e, quando necessario, consentimento.',
  },
  {
    title: '4. Compartilhamento',
    text: 'Compartilhamos dados com lojistas parceiros responsaveis pelo seu pedido, provedores de pagamento, transportadoras, ferramentas de analytics e autoridades quando exigido por lei.',
  },
  {
    title: '5. Armazenamento e seguranca',
    text: 'Utilizamos medidas tecnicas e organizacionais para proteger seus dados: criptografia em transito, controles de acesso e monitoramento. Retemos dados pelo prazo necessario a finalidade ou exigido por lei.',
  },
  {
    title: '6. Seus direitos',
    text: 'Voce pode solicitar a qualquer momento: acesso, correcao, anonimizacao, portabilidade, exclusao de dados desnecessarios e revogacao de consentimento. Envie seu pedido para contato@alfaconstrucao.com.br.',
  },
  {
    title: '7. Cookies',
    text: 'Usamos cookies essenciais (para funcionamento), de desempenho (para medir o uso) e de marketing (para atribuicao de campanhas). Voce pode gerenciar cookies pelo seu navegador a qualquer momento.',
  },
  {
    title: '8. Transferencia internacional',
    text: 'Em alguns casos seus dados podem ser processados fora do Brasil por provedores globais. Nesses casos, garantimos salvaguardas contratuais e tecnicas conforme a LGPD.',
  },
  {
    title: '9. Atualizacoes desta politica',
    text: 'Podemos atualizar esta politica para refletir mudancas em nossos servicos ou na legislacao. A data de ultima atualizacao e sempre exibida no topo deste documento.',
  },
  {
    title: '10. Encarregado (DPO) e contato',
    text: 'Duvidas sobre o tratamento de dados podem ser direcionadas ao Encarregado pelo e-mail contato@alfaconstrucao.com.br.',
  },
]

export default function PrivacidadePage() {
  return (
    <>
      <InfoHero
        eyebrow="Documento legal"
        title="Politica de Privacidade"
        description={`Ultima atualizacao: ${ultimaAtualizacao}. Conheca como tratamos os seus dados pessoais conforme a LGPD.`}
        breadcrumbLabel="Politica de Privacidade"
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
