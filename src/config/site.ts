export const SITE = {
  brand: "Mentoria",
  overline: "MENTORIA • PMMG • SOLDADO E CADETE",
  titleStart: "A MENTORIA QUE MAIS APROVA",
  titleGold: "NA PMMG.",
  subtitle: "Você não precisa estudar tudo. Precisa estudar o que realmente aproxima você da farda.",
  support: "Plataforma, material, cronograma e acompanhamento construídos especificamente para Soldado e Cadete da PMMG.",
  whatsapp: "5500000000000",
  whatsappText: "Olá! Tenho uma dúvida sobre a mentoria.",
  proof: "Atestado por 2.000+ alunos aprovados",
  guarantee: "7 dias de garantia legal",
};

export const STATS = [
  { n: "46", l: "1º lugar Soldado" },
  { n: "5", l: "1º lugar Cadete" },
  { n: "5.628", l: "alunos aprovados" },
];

export const TRACKS = [
  { id: "soldado", label: "Soldado PMMG", sub: "2027" },
  { id: "cadete", label: "Cadete CFO", sub: "2027" },
] as const;

export const PLANS = [
  {
    id: "3m", name: "3 meses de acesso", priceCents: 56700, featured: false,
    note: "Mesmo conteúdo e materiais dos planos mais longos",
    features: ["Acesso integral à plataforma durante os 3 meses", "Mesmo conteúdo e materiais dos planos mais longos"],
  },
  {
    id: "6m", name: "6 meses de acesso", priceCents: 94700, featured: false,
    features: ["17% menor por mês em relação ao plano de 3 meses", "6 meses completos de acesso à plataforma e aos materiais"],
  },
  {
    id: "12m", name: "12 meses de acesso", priceCents: 142200, featured: true,
    features: ["Até 15 redações corrigidas", "46% menor por mês em relação ao plano de 3 meses", "12 meses de acesso à plataforma e aos materiais"],
  },
] as const;

export const RECEIVES = [
  "Cronograma individualizado", "Apostilas em PDF", "Videoaulas", "Simulados",
  "Listas de questões", "Atualizações durante o ano", "Canal exclusivo de dúvidas", "Orientação para as etapas do certame",
];

export const WHAT_IS = [
  { t: "Conteúdo passo a passo", d: "Do iniciante ao avançado, em linguagem simples." },
  { t: "Domine todas as etapas", d: "Prova objetiva, TAF, psicotécnico e exame médico." },
  { t: "Cronograma individualizado", d: "Montado para o seu tempo disponível." },
  { t: "Contato direto", d: "Canal exclusivo para tirar dúvidas." },
  { t: "Atualizações gratuitas", d: "Todas as atualizações durante o seu acesso." },
  { t: "Material completo", d: "Apostilas, videoaulas e tudo o que for necessário." },
];

export const FOR_WHO = [
  "Quem está começando agora e não faz ideia do conteúdo.",
  "Quem já está avançado e trava em poucas questões.",
  "Quem tem compromisso em fazer o básico que aprova.",
  "Quem entende que a cura está no campo de batalha diário.",
  "Quem não acredita em fórmula mágica e quer estudar com método.",
];

export const NOT_FOR_WHO = [
  "Não é para quem acredita em fórmulas mágicas.",
  "Não é para quem não quer construir uma rotina constante de estudos.",
  "Não é para quem quer ser aprovado estudando apenas 10 dias.",
];

export const BENEFITS = [
  "Remuneração acima da média", "Abono fardamento", "Aposentadoria integral",
  "Plano de saúde", "ADE por tempo de serviço", "Férias de 25 dias úteis + 1/3",
  "13º salário", "Possibilidade de ascensão rápida", "Porte de arma de âmbito nacional",
];

export const FAQ = [
  { q: "Em quanto tempo recebo o acesso?", a: "Assim que o Pix é confirmado, o acesso é liberado." },
  { q: "Quais formas de pagamento?", a: "Pix, com QR Code ou copia e cola. A confirmação é automática." },
  { q: "Existe garantia?", a: "Sim. 7 dias de garantia, conforme o art. 49 do Código de Defesa do Consumidor." },
  { q: "Preciso renovar?", a: "Não. Sem renovação automática." },
];

export const brl = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);

export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");