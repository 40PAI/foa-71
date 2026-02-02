
# Plano: Ajustar Posicionamento do Botao do Agente no Mobile

## Problema Identificado
O botao flutuante do assistente FOA esta a sobrepor parcialmente a barra de navegacao inferior no mobile, dificultando o acesso ao item "Mais" da navegacao.

## Analise Tecnica

### Estrutura Atual
- **Barra de navegacao**: `h-16` (64px) + `safe-area-bottom` (para iPhones com notch)
- **Posicao atual do botao**: `bottom: 80px`
- **Tamanho do botao**: 64px (variavel `--chat--toggle--size`)

### Motivo do Problema
O valor de 80px nao e suficiente considerando:
- Altura da barra: 64px
- Safe area em iPhones: ~34px
- Espaco de respiro visual

## Solucao Proposta

Atualizar os estilos CSS no componente `FOAAssistant.tsx`:

```css
@media (max-width: 768px) {
  .n8n-chat .chat-toggle,
  .n8n-chat button.chat-toggle,
  [class*="chat-toggle"],
  .n8n-chat [class*="toggle"] {
    bottom: 100px !important;  /* Aumentar de 80px para 100px */
    right: 16px !important;    /* Afastar ligeiramente da borda */
  }
}
```

### Valores Calculados
- **Novo bottom**: 100px (64px barra + 20px margem + 16px safe area buffer)
- **Right**: 16px para alinhar melhor com o layout mobile

## Ficheiro a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/chat/FOAAssistant.tsx` | Atualizar media query mobile (linhas 137-144) |

## Resultado Esperado
O botao do agente ficara posicionado claramente acima da barra de navegacao inferior, sem obstruir nenhum elemento de navegacao e mantendo boa acessibilidade em todos os dispositivos mobile.
