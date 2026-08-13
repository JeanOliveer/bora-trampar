import { useEffect, useState } from "react";

const cache = new Map<string, string[]>();

export const useCidades = (uf: string) => {
  const [cidades, setCidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uf) {
      setCidades([]);
      return;
    }
    const cached = cache.get(uf);
    if (cached) {
      setCidades(cached);
      return;
    }
    let ativo = true;
    setLoading(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then((r) => r.json())
      .then((data: { nome: string }[]) => {
        const nomes = data
          .map((m) => m.nome)
          .sort((a, b) => a.localeCompare(b, "pt-BR"));
        cache.set(uf, nomes);
        if (ativo) setCidades(nomes);
      })
      .catch(() => {
        if (ativo) setCidades([]);
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });
    return () => {
      ativo = false;
    };
  }, [uf]);

  return { cidades, loading };
};
