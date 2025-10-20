// Função de mapeamento de categorias para finanças
export function mapCategoriaPrincipalToFinancas(categoria: string): string {
  switch (categoria) {
    case 'Material':
      return 'Materiais de Construção';
    case 'Mão de Obra':
      return 'Mão de Obra';
    case 'Património':
      return 'Equipamentos';
    case 'Custos Indiretos':
      return 'Custos Indiretos';
    default:
      return 'Outros';
  }
}