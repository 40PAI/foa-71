import { useMemo } from "react";

interface SubcategoriaConfig {
  [key: string]: string[];
}

const SUBCATEGORIAS: SubcategoriaConfig = {
  "Materiais de Construção": [
    "Cimento",
    "Areia",
    "Ferro/Aço",
    "Madeira",
    "Materiais Elétricos",
    "Materiais Hidráulicos",
    "Blocos/Tijolos",
    "Revestimentos",
    "Tintas",
    "Outros Materiais"
  ],
  "Mão de Obra": [
    "Pedreiro",
    "Eletricista",
    "Encanador",
    "Carpinteiro",
    "Pintor",
    "Servente",
    "Engenheiro",
    "Mestre de Obras",
    "Outros Profissionais"
  ],
  "Equipamentos": [
    "Betoneira",
    "Andaime",
    "Gerador",
    "Ferramentas Manuais",
    "Ferramentas Elétricas",
    "Equipamentos de Segurança",
    "Veículos",
    "Outros Equipamentos"
  ],
  "Custos Indiretos": [
    "Transporte",
    "Alimentação",
    "Seguros",
    "Taxas e Licenças",
    "Administrativo",
    "Utilidades (Água/Luz)",
    "Limpeza",
    "Segurança",
    "Outros Custos"
  ],
  "Outros": [
    "Diversos"
  ]
};

export function useFinanceSubcategorias(categoria?: string) {
  const subcategorias = useMemo(() => {
    if (!categoria) return [];
    return SUBCATEGORIAS[categoria] || [];
  }, [categoria]);

  return subcategorias;
}
