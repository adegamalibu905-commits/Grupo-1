// Mapa do painel: o que existe, onde aparece no site e como cada campo é explicado.
// Para criar um campo novo, basta incluir uma linha aqui (a chave "k" é o caminho dentro do conteúdo do site).

export type Opt = [string, string];
export type Field =
  | { t: "text"; k: string; label: string; help?: string; ph?: string }
  | { t: "area"; k: string; label: string; help?: string; rows?: number }
  | { t: "rich"; k: string; label: string; help?: string; rows?: number }
  | { t: "image"; k: string; label: string; help?: string }
  | { t: "video"; k: string; label: string; help?: string }
  | { t: "link"; k: string; label: string; help?: string; presets?: Opt[] }
  | { t: "color"; k: string; label: string; help?: string }
  | { t: "num"; k: string; label: string; help?: string; prefix?: string; suffix?: string; step?: number; min?: number }
  | { t: "bool"; k: string; label: string; help?: string }
  | { t: "select"; k: string; label: string; help?: string; opts: Opt[] }
  | { t: "id"; k: string }
  | { t: "list"; k: string; label: string; help?: string; add: string; of: Field[] | "text" | "rich" | "image"; ph?: string; titleKey?: string; fixed?: boolean; noAdd?: boolean }
  | { t: "group"; label: string; help?: string; fields: Field[] }
  | { t: "note"; text: string; tone?: "info" | "warn" };

export type Page = {
  id: string; icon: string; title: string;
  where: string;                       // "Onde aparece no site"
  sec?: string;                        // id da área do site que a prévia mostra/destaca
  view?: "site" | "thanks" | "checkout";
  toggle?: string;                     // id da seção (liga/desliga)
  roots: string[];                     // partes do conteúdo que esta tela mexe
  kw: string;                          // palavras para a busca
  fields?: Field[];
  custom?: "sections";
};
export type Category = { id: string; icon: string; title: string; desc: string; pages: Page[] };

const T = (k: string, label: string, help?: string, ph?: string): Field => ({ t: "text", k, label, help, ph });
const A = (k: string, label: string, help?: string, rows?: number): Field => ({ t: "area", k, label, help, rows });
const R = (k: string, label: string, help?: string, rows?: number): Field => ({ t: "rich", k, label, help, rows });
const I = (k: string, label: string, help?: string): Field => ({ t: "image", k, label, help });
const L = (k: string, label: string, help?: string, presets?: Opt[]): Field => ({ t: "link", k, label, help, presets });
const G = (label: string, fields: Field[], help?: string): Field => ({ t: "group", label, help, fields });
const N = (text: string, tone?: "info" | "warn"): Field => ({ t: "note", text, tone });

const TO_PLANS: Opt[] = [["#planos", "Descer até a área dos planos (recomendado)"]];
const BOLD = "Dica: para deixar uma palavra em negrito, selecione-a e clique em “Negrito”.";

const career = (key: "soldado" | "cadete", who: string): Field[] => [
  N(`Esta é a caixa que aparece logo abaixo dos planos quando o visitante clica na aba “${who}”.`),
  T(`career.${key}.overline`, "Texto pequeno acima do título", "Linha pequena em letras maiúsculas."),
  G("Título", [
    T(`career.${key}.titleStart`, "Início do título"),
    T(`career.${key}.titleAccent`, "Palavra em destaque (colorida)"),
    T(`career.${key}.titleEnd`, "Final do título"),
  ], "O título é montado assim: início + palavra em destaque + final."),
  A(`career.${key}.subtitle`, "Subtítulo", "Frase logo abaixo do título.", 2),
  { t: "list", k: `career.${key}.items`, label: "Benefícios da carreira", help: "Cada item é uma linha com ✓ (valor ou nome grande + explicação).", add: "Adicionar benefício", titleKey: "t",
    of: [T("t", "Destaque (em negrito)", "Ex.: R$ 5.620,47"), A("d", "Explicação", "Ex.: Salário indicado para Soldado", 2)] },
  A(`career.${key}.note`, "Aviso final (letras pequenas)", undefined, 2),
];

export const CATEGORIES: Category[] = [
  {
    id: "site", icon: "🌐", title: "Informações do site", desc: "Nome, WhatsApp, Google e rodapé",
    pages: [
      { id: "marca", icon: "🏷️", title: "Nome da marca e logo", where: "O nome aparece na descrição do pagamento Pix. A logo só aparece na seção antiga “Mentor”, quando ela está ligada e sem foto.", roots: ["settings"], kw: "marca nome logo identidade",
        fields: [T("settings.brand", "Nome da marca", "Aparece na descrição que o cliente vê ao pagar o Pix."), I("settings.logo", "Logo", "Imagem quadrada ou redonda funciona melhor.")] },
      { id: "google", icon: "🔎", title: "Título e descrição (Google)", where: "Na aba do navegador e no resultado de busca do Google (não aparece dentro da página).", roots: ["settings"], kw: "google seo titulo descricao aba busca",
        fields: [T("settings.metaTitle", "Título da aba", "É o texto que aparece na aba do navegador e como título azul no Google.", "Ex.: Mentoria PMMG | Soldado e Cadete"),
          A("settings.metaDescription", "Descrição para o Google", "Uma ou duas frases explicando o site. Aparece abaixo do título no Google.", 3)] },
      { id: "whatsapp", icon: "💬", title: "WhatsApp", where: "No botão verde que fica flutuando no canto da tela e no cartão que aparece junto dele.", sec: "wa", roots: ["settings"], kw: "whatsapp zap contato telefone atendimento botão",
        fields: [
          G("Número e mensagem", [
            T("settings.whatsapp", "Número do WhatsApp", "Só números, com 55 + DDD + número. Exemplo: 5531999999999", "5531999999999"),
            A("settings.whatsappText", "Mensagem que já vem escrita", "É o texto que aparece pronto na conversa quando o cliente clica.", 2),
          ]),
          G("Cartão que aparece ao lado do botão", [
            T("settings.waLabel", "Rótulo pequeno (em cima)", undefined, "ATENDIMENTO"),
            T("settings.waTitle", "Título"),
            T("settings.waText", "Texto"),
            T("settings.waCta", "Chamada (última linha)"),
          ], "O cartão aparece alguns segundos depois da página abrir."),
        ] },
      { id: "prova", icon: "⭐", title: "Frase de confiança", where: "Embaixo das 5 estrelas, nas áreas de vídeo e de resumo.", sec: "video", roots: ["settings"], kw: "prova social atestado alunos estrelas confiança",
        fields: [T("settings.proof", "Frase abaixo das estrelas", "Ex.: Atestado por 2.000+ alunos aprovados")] },
      { id: "rodape", icon: "📎", title: "Rodapé", where: "Faixa preta no final da página.", sec: "rodape", roots: ["settings"], kw: "rodape copyright direitos final",
        fields: [N("O rodapé é montado assim: “Copyright © (ano automático) + nome + frase final”."),
          T("settings.footerOwner", "Nome após o Copyright", undefined, "Otávio Souza – PMMinas"),
          T("settings.footerText", "Frase final", undefined, "Todos os direitos reservados."),
          T("settings.footerSub", "Segunda linha (opcional)", "Pode ficar vazia. Boa para CNPJ ou endereço.")] },
    ],
  },
  {
    id: "visual", icon: "🎨", title: "Aparência", desc: "Cores e ordem das seções",
    pages: [
      { id: "ordem", icon: "📑", title: "Ordem e visibilidade das seções", where: "Define quais blocos aparecem na página e em que ordem, de cima para baixo.", roots: ["sections"], kw: "ordem seções mostrar esconder ocultar ligar desligar mover blocos", custom: "sections" },
      { id: "cores", icon: "🎨", title: "Cores do site", where: "Em toda a página. A prévia muda na hora.", roots: ["theme"], kw: "cores cor fundo dourado azul tema visual",
        fields: [
          G("Fundo e textos", [
            { t: "color", k: "theme.bg", label: "Fundo da página", help: "Cor de trás de tudo." },
            { t: "color", k: "theme.card", label: "Cartões e caixas" },
            { t: "color", k: "theme.line", label: "Linhas e bordas" },
            { t: "color", k: "theme.text", label: "Texto principal" },
            { t: "color", k: "theme.muted", label: "Texto secundário", help: "Textos menores e mais apagados." },
          ]),
          G("Dourado (carreira Soldado e destaques)", [
            { t: "color", k: "theme.gold", label: "Dourado principal" },
            { t: "color", k: "theme.goldLight", label: "Dourado claro" },
            { t: "color", k: "theme.goldDark", label: "Dourado escuro" },
          ]),
          G("Azul (carreira Cadete)", [
            { t: "color", k: "theme.blue", label: "Azul principal" },
            { t: "color", k: "theme.blueLight", label: "Azul claro" },
            { t: "color", k: "theme.blueDark", label: "Azul escuro" },
          ]),
          G("Faixas e destaques", [
            { t: "color", k: "theme.band", label: "Faixa azul", help: "Usada na faixa de destaque (seção antiga)." },
            { t: "color", k: "theme.accent", label: "Amarelo de destaque" },
          ]),
        ] },
    ],
  },
  {
    id: "topo", icon: "⭐", title: "Início da página", desc: "Título principal e vídeo",
    pages: [
      { id: "hero", icon: "🏁", title: "Topo da página (título e números)", where: "Primeira coisa que o visitante vê, logo ao abrir o site.", sec: "hero", toggle: "hero", roots: ["hero"], kw: "topo titulo hero principal numeros estatisticas inicio",
        fields: [
          T("hero.overline", "Texto pequeno acima do título", undefined, "MENTORIA • PMMG • SOLDADO E CADETE"),
          G("Título grande", [T("hero.titleStart", "Primeira parte"), T("hero.titleGold", "Parte em destaque (dourada)")], "O título é a primeira parte seguida da parte dourada."),
          A("hero.subtitle", "Subtítulo", "Frase logo abaixo do título.", 2),
          A("hero.support", "Texto de apoio", "Texto menor, abaixo do subtítulo.", 3),
          I("hero.image", "Imagem (opcional)", "Se ficar vazia, nenhuma imagem é mostrada."),
          { t: "list", k: "hero.stats", label: "Números de destaque", help: "Os números grandes que aparecem em linha (ex.: 5.628 alunos aprovados).", add: "Adicionar número", titleKey: "l",
            of: [T("n", "Número", "Ex.: 5.628"), T("l", "Legenda", "Ex.: alunos aprovados")] },
        ] },
      { id: "video", icon: "🎬", title: "Vídeo e botões de carreira", where: "Logo abaixo do topo: vídeo, botões “Quero ser…” e selos.", sec: "video", toggle: "video", roots: ["video"], kw: "video vídeo youtube botoes botões selos capa",
        fields: [
          T("video.title", "Título da área"), A("video.subtitle", "Subtítulo", undefined, 2),
          G("Vídeo", [
            { t: "video", k: "video.url", label: "Link do vídeo", help: "Cole o endereço do YouTube, Vimeo ou de um arquivo .mp4." },
            I("video.poster", "Imagem de capa", "Aparece antes de o visitante apertar o play."),
          ]),
          { t: "list", k: "video.buttons", label: "Botões", help: "Botões dourados abaixo do vídeo.", add: "Adicionar botão", titleKey: "text",
            of: [T("text", "Texto do botão"), L("link", "Para onde leva", undefined, TO_PLANS)] },
          T("video.note", "Frase abaixo dos botões"),
          { t: "list", k: "video.badges", label: "Selos de segurança", help: "Pequenas etiquetas, ex.: Pix, Compra 100% segura.", add: "Adicionar selo", of: "text", ph: "Ex.: Pix" },
        ] },
    ],
  },
  {
    id: "planos", icon: "💰", title: "Planos e vendas", desc: "Preços, carreiras e renovação",
    pages: [
      { id: "planos-topo", icon: "🏷️", title: "Planos: títulos da área", where: "Textos que ficam acima dos cartões de preço.", sec: "plans", toggle: "plans", roots: ["plans"], kw: "planos titulo matriculas abertas escolha carreira",
        fields: [
          T("plans.overline", "Texto pequeno acima", undefined, "MATRÍCULAS ABERTAS"),
          G("Título", [T("plans.titleStart", "Início"), T("plans.titleAccent", "Palavra em destaque"), T("plans.titleEnd", "Final")], "Montado assim: início + destaque + final."),
          A("plans.text", "Texto explicativo", undefined, 3),
        ] },
      { id: "planos-precos", icon: "💵", title: "Planos e preços", where: "Nos cartões de preço, dentro de cada aba (Soldado e Cadete).", sec: "plans", toggle: "plans", roots: ["plans"], kw: "preço precos valor plano planos 3 meses 6 meses 12 meses cartão comprar",
        fields: [
          N("Cada carreira (aba) tem seus próprios planos. Mude o preço, o nome ou os benefícios de cada cartão aqui.", "info"),
          N("Atenção: acima do limite do Pix (veja “Cupons e limite do Pix”), o site aplica o desconto automático e mostra o preço “de” riscado.", "warn"),
          { t: "list", k: "plans.tracks", label: "Carreiras (abas)", add: "", fixed: true, noAdd: true, titleKey: "label",
            of: [
              { t: "id", k: "id" }, T("label", "Nome da aba", "Ex.: Soldado PMMG"), T("sub", "Ano (pequeno, abaixo do nome)", "Ex.: 2027"),
              { t: "select", k: "colorTheme", label: "Cor da carreira", opts: [["gold", "Dourado"], ["blue", "Azul"]] },
              { t: "list", k: "plans", label: "Planos desta carreira", add: "Adicionar plano", titleKey: "name",
                of: [
                  { t: "id", k: "id" },
                  T("label", "Etiqueta pequena", "Ex.: MELHOR CUSTO-BENEFÍCIO"), T("name", "Nome do plano", "Ex.: 12 meses de acesso"),
                  { t: "num", k: "price", label: "Preço cobrado", prefix: "R$", step: 0.01, help: "O valor que o cliente paga (sem cupom)." },
                  { t: "num", k: "oldPrice", label: "Preço antigo (riscado)", prefix: "R$", step: 0.01, help: "Aparece riscado ao lado do preço. Deixe 0 para não mostrar." },
                  { t: "bool", k: "featured", label: "Destacar como “Mais escolhido”", help: "Só um por carreira, de preferência." },
                  { t: "list", k: "features", label: "O que o plano inclui", add: "Adicionar benefício", of: "text", ph: "Ex.: Até 15 redações corrigidas" },
                ] },
            ] },
        ] },
      { id: "planos-extras", icon: "🧾", title: "Planos: botões e “Tudo o que você recebe”", where: "Textos dos cartões de preço e a lista de itens recebidos logo abaixo deles.", sec: "plans", toggle: "plans", roots: ["plans"], kw: "botão garantir vaga recebe lista termos contrato pix nota",
        fields: [
          G("Textos dos cartões", [T("plans.cta", "Texto do botão de compra"), T("plans.ribbon", "Etiqueta do plano destacado"), T("plans.priceNote", "Texto abaixo do preço")]),
          G("Lista “Tudo o que você recebe”", [T("plans.receivesTitle", "Título"),
            { t: "list", k: "plans.receives", label: "Itens", add: "Adicionar item", of: "text", ph: "Ex.: Videoaulas" }]),
          G("Rodapé da caixa", [
            A("plans.payNote", "Linha de pagamento", "Separe cada ideia com o símbolo • (ponto central).", 2),
            A("plans.finePrint", "Texto pequeno (antes do link)", undefined, 2),
            T("plans.termsText", "Texto do link de termos", undefined, "Termos de Uso e Contrato"),
            L("plans.termsLink", "Endereço do link de termos", "Cole o endereço da página dos termos."),
          ]),
        ] },
      { id: "carreira-soldado", icon: "🪖", title: "Carreira: Soldado", where: "Caixa de benefícios logo abaixo dos planos, na aba “Soldado”.", sec: "plans", toggle: "plans", roots: ["career"], kw: "carreira soldado salario benefícios", fields: career("soldado", "Soldado PMMG") },
      { id: "carreira-cadete", icon: "🎖️", title: "Carreira: Cadete / Oficial", where: "Caixa de benefícios logo abaixo dos planos, na aba “Cadete”.", sec: "plans", toggle: "plans", roots: ["career"], kw: "carreira cadete oficial salario benefícios", fields: career("cadete", "Cadete CFO") },
      { id: "renew", icon: "🔁", title: "Renovação para ex-alunos", where: "Faixa logo depois dos planos, para quem já foi aluno.", sec: "renew", toggle: "renew", roots: ["renew"], kw: "renovar renovação ex aluno desconto",
        fields: [T("renew.overline", "Texto pequeno acima"), G("Título", [T("renew.title", "Início"), T("renew.titleGold", "Parte dourada")]), T("renew.button", "Texto do botão"),
          L("renew.link", "Para onde o botão leva", "Se deixar vazio, o botão abre o seu WhatsApp.", [["", "Abrir o meu WhatsApp (padrão)"]]), T("renew.note", "Frase abaixo do botão")] },
    ],
  },
  {
    id: "apresentacao", icon: "📖", title: "Apresentação da mentoria", desc: "Explicações, garantia e para quem é",
    pages: [
      { id: "what", icon: "💡", title: "O que é a Mentoria", where: "Seção com 6 cartões explicando a mentoria.", sec: "what", toggle: "what", roots: ["what"], kw: "o que é mentoria cartões explicação",
        fields: [T("what.title", "Título"), R("what.intro", "Frase de abertura", BOLD, 3), A("what.highlight", "Frase em destaque", undefined, 2),
          { t: "list", k: "what.items", label: "Cartões", add: "Adicionar cartão", titleKey: "t",
            of: [T("icon", "Símbolo (emoji)", "Aparece se não houver imagem. Ex.: ★"), I("image", "Imagem (opcional)", "Substitui o símbolo."), T("t", "Título do cartão"), R("d", "Texto do cartão", BOLD, 3)] }] },
      { id: "redacao", icon: "✍️", title: "Correção de redações", where: "Faixa preta explicando quantas redações são corrigidas.", sec: "redacao", toggle: "redacao", roots: ["redacao"], kw: "redação redacao correção cfo",
        fields: [T("redacao.title", "Título"), R("redacao.intro", "Introdução", BOLD, 2),
          { t: "list", k: "redacao.lines", label: "Linhas de regras", add: "Adicionar linha", of: "rich" }, R("redacao.note", "Observação final", BOLD, 4)] },
      { id: "forwho", icon: "🎯", title: "Para quem é a Mentoria", where: "Lista com ✓ e dois cartões de perguntas e respostas.", sec: "forwho", toggle: "forwho", roots: ["forwho"], kw: "para quem é lista perguntas cartões",
        fields: [T("forwho.title", "Título"),
          { t: "list", k: "forwho.list", label: "Lista de “para quem é”", add: "Adicionar item", of: "rich" },
          G("Primeira pergunta", [I("forwho.image1", "Foto (opcional)"), T("forwho.quote1Title", "Pergunta"), R("forwho.quote1Text", "Resposta", BOLD, 3)]),
          G("Botão", [T("forwho.button", "Texto do botão"), L("forwho.link", "Para onde leva", undefined, TO_PLANS)]),
          G("Segunda pergunta", [I("forwho.image2", "Foto (opcional)"), T("forwho.quote2Title", "Pergunta"), R("forwho.quote2Text", "Resposta", BOLD, 3)])] },
      { id: "receive", icon: "📦", title: "O que você irá receber", where: "Seção clara com textos longos e vídeo de prova.", sec: "receive", toggle: "receive", roots: ["receive"], kw: "o que irá receber parágrafos vídeo prova",
        fields: [T("receive.title", "Título"), { t: "list", k: "receive.paragraphs", label: "Parágrafos", add: "Adicionar parágrafo", of: "rich", help: BOLD },
          T("receive.proofTitle", "Título da prova (“Não se convenceu?”)"), { t: "video", k: "receive.videoUrl", label: "Link do vídeo", help: "YouTube, Vimeo ou .mp4. Deixe vazio para não mostrar vídeo." }, I("receive.poster", "Imagem de capa do vídeo")] },
      { id: "summary", icon: "🧮", title: "Resumindo + garantia", where: "Caixa de resumo com botão, garantia e meios de pagamento.", sec: "summary", toggle: "summary", roots: ["summary"], kw: "resumindo garantia pagamento cartão boleto pix botão avatares",
        fields: [T("summary.title", "Título"), R("summary.text", "Texto do resumo", BOLD, 5),
          G("Garantia", [T("summary.guaranteeTitle", "Título da garantia"), A("summary.guarantee", "Texto da garantia", undefined, 6)]),
          I("summary.sticker", "Figurinha / selo (opcional)"),
          G("Botão", [T("summary.button", "Texto do botão"), L("summary.link", "Para onde leva", undefined, TO_PLANS)]),
          G("Meios de pagamento", [I("summary.payImage", "Imagem dos meios de pagamento (opcional)", "Se enviar uma imagem, ela substitui a lista de textos."),
            { t: "list", k: "summary.payItems", label: "Textos de pagamento", add: "Adicionar", of: "text" }]),
          { t: "list", k: "summary.avatars", label: "Fotinhos de alunos (prova social)", help: "Pequenas fotos redondas ao lado das estrelas.", add: "Adicionar foto", of: "image" }] },
      { id: "basico", icon: "✅", title: "O que é “fazer o básico”", where: "Faixa preta com 3 itens marcados com ✓.", sec: "basico", toggle: "basico", roots: ["basico"], kw: "básico basico faixa preta itens",
        fields: [T("basico.title", "Título"), { t: "list", k: "basico.items", label: "Itens", add: "Adicionar item", of: "rich", help: BOLD }] },
    ],
  },
  {
    id: "provas", icon: "🏆", title: "Provas e depoimentos", desc: "Fotos, depoimentos, placa e história",
    pages: [
      { id: "results", icon: "🖼️", title: "Galeria de aprovados", where: "Grade de fotos de alunos aprovados.", sec: "results", toggle: "results", roots: ["results"], kw: "galeria fotos aprovados imagens resultados",
        fields: [T("results.title", "Título (opcional)"), T("results.subtitle", "Subtítulo (opcional)"),
          { t: "list", k: "results.images", label: "Fotos", help: "Você pode enviar várias de uma vez. Use o botão “Enviar várias fotos”.", add: "Adicionar foto", of: "image" }] },
      { id: "testimonials", icon: "💬", title: "Depoimentos (“Quem estudou, aprovou”)", where: "Cartões com foto, nome e depoimento.", sec: "testimonials", toggle: "testimonials", roots: ["testimonials"], kw: "depoimentos alunos quem estudou aprovou",
        fields: [T("testimonials.title", "Título"),
          { t: "list", k: "testimonials.items", label: "Depoimentos", add: "Adicionar depoimento", titleKey: "name",
            of: [I("image", "Foto do aluno"), T("name", "Nome"), T("role", "Resultado", "Ex.: 1º lugar Soldado"), A("text", "Depoimento", undefined, 4)] }] },
      { id: "caution", icon: "⚠️", title: "“Cuidado!” (carrossel de depoimentos)", where: "Seção com depoimentos que passam um por vez, com setas.", sec: "caution", toggle: "caution", roots: ["caution"], kw: "cuidado carrossel depoimentos setas",
        fields: [G("Título", [T("caution.title", "Primeira linha"), T("caution.title2", "Segunda linha")]),
          { t: "list", k: "caution.items", label: "Depoimentos do carrossel", add: "Adicionar depoimento", titleKey: "name",
            of: [
              N("Escolha UM formato: só foto (aparece redonda) ou vídeo (YouTube, Vimeo ou .mp4). Se preencher o link do vídeo, ele aparece no lugar da foto."),
              I("image", "Foto", "Usada quando não há vídeo. Se houver vídeo e a capa abaixo estiver vazia, esta imagem vira a capa dele."),
              { t: "video", k: "video", label: "Link do vídeo (opcional)", help: "Cole o endereço do YouTube, Vimeo ou de um arquivo .mp4. Deixe vazio para mostrar só a foto." },
              I("poster", "Capa do vídeo (opcional)", "Imagem exibida antes de o visitante apertar o play."),
              A("text", "Depoimento", BOLD, 5), T("name", "Nome"), T("role", "Resultado")] }] },
      { id: "placa", icon: "🏅", title: "Receba a Placa OBA", where: "Seção sobre a placa de primeiro lugar, com vídeo ou imagem.", sec: "placa", toggle: "placa", roots: ["placa"], kw: "placa oba primeiro lugar honraria vídeo",
        fields: [T("placa.title", "Título"), { t: "list", k: "placa.paragraphs", label: "Parágrafos", add: "Adicionar parágrafo", of: "rich", help: BOLD },
          { t: "video", k: "placa.videoUrl", label: "Link do vídeo (opcional)", help: "Se vazio, mostra só a imagem abaixo." }, I("placa.image", "Imagem", "Se houver vídeo, vira a capa dele.")] },
      { id: "origin", icon: "📜", title: "De onde surgiu o Método", where: "Seção de história do método, em fundo preto.", sec: "origin", toggle: "origin", roots: ["origin"], kw: "origem método historia história espaço preto",
        fields: [{ t: "num", k: "origin.spacer", label: "Espaço preto acima da seção", suffix: "px", step: 1, help: "56 equivale a mais ou menos 1,5 cm." },
          G("Título", [T("origin.title", "Início"), T("origin.titleGold", "Parte em destaque")]),
          { t: "list", k: "origin.paragraphs", label: "Parágrafos", add: "Adicionar parágrafo", of: "rich", help: BOLD }, I("origin.image", "Imagem final (opcional)")] },
    ],
  },
  {
    id: "pagamento", icon: "💳", title: "Pagamento e cupons", desc: "Janela do Pix, cupons e obrigado",
    pages: [
      { id: "checkout", icon: "🧾", title: "Janela de pagamento", where: "Janela que abre quando o cliente clica em “Garantir minha vaga”.", view: "checkout", roots: ["checkout"], kw: "pagamento checkout janela pix finalizar pedido qr code termos legal",
        fields: [
          N("A prévia ao lado mostra a janela de pagamento. Nela nenhum pedido é enviado de verdade.", "info"),
          G("Produto", [T("checkout.brandTag", "Nome do produto", "Aparece antes da carreira. Ex.: [Mentoria OBA]"), I("checkout.image", "Imagem do produto", "Se vazia, usa a imagem padrão."), T("checkout.priceNote", "Texto abaixo do preço")]),
          G("Cupom", [T("checkout.couponTitle", "Título da caixa de cupom"), T("checkout.couponPlaceholder", "Texto dentro do campo"), T("checkout.couponButton", "Texto do botão")]),
          G("Aviso de segurança", [T("checkout.secureTitle", "Título"), A("checkout.secureText", "Texto", undefined, 4), R("checkout.safeNote", "Frase do cadeado", BOLD, 2)]),
          G("Resumo e botão final", [T("checkout.detailsTitle", "Título do resumo"), T("checkout.finishButton", "Texto do botão final"), T("checkout.waitText", "Frase enquanto envia")]),
          G("Texto legal", [T("checkout.sellerLabel", "Texto antes do vendedor"), T("checkout.seller", "Nome da empresa vendedora"), R("checkout.legal", "Termos de aceite", BOLD, 5)]),
          G("Tela do Pix", [T("checkout.pixExpires", "Contador do Pix"), T("checkout.pixExpired", "Quando o Pix vence"), T("checkout.pixScan", "Chamada do QR Code"), T("checkout.pixOr", "Chamada do copia e cola"),
            T("checkout.pixCopy", "Botão copiar"), T("checkout.pixCopied", "Botão depois de copiar"), T("checkout.pixWaiting", "Frase de espera"), T("checkout.pixNew", "Botão novo Pix"),
            { t: "list", k: "checkout.pixSteps", label: "Passo a passo para pagar", add: "Adicionar passo", of: "rich" }]),
          G("Pagamento confirmado", [T("checkout.paidTitle", "Título"), T("checkout.paidText", "Texto", "Escreva {email} onde o e-mail do cliente deve aparecer."), T("checkout.paidButton", "Texto do botão")]),
        ] },
      { id: "coupons", icon: "🎟️", title: "Cupons e limite do Pix", where: "Funciona na janela de pagamento e define o preço final cobrado. Nada aparece diretamente na página.", view: "checkout", roots: ["coupons"], kw: "cupom cupons desconto limite pix 500 automático código",
        fields: [
          G("Desconto automático", [
            { t: "num", k: "coupons.limitReais", label: "Limite do Pix", prefix: "R$", step: 1, help: "Valor máximo que a GladePay aceita no Pix (hoje R$ 500)." },
            { t: "num", k: "coupons.autoPercent", label: "Desconto aplicado acima do limite", suffix: "%", step: 1, help: "Planos mais caros que o limite ganham este desconto sozinhos." },
          ]),
          { t: "list", k: "coupons.list", label: "Cupons", help: "O cliente digita o código na janela de pagamento.", add: "Adicionar cupom", titleKey: "code",
            of: [T("code", "Código", "Sem espaços. Ex.: OBA2027"), { t: "num", k: "percent", label: "Desconto", suffix: "%", step: 1 }, { t: "bool", k: "on", label: "Cupom ativo" }] },
          N("Vale o maior desconto entre cupom e desconto automático. Eles não se somam.", "info"),
        ] },
      { id: "thanks", icon: "🙏", title: "Página de obrigado", where: "Página que abre depois do pagamento (endereço /obrigado).", view: "thanks", roots: ["thanks"], kw: "obrigado agradecimento depois pagamento página",
        fields: [T("thanks.title", "Título"), A("thanks.text", "Texto", undefined, 3), T("thanks.button", "Texto do botão"), L("thanks.link", "Para onde o botão leva", "Use / para voltar ao início do site.")] },
    ],
  },
  {
    id: "antigas", icon: "🗄️", title: "Seções antigas", desc: "Blocos guardados (desligados)",
    pages: [
      { id: "mentor", icon: "👤", title: "Quem é o mentor", where: "Seção antiga. Só aparece se você ligá-la em “Ordem das seções”.", sec: "mentor", toggle: "mentor", roots: ["mentor"], kw: "mentor quem é antigo foto",
        fields: [T("mentor.overline", "Texto pequeno acima"), T("mentor.title", "Título"), A("mentor.text", "Texto", undefined, 4), I("mentor.image", "Foto do mentor", "Se vazia, usa a logo."),
          { t: "list", k: "mentor.bullets", label: "Tópicos", add: "Adicionar tópico", of: "text" }] },
      { id: "benefits", icon: "🏛️", title: "Por que vale a carreira", where: "Seção antiga com lista numerada e botão.", sec: "benefits", toggle: "benefits", roots: ["benefits"], kw: "benefícios carreira vale a pena antigo lista",
        fields: [T("benefits.title", "Título"), { t: "list", k: "benefits.items", label: "Benefícios", add: "Adicionar benefício", of: "text" }, T("benefits.button", "Texto do botão"), L("benefits.link", "Para onde leva", undefined, TO_PLANS)] },
      { id: "banner", icon: "🟦", title: "Faixa de destaque", where: "Faixa azul com uma frase. Seção antiga.", sec: "banner", toggle: "banner", roots: ["banner"], kw: "faixa banner azul frase destaque", fields: [T("banner.text", "Frase da faixa")] },
      { id: "faq", icon: "❓", title: "Perguntas frequentes", where: "Seção antiga com perguntas que abrem e fecham.", sec: "faq", toggle: "faq", roots: ["faq"], kw: "perguntas frequentes faq dúvidas",
        fields: [T("faq.title", "Título"), { t: "list", k: "faq.items", label: "Perguntas", add: "Adicionar pergunta", titleKey: "q", of: [T("q", "Pergunta"), A("a", "Resposta", undefined, 3)] }, T("faq.button", "Texto do botão"), L("faq.link", "Para onde leva", undefined, TO_PLANS)] },
      { id: "final", icon: "🔚", title: "Chamada final", where: "Seção antiga com convite final para comprar.", sec: "final", toggle: "final", roots: ["final"], kw: "chamada final cta comprar",
        fields: [T("final.title", "Título"), A("final.text", "Texto", undefined, 3), T("final.button", "Texto do botão"), L("final.link", "Para onde leva", undefined, TO_PLANS)] },
    ],
  },
];

export const ALL_PAGES: Page[] = CATEGORIES.flatMap((c) => c.pages);
export const pageById = (id: string) => ALL_PAGES.find((p) => p.id === id);
export const catOf = (pageId: string) => CATEGORIES.find((c) => c.pages.some((p) => p.id === pageId));

// ---------- utilitários de caminho ----------
/* eslint-disable @typescript-eslint/no-explicit-any */
export const getIn = (o: any, path: string): any => path.split(".").reduce((a, k) => (a == null ? undefined : a[k]), o);
export function setIn(o: any, path: string, v: any): any {
  const [h, ...rest] = path.split(".");
  if (!rest.length) return { ...o, [h]: v };
  return { ...o, [h]: setIn(o?.[h] ?? {}, rest.join("."), v) };
}
const uid = () => "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
export function blankOf(fields: Field[]): any {
  const o: any = {};
  for (const f of fields) {
    if (f.t === "group") Object.assign(o, blankOf(f.fields));
    else if (f.t === "id") o[f.k] = uid();
    else if (f.t === "bool") o[f.k] = false;
    else if (f.t === "num") o[f.k] = 0;
    else if (f.t === "list") o[f.k] = [];
    else if (f.t === "select") o[f.k] = f.opts[0][0];
    else if (f.t !== "note") o[f.k] = "";
  }
  return o;
}
// Todos os caminhos que o painel cobre (para conferir que nada ficou de fora)
export function coveredPaths(fields: Field[], prefix = "", out = new Set<string>()): Set<string> {
  for (const f of fields) {
    if (f.t === "group") coveredPaths(f.fields, prefix, out);
    else if (f.t === "note") continue;
    else if (f.t === "list") { out.add(prefix + f.k); if (Array.isArray(f.of)) coveredPaths(f.of, prefix + f.k + "[].", out); }
    else out.add(prefix + f.k);
  }
  return out;
}