const mkPlans = () => [
  { id: "3m", name: "3 meses de acesso", label: "PLANO CURTO", price: 567, oldPrice: 0, featured: false,
    features: ["Acesso integral à plataforma durante os 3 meses", "Mesmo conteúdo e materiais dos planos mais longos"] },
  { id: "6m", name: "6 meses de acesso", label: "PLANO INTERMEDIÁRIO", price: 947, oldPrice: 0, featured: false,
    features: ["17% menor por mês em relação ao plano de 3 meses", "6 meses completos de acesso à plataforma e aos materiais"] },
  { id: "12m", name: "12 meses de acesso", label: "MELHOR CUSTO-BENEFÍCIO", price: 1422, oldPrice: 0, featured: true,
    features: ["Até 15 redações corrigidas", "46% menor por mês em relação ao plano de 3 meses", "12 meses de acesso à plataforma e aos materiais"] },
];

export const DEFAULT_CONTENT = {
  settings: {
    brand: "Mentoria", logo: "/foto.jpg",
    metaTitle: "Mentoria PMMG | Soldado e Cadete",
    metaDescription: "A mentoria que mais aprova na PMMG. Pagamento por Pix com confirmação automática.",
    whatsapp: "5500000000000", whatsappText: "Olá! Tenho uma dúvida sobre a mentoria.",
    waLabel: "ATENDIMENTO", waTitle: "Fale com nossa equipe", waText: "Tire suas dúvidas pelo WhatsApp", waCta: "Iniciar conversa →",
    proof: "Atestado por 2.000+ alunos aprovados", guarantee: "7 dias de garantia legal",
    footerText: "Todos os direitos reservados.", footerSub: "Pagamentos processados por Pix.",
  },
  theme: {
    bg: "#050505", card: "#121210", line: "#2a2518", text: "#f4f1ea", muted: "#a39d8f",
    gold: "#c8a86a", goldLight: "#e2cb97", goldDark: "#9c7f47",
    blue: "#7fa6d1", blueLight: "#b9d3ee", blueDark: "#55799f",
    band: "#0a0a8c", accent: "#ffe11a",
  },
  sections: [
    { id: "hero", label: "Topo (título e números)", on: true },
    { id: "video", label: "Vídeo + botões de carreira", on: true },
    { id: "plans", label: "Planos, carreira e o que recebe", on: true },
    { id: "renew", label: "Renovação ex-alunos", on: true },
    { id: "results", label: "Galeria de fotos", on: true },
    { id: "what", label: "O que é a Mentoria", on: true },
    { id: "steps", label: "Como funciona", on: true },
    { id: "forwho", label: "Para quem é", on: true },
    { id: "testimonials", label: "Depoimentos", on: true },
    { id: "mentor", label: "Quem é o mentor", on: true },
    { id: "summary", label: "Resumindo + garantia", on: true },
    { id: "benefits", label: "Por que vale a carreira", on: true },
    { id: "banner", label: "Faixa de destaque", on: true },
    { id: "faq", label: "Perguntas frequentes", on: true },
    { id: "final", label: "Chamada final", on: true },
  ],
  hero: {
    overline: "MENTORIA • PMMG • SOLDADO E CADETE",
    titleStart: "A MENTORIA QUE MAIS APROVA", titleGold: "NA PMMG.",
    subtitle: "Você não precisa estudar tudo. Precisa estudar o que realmente aproxima você da farda.",
    support: "Plataforma, material, cronograma e acompanhamento construídos especificamente para Soldado e Cadete da PMMG.",
    image: "",
    stats: [{ n: "46", l: "1º lugar Soldado" }, { n: "5", l: "1º lugar Cadete" }, { n: "5.628", l: "alunos aprovados" }],
  },
  video: {
    title: "VEJA A MENTORIA POR DENTRO", subtitle: "Conheça a plataforma, os materiais e a lógica de preparação.",
    url: "", poster: "",
    buttons: [{ text: "QUERO SER SOLDADO →", link: "#planos" }, { text: "QUERO SER CADETE →", link: "#planos" }],
    note: "Soldado • Cadete • Turmas 2026/2027",
    badges: ["Pix", "Compra 100% segura", "Privacidade protegida"],
  },
  plans: {
    overline: "MATRÍCULAS ABERTAS", titleStart: "Escolha sua", titleAccent: "carreira", titleEnd: "e o tempo de acesso",
    text: "Você recebe o mesmo conteúdo completo em qualquer plano. Escolha a carreira e por quanto tempo deseja ter acesso à preparação.",
    priceNote: "à vista no Pix", cta: "Garantir minha vaga →", ribbon: "★ MAIS ESCOLHIDO",
    tracks: [
      { id: "soldado", label: "Soldado PMMG", sub: "2027", colorTheme: "gold", plans: mkPlans() },
      { id: "cadete", label: "Cadete CFO", sub: "2027", colorTheme: "blue", plans: mkPlans() },
    ],
    receivesTitle: "TUDO O QUE VOCÊ RECEBE NA MENTORIA",
    receives: ["Cronograma individualizado", "Apostilas em PDF", "Videoaulas", "Simulados", "Listas de questões", "Atualizações durante o ano", "Canal exclusivo de dúvidas", "Orientação para as etapas do certame"],
    payNote: "Pix • Pagamento seguro • 7 dias de garantia legal • Sem renovação automática",
    finePrint: "* Os valores à vista estão indicados em cada plano. Ao adquirir a Mentoria, você declara ciência dos",
    termsText: "Termos de Uso e Contrato", termsLink: "#",
  },
  career: {
    soldado: {
      overline: "DEPOIS DA APROVAÇÃO", titleStart: "O que a carreira de", titleAccent: "Soldado PMMG", titleEnd: "oferece",
      subtitle: "Remuneração, benefícios e possibilidades vinculadas à carreira de Soldado.",
      items: [
        { t: "R$ 6.620,47", d: "Remuneração indicada para a carreira de Soldado" },
        { t: "R$ 1.650,00", d: "Vale alimentação" },
        { t: "R$ 8.155,36 por ano", d: "Abono fardamento" },
        { t: "Plano de saúde", d: "Benefício da carreira" },
        { t: "ADE", d: "6% em três anos e 10% em cinco anos" },
        { t: "Férias + 13º", d: "1/3 de férias e 13º salário" },
        { t: "Porte nacional", d: "Porte de arma em âmbito nacional" },
        { t: "Aproximadamente R$ 20 mil", d: "Projeção informada de aposentadoria integral como Subtenente" },
      ],
      note: "Valores, requisitos e regras da carreira podem sofrer alterações legislativas, remuneratórias e administrativas.",
    },
    cadete: {
      overline: "DEPOIS DA APROVAÇÃO", titleStart: "O que a carreira de", titleAccent: "Oficial PMMG", titleEnd: "oferece",
      subtitle: "Remuneração, benefícios e possibilidades vinculadas à carreira de Oficial.",
      items: [
        { t: "R$ 12.170,26", d: "Salário indicado como 2º Tenente" },
        { t: "R$ 1.650,00", d: "Vale alimentação" },
        { t: "R$ 8.155,36 por ano", d: "Abono fardamento" },
        { t: "Bacharelado em Direito", d: "Requisito específico do CFO" },
        { t: "Plano de saúde", d: "Benefício da carreira" },
        { t: "ADE", d: "6% em três anos e 10% em cinco anos" },
        { t: "Férias + 13º", d: "1/3 de férias e 13º salário" },
        { t: "Porte nacional", d: "Porte de arma em âmbito nacional" },
        { t: "Aproximadamente R$ 40 mil", d: "Projeção informada de aposentadoria integral como Coronel" },
      ],
      note: "Valores, requisitos e regras da carreira podem sofrer alterações legislativas, remuneratórias e administrativas.",
    },
  },
  renew: { overline: "CONDIÇÃO EXCLUSIVA PARA EX-ALUNOS", title: "JÁ FOI ALUNO? RENOVE COM", titleGold: "DESCONTO.", button: "RENOVAR COM DESCONTO", link: "", note: "Atendimento pelo WhatsApp" },
  what: {
    title: "O que é a Mentoria?",
    intro: "A Mentoria é o único lugar que reúne **ABSOLUTAMENTE TUDO** que você precisa",
    highlight: "para ser aprovado na Polícia Militar seja você avançado ou iniciante nas matérias:",
    items: [
      { icon: "★", image: "", t: "Conteúdo passo a passo", d: "atende o **iniciante** ao **avançado**, material de fácil compreensão para você que nunca viu o conteúdo ou para você que quase passou" },
      { icon: "★", image: "", t: "Cronograma individualizado", d: "será criado um cronograma específico para você, o qual é moldado para sua quantidade de horas disponíveis e particularidades" },
      { icon: "★", image: "", t: "Atualizações gratuitas", d: "não se preocupe, você receberá toda e qualquer atualização pelo tempo que estiver na Mentoria" },
      { icon: "★", image: "", t: "Domine todas as etapas", d: "sanarei TODAS suas dúvidas referentes ao certame: prova objetiva, TAF, psico, médico etc" },
      { icon: "★", image: "", t: "Contato direto comigo", d: "além do meu Whatsapp, você terá um canal exclusivo de dúvidas, as quais serão prontamente respondidas por mim e minha equipe" },
      { icon: "★", image: "", t: "Material completo", d: "a Mentoria é suficiente para a sua aprovação, ou seja, receberá o combo de apostilas, videoaulas e todo material necessário" },
    ],
  },
  steps: {
    title: "Como funciona", subtitle: "Do pagamento à aprovação, em quatro passos.",
    items: [
      { t: "Escolha sua carreira e plano", d: "Soldado ou Cadete, 3, 6 ou 12 meses de acesso." },
      { t: "Pague no Pix", d: "QR Code ou copia e cola, com confirmação automática." },
      { t: "Receba o acesso", d: "Liberado assim que o pagamento for confirmado." },
      { t: "Estude com método", d: "Cronograma individual, materiais e canal de dúvidas." },
    ],
  },
  forwho: {
    title: "Para", titleGold: "QUEM", titleEnd: "é a Mentoria?",
    items: ["Quem está começando agora e não faz ideia do conteúdo.", "Quem já está avançado e trava em poucas questões.", "Quem tem compromisso em fazer o básico que aprova.", "Quem entende que a cura está no campo de batalha diário.", "Quem não acredita em fórmula mágica e quer estudar com método."],
  },
  results: { title: "", subtitle: "", images: [] as string[] },
  testimonials: {
    title: "Quem estudou, aprovou",
    items: [
      { name: "Nome do aluno", role: "1º lugar Soldado", text: "Edite este depoimento no painel administrativo.", image: "" },
      { name: "Nome do aluno", role: "Aprovado Cadete", text: "Edite este depoimento no painel administrativo.", image: "" },
      { name: "Nome do aluno", role: "Aprovado Soldado", text: "Edite este depoimento no painel administrativo.", image: "" },
    ],
  },
  mentor: {
    overline: "QUEM ESTÁ POR TRÁS", title: "Seu mentor", text: "Escreva aqui a história, a experiência e a credibilidade do mentor.", image: "",
    bullets: ["Aprovado na PMMG", "Anos de experiência em preparação", "Método testado por milhares de alunos"],
  },
  summary: {
    title: "Resumindo", text: "Você recebe tudo o que precisa para estudar com método, sem precisar adquirir mais materiais.",
    guaranteeTitle: "Garantia de 07 dias:", guarantee: "em observância ao art. 49 do Código de Defesa do Consumidor, você pode desistir em até 7 dias após a contratação.",
    notFor: ["Não é para quem acredita em fórmulas mágicas.", "Não é para quem não quer construir uma rotina constante de estudos.", "Não é para quem quer ser aprovado estudando apenas 10 dias."],
  },
  benefits: {
    title: "Por que vale a pena a carreira?", button: "QUERO COMPRAR A MENTORIA", link: "#planos",
    items: ["Remuneração acima da média", "Abono fardamento", "Aposentadoria integral", "Plano de saúde", "ADE por tempo de serviço", "Férias de 25 dias úteis + 1/3", "13º salário", "Possibilidade de ascensão rápida", "Porte de arma de âmbito nacional"],
  },
  banner: { text: "Colecionando Primeiros Colocados" },
  faq: {
    title: "Perguntas frequentes", button: "Comprar Agora", link: "#planos",
    items: [
      { q: "Em quanto tempo recebo o acesso?", a: "Assim que o Pix é confirmado, o acesso é liberado." },
      { q: "Quais formas de pagamento?", a: "Pix, com QR Code ou copia e cola. A confirmação é automática." },
      { q: "Existe garantia?", a: "Sim. 7 dias de garantia, conforme o art. 49 do Código de Defesa do Consumidor." },
      { q: "Preciso renovar?", a: "Não. Sem renovação automática." },
    ],
  },
  final: { title: "Sua farda começa com a decisão de hoje.", text: "Garanta sua vaga e comece com cronograma, material e suporte desde o primeiro dia.", button: "GARANTIR MINHA VAGA →", link: "#planos" },
};

export type Content = typeof DEFAULT_CONTENT;

export const brl = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);

export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");