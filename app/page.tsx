"use client";

import { useMemo, useState } from "react";
import { analisarLexicamente, type Estado } from "@/components/Lexer";

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

export default function Home() {
  const [codigo, setCodigo] = useState(CODIGO_EXEMPLO);

  const resultado = useMemo(() => analisarLexicamente(codigo), [codigo]);

  const fitaTokens = useMemo(
    () =>
      resultado.fitaSaida
        .replace(/^FITA:\s*/, "")
        .replace(/\s*\$$/, "")
        .split(" ")
        .filter(Boolean),
    [resultado.fitaSaida],
  );

  const linhasCodigo = codigo.split("\n").length;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
        <header className="flex flex-col items-center gap-4 text-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
            Compiladores · Projeto 1 · AFD
          </span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Analisador Léxico
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-500">
            Reconhece tokens da linguagem a partir de um AFD. Digite o código
            fonte no editor; a análise é executada em tempo real, produzindo a
            fita de saída, a tabela de símbolos e a lista de erros léxicos.
          </p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-xs text-zinc-500">
                codigo-fonte.se
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden font-mono text-xs text-zinc-500 sm:inline">
                {linhasCodigo} linhas · {codigo.length} caracteres
              </span>
              <button
                onClick={() => setCodigo("")}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
              >
                Limpar
              </button>
              <button
                onClick={() => setCodigo(CODIGO_EXEMPLO)}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
              >
                Restaurar exemplo
              </button>
            </div>
          </div>
          <textarea
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            placeholder="Escreva seu código-fonte aqui..."
            className="block w-full resize-y bg-transparent px-4 py-4 font-mono text-sm leading-7 text-zinc-800 caret-violet-600 outline-none placeholder:text-zinc-400"
            rows={8}
          />
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "Tokens reconhecidos",
              valor: fitaTokens.length,
              cor: "text-sky-600",
              icone: "▸",
            },
            {
              label: "Símbolos na tabela",
              valor: resultado.tabelaSimbolos.length,
              cor: "text-emerald-600",
              icone: "≡",
            },
            {
              label: "Erros léxicos",
              valor: resultado.erros.length,
              cor:
                resultado.erros.length > 0 ? "text-red-600" : "text-zinc-400",
              icone: "!",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 font-mono text-lg ${stat.cor}`}
              >
                {stat.icone}
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-semibold tabular-nums text-zinc-900">
                  {stat.valor}
                </span>
                <span className="text-xs text-zinc-500">{stat.label}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="text-sm font-semibold tracking-wide text-zinc-700">
              Fita de Saída
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Sequência de classes lexemáticas reconhecidas, terminada em $
            </p>
          </div>
          <div className="px-5 py-5">
            <div className="flex flex-wrap items-center gap-2">
              {fitaTokens.length === 0 && (
                <span className="font-mono text-xs text-zinc-400">
                  (sem tokens, aguardando entrada)
                </span>
              )}
              {fitaTokens.map((token, i) => {
                const estado = token as Estado;
                return (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs font-semibold ring-1 ${ESTILO_TOKEN[estado]}`}
                  >
                    {token}
                  </span>
                );
              })}
              <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 font-mono text-xs font-semibold text-zinc-500 ring-1 ring-zinc-200">
                $
              </span>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="text-sm font-semibold tracking-wide text-zinc-700">
              Tabela de Símbolos
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Registros da análise com linha, classe e lexema exato
            </p>
          </div>
          {resultado.tabelaSimbolos.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-zinc-400">
              Nenhum símbolo reconhecido até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-5 py-3 font-medium">#</th>
                    <th className="px-5 py-3 font-medium">Linha</th>
                    <th className="px-5 py-3 font-medium">Identificador</th>
                    <th className="px-5 py-3 font-medium">Token</th>
                    <th className="hidden px-5 py-3 font-medium sm:table-cell">
                      Descrição
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {resultado.tabelaSimbolos.map((item, i) => {
                    const identificador = item.identificador as Estado;
                    return (
                      <tr
                        key={i}
                        className="transition-colors hover:bg-zinc-50"
                      >
                        <td className="px-5 py-3 font-mono text-xs text-zinc-400">
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs text-zinc-500">
                          {item.linha}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-semibold ring-1 ${ESTILO_TOKEN[identificador]}`}
                          >
                            {item.identificador}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-sm text-zinc-800">
                          {item.label}
                        </td>
                        <td className="hidden px-5 py-3 text-zinc-500 sm:table-cell">
                          {DESCRICAO_TOKEN[identificador]}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="text-sm font-semibold tracking-wide text-zinc-700">
              Erros Encontrados
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Tokens que levaram o AFD ao estado de erro
            </p>
          </div>
          {resultado.erros.length === 0 ? (
            <div className="flex items-center gap-3 px-5 py-6">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                ✓
              </span>
              <span className="text-sm text-zinc-500">
                Nenhum erro léxico detectado.
              </span>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {resultado.erros.map((erro, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 px-5 py-3.5 text-sm text-red-700"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-200">
                    !
                  </span>
                  <span className="font-mono text-[13px] leading-5">
                    {erro}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="border-t border-zinc-200 pt-6 text-center text-xs text-zinc-400">
          Análise léxica determinística: AFD com estados finais{" "}
          <span className="font-mono">
            KW_SE, KW_FIM, ID, NUM, OP_ATRIB, OP_SOMA, PONT_PV
          </span>
        </footer>
      </div>
    </div>
  );
}
