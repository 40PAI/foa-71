export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alocacao_mensal_colaboradores: {
        Row: {
          ano: number
          ativo: boolean
          colaborador_id: number
          created_at: string
          funcao: string
          horario_tipo: string
          id: string
          mes: number
          projeto_id: number
          updated_at: string
        }
        Insert: {
          ano: number
          ativo?: boolean
          colaborador_id: number
          created_at?: string
          funcao: string
          horario_tipo?: string
          id?: string
          mes: number
          projeto_id: number
          updated_at?: string
        }
        Update: {
          ano?: number
          ativo?: boolean
          colaborador_id?: number
          created_at?: string
          funcao?: string
          horario_tipo?: string
          id?: string
          mes?: number
          projeto_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_alocacao_mensal_colaborador"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alocacao_mensal_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_alocacao_mensal_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      auditoria_movimentos: {
        Row: {
          created_at: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          movimento_id: string | null
          operacao: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          movimento_id?: string | null
          operacao: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          movimento_id?: string | null
          operacao?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      centros_custo: {
        Row: {
          ativo: boolean
          codigo: string
          created_at: string
          departamento: string | null
          etapa_id: number | null
          id: string
          nome: string
          orcamento_mensal: number | null
          projeto_id: number | null
          responsavel_id: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: string
          created_at?: string
          departamento?: string | null
          etapa_id?: number | null
          id?: string
          nome: string
          orcamento_mensal?: number | null
          projeto_id?: number | null
          responsavel_id?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string
          created_at?: string
          departamento?: string | null
          etapa_id?: number | null
          id?: string
          nome?: string
          orcamento_mensal?: number | null
          projeto_id?: number | null
          responsavel_id?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "centros_custo_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas_projeto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centros_custo_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centros_custo_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      clientes: {
        Row: {
          cidade: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          nif: string | null
          nome: string
          observacoes: string | null
          projeto_id: number | null
          provincia: string | null
          responsavel_id: string | null
          status: string
          telefone: string | null
          tipo_cliente: string | null
          updated_at: string | null
        }
        Insert: {
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nif?: string | null
          nome: string
          observacoes?: string | null
          projeto_id?: number | null
          provincia?: string | null
          responsavel_id?: string | null
          status?: string
          telefone?: string | null
          tipo_cliente?: string | null
          updated_at?: string | null
        }
        Update: {
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nif?: string | null
          nome?: string
          observacoes?: string | null
          projeto_id?: number | null
          provincia?: string | null
          responsavel_id?: string | null
          status?: string
          telefone?: string | null
          tipo_cliente?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "clientes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      colaboradores: {
        Row: {
          bi: string | null
          cargo: string
          categoria: Database["public"]["Enums"]["categoria_colaborador"]
          created_at: string | null
          custo_hora: number
          cv_link: string | null
          hora_entrada: string | null
          hora_saida: string | null
          id: number
          morada: string | null
          nome: string
          numero_funcional: string | null
          offline_token: string | null
          projeto_id: number | null
          tipo_colaborador: string | null
          updated_at: string | null
        }
        Insert: {
          bi?: string | null
          cargo: string
          categoria: Database["public"]["Enums"]["categoria_colaborador"]
          created_at?: string | null
          custo_hora?: number
          cv_link?: string | null
          hora_entrada?: string | null
          hora_saida?: string | null
          id?: number
          morada?: string | null
          nome: string
          numero_funcional?: string | null
          offline_token?: string | null
          projeto_id?: number | null
          tipo_colaborador?: string | null
          updated_at?: string | null
        }
        Update: {
          bi?: string | null
          cargo?: string
          categoria?: Database["public"]["Enums"]["categoria_colaborador"]
          created_at?: string | null
          custo_hora?: number
          cv_link?: string | null
          hora_entrada?: string | null
          hora_saida?: string | null
          id?: number
          morada?: string | null
          nome?: string
          numero_funcional?: string | null
          offline_token?: string | null
          projeto_id?: number | null
          tipo_colaborador?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_colaboradores_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_colaboradores_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      colaboradores_projetos: {
        Row: {
          colaborador_id: number
          created_at: string | null
          data_alocacao: string
          funcao: string
          horario_tipo: string
          id: string
          projeto_id: number
          updated_at: string | null
        }
        Insert: {
          colaborador_id: number
          created_at?: string | null
          data_alocacao?: string
          funcao: string
          horario_tipo: string
          id?: string
          projeto_id: number
          updated_at?: string | null
        }
        Update: {
          colaborador_id?: number
          created_at?: string | null
          data_alocacao?: string
          funcao?: string
          horario_tipo?: string
          id?: string
          projeto_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colaboradores_projetos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_colaboradores_projetos_colaborador"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_colaboradores_projetos_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_colaboradores_projetos_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      configuracoes_foa: {
        Row: {
          chave: string
          created_at: string | null
          descricao: string | null
          id: string
          updated_at: string | null
          valor_numerico: number | null
          valor_texto: string | null
        }
        Insert: {
          chave: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          updated_at?: string | null
          valor_numerico?: number | null
          valor_texto?: string | null
        }
        Update: {
          chave?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          updated_at?: string | null
          valor_numerico?: number | null
          valor_texto?: string | null
        }
        Relationships: []
      }
      contas_correntes_fornecedores: {
        Row: {
          categoria: string | null
          created_at: string | null
          data_vencimento: string | null
          descricao: string | null
          fornecedor_id: string | null
          id: string
          projeto_id: number | null
          saldo_inicial: number | null
          updated_at: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          fornecedor_id?: string | null
          id?: string
          projeto_id?: number | null
          saldo_inicial?: number | null
          updated_at?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          data_vencimento?: string | null
          descricao?: string | null
          fornecedor_id?: string | null
          id?: string
          projeto_id?: number | null
          saldo_inicial?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_correntes_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_correntes_fornecedores_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_correntes_fornecedores_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      contratos_clientes: {
        Row: {
          cliente_id: string
          created_at: string | null
          data_inicio: string
          data_termino: string | null
          data_ultimo_recebimento: string | null
          descricao_servicos: string
          documento_contrato_url: string | null
          frequencia_faturacao: string | null
          id: string
          metodo_pagamento: string | null
          numero_contrato: string | null
          observacoes: string | null
          prazo_pagamento_dias: number | null
          projeto_id: number | null
          responsavel_id: string | null
          saldo_receber: number | null
          status: string
          updated_at: string | null
          valor_contratado: number
          valor_recebido: number | null
        }
        Insert: {
          cliente_id: string
          created_at?: string | null
          data_inicio: string
          data_termino?: string | null
          data_ultimo_recebimento?: string | null
          descricao_servicos: string
          documento_contrato_url?: string | null
          frequencia_faturacao?: string | null
          id?: string
          metodo_pagamento?: string | null
          numero_contrato?: string | null
          observacoes?: string | null
          prazo_pagamento_dias?: number | null
          projeto_id?: number | null
          responsavel_id?: string | null
          saldo_receber?: number | null
          status?: string
          updated_at?: string | null
          valor_contratado: number
          valor_recebido?: number | null
        }
        Update: {
          cliente_id?: string
          created_at?: string | null
          data_inicio?: string
          data_termino?: string | null
          data_ultimo_recebimento?: string | null
          descricao_servicos?: string
          documento_contrato_url?: string | null
          frequencia_faturacao?: string | null
          id?: string
          metodo_pagamento?: string | null
          numero_contrato?: string | null
          observacoes?: string | null
          prazo_pagamento_dias?: number | null
          projeto_id?: number | null
          responsavel_id?: string | null
          saldo_receber?: number | null
          status?: string
          updated_at?: string | null
          valor_contratado?: number
          valor_recebido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_clientes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_clientes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_clientes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "contratos_clientes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos_fornecedores: {
        Row: {
          condicao_pagamento: string | null
          created_at: string | null
          data_inicio: string
          data_termino: string | null
          data_ultimo_pagamento: string | null
          descricao_produtos_servicos: string
          documento_contrato_url: string | null
          fornecedor_id: string
          id: string
          metodo_pagamento: string | null
          notas_fiscais: Json | null
          numero_contrato: string | null
          observacoes: string | null
          projeto_id: number | null
          responsavel_id: string | null
          saldo_pagar: number | null
          status: string
          updated_at: string | null
          valor_contratado: number
          valor_pago: number | null
        }
        Insert: {
          condicao_pagamento?: string | null
          created_at?: string | null
          data_inicio: string
          data_termino?: string | null
          data_ultimo_pagamento?: string | null
          descricao_produtos_servicos: string
          documento_contrato_url?: string | null
          fornecedor_id: string
          id?: string
          metodo_pagamento?: string | null
          notas_fiscais?: Json | null
          numero_contrato?: string | null
          observacoes?: string | null
          projeto_id?: number | null
          responsavel_id?: string | null
          saldo_pagar?: number | null
          status?: string
          updated_at?: string | null
          valor_contratado: number
          valor_pago?: number | null
        }
        Update: {
          condicao_pagamento?: string | null
          created_at?: string | null
          data_inicio?: string
          data_termino?: string | null
          data_ultimo_pagamento?: string | null
          descricao_produtos_servicos?: string
          documento_contrato_url?: string | null
          fornecedor_id?: string
          id?: string
          metodo_pagamento?: string | null
          notas_fiscais?: Json | null
          numero_contrato?: string | null
          observacoes?: string | null
          projeto_id?: number | null
          responsavel_id?: string | null
          saldo_pagar?: number | null
          status?: string
          updated_at?: string | null
          valor_contratado?: number
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contratos_fornecedores_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_fornecedores_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_fornecedores_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "contratos_fornecedores_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_kpis: {
        Row: {
          absentismo_percentual: number
          avanco_financeiro_real: number
          avanco_fisico_real: number
          created_at: string | null
          data_calculo: string
          desvio_prazo_dias: number
          id: number
          lead_time_compras_medio: number
          projeto_id: number | null
          status_alerta: string
          updated_at: string | null
        }
        Insert: {
          absentismo_percentual?: number
          avanco_financeiro_real?: number
          avanco_fisico_real?: number
          created_at?: string | null
          data_calculo?: string
          desvio_prazo_dias?: number
          id?: number
          lead_time_compras_medio?: number
          projeto_id?: number | null
          status_alerta?: string
          updated_at?: string | null
        }
        Update: {
          absentismo_percentual?: number
          avanco_financeiro_real?: number
          avanco_fisico_real?: number
          created_at?: string | null
          data_calculo?: string
          desvio_prazo_dias?: number
          id?: number
          lead_time_compras_medio?: number
          projeto_id?: number | null
          status_alerta?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_dashboard_kpis_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_dashboard_kpis_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      documentos_projeto: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: number
          nome_arquivo: string
          projeto_id: number
          tamanho_bytes: number
          tipo_arquivo: string
          updated_at: string | null
          uploaded_by: string | null
          url_arquivo: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: number
          nome_arquivo: string
          projeto_id: number
          tamanho_bytes: number
          tipo_arquivo: string
          updated_at?: string | null
          uploaded_by?: string | null
          url_arquivo: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: number
          nome_arquivo?: string
          projeto_id?: number
          tamanho_bytes?: number
          tipo_arquivo?: string
          updated_at?: string | null
          uploaded_by?: string | null
          url_arquivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_projeto_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_projeto_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      dre_linhas: {
        Row: {
          ano: number
          centro_custo_id: string | null
          created_at: string | null
          custos_totais: number | null
          foa_auto: number | null
          fof_financiamento: number | null
          id: string
          mes: number
          projeto_id: number
          receita_cliente: number | null
          resultado: number | null
          updated_at: string | null
        }
        Insert: {
          ano: number
          centro_custo_id?: string | null
          created_at?: string | null
          custos_totais?: number | null
          foa_auto?: number | null
          fof_financiamento?: number | null
          id?: string
          mes: number
          projeto_id: number
          receita_cliente?: number | null
          resultado?: number | null
          updated_at?: string | null
        }
        Update: {
          ano?: number
          centro_custo_id?: string | null
          created_at?: string | null
          custos_totais?: number | null
          foa_auto?: number | null
          fof_financiamento?: number | null
          id?: string
          mes?: number
          projeto_id?: number
          receita_cliente?: number | null
          resultado?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dre_linhas_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dre_linhas_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "saldos_centros_custo"
            referencedColumns: ["centro_custo_id"]
          },
          {
            foreignKeyName: "dre_linhas_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "vw_cost_center_balances_extended"
            referencedColumns: ["centro_custo_id"]
          },
          {
            foreignKeyName: "dre_linhas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dre_linhas_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      epis: {
        Row: {
          codigo: string
          created_at: string | null
          descricao: string
          estoque_atual: number
          estoque_minimo: number
          id: number
          tarefa_relacionada: string
          updated_at: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          descricao: string
          estoque_atual?: number
          estoque_minimo?: number
          id?: number
          tarefa_relacionada: string
          updated_at?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          descricao?: string
          estoque_atual?: number
          estoque_minimo?: number
          id?: number
          tarefa_relacionada?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      etapas_projeto: {
        Row: {
          created_at: string | null
          data_fim_prevista_etapa: string | null
          data_inicio_etapa: string | null
          gasto_etapa: number | null
          id: number
          nome_etapa: string
          numero_etapa: number
          observacoes: string | null
          orcamento_etapa: number | null
          projeto_id: number
          responsavel_etapa: string
          status_etapa: Database["public"]["Enums"]["status_etapa_enum"]
          tempo_previsto_dias: number | null
          tempo_real_dias: number | null
          tipo_etapa: Database["public"]["Enums"]["tipo_etapa_enum"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim_prevista_etapa?: string | null
          data_inicio_etapa?: string | null
          gasto_etapa?: number | null
          id?: number
          nome_etapa: string
          numero_etapa: number
          observacoes?: string | null
          orcamento_etapa?: number | null
          projeto_id: number
          responsavel_etapa: string
          status_etapa?: Database["public"]["Enums"]["status_etapa_enum"]
          tempo_previsto_dias?: number | null
          tempo_real_dias?: number | null
          tipo_etapa?: Database["public"]["Enums"]["tipo_etapa_enum"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim_prevista_etapa?: string | null
          data_inicio_etapa?: string | null
          gasto_etapa?: number | null
          id?: number
          nome_etapa?: string
          numero_etapa?: number
          observacoes?: string | null
          orcamento_etapa?: number | null
          projeto_id?: number
          responsavel_etapa?: string
          status_etapa?: Database["public"]["Enums"]["status_etapa_enum"]
          tempo_previsto_dias?: number | null
          tempo_real_dias?: number | null
          tipo_etapa?: Database["public"]["Enums"]["tipo_etapa_enum"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_etapas_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_etapas_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      fichas_tecnicas: {
        Row: {
          aprovado_por: string | null
          created_at: string | null
          data_aprovacao: string | null
          id: number
          id_material: number | null
          pdf_url: string | null
          status: Database["public"]["Enums"]["status_ficha"]
          updated_at: string | null
        }
        Insert: {
          aprovado_por?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          id?: number
          id_material?: number | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["status_ficha"]
          updated_at?: string | null
        }
        Update: {
          aprovado_por?: string | null
          created_at?: string | null
          data_aprovacao?: string | null
          id?: number
          id_material?: number | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["status_ficha"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fichas_tecnicas_id_material_fkey"
            columns: ["id_material"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_fichas_tecnicas_material"
            columns: ["id_material"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      financas: {
        Row: {
          categoria: string
          centro_custo: string | null
          centro_custo_id: string | null
          comprovantes: Json | null
          created_at: string | null
          data_despesa: string | null
          data_pagamento: string | null
          etapa_id: number | null
          forma_pagamento: string | null
          fornecedor: string | null
          gasto: number
          id: number
          id_projeto: number | null
          justificativa: string | null
          numero_nf: string | null
          numero_parcelas: number | null
          observacoes: string | null
          orcamentado: number
          prazo_pagamento: string | null
          prioridade: string | null
          requer_aprovacao_direcao: boolean | null
          requisicao_id: number | null
          responsavel_id: string | null
          status_aprovacao: string | null
          subcategoria: string | null
          tarefa_id: number | null
          tipo_despesa: string | null
          updated_at: string | null
          valor_parcela: number | null
        }
        Insert: {
          categoria: string
          centro_custo?: string | null
          centro_custo_id?: string | null
          comprovantes?: Json | null
          created_at?: string | null
          data_despesa?: string | null
          data_pagamento?: string | null
          etapa_id?: number | null
          forma_pagamento?: string | null
          fornecedor?: string | null
          gasto?: number
          id?: number
          id_projeto?: number | null
          justificativa?: string | null
          numero_nf?: string | null
          numero_parcelas?: number | null
          observacoes?: string | null
          orcamentado?: number
          prazo_pagamento?: string | null
          prioridade?: string | null
          requer_aprovacao_direcao?: boolean | null
          requisicao_id?: number | null
          responsavel_id?: string | null
          status_aprovacao?: string | null
          subcategoria?: string | null
          tarefa_id?: number | null
          tipo_despesa?: string | null
          updated_at?: string | null
          valor_parcela?: number | null
        }
        Update: {
          categoria?: string
          centro_custo?: string | null
          centro_custo_id?: string | null
          comprovantes?: Json | null
          created_at?: string | null
          data_despesa?: string | null
          data_pagamento?: string | null
          etapa_id?: number | null
          forma_pagamento?: string | null
          fornecedor?: string | null
          gasto?: number
          id?: number
          id_projeto?: number | null
          justificativa?: string | null
          numero_nf?: string | null
          numero_parcelas?: number | null
          observacoes?: string | null
          orcamentado?: number
          prazo_pagamento?: string | null
          prioridade?: string | null
          requer_aprovacao_direcao?: boolean | null
          requisicao_id?: number | null
          responsavel_id?: string | null
          status_aprovacao?: string | null
          subcategoria?: string | null
          tarefa_id?: number | null
          tipo_despesa?: string | null
          updated_at?: string | null
          valor_parcela?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financas_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financas_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "saldos_centros_custo"
            referencedColumns: ["centro_custo_id"]
          },
          {
            foreignKeyName: "financas_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "vw_cost_center_balances_extended"
            referencedColumns: ["centro_custo_id"]
          },
          {
            foreignKeyName: "financas_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas_projeto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financas_requisicao_id_fkey"
            columns: ["requisicao_id"]
            isOneToOne: false
            referencedRelation: "requisicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financas_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas_lean"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_financas_projeto"
            columns: ["id_projeto"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_financas_projeto"
            columns: ["id_projeto"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      fluxo_caixa: {
        Row: {
          categoria: string
          comprovante_url: string | null
          created_at: string | null
          data_movimento: string
          descricao: string
          etapa_id: number | null
          forma_pagamento: string | null
          fornecedor_beneficiario: string | null
          id: string
          numero_documento: string | null
          observacoes: string | null
          projeto_id: number
          responsavel_id: string | null
          subcategoria: string | null
          tarefa_id: number | null
          tipo_movimento: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          categoria: string
          comprovante_url?: string | null
          created_at?: string | null
          data_movimento?: string
          descricao: string
          etapa_id?: number | null
          forma_pagamento?: string | null
          fornecedor_beneficiario?: string | null
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          projeto_id: number
          responsavel_id?: string | null
          subcategoria?: string | null
          tarefa_id?: number | null
          tipo_movimento: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          categoria?: string
          comprovante_url?: string | null
          created_at?: string | null
          data_movimento?: string
          descricao?: string
          etapa_id?: number | null
          forma_pagamento?: string | null
          fornecedor_beneficiario?: string | null
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          projeto_id?: number
          responsavel_id?: string | null
          subcategoria?: string | null
          tarefa_id?: number | null
          tipo_movimento?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fluxo_caixa_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas_projeto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fluxo_caixa_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fluxo_caixa_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "fluxo_caixa_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fluxo_caixa_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas_lean"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedor_documentos: {
        Row: {
          created_at: string
          fornecedor_id: string
          id: string
          nome_arquivo: string
          storage_path: string
          tamanho_bytes: number | null
          tipo_documento: string | null
          updated_at: string
          uploaded_by: string | null
          url_documento: string | null
        }
        Insert: {
          created_at?: string
          fornecedor_id: string
          id?: string
          nome_arquivo: string
          storage_path: string
          tamanho_bytes?: number | null
          tipo_documento?: string | null
          updated_at?: string
          uploaded_by?: string | null
          url_documento?: string | null
        }
        Update: {
          created_at?: string
          fornecedor_id?: string
          id?: string
          nome_arquivo?: string
          storage_path?: string
          tamanho_bytes?: number | null
          tipo_documento?: string | null
          updated_at?: string
          uploaded_by?: string | null
          url_documento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fornecedor_documentos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          avaliacao_qualidade: number | null
          categoria_principal: string | null
          cidade: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          nif: string | null
          nome: string
          observacoes: string | null
          provincia: string | null
          recorrencia: string | null
          responsavel_id: string | null
          status: string
          telefone: string | null
          tipo_fornecedor: string | null
          updated_at: string | null
        }
        Insert: {
          avaliacao_qualidade?: number | null
          categoria_principal?: string | null
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nif?: string | null
          nome: string
          observacoes?: string | null
          provincia?: string | null
          recorrencia?: string | null
          responsavel_id?: string | null
          status?: string
          telefone?: string | null
          tipo_fornecedor?: string | null
          updated_at?: string | null
        }
        Update: {
          avaliacao_qualidade?: number | null
          categoria_principal?: string | null
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nif?: string | null
          nome?: string
          observacoes?: string | null
          provincia?: string | null
          recorrencia?: string | null
          responsavel_id?: string | null
          status?: string
          telefone?: string | null
          tipo_fornecedor?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gastos_detalhados: {
        Row: {
          aprovado_por: string | null
          categoria_gasto: string
          comprovante_url: string | null
          created_at: string | null
          data_gasto: string
          descricao: string | null
          id: string
          projeto_id: number | null
          status_aprovacao: string | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          aprovado_por?: string | null
          categoria_gasto: string
          comprovante_url?: string | null
          created_at?: string | null
          data_gasto?: string
          descricao?: string | null
          id?: string
          projeto_id?: number | null
          status_aprovacao?: string | null
          updated_at?: string | null
          valor: number
        }
        Update: {
          aprovado_por?: string | null
          categoria_gasto?: string
          comprovante_url?: string | null
          created_at?: string | null
          data_gasto?: string
          descricao?: string | null
          id?: string
          projeto_id?: number | null
          status_aprovacao?: string | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_gastos_detalhados_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_gastos_detalhados_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      guias_consumo: {
        Row: {
          created_at: string
          data_consumo: string
          etapa_id: number | null
          frente_servico: string | null
          id: string
          numero_guia: string
          observacoes: string | null
          projeto_id: number
          responsavel: string
          status: string
          tarefa_relacionada: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_consumo?: string
          etapa_id?: number | null
          frente_servico?: string | null
          id?: string
          numero_guia: string
          observacoes?: string | null
          projeto_id: number
          responsavel: string
          status?: string
          tarefa_relacionada?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_consumo?: string
          etapa_id?: number | null
          frente_servico?: string | null
          id?: string
          numero_guia?: string
          observacoes?: string | null
          projeto_id?: number
          responsavel?: string
          status?: string
          tarefa_relacionada?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_guias_consumo_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_guias_consumo_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "guias_consumo_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas_projeto"
            referencedColumns: ["id"]
          },
        ]
      }
      guias_consumo_itens: {
        Row: {
          created_at: string
          guia_id: string
          id: string
          material_id: string
          observacoes: string | null
          quantidade_consumida: number
        }
        Insert: {
          created_at?: string
          guia_id: string
          id?: string
          material_id: string
          observacoes?: string | null
          quantidade_consumida: number
        }
        Update: {
          created_at?: string
          guia_id?: string
          id?: string
          material_id?: string
          observacoes?: string | null
          quantidade_consumida?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_guia_item_guia"
            columns: ["guia_id"]
            isOneToOne: false
            referencedRelation: "guias_consumo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_guia_item_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais_armazem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_guias_consumo_itens_guia"
            columns: ["guia_id"]
            isOneToOne: false
            referencedRelation: "guias_consumo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_guias_consumo_itens_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais_armazem"
            referencedColumns: ["id"]
          },
        ]
      }
      incidentes: {
        Row: {
          created_at: string | null
          data: string
          descricao: string
          etapa_relacionada: string
          id: number
          id_projeto: number | null
          reportado_por: string
          severidade: Database["public"]["Enums"]["severidade"]
          tipo: Database["public"]["Enums"]["tipo_incidente"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: string
          descricao: string
          etapa_relacionada: string
          id?: number
          id_projeto?: number | null
          reportado_por: string
          severidade: Database["public"]["Enums"]["severidade"]
          tipo: Database["public"]["Enums"]["tipo_incidente"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string
          descricao?: string
          etapa_relacionada?: string
          id?: number
          id_projeto?: number | null
          reportado_por?: string
          severidade?: Database["public"]["Enums"]["severidade"]
          tipo?: Database["public"]["Enums"]["tipo_incidente"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_incidentes_projeto"
            columns: ["id_projeto"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_incidentes_projeto"
            columns: ["id_projeto"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      lancamentos_fornecedor: {
        Row: {
          centro_custo_id: string | null
          conta_fornecedor_id: string | null
          created_at: string | null
          credito: number | null
          data_lancamento: string
          debito: number | null
          descricao: string
          id: string
          observacoes: string | null
          saldo_corrente: number | null
        }
        Insert: {
          centro_custo_id?: string | null
          conta_fornecedor_id?: string | null
          created_at?: string | null
          credito?: number | null
          data_lancamento: string
          debito?: number | null
          descricao: string
          id?: string
          observacoes?: string | null
          saldo_corrente?: number | null
        }
        Update: {
          centro_custo_id?: string | null
          conta_fornecedor_id?: string | null
          created_at?: string | null
          credito?: number | null
          data_lancamento?: string
          debito?: number | null
          descricao?: string
          id?: string
          observacoes?: string | null
          saldo_corrente?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_fornecedor_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_fornecedor_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "saldos_centros_custo"
            referencedColumns: ["centro_custo_id"]
          },
          {
            foreignKeyName: "lancamentos_fornecedor_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "vw_cost_center_balances_extended"
            referencedColumns: ["centro_custo_id"]
          },
          {
            foreignKeyName: "lancamentos_fornecedor_conta_fornecedor_id_fkey"
            columns: ["conta_fornecedor_id"]
            isOneToOne: false
            referencedRelation: "contas_correntes_fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      materiais: {
        Row: {
          codigo: string
          created_at: string | null
          grupo_lean: string
          id: number
          necessita_aprovacao_qualidade: boolean
          nome: string
          unidade: string
          updated_at: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          grupo_lean: string
          id?: number
          necessita_aprovacao_qualidade?: boolean
          nome: string
          unidade: string
          updated_at?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          grupo_lean?: string
          id?: number
          necessita_aprovacao_qualidade?: boolean
          nome?: string
          unidade?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      materiais_armazem: {
        Row: {
          categoria_principal:
            | Database["public"]["Enums"]["categoria_principal_enum"]
            | null
          codigo_interno: string
          created_at: string | null
          data_entrada: string
          descricao_tecnica: string | null
          fornecedor: string | null
          id: string
          localizacao_fisica: string | null
          nome_material: string
          projeto_alocado_id: number | null
          quantidade_stock: number
          status_item: Database["public"]["Enums"]["status_material_enum"]
          subcategoria: string
          unidade_medida: Database["public"]["Enums"]["unidade_medida_enum"]
          updated_at: string | null
        }
        Insert: {
          categoria_principal?:
            | Database["public"]["Enums"]["categoria_principal_enum"]
            | null
          codigo_interno: string
          created_at?: string | null
          data_entrada?: string
          descricao_tecnica?: string | null
          fornecedor?: string | null
          id?: string
          localizacao_fisica?: string | null
          nome_material: string
          projeto_alocado_id?: number | null
          quantidade_stock?: number
          status_item?: Database["public"]["Enums"]["status_material_enum"]
          subcategoria: string
          unidade_medida: Database["public"]["Enums"]["unidade_medida_enum"]
          updated_at?: string | null
        }
        Update: {
          categoria_principal?:
            | Database["public"]["Enums"]["categoria_principal_enum"]
            | null
          codigo_interno?: string
          created_at?: string | null
          data_entrada?: string
          descricao_tecnica?: string | null
          fornecedor?: string | null
          id?: string
          localizacao_fisica?: string | null
          nome_material?: string
          projeto_alocado_id?: number | null
          quantidade_stock?: number
          status_item?: Database["public"]["Enums"]["status_material_enum"]
          subcategoria?: string
          unidade_medida?: Database["public"]["Enums"]["unidade_medida_enum"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_materiais_armazem_projeto"
            columns: ["projeto_alocado_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_materiais_armazem_projeto"
            columns: ["projeto_alocado_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      materiais_movimentacoes: {
        Row: {
          created_at: string
          data_movimentacao: string
          id: string
          material_id: string
          observacoes: string | null
          projeto_destino_id: number | null
          projeto_origem_id: number | null
          quantidade: number
          responsavel: string
          tipo_movimentacao: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_movimentacao?: string
          id?: string
          material_id: string
          observacoes?: string | null
          projeto_destino_id?: number | null
          projeto_origem_id?: number | null
          quantidade: number
          responsavel: string
          tipo_movimentacao?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_movimentacao?: string
          id?: string
          material_id?: string
          observacoes?: string | null
          projeto_destino_id?: number | null
          projeto_origem_id?: number | null
          quantidade?: number
          responsavel?: string
          tipo_movimentacao?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_material_movimentacao_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais_armazem"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_material_movimentacoes_material"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais_armazem"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentos_financeiros: {
        Row: {
          aprovado_por: string | null
          banco: string | null
          categoria: string
          centro_custo_id: string | null
          comprovante_url: string | null
          conta: string | null
          contrato_cliente_id: string | null
          contrato_fornecedor_id: string | null
          created_at: string
          data_aprovacao: string | null
          data_movimento: string
          descricao: string
          etapa_id: number | null
          fonte_financiamento:
            | Database["public"]["Enums"]["fonte_foa_enum"]
            | null
          forma_pagamento: string | null
          id: string
          metadata: Json | null
          nota_fiscal_url: string | null
          numero_documento: string | null
          observacoes: string | null
          projeto_id: number
          requisicao_id: number | null
          responsavel_id: string | null
          status_aprovacao: string | null
          subcategoria: string | null
          subtipo_entrada:
            | Database["public"]["Enums"]["subtipo_entrada_enum"]
            | null
          tags: Json | null
          tarefa_id: number | null
          tipo_movimento: string
          updated_at: string
          valor: number
          valor_liquido: number | null
        }
        Insert: {
          aprovado_por?: string | null
          banco?: string | null
          categoria: string
          centro_custo_id?: string | null
          comprovante_url?: string | null
          conta?: string | null
          contrato_cliente_id?: string | null
          contrato_fornecedor_id?: string | null
          created_at?: string
          data_aprovacao?: string | null
          data_movimento?: string
          descricao: string
          etapa_id?: number | null
          fonte_financiamento?:
            | Database["public"]["Enums"]["fonte_foa_enum"]
            | null
          forma_pagamento?: string | null
          id?: string
          metadata?: Json | null
          nota_fiscal_url?: string | null
          numero_documento?: string | null
          observacoes?: string | null
          projeto_id: number
          requisicao_id?: number | null
          responsavel_id?: string | null
          status_aprovacao?: string | null
          subcategoria?: string | null
          subtipo_entrada?:
            | Database["public"]["Enums"]["subtipo_entrada_enum"]
            | null
          tags?: Json | null
          tarefa_id?: number | null
          tipo_movimento: string
          updated_at?: string
          valor: number
          valor_liquido?: number | null
        }
        Update: {
          aprovado_por?: string | null
          banco?: string | null
          categoria?: string
          centro_custo_id?: string | null
          comprovante_url?: string | null
          conta?: string | null
          contrato_cliente_id?: string | null
          contrato_fornecedor_id?: string | null
          created_at?: string
          data_aprovacao?: string | null
          data_movimento?: string
          descricao?: string
          etapa_id?: number | null
          fonte_financiamento?:
            | Database["public"]["Enums"]["fonte_foa_enum"]
            | null
          forma_pagamento?: string | null
          id?: string
          metadata?: Json | null
          nota_fiscal_url?: string | null
          numero_documento?: string | null
          observacoes?: string | null
          projeto_id?: number
          requisicao_id?: number | null
          responsavel_id?: string | null
          status_aprovacao?: string | null
          subcategoria?: string | null
          subtipo_entrada?:
            | Database["public"]["Enums"]["subtipo_entrada_enum"]
            | null
          tags?: Json | null
          tarefa_id?: number | null
          tipo_movimento?: string
          updated_at?: string
          valor?: number
          valor_liquido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentos_financeiros_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentos_financeiros_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "saldos_centros_custo"
            referencedColumns: ["centro_custo_id"]
          },
          {
            foreignKeyName: "movimentos_financeiros_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "vw_cost_center_balances_extended"
            referencedColumns: ["centro_custo_id"]
          },
          {
            foreignKeyName: "movimentos_financeiros_contrato_cliente_id_fkey"
            columns: ["contrato_cliente_id"]
            isOneToOne: false
            referencedRelation: "contratos_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentos_financeiros_contrato_fornecedor_id_fkey"
            columns: ["contrato_fornecedor_id"]
            isOneToOne: false
            referencedRelation: "contratos_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentos_financeiros_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas_projeto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentos_financeiros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentos_financeiros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "movimentos_financeiros_requisicao_id_fkey"
            columns: ["requisicao_id"]
            isOneToOne: false
            referencedRelation: "requisicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentos_financeiros_tarefa_id_fkey"
            columns: ["tarefa_id"]
            isOneToOne: false
            referencedRelation: "tarefas_lean"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          centro_custo_id: string | null
          created_at: string | null
          id: string
          lida: boolean | null
          mensagem: string
          projeto_id: number | null
          severidade: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          centro_custo_id?: string | null
          created_at?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          projeto_id?: number | null
          severidade?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          centro_custo_id?: string | null
          created_at?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          projeto_id?: number | null
          severidade?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "saldos_centros_custo"
            referencedColumns: ["centro_custo_id"]
          },
          {
            foreignKeyName: "notificacoes_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "vw_cost_center_balances_extended"
            referencedColumns: ["centro_custo_id"]
          },
          {
            foreignKeyName: "notificacoes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      pagamentos_recebimentos: {
        Row: {
          banco: string | null
          comprovante_url: string | null
          conta: string | null
          contrato_cliente_id: string | null
          contrato_fornecedor_id: string | null
          created_at: string | null
          data_transacao: string
          descricao: string | null
          id: string
          metodo: string | null
          nota_fiscal_url: string | null
          numero_documento: string | null
          observacoes: string | null
          responsavel_id: string | null
          tipo: string
          valor: number
        }
        Insert: {
          banco?: string | null
          comprovante_url?: string | null
          conta?: string | null
          contrato_cliente_id?: string | null
          contrato_fornecedor_id?: string | null
          created_at?: string | null
          data_transacao?: string
          descricao?: string | null
          id?: string
          metodo?: string | null
          nota_fiscal_url?: string | null
          numero_documento?: string | null
          observacoes?: string | null
          responsavel_id?: string | null
          tipo: string
          valor: number
        }
        Update: {
          banco?: string | null
          comprovante_url?: string | null
          conta?: string | null
          contrato_cliente_id?: string | null
          contrato_fornecedor_id?: string | null
          created_at?: string | null
          data_transacao?: string
          descricao?: string | null
          id?: string
          metodo?: string | null
          nota_fiscal_url?: string | null
          numero_documento?: string | null
          observacoes?: string | null
          responsavel_id?: string | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_recebimentos_contrato_cliente_id_fkey"
            columns: ["contrato_cliente_id"]
            isOneToOne: false
            referencedRelation: "contratos_clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_recebimentos_contrato_fornecedor_id_fkey"
            columns: ["contrato_fornecedor_id"]
            isOneToOne: false
            referencedRelation: "contratos_fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_recebimentos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonio: {
        Row: {
          alocado_projeto_id: number | null
          codigo: string
          created_at: string | null
          id: string
          nome: string
          status: Database["public"]["Enums"]["status_patrimonio"]
          tipo: Database["public"]["Enums"]["tipo_patrimonio"]
          updated_at: string | null
        }
        Insert: {
          alocado_projeto_id?: number | null
          codigo: string
          created_at?: string | null
          id: string
          nome: string
          status?: Database["public"]["Enums"]["status_patrimonio"]
          tipo?: Database["public"]["Enums"]["tipo_patrimonio"]
          updated_at?: string | null
        }
        Update: {
          alocado_projeto_id?: number | null
          codigo?: string
          created_at?: string | null
          id?: string
          nome?: string
          status?: Database["public"]["Enums"]["status_patrimonio"]
          tipo?: Database["public"]["Enums"]["tipo_patrimonio"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_patrimonio_projeto"
            columns: ["alocado_projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_patrimonio_projeto"
            columns: ["alocado_projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      ponto_diario: {
        Row: {
          colaborador_id: number
          created_at: string | null
          data: string
          hora_entrada: string | null
          hora_saida: string | null
          id: string
          observacoes: string | null
          projeto_id: number
          status: string
          updated_at: string | null
        }
        Insert: {
          colaborador_id: number
          created_at?: string | null
          data: string
          hora_entrada?: string | null
          hora_saida?: string | null
          id?: string
          observacoes?: string | null
          projeto_id: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          colaborador_id?: number
          created_at?: string | null
          data?: string
          hora_entrada?: string | null
          hora_saida?: string | null
          id?: string
          observacoes?: string | null
          projeto_id?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ponto_diario_colaborador"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ponto_diario_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ponto_diario_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "ponto_diario_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      ppc_historico: {
        Row: {
          created_at: string | null
          id: number
          periodo_fim: string
          periodo_inicio: string
          ppc_percentual: number
          projeto_id: number | null
          tarefas_concluidas_prazo: number
          tarefas_programadas: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          periodo_fim: string
          periodo_inicio: string
          ppc_percentual: number
          projeto_id?: number | null
          tarefas_concluidas_prazo: number
          tarefas_programadas: number
        }
        Update: {
          created_at?: string | null
          id?: number
          periodo_fim?: string
          periodo_inicio?: string
          ppc_percentual?: number
          projeto_id?: number | null
          tarefas_concluidas_prazo?: number
          tarefas_programadas?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_ppc_historico_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ppc_historico_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          cargo: Database["public"]["Enums"]["user_role"]
          created_at: string
          created_by: string | null
          data_admissao: string | null
          data_nascimento: string | null
          departamento: string | null
          email: string
          foto_perfil_url: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cargo?: Database["public"]["Enums"]["user_role"]
          created_at?: string
          created_by?: string | null
          data_admissao?: string | null
          data_nascimento?: string | null
          departamento?: string | null
          email: string
          foto_perfil_url?: string | null
          id: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cargo?: Database["public"]["Enums"]["user_role"]
          created_at?: string
          created_by?: string | null
          data_admissao?: string | null
          data_nascimento?: string | null
          departamento?: string | null
          email?: string
          foto_perfil_url?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      projeto_status_mensal: {
        Row: {
          ano: number
          created_at: string
          id: string
          mes: number
          projeto_id: number
          status: string
          updated_at: string
        }
        Insert: {
          ano: number
          created_at?: string
          id?: string
          mes: number
          projeto_id: number
          status?: string
          updated_at?: string
        }
        Update: {
          ano?: number
          created_at?: string
          id?: string
          mes?: number
          projeto_id?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_projeto_status_mensal"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_projeto_status_mensal"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      projetos: {
        Row: {
          avanco_financeiro: number
          avanco_fisico: number
          avanco_tempo: number
          cliente: string
          created_at: string | null
          data_fim_prevista: string
          data_inicio: string
          encarregado: string
          gasto: number
          id: number
          limite_aprovacao: number
          limite_gastos: number | null
          metodo_calculo_temporal: string | null
          municipio: string | null
          nome: string
          numero_etapas: number | null
          orcamento: number
          provincia: string | null
          status: Database["public"]["Enums"]["projeto_status"]
          tipo_projeto: Database["public"]["Enums"]["tipo_projeto"] | null
          updated_at: string | null
          zona_bairro: string | null
        }
        Insert: {
          avanco_financeiro?: number
          avanco_fisico?: number
          avanco_tempo?: number
          cliente: string
          created_at?: string | null
          data_fim_prevista: string
          data_inicio: string
          encarregado: string
          gasto?: number
          id?: number
          limite_aprovacao?: number
          limite_gastos?: number | null
          metodo_calculo_temporal?: string | null
          municipio?: string | null
          nome: string
          numero_etapas?: number | null
          orcamento?: number
          provincia?: string | null
          status?: Database["public"]["Enums"]["projeto_status"]
          tipo_projeto?: Database["public"]["Enums"]["tipo_projeto"] | null
          updated_at?: string | null
          zona_bairro?: string | null
        }
        Update: {
          avanco_financeiro?: number
          avanco_fisico?: number
          avanco_tempo?: number
          cliente?: string
          created_at?: string | null
          data_fim_prevista?: string
          data_inicio?: string
          encarregado?: string
          gasto?: number
          id?: number
          limite_aprovacao?: number
          limite_gastos?: number | null
          metodo_calculo_temporal?: string | null
          municipio?: string | null
          nome?: string
          numero_etapas?: number | null
          orcamento?: number
          provincia?: string | null
          status?: Database["public"]["Enums"]["projeto_status"]
          tipo_projeto?: Database["public"]["Enums"]["tipo_projeto"] | null
          updated_at?: string | null
          zona_bairro?: string | null
        }
        Relationships: []
      }
      reembolsos_foa_fof: {
        Row: {
          created_at: string | null
          data_reembolso: string
          descricao: string
          id: string
          meta_total: number | null
          observacoes: string | null
          percentual_cumprido: number | null
          projeto_id: number | null
          responsavel_id: string | null
          tipo: string | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          data_reembolso: string
          descricao: string
          id?: string
          meta_total?: number | null
          observacoes?: string | null
          percentual_cumprido?: number | null
          projeto_id?: number | null
          responsavel_id?: string | null
          tipo?: string | null
          updated_at?: string | null
          valor: number
        }
        Update: {
          created_at?: string | null
          data_reembolso?: string
          descricao?: string
          id?: string
          meta_total?: number | null
          observacoes?: string | null
          percentual_cumprido?: number | null
          projeto_id?: number | null
          responsavel_id?: string | null
          tipo?: string | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "reembolsos_foa_fof_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reembolsos_foa_fof_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      requisicoes: {
        Row: {
          aprovacao_qualidade: boolean
          categoria_principal:
            | Database["public"]["Enums"]["categoria_principal_enum"]
            | null
          codigo_produto: string | null
          created_at: string | null
          data_limite: string | null
          data_requisicao: string
          descricao_tecnica: string | null
          fornecedor_preferencial: string | null
          id: number
          id_material: number | null
          id_projeto: number | null
          nome_comercial_produto: string | null
          observacoes: string | null
          percentual_desconto: number | null
          percentual_imposto: number | null
          prazo_limite_dias: number | null
          quantidade_requisitada: number | null
          requisitante: string
          status_fluxo: Database["public"]["Enums"]["status_fluxo"]
          subcategoria: string | null
          unidade_medida:
            | Database["public"]["Enums"]["unidade_medida_enum"]
            | null
          updated_at: string | null
          urgencia_prioridade:
            | Database["public"]["Enums"]["urgencia_prioridade_enum"]
            | null
          valor: number
          valor_desconto: number | null
          valor_imposto: number | null
          valor_liquido: number | null
          valor_unitario: number | null
        }
        Insert: {
          aprovacao_qualidade?: boolean
          categoria_principal?:
            | Database["public"]["Enums"]["categoria_principal_enum"]
            | null
          codigo_produto?: string | null
          created_at?: string | null
          data_limite?: string | null
          data_requisicao?: string
          descricao_tecnica?: string | null
          fornecedor_preferencial?: string | null
          id?: number
          id_material?: number | null
          id_projeto?: number | null
          nome_comercial_produto?: string | null
          observacoes?: string | null
          percentual_desconto?: number | null
          percentual_imposto?: number | null
          prazo_limite_dias?: number | null
          quantidade_requisitada?: number | null
          requisitante: string
          status_fluxo?: Database["public"]["Enums"]["status_fluxo"]
          subcategoria?: string | null
          unidade_medida?:
            | Database["public"]["Enums"]["unidade_medida_enum"]
            | null
          updated_at?: string | null
          urgencia_prioridade?:
            | Database["public"]["Enums"]["urgencia_prioridade_enum"]
            | null
          valor?: number
          valor_desconto?: number | null
          valor_imposto?: number | null
          valor_liquido?: number | null
          valor_unitario?: number | null
        }
        Update: {
          aprovacao_qualidade?: boolean
          categoria_principal?:
            | Database["public"]["Enums"]["categoria_principal_enum"]
            | null
          codigo_produto?: string | null
          created_at?: string | null
          data_limite?: string | null
          data_requisicao?: string
          descricao_tecnica?: string | null
          fornecedor_preferencial?: string | null
          id?: number
          id_material?: number | null
          id_projeto?: number | null
          nome_comercial_produto?: string | null
          observacoes?: string | null
          percentual_desconto?: number | null
          percentual_imposto?: number | null
          prazo_limite_dias?: number | null
          quantidade_requisitada?: number | null
          requisitante?: string
          status_fluxo?: Database["public"]["Enums"]["status_fluxo"]
          subcategoria?: string | null
          unidade_medida?:
            | Database["public"]["Enums"]["unidade_medida_enum"]
            | null
          updated_at?: string | null
          urgencia_prioridade?:
            | Database["public"]["Enums"]["urgencia_prioridade_enum"]
            | null
          valor?: number
          valor_desconto?: number | null
          valor_imposto?: number | null
          valor_liquido?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_requisicoes_material"
            columns: ["id_material"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_requisicoes_projeto"
            columns: ["id_projeto"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_requisicoes_projeto"
            columns: ["id_projeto"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
          {
            foreignKeyName: "requisicoes_id_material_fkey"
            columns: ["id_material"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      semanas_projeto: {
        Row: {
          created_at: string | null
          data_fim: string
          data_inicio: string
          id: number
          numero_semana: number
          projeto_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_fim: string
          data_inicio: string
          id?: number
          numero_semana: number
          projeto_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          id?: number
          numero_semana?: number
          projeto_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_semanas_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_semanas_projeto"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      subcategorias_compras: {
        Row: {
          categoria_financeira: string
          categoria_principal: Database["public"]["Enums"]["categoria_principal_enum"]
          categoria_secundaria: string
          created_at: string | null
          descricao: string | null
          id: number
          limite_aprovacao_automatica: number | null
          nome_subcategoria: string
          updated_at: string | null
        }
        Insert: {
          categoria_financeira: string
          categoria_principal: Database["public"]["Enums"]["categoria_principal_enum"]
          categoria_secundaria?: string
          created_at?: string | null
          descricao?: string | null
          id?: number
          limite_aprovacao_automatica?: number | null
          nome_subcategoria: string
          updated_at?: string | null
        }
        Update: {
          categoria_financeira?: string
          categoria_principal?: Database["public"]["Enums"]["categoria_principal_enum"]
          categoria_secundaria?: string
          created_at?: string | null
          descricao?: string | null
          id?: number
          limite_aprovacao_automatica?: number | null
          nome_subcategoria?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tarefas_lean: {
        Row: {
          created_at: string | null
          custo_mao_obra: number | null
          custo_material: number | null
          descricao: string
          gasto_real: number | null
          id: number
          id_etapa: number | null
          id_projeto: number | null
          percentual_conclusao: number
          prazo: string
          preco_unitario: number | null
          responsavel: string
          semana_programada: number | null
          status: Database["public"]["Enums"]["status_tarefa"]
          tempo_real_dias: number | null
          tipo: Database["public"]["Enums"]["tipo_tarefa_lean"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custo_mao_obra?: number | null
          custo_material?: number | null
          descricao: string
          gasto_real?: number | null
          id?: number
          id_etapa?: number | null
          id_projeto?: number | null
          percentual_conclusao?: number
          prazo: string
          preco_unitario?: number | null
          responsavel: string
          semana_programada?: number | null
          status?: Database["public"]["Enums"]["status_tarefa"]
          tempo_real_dias?: number | null
          tipo?: Database["public"]["Enums"]["tipo_tarefa_lean"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custo_mao_obra?: number | null
          custo_material?: number | null
          descricao?: string
          gasto_real?: number | null
          id?: number
          id_etapa?: number | null
          id_projeto?: number | null
          percentual_conclusao?: number
          prazo?: string
          preco_unitario?: number | null
          responsavel?: string
          semana_programada?: number | null
          status?: Database["public"]["Enums"]["status_tarefa"]
          tempo_real_dias?: number | null
          tipo?: Database["public"]["Enums"]["tipo_tarefa_lean"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tarefas_etapa"
            columns: ["id_etapa"]
            isOneToOne: false
            referencedRelation: "etapas_projeto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tarefas_lean_projeto"
            columns: ["id_projeto"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tarefas_lean_projeto"
            columns: ["id_projeto"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      gastos_obra_view: {
        Row: {
          categoria: string | null
          centro_custo_id: string | null
          centro_custo_nome: string | null
          comprovante_url: string | null
          created_at: string | null
          data_movimento: string | null
          descricao: string | null
          foa_auto: number | null
          fof_financiamento: number | null
          fonte_financiamento:
            | Database["public"]["Enums"]["fonte_foa_enum"]
            | null
          id: string | null
          observacoes: string | null
          projeto_id: number | null
          projeto_nome: string | null
          recebimento_foa: number | null
          responsavel_id: string | null
          responsavel_nome: string | null
          saida: number | null
          tipo_movimento: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentos_financeiros_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentos_financeiros_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "saldos_centros_custo"
            referencedColumns: ["centro_custo_id"]
          },
          {
            foreignKeyName: "movimentos_financeiros_centro_custo_id_fkey"
            columns: ["centro_custo_id"]
            isOneToOne: false
            referencedRelation: "vw_cost_center_balances_extended"
            referencedColumns: ["centro_custo_id"]
          },
          {
            foreignKeyName: "movimentos_financeiros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentos_financeiros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      saldos_centros_custo: {
        Row: {
          centro_custo_id: string | null
          codigo: string | null
          nome: string | null
          orcamento_mensal: number | null
          percentual_utilizado: number | null
          projeto_id: number | null
          saldo: number | null
          tipo: string | null
          total_entradas: number | null
          total_movimentos: number | null
          total_saidas: number | null
        }
        Relationships: [
          {
            foreignKeyName: "centros_custo_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centros_custo_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      vw_cost_center_balances_extended: {
        Row: {
          centro_custo_id: string | null
          codigo: string | null
          fonte_predominante:
            | Database["public"]["Enums"]["fonte_foa_enum"]
            | null
          nome: string | null
          orcamento_mensal: number | null
          percentual_utilizado: number | null
          projeto_id: number | null
          saldo: number | null
          tipo: string | null
          total_entradas: number | null
          total_movimentos: number | null
          total_saidas: number | null
        }
        Relationships: [
          {
            foreignKeyName: "centros_custo_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centros_custo_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      vw_funding_breakdown: {
        Row: {
          fonte_financiamento:
            | Database["public"]["Enums"]["fonte_foa_enum"]
            | null
          fonte_label: string | null
          percentual_total: number | null
          projeto_id: number | null
          projeto_nome: string | null
          total_movimentos: number | null
          total_valor: number | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentos_financeiros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentos_financeiros_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "vw_resumo_foa"
            referencedColumns: ["projeto_id"]
          },
        ]
      }
      vw_resumo_foa: {
        Row: {
          amortizacao: number | null
          custos_suportados: number | null
          divida_foa_com_fof: number | null
          fof_financiamento: number | null
          projeto_id: number | null
          projeto_nome: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      auto_categorize_expense: {
        Args: { descricao_texto: string }
        Returns: string
      }
      calcular_dre_consolidado: {
        Args: never
        Returns: {
          centro_custo_id: string
          centro_nome: string
          custos_totais: number
          foa_entrada: number
          foa_saida: number
          fof_entrada: number
          fof_saida: number
          numero: number
          projeto_nome: string
          receita_cliente: number
          resultado: number
        }[]
      }
      calcular_dre_evolucao_mensal: {
        Args: { p_projeto_id: number }
        Returns: {
          ano: number
          custos_totais: number
          foa_auto: number
          fof_financiamento: number
          mes: number
          periodo: string
          receita_cliente: number
          resultado: number
        }[]
      }
      calcular_dre_mensal: {
        Args: { p_ano: number; p_mes: number; p_projeto_id: number }
        Returns: {
          centro_custo_id: string
          centro_nome: string
          custos_totais: number
          foa_auto: number
          fof_financiamento: number
          receita_cliente: number
          resultado: number
        }[]
      }
      calcular_dre_por_periodo: {
        Args: {
          p_data_fim: string
          p_data_inicio: string
          p_projeto_id: number
        }
        Returns: {
          custos_totais: number
          foa_auto: number
          fof_financiamento: number
          receita_cliente: number
          resultado: number
          total_entradas: number
          total_saidas: number
        }[]
      }
      calcular_resumo_foa: {
        Args: { p_projeto_id?: number }
        Returns: {
          amortizacao: number
          divida_foa_com_fof: number
          fof_financiamento: number
          projeto_id: number
          projeto_nome: string
        }[]
      }
      calculate_dias_restantes: {
        Args: { data_requisicao: string; prazo_limite_dias: number }
        Returns: string
      }
      calculate_integrated_financial_progress: {
        Args: { project_id: number }
        Returns: {
          financial_progress: number
          indirect_expenses: number
          material_expenses: number
          patrimony_expenses: number
          payroll_expenses: number
          total_budget: number
          total_expenses: number
        }[]
      }
      calculate_material_expenses: {
        Args: { project_id: number }
        Returns: number
      }
      calculate_patrimony_expenses: {
        Args: { project_id: number }
        Returns: number
      }
      calculate_payroll_expenses: {
        Args: { project_id: number }
        Returns: number
      }
      calculate_project_physical_progress: {
        Args: { project_id: number }
        Returns: number
      }
      calculate_project_ppc: { Args: { project_id: number }; Returns: number }
      calculate_project_weeks: { Args: { project_id: number }; Returns: number }
      calculate_stage_progress: { Args: { stage_id: number }; Returns: number }
      calculate_temporal_progress: {
        Args: { method?: string; project_id: number }
        Returns: number
      }
      calculate_valor_liquido: {
        Args: {
          percentual_desconto?: number
          percentual_imposto?: number
          valor_base: number
          valor_desconto?: number
          valor_imposto?: number
        }
        Returns: number
      }
      calculate_weekly_average_ppc: {
        Args: { project_id: number }
        Returns: number
      }
      calculate_weekly_ppc: {
        Args: { project_id: number; week_end: string; week_start: string }
        Returns: number
      }
      check_budget_thresholds: { Args: never; Returns: undefined }
      delete_project_safely: { Args: { project_id: number }; Returns: Json }
      detect_financial_discrepancies: {
        Args: { project_id: number }
        Returns: {
          categoria: string
          discrepancia: number
          gasto_calculado: number
          gasto_manual: number
          percentual_discrepancia: number
        }[]
      }
      generate_monthly_report: {
        Args: { p_ano: number; p_mes: number; p_projeto_id: number }
        Returns: {
          centro_custo: string
          gasto: number
          orcamento: number
          percentual_usado: number
          saldo: number
          status: string
        }[]
      }
      generate_project_weeks: {
        Args: { project_id: number }
        Returns: undefined
      }
      get_clientes_kpis: {
        Args: { project_id?: number }
        Returns: {
          prazo_medio_recebimento: number
          saldo_receber: number
          taxa_recebimento: number
          total_clientes: number
          total_contratado: number
          total_recebido: number
        }[]
      }
      get_consolidated_financial_data: {
        Args: { p_projeto_id: number }
        Returns: Json
      }
      get_current_project_week: {
        Args: { project_id: number }
        Returns: number
      }
      get_dashboard_geral_data: {
        Args: { user_id_param: string }
        Returns: Json
      }
      get_detailed_expense_breakdown: {
        Args: { project_id: number }
        Returns: {
          categoria: string
          discrepancia: number
          percentual_orcamento: number
          valor_calculado: number
          valor_manual: number
        }[]
      }
      get_fluxo_caixa_summary: {
        Args: { project_id: number }
        Returns: {
          saldo: number
          total_entradas: number
          total_movimentos: number
          total_saidas: number
        }[]
      }
      get_fornecedores_kpis: {
        Args: { project_id?: number }
        Returns: {
          prazo_medio_pagamento: number
          saldo_pagar: number
          taxa_pagamento: number
          total_contratado: number
          total_fornecedores: number
          total_pago: number
        }[]
      }
      get_gastos_obra_summary: {
        Args: { p_ano?: number; p_mes?: number; p_projeto_id: number }
        Returns: {
          saldo_atual: number
          total_foa_auto: number
          total_fof_financiamento: number
          total_movimentos: number
          total_recebimento_foa: number
          total_saidas: number
        }[]
      }
      get_hr_analytics: {
        Args: { project_id: number }
        Returns: {
          attendance_by_front: Json
          attendance_trends: Json
          hr_kpis: Json
          work_hours_by_type: Json
        }[]
      }
      get_integrated_dashboard_data: {
        Args: { project_id: number }
        Returns: {
          categoria: string
          limite_excedido: boolean
          percentual_execucao: number
          status_alerta: string
          valor_gasto: number
          valor_orcamentado: number
          valor_pendente: number
        }[]
      }
      get_management_dashboard: {
        Args: never
        Returns: {
          alerts: Json
          consolidated_kpis: Json
          performance_heatmap: Json
          productivity_ranking: Json
        }[]
      }
      get_pending_approvals: {
        Args: { project_id: number }
        Returns: {
          categoria_principal: string
          data_requisicao: string
          id: number
          nome_comercial_produto: string
          requisitante: string
          status_fluxo: string
          urgencia_prioridade: string
          valor: number
        }[]
      }
      get_purchase_breakdown: {
        Args: { project_id: number }
        Returns: {
          categoria: string
          percentual_aprovacao: number
          total_requisicoes: number
          valor_aprovado: number
          valor_pendente: number
        }[]
      }
      get_task_financial_analytics: {
        Args: { project_id: number }
        Returns: {
          budget_deviation: number
          budget_deviation_percentage: number
          efficiency_score: number
          labor_planned: number
          labor_real: number
          material_planned: number
          material_real: number
          tasks_delayed: number
          tasks_on_budget: number
          tasks_on_time: number
          tasks_over_budget: number
          time_deviation: number
          time_efficiency_percentage: number
          total_planned_cost: number
          total_planned_days: number
          total_real_days: number
          total_real_expenses: number
        }[]
      }
      get_top_deviation_tasks: {
        Args: { limit_count?: number; project_id: number }
        Returns: {
          custo_planejado: number
          descricao: string
          desvio_orcamentario: number
          desvio_percentual: number
          desvio_temporal: number
          gasto_real: number
          responsavel: string
          status: string
          task_id: number
          tempo_previsto: number
          tempo_real: number
        }[]
      }
      get_warehouse_analytics: {
        Args: { project_id: number }
        Returns: {
          consumption_by_project: Json
          critical_stock: Json
          stock_flow: Json
          weekly_consumption: Json
        }[]
      }
      get_weekly_ppc_data: {
        Args: { project_id: number }
        Returns: {
          ppc_percentual: number
          semana_fim: string
          semana_inicio: string
          status_ppc: string
          tarefas_concluidas: number
          tarefas_programadas: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_director: { Args: never; Returns: boolean }
      map_categoria_principal_to_financas: {
        Args: {
          categoria: Database["public"]["Enums"]["categoria_principal_enum"]
        }
        Returns: string
      }
      map_categoria_to_financas: {
        Args: {
          categoria_principal: Database["public"]["Enums"]["categoria_principal_enum"]
          subcategoria?: string
        }
        Returns: string
      }
      move_material: {
        Args: {
          p_material_id: string
          p_observacoes?: string
          p_projeto_destino_id: number
          p_projeto_origem_id: number
          p_quantidade: number
          p_responsavel: string
        }
        Returns: Json
      }
      prever_gasto_mensal: {
        Args: { p_centro_custo_id: string }
        Returns: number
      }
      process_consumption_guide: { Args: { p_guia_id: string }; Returns: Json }
      register_weekly_ppc_entries: {
        Args: { project_id: number }
        Returns: undefined
      }
      update_project_metrics_with_integrated_finance: {
        Args: { project_id: number }
        Returns: undefined
      }
      update_project_metrics_with_ppc: {
        Args: { project_id: number }
        Returns: undefined
      }
      validate_project_spending_limit: {
        Args: { new_amount: number; project_id: number }
        Returns: boolean
      }
      zerar_custos_projeto: { Args: { p_projeto_id: number }; Returns: Json }
    }
    Enums: {
      app_role:
        | "diretor_tecnico"
        | "encarregado_obra"
        | "assistente_compras"
        | "departamento_hst"
        | "coordenacao_direcao"
      categoria_colaborador: "Oficial" | "Auxiliar" | "Técnico Superior"
      categoria_material_enum:
        | "Material de Construção"
        | "Equipamento"
        | "Ferramenta"
        | "Consumível"
        | "EPI"
        | "Outro"
      categoria_principal_enum:
        | "Material"
        | "Mão de Obra"
        | "Património"
        | "Custos Indiretos"
        | "Segurança e Higiene no Trabalho"
      fonte_foa_enum: "REC_FOA" | "FOF_FIN" | "FOA_AUTO"
      projeto_status:
        | "Em Andamento"
        | "Atrasado"
        | "Concluído"
        | "Pausado"
        | "Cancelado"
      severidade: "Baixa" | "Média" | "Alta"
      status_etapa_enum: "Não Iniciada" | "Em Curso" | "Concluída" | "Atrasada"
      status_ficha: "Pendente" | "Aprovado" | "Rejeitado"
      status_fluxo:
        | "Pendente"
        | "Cotações"
        | "Aprovação Qualidade"
        | "Aprovação Direção"
        | "OC Gerada"
        | "Recepcionado"
        | "Liquidado"
        | "Rejeitado"
      status_material_enum:
        | "Disponível"
        | "Em uso"
        | "Reservado"
        | "Manutenção"
        | "Inativo"
      status_patrimonio:
        | "Em Uso"
        | "Disponível"
        | "Manutenção"
        | "Transferência"
      status_tarefa: "Pendente" | "Em Andamento" | "Concluído"
      subtipo_entrada_enum:
        | "valor_inicial"
        | "recebimento_cliente"
        | "financiamento_adicional"
        | "reembolso"
      tipo_etapa_enum:
        | "Fundação"
        | "Estrutura"
        | "Alvenaria"
        | "Acabamento"
        | "Instalações"
        | "Entrega"
        | "Mobilização"
        | "Desmobilização"
      tipo_incidente: "Incidente" | "Near-miss"
      tipo_patrimonio:
        | "Gerador"
        | "Betoneira"
        | "Andaime"
        | "Ferramenta"
        | "Outros"
      tipo_projeto:
        | "Residencial"
        | "Comercial"
        | "Industrial"
        | "Infraestrutura"
        | "Reforma"
      tipo_tarefa_lean:
        | "Residencial"
        | "Comercial"
        | "Industrial"
        | "Infraestrutura"
        | "Reforma"
      unidade_medida_enum:
        | "saco"
        | "m³"
        | "m"
        | "kg"
        | "litro"
        | "unidade"
        | "outro"
      urgencia_prioridade_enum: "Alta" | "Média" | "Baixa"
      user_role:
        | "diretor_tecnico"
        | "encarregado_obra"
        | "assistente_compras"
        | "departamento_hst"
        | "coordenacao_direcao"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "diretor_tecnico",
        "encarregado_obra",
        "assistente_compras",
        "departamento_hst",
        "coordenacao_direcao",
      ],
      categoria_colaborador: ["Oficial", "Auxiliar", "Técnico Superior"],
      categoria_material_enum: [
        "Material de Construção",
        "Equipamento",
        "Ferramenta",
        "Consumível",
        "EPI",
        "Outro",
      ],
      categoria_principal_enum: [
        "Material",
        "Mão de Obra",
        "Património",
        "Custos Indiretos",
        "Segurança e Higiene no Trabalho",
      ],
      fonte_foa_enum: ["REC_FOA", "FOF_FIN", "FOA_AUTO"],
      projeto_status: [
        "Em Andamento",
        "Atrasado",
        "Concluído",
        "Pausado",
        "Cancelado",
      ],
      severidade: ["Baixa", "Média", "Alta"],
      status_etapa_enum: ["Não Iniciada", "Em Curso", "Concluída", "Atrasada"],
      status_ficha: ["Pendente", "Aprovado", "Rejeitado"],
      status_fluxo: [
        "Pendente",
        "Cotações",
        "Aprovação Qualidade",
        "Aprovação Direção",
        "OC Gerada",
        "Recepcionado",
        "Liquidado",
        "Rejeitado",
      ],
      status_material_enum: [
        "Disponível",
        "Em uso",
        "Reservado",
        "Manutenção",
        "Inativo",
      ],
      status_patrimonio: [
        "Em Uso",
        "Disponível",
        "Manutenção",
        "Transferência",
      ],
      status_tarefa: ["Pendente", "Em Andamento", "Concluído"],
      subtipo_entrada_enum: [
        "valor_inicial",
        "recebimento_cliente",
        "financiamento_adicional",
        "reembolso",
      ],
      tipo_etapa_enum: [
        "Fundação",
        "Estrutura",
        "Alvenaria",
        "Acabamento",
        "Instalações",
        "Entrega",
        "Mobilização",
        "Desmobilização",
      ],
      tipo_incidente: ["Incidente", "Near-miss"],
      tipo_patrimonio: [
        "Gerador",
        "Betoneira",
        "Andaime",
        "Ferramenta",
        "Outros",
      ],
      tipo_projeto: [
        "Residencial",
        "Comercial",
        "Industrial",
        "Infraestrutura",
        "Reforma",
      ],
      tipo_tarefa_lean: [
        "Residencial",
        "Comercial",
        "Industrial",
        "Infraestrutura",
        "Reforma",
      ],
      unidade_medida_enum: [
        "saco",
        "m³",
        "m",
        "kg",
        "litro",
        "unidade",
        "outro",
      ],
      urgencia_prioridade_enum: ["Alta", "Média", "Baixa"],
      user_role: [
        "diretor_tecnico",
        "encarregado_obra",
        "assistente_compras",
        "departamento_hst",
        "coordenacao_direcao",
      ],
    },
  },
} as const
