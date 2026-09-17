"use client";

import { useMemo, useState, useEffect } from "react";
import { type Estado, type ItemTabelaSimbolos } from "@/components/Lexer";

// ============================================================================
// 1. CONFIGURAÇÕES VISUAIS & DADOS MANTIDOS DO SEU DESIGN
// ============================================================================

const CODIGO_EXEMPLO = `se x = 10 ;
fim
se + invalid#token`;

const DESCRICAO_TOKEN: Record<Estado, string> = {
  S: "Estado inicial",
  A: "Prefixo 's'",
  B: "Prefixo 'f'",
  C: "Prefixo 'fi'",
  KW_SE: "Palavra reservada 'se'",
  KW_FIM: "Palavra reservada 'fim'",
  ID: "Identificador",
  NUM: "Constante numérica",
  OP_ATRIB: "Operador de atribuição",
  OP_SOMA: "Operador de soma",
  PONT_PV: "Ponto e vírgula",
  X: "Erro léxico",
};

const ESTILO_TOKEN: Record<Estado, string> = {
  S: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  A: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  B: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  C: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  KW_SE: "bg-violet-50 text-violet-700 ring-violet-200",
  KW_FIM: "bg-violet-50 text-violet-700 ring-violet-200",
  ID: "bg-sky-50 text-sky-700 ring-sky-200",
  NUM: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  OP_ATRIB: "bg-amber-50 text-amber-700 ring-amber-200",
  OP_SOMA: "bg-amber-50 text-amber-700 ring-amber-200",
  PONT_PV: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  X: "bg-red-50 text-red-700 ring-red-200",
};

// Mapeamento dos trechos da função do Lexer para o explicador
type CodeBlockId =
  | "INIT"
  | "LOOP_START"
  | "CHECK_SEPARADOR"
  | "TRANSICAO"
  | "ACCEPT_TOKEN"
  | "ERROR_HANDLE"
  | "FINALIZE";

interface StepTrace {
  id: number;
  char: string;
  charPos: number;
  linhaAtual: number;
  estadoAnterior: Estado;
  estadoAtual: Estado;
  bufferLexema: string;
  codeBlock: CodeBlockId;
  explicacao: string;
  fitaTokens: string[];
  tabelaSimbolos: ItemTabelaSimbolos[];
  erros: string[];
}

// ============================================================================
// 2. SIMULADOR PASSO A PASSO DA FUNÇÃO "analisarLexicamente"
// ============================================================================

function categorizarCaractere(char: string) {
  if (["s", "e", "f", "i", "m"].includes(char)) return char;
  if (/[a-zA-Z]/.test(char)) return "L";
  if (/[0-9]/.test(char)) return "D";
  if (char === "=") return "=";
  if (char === "+") return "+";
  if (char === ";") return ";";
  return "OUTRO";
}

const TABELA_TRANSICAO: Record<string, Record<string, Estado>> = {
  S: {
    s: "A",
    e: "ID",
    f: "B",
    i: "ID",
    m: "ID",
    L: "ID",
    D: "NUM",
    "=": "OP_ATRIB",
    "+": "OP_SOMA",
    ";": "PONT_PV",
    OUTRO: "X",
  },
  A: {
    s: "ID",
    e: "KW_SE",
    f: "ID",
    i: "ID",
    m: "ID",
    L: "ID",
    D: "ID",
    "=": "X",
    "+": "X",
    ";": "X",
    OUTRO: "X",
  },
  B: {
    s: "ID",
    e: "ID",
    f: "ID",
    i: "C",
    m: "ID",
    L: "ID",
    D: "ID",
    "=": "X",
    "+": "X",
    ";": "X",
    OUTRO: "X",
  },
  C: {
    s: "ID",
    e: "ID",
    f: "ID",
    i: "ID",
    m: "KW_FIM",
    L: "ID",
    D: "ID",
    "=": "X",
    "+": "X",
    ";": "X",
    OUTRO: "X",
  },
  KW_SE: {
    s: "ID",
    e: "ID",
    f: "ID",
    i: "ID",
    m: "ID",
    L: "ID",
    D: "ID",
    "=": "X",
    "+": "X",
    ";": "X",
    OUTRO: "X",
  },
  KW_FIM: {
    s: "ID",
    e: "ID",
    f: "ID",
    i: "ID",
    m: "ID",
    L: "ID",
    D: "ID",
    "=": "X",
    "+": "X",
    ";": "X",
    OUTRO: "X",
  },
  ID: {
    s: "ID",
    e: "ID",
    f: "ID",
    i: "ID",
    m: "ID",
    L: "ID",
    D: "ID",
    "=": "X",
    "+": "X",
    ";": "X",
    OUTRO: "X",
  },
  NUM: {
    s: "X",
    e: "X",
    f: "X",
    i: "X",
    m: "X",
    L: "X",
    D: "NUM",
    "=": "X",
    "+": "X",
    ";": "X",
    OUTRO: "X",
  },
  OP_ATRIB: {
    s: "X",
    e: "X",
    f: "X",
    i: "X",
    m: "X",
    L: "X",
    D: "X",
    "=": "X",
    "+": "X",
    ";": "X",
    OUTRO: "X",
  },
  OP_SOMA: {
    s: "X",
    e: "X",
    f: "X",
    i: "X",
    m: "X",
    L: "X",
    D: "X",
    "=": "X",
    "+": "X",
    ";": "X",
    OUTRO: "X",
  },
  PONT_PV: {
    s: "X",
    e: "X",
    f: "X",
    i: "X",
    m: "X",
    L: "X",
    D: "X",
    "=": "X",
    "+": "X",
    ";": "X",
    OUTRO: "X",
  },
  X: {
    s: "X",
    e: "X",
    f: "X",
    i: "X",
    m: "X",
    L: "X",
    D: "X",
    "=": "X",
    "+": "X",
    ";": "X",
    OUTRO: "X",
  },
};

const ESTADOS_FINAIS = new Set<Estado>([
  "A",
  "B",
  "C",
  "KW_SE",
  "KW_FIM",
  "ID",
  "NUM",
  "OP_ATRIB",
  "OP_SOMA",
  "PONT_PV",
]);

function gerarTracePassoAPasso(codigoFonte: string): StepTrace[] {
  const passos: StepTrace[] = [];
  let estadoCorrente: Estado = "S";
  let bufferLexema = "";
  let linhaAtual = 1;
  const fitaTokens: string[] = [];
  const tabelaSimbolos: ItemTabelaSimbolos[] = [];
  const erros: string[] = [];

  const fonte = codigoFonte + " ";
  let stepId = 1;

  // Step inicial
  passos.push({
    id: stepId++,
    char: "^",
    charPos: -1,
    linhaAtual: 1,
    estadoAnterior: "S",
    estadoAtual: "S",
    bufferLexema: "",
    codeBlock: "INIT",
    explicacao:
      "Inicializando variáveis: estadoCorrente = 'S', bufferLexema = ''",
    fitaTokens: [],
    tabelaSimbolos: [],
    erros: [],
  });

  for (let i = 0; i < fonte.length; i++) {
    const simbolo = fonte[i];
    if (simbolo === "\n") linhaAtual++;

    const ehSep =
      simbolo === " " ||
      simbolo === "\t" ||
      simbolo === "\n" ||
      simbolo === "\r";

    if (ehSep) {
      if (bufferLexema.length > 0) {
        let estadoReconhecido = estadoCorrente;
        if (!ESTADOS_FINAIS.has(estadoCorrente)) estadoReconhecido = "X";
        if (["A", "B", "C"].includes(estadoReconhecido))
          estadoReconhecido = "ID";

        const isError = estadoReconhecido === "X";
        if (isError) {
          erros.push(
            `Erro léxico na linha ${linhaAtual}: token inválido '${bufferLexema}'`,
          );
        }

        fitaTokens.push(estadoReconhecido);
        tabelaSimbolos.push({
          linha: linhaAtual,
          identificador: estadoReconhecido,
          label: bufferLexema,
        });

        passos.push({
          id: stepId++,
          char: simbolo === "\n" ? "\\n" : simbolo === " " ? "ESPAÇO" : simbolo,
          charPos: i,
          linhaAtual,
          estadoAnterior: estadoCorrente,
          estadoAtual: "S",
          bufferLexema,
          codeBlock: isError ? "ERROR_HANDLE" : "ACCEPT_TOKEN",
          explicacao: isError
            ? `Separador encontrado! O estado '${estadoCorrente}' não é final. Erro gerado para '${bufferLexema}'.`
            : `Separador encontrado! Token '${bufferLexema}' aceito como '${estadoReconhecido}' e gravado na TS.`,
          fitaTokens: [...fitaTokens],
          tabelaSimbolos: [...tabelaSimbolos],
          erros: [...erros],
        });

        estadoCorrente = "S";
        bufferLexema = "";
      }
    } else {
      const cat = categorizarCaractere(simbolo);
      const novoEstado = (TABELA_TRANSICAO[estadoCorrente]?.[cat] ||
        "X") as Estado;
      const estadoAnt = estadoCorrente;
      estadoCorrente = novoEstado;
      bufferLexema += simbolo;

      passos.push({
        id: stepId++,
        char: simbolo,
        charPos: i,
        linhaAtual,
        estadoAnterior: estadoAnt,
        estadoAtual: novoEstado,
        bufferLexema,
        codeBlock: "TRANSICAO",
        explicacao: `Caractere '${simbolo}' (Categoria '${cat}') moveu o AFD de '${estadoAnt}' -> '${novoEstado}'. Buffer acumulado: "${bufferLexema}".`,
        fitaTokens: [...fitaTokens],
        tabelaSimbolos: [...tabelaSimbolos],
        erros: [...erros],
      });
    }
  }

  passos.push({
    id: stepId++,
    char: "$",
    charPos: fonte.length,
    linhaAtual,
    estadoAnterior: "S",
    estadoAtual: "S",
    bufferLexema: "",
    codeBlock: "FINALIZE",
    explicacao:
      "Análise concluída! A fita de tokens e a tabela de símbolos foram finalizadas com o terminador '$'.",
    fitaTokens: [...fitaTokens],
    tabelaSimbolos: [...tabelaSimbolos],
    erros: [...erros],
  });

  return passos;
}

// ============================================================================
// 3. COMPONENTE DA PÁGINA COM NOVA ESTRUTURA E MESMAS REGRAS DE DESIGN
// ============================================================================

export default function LexerStepByStepHome() {
  const [codigo, setCodigo] = useState(CODIGO_EXEMPLO);
  const [passoIndex, setPassoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Gera todo o log de execução passo a passo
  const passos = useMemo(() => gerarTracePassoAPasso(codigo), [codigo]);
  const passoAtual = passos[passoIndex] || passos[0];

  // Auto-play do algoritmo
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && passoIndex < passos.length - 1) {
      timer = setTimeout(() => {
        setPassoIndex((prev) => prev + 1);
      }, 700);
    } else if (passoIndex >= passos.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, passoIndex, passos.length]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
        {/* HEADER COM IDENTIDADE MANTIDA */}
        <header className="flex flex-col items-center justify-between gap-4 border-b border-zinc-200 pb-6 text-center sm:flex-row sm:text-left">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600 animate-pulse" />
              Execução Visual Passo a Passo
            </span>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Como a Função Lexer Processa o Código
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCodigo(CODIGO_EXEMPLO);
                setPassoIndex(0);
              }}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 shadow-sm"
            >
              Restaurar Exemplo
            </button>
            <button
              onClick={() => {
                setCodigo("");
                setPassoIndex(0);
              }}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 shadow-sm"
            >
              Limpar
            </button>
          </div>
        </header>

        {/* NOVA ESTRUTURA: SPLIT SCREEN (IDE + DEPURADOR) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* PAINEL ESQUERDO: EDITOR + INSPECTOR DE ESTADO (5 cols) */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            {/* Contêiner de Entrada com Inspeção Dinâmica de Posição */}
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  <span className="ml-2 font-mono text-xs text-zinc-500">
                    Entrada do Usuário
                  </span>
                </div>
                <span className="font-mono text-xs text-zinc-400">
                  {codigo.length} chars
                </span>
              </div>

              <textarea
                value={codigo}
                onChange={(e) => {
                  setCodigo(e.target.value);
                  setPassoIndex(0);
                }}
                spellCheck={false}
                placeholder="Escreva seu código-fonte aqui..."
                className="block w-full resize-none bg-transparent px-4 py-3 font-mono text-sm leading-6 text-zinc-800 outline-none placeholder:text-zinc-400"
                rows={4}
              />

              {/* Fita Visual do Ponteiro de Leitura */}
              <div className="border-t border-zinc-100 bg-zinc-50/50 p-3">
                <span className="mb-2 block text-xs font-medium text-zinc-500">
                  Leitor de Caractere (Ponteiro do Loop):
                </span>
                <div className="flex flex-wrap gap-1 font-mono text-xs">
                  {codigo.split("").map((c, idx) => {
                    const isCurrent = idx === passoAtual.charPos;
                    return (
                      <span
                        key={idx}
                        className={`inline-flex h-6 min-w-[20px] items-center justify-center rounded border px-1 ${
                          isCurrent
                            ? "border-violet-300 bg-violet-600 text-white font-bold ring-2 ring-violet-200"
                            : "border-zinc-200 bg-white text-zinc-600"
                        }`}
                      >
                        {c === " " ? "␣" : c === "\n" ? "↵" : c}
                      </span>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* BARRA DE CONTROLE DO PASSO A PASSO (PLAYER) */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Controle do Algoritmo
                </span>
                <span className="font-mono text-xs font-semibold text-zinc-700">
                  Passo {passoIndex + 1} / {passos.length}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setPassoIndex(0)}
                  disabled={passoIndex === 0}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-40"
                >
                  ⏮
                </button>
                <button
                  onClick={() => setPassoIndex((p) => Math.max(0, p - 1))}
                  disabled={passoIndex === 0}
                  className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
                >
                  ◀ Anterior
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
                >
                  {isPlaying ? "⏸ Pausar" : "▶ Auto Play"}
                </button>
                <button
                  onClick={() =>
                    setPassoIndex((p) => Math.min(passos.length - 1, p + 1))
                  }
                  disabled={passoIndex >= passos.length - 1}
                  className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
                >
                  Próximo ▶
                </button>
              </div>

              {/* Barra de Progresso */}
              <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className="h-full bg-violet-600 transition-all duration-200"
                  style={{
                    width: `${((passoIndex + 1) / passos.length) * 100}%`,
                  }}
                />
              </div>
            </section>

            {/* ESTADO INTERNO DO COMPILADOR NESTE PASSO */}
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-4">
                Estado Atual da Memória
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <span className="block text-[11px] text-zinc-400">
                    Estado Anterior
                  </span>
                  <span className="font-mono text-sm font-semibold text-zinc-700">
                    {passoAtual.estadoAnterior}
                  </span>
                </div>
                <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3">
                  <span className="block text-[11px] text-violet-600">
                    Estado Atual
                  </span>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-semibold ring-1 ${ESTILO_TOKEN[passoAtual.estadoAtual]}`}
                  >
                    {passoAtual.estadoAtual}
                  </span>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <span className="block text-[11px] text-zinc-400">
                    Caractere Lido
                  </span>
                  <span className="font-mono text-sm font-semibold text-zinc-800">
                    "{passoAtual.char}"
                  </span>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <span className="block text-[11px] text-zinc-400">
                    Buffer Acumulado
                  </span>
                  <span className="font-mono text-sm font-bold text-zinc-900">
                    "{passoAtual.bufferLexema}"
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* PAINEL DIREITO: VISUALIZADOR DE CÓDIGO & ESTRUTURA DE SAÍDA (7 cols) */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            {/* CÓDIGO DA FUNÇÃO COM HIGHLIGHT NO BLOCO ATIVO */}
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-3.5 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-700">
                    Trecho em Execução:{" "}
                    <span className="font-mono text-xs text-violet-600">
                      analisarLexicamente()
                    </span>
                  </h2>
                </div>
                <span className="rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-[11px] text-zinc-500">
                  {passoAtual.codeBlock}
                </span>
              </div>

              {/* Mapeamento dos trechos de código em TS */}
              <div className="p-4 bg-zinc-900 font-mono text-xs text-zinc-300 leading-6 overflow-x-auto">
                <div
                  className={`px-2 py-1 rounded transition-colors ${passoAtual.codeBlock === "INIT" ? "bg-violet-950/80 text-violet-200 border-l-2 border-violet-400" : "opacity-40"}`}
                >
                  let estadoCorrente: Estado = 'S'; let bufferLexema = '';
                </div>
                <div
                  className={`px-2 py-1 rounded transition-colors ${passoAtual.codeBlock === "TRANSICAO" ? "bg-violet-950/80 text-violet-200 border-l-2 border-violet-400" : "opacity-40"}`}
                >
                  const categoria = categorizarCaractere(simbolo);
                  <br />
                  estadoCorrente = TABELA_TRANSICAO[estadoCorrente][categoria];
                  <br />
                  bufferLexema += simbolo;
                </div>
                <div
                  className={`px-2 py-1 rounded transition-colors ${passoAtual.codeBlock === "ACCEPT_TOKEN" ? "bg-violet-950/80 text-violet-200 border-l-2 border-violet-400" : "opacity-40"}`}
                >
                  if (ehSeparador(simbolo)) &#123;
                  <br />
                  &nbsp;&nbsp;fitaTokens.push(estadoReconhecido);
                  <br />
                  &nbsp;&nbsp;tabelaSimbolos.push(&#123; linha, identificador,
                  label &#125;);
                  <br />
                  &#125;
                </div>
                <div
                  className={`px-2 py-1 rounded transition-colors ${passoAtual.codeBlock === "ERROR_HANDLE" ? "bg-red-950/80 text-red-200 border-l-2 border-red-400" : "opacity-40"}`}
                >
                  if (estadoReconhecido === 'X') erros.push(`Erro léxico...`);
                </div>
              </div>

              {/* Explicação Didática da Ação */}
              <div className="border-t border-zinc-200 bg-zinc-50 p-4 flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                  i
                </span>
                <p className="text-xs leading-5 text-zinc-600">
                  {passoAtual.explicacao}
                </p>
              </div>
            </section>

            {/* FITA DE SAÍDA INCREMENTAL */}
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-200 px-5 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Fita de Saída Gerada
                </h2>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {passoAtual.fitaTokens.length === 0 ? (
                    <span className="font-mono text-xs text-zinc-400">
                      (Nenhum token gravado ainda)
                    </span>
                  ) : (
                    passoAtual.fitaTokens.map((token, i) => {
                      const estado = token as Estado;
                      return (
                        <span
                          key={i}
                          className={`inline-flex items-center rounded-md px-2.5 py-1 font-mono text-xs font-semibold ring-1 ${ESTILO_TOKEN[estado]}`}
                        >
                          {token}
                        </span>
                      );
                    })
                  )}
                  {passoAtual.codeBlock === "FINALIZE" && (
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 font-mono text-xs font-semibold text-zinc-500 ring-1 ring-zinc-200">
                      $
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* TABELA DE SÍMBOLOS DINÂMICA */}
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="border-b border-zinc-200 px-5 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Tabela de Símbolos (TS)
                </h2>
              </div>
              {passoAtual.tabelaSimbolos.length === 0 ? (
                <div className="p-6 text-center font-mono text-xs text-zinc-400">
                  A Tabela de Símbolos está vazia neste passo.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-400 uppercase tracking-wider">
                        <th className="px-5 py-2.5 font-medium">Linha</th>
                        <th className="px-5 py-2.5 font-medium">Lexema</th>
                        <th className="px-5 py-2.5 font-medium">
                          Identificador
                        </th>
                        <th className="px-5 py-2.5 font-medium">Descrição</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-mono">
                      {passoAtual.tabelaSimbolos.map((item, i) => {
                        const id = item.identificador as Estado;
                        return (
                          <tr key={i} className="hover:bg-zinc-50">
                            <td className="px-5 py-2 text-zinc-400">
                              {item.linha}
                            </td>
                            <td className="px-5 py-2 font-bold text-zinc-800">
                              {item.label}
                            </td>
                            <td className="px-5 py-2">
                              <span
                                className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold ring-1 ${ESTILO_TOKEN[id]}`}
                              >
                                {item.identificador}
                              </span>
                            </td>
                            <td className="px-5 py-2 font-sans text-zinc-500">
                              {DESCRICAO_TOKEN[id]}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="border-t border-zinc-200 pt-6 text-center text-xs text-zinc-400">
          Compiladores · Visualizador de Execução do Analisador Léxico
        </footer>
      </div>
    </div>
  );
}
