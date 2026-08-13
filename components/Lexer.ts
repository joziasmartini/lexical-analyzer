/**
 * Analisador Léxico (Reconhecedor Léxico) - Projeto 1 (Construção de Compiladores)
 * 
 * Estrutura projetada para fácil integração com React / Next.js.
 */

// 1. DEFINIÇÃO DOS ESTADOS DO AFD
export type Estado =
  | 'S'          // Estado Inicial
  | 'A'          // Prefixo 's'
  | 'B'          // Prefixo 'f'
  | 'C'          // Prefixo 'fi'
  | 'KW_SE'      // Palavra reservada 'se' (Final)
  | 'KW_FIM'     // Palavra reservada 'fim' (Final)
  | 'ID'         // Identificador genérico (Final)
  | 'NUM'        // Constante Numérica (Final)
  | 'OP_ATRIB'   // Operador '=' (Final)
  | 'OP_SOMA'    // Operador '+' (Final)
  | 'PONT_PV'    // Pontuação ';' (Final)
  | 'X';         // Estado de Erro

// Conjunto de Estados Finais (Aceitação)
const ESTADOS_FINAIS: Set<Estado> = new Set([
  'A',
  'B',
  'C',
  'KW_SE',
  'KW_FIM',
  'ID',
  'NUM',
  'OP_ATRIB',
  'OP_SOMA',
  'PONT_PV',
]);

// 2. TIPO DAS ENTRADAS / CATEGORIAS DO ALFABETO
type CategoriaCaractere =
  | 's'
  | 'e'
  | 'f'
  | 'i'
  | 'm'
  | 'L'     // Outras letras (a..z, A..Z exceto s, e, f, i, m)
  | 'D'     // Dígitos (0..9)
  | '='
  | '+'
  | ';'
  | 'OUTRO';

// 3. TABELA DE TRANSIÇÃO DO AFD: AF[EstadoCorrente, Categoria]
const TABELA_TRANSICAO: Record<Estado, Record<CategoriaCaractere, Estado>> = {
  S: {
    s: 'A',
    e: 'ID',
    f: 'B',
    i: 'ID',
    m: 'ID',
    L: 'ID',
    D: 'NUM',
    '=': 'OP_ATRIB',
    '+': 'OP_SOMA',
    ';': 'PONT_PV',
    OUTRO: 'X',
  },
  A: {
    s: 'ID',
    e: 'KW_SE',
    f: 'ID',
    i: 'ID',
    m: 'ID',
    L: 'ID',
    D: 'ID',
    '=': 'X',
    '+': 'X',
    ';': 'X',
    OUTRO: 'X',
  },
  B: {
    s: 'ID',
    e: 'ID',
    f: 'ID',
    i: 'C',
    m: 'ID',
    L: 'ID',
    D: 'ID',
    '=': 'X',
    '+': 'X',
    ';': 'X',
    OUTRO: 'X',
  },
  C: {
    s: 'ID',
    e: 'ID',
    f: 'ID',
    i: 'ID',
    m: 'KW_FIM',
    L: 'ID',
    D: 'ID',
    '=': 'X',
    '+': 'X',
    ';': 'X',
    OUTRO: 'X',
  },
  KW_SE: {
    s: 'ID',
    e: 'ID',
    f: 'ID',
    i: 'ID',
    m: 'ID',
    L: 'ID',
    D: 'ID',
    '=': 'X',
    '+': 'X',
    ';': 'X',
    OUTRO: 'X',
  },
  KW_FIM: {
    s: 'ID',
    e: 'ID',
    f: 'ID',
    i: 'ID',
    m: 'ID',
    L: 'ID',
    D: 'ID',
    '=': 'X',
    '+': 'X',
    ';': 'X',
    OUTRO: 'X',
  },
  ID: {
    s: 'ID',
    e: 'ID',
    f: 'ID',
    i: 'ID',
    m: 'ID',
    L: 'ID',
    D: 'ID',
    '=': 'X',
    '+': 'X',
    ';': 'X',
    OUTRO: 'X',
  },
  NUM: {
    s: 'X',
    e: 'X',
    f: 'X',
    i: 'X',
    m: 'X',
    L: 'X',
    D: 'NUM',
    '=': 'X',
    '+': 'X',
    ';': 'X',
    OUTRO: 'X',
  },
  OP_ATRIB: {
    s: 'X',
    e: 'X',
    f: 'X',
    i: 'X',
    m: 'X',
    L: 'X',
    D: 'X',
    '=': 'X',
    '+': 'X',
    ';': 'X',
    OUTRO: 'X',
  },
  OP_SOMA: {
    s: 'X',
    e: 'X',
    f: 'X',
    i: 'X',
    m: 'X',
    L: 'X',
    D: 'X',
    '=': 'X',
    '+': 'X',
    ';': 'X',
    OUTRO: 'X',
  },
  PONT_PV: {
    s: 'X',
    e: 'X',
    f: 'X',
    i: 'X',
    m: 'X',
    L: 'X',
    D: 'X',
    '=': 'X',
    '+': 'X',
    ';': 'X',
    OUTRO: 'X',
  },
  X: {
    s: 'X',
    e: 'X',
    f: 'X',
    i: 'X',
    m: 'X',
    L: 'X',
    D: 'X',
    '=': 'X',
    '+': 'X',
    ';': 'X',
    OUTRO: 'X',
  },
};

// 4. ESTRUTURAS DE SAÍDA EXIGIDAS
export interface ItemTabelaSimbolos {
  linha: number;
  identificador: Estado; // Rótulo do Estado Final reconhecido (ou 'X' se erro)
  label: string;         // A lexema/cadeia exata lida (ex: "se", "var1", "123")
}

export interface ResultadoAnaliseLexica {
  fitaSaida: string;                    // Ex: "FITA: KW_SE ID OP_ATRIB NUM PONT_PV $"
  tabelaSimbolos: ItemTabelaSimbolos[]; // Registros estruturados da TS
  erros: string[];                      // Detalhamento dos erros encontrados
}

// 5. FUNÇÕES AUXILIARES DE CLASSIFICAÇÃO
function categorizarCaractere(char: string): CategoriaCaractere {
  if (['s', 'e', 'f', 'i', 'm'].includes(char)) {
    return char as CategoriaCaractere;
  }
  if (/[a-zA-Z]/.test(char)) {
    return 'L';
  }
  if (/[0-9]/.test(char)) {
    return 'D';
  }
  if (char === '=') return '=';
  if (char === '+') return '+';
  if (char === ';') return ';';

  return 'OUTRO';
}

function ehSeparador(char: string): boolean {
  // Espaço, Tabulação, Quebra de Linha ou Fim de arquivo
  return char === ' ' || char === '\t' || char === '\n' || char === '\r';
}

// 6. ALGORITMO PRINCIPAL DE RECONHECIMENTO LÉXICO
export function analisarLexicamente(codigoFonte: string): ResultadoAnaliseLexica {
  let estadoCorrente: Estado = 'S';
  let bufferLexema = '';
  let linhaAtual = 1;

  const fitaTokens: string[] = [];
  const tabelaSimbolos: ItemTabelaSimbolos[] = [];
  const erros: string[] = [];

  // Garante que o processamento do último token ocorra adicionando um separador ao final
  const fonteComTerminador = codigoFonte + ' ';

  for (let i = 0; i < fonteComTerminador.length; i++) {
    const simbolo = fonteComTerminador[i];

    // Atualiza contagem de linha
    if (simbolo === '\n') {
      linhaAtual++;
    }

    if (ehSeparador(simbolo)) {
      // Se acumulou caracteres antes de encontrar o separador
      if (bufferLexema.length > 0) {
        // Passo 6: se estado não for de aceitação, define como Estado de Erro 'X'
        let estadoReconhecido = estadoCorrente;
        if (!ESTADOS_FINAIS.has(estadoCorrente)) {
          estadoReconhecido = 'X';
        }

        // Mapeia os estados intermediários de prefixo para 'ID' se forem válidos
        if (['A', 'B', 'C'].includes(estadoReconhecido)) {
          estadoReconhecido = 'ID';
        }

        // Registo de erros
        if (estadoReconhecido === 'X') {
          erros.push(`Erro léxico na linha ${linhaAtual}: token inválido '${bufferLexema}'`);
        }

        // Passo 7: Adiciona à FITA de saída
        fitaTokens.push(estadoReconhecido);

        // Passo 8: Adiciona à Tabela de Símbolos (TS)
        tabelaSimbolos.push({
          linha: linhaAtual,
          identificador: estadoReconhecido,
          label: bufferLexema,
        });

        // Passo 9 & 1: Reseta para o estado inicial S e limpa o buffer
        estadoCorrente = 'S';
        bufferLexema = '';
      }
    } else {
      // Passo 4: Transição de estado com base na tabela
      const categoria = categorizarCaractere(simbolo);
      estadoCorrente = TABELA_TRANSICAO[estadoCorrente][categoria];
      bufferLexema += simbolo;
    }
  }

  // Passo 4 do PDF: Formatação final da FITA: E1 E2 En... $
  const fitaSaida = `FITA: ${fitaTokens.join(' ')} $`;

  return {
    fitaSaida,
    tabelaSimbolos,
    erros,
  };
}
