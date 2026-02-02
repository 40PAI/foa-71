

# Plano: Reposicionar Botão do Agente no Mobile via JavaScript

## Problema Identificado
A abordagem CSS com media query não está a funcionar porque:
1. O n8n chat injeta estilos inline directamente no elemento
2. Os estilos inline têm maior especificidade que CSS externo
3. O botão é criado dinamicamente após o nosso CSS ser carregado

## Nova Abordagem: Manipulação DOM Directa

Em vez de depender apenas de CSS, vamos usar um `MutationObserver` para detectar quando o botão do chat é criado e aplicar os estilos directamente via JavaScript.

### Lógica da Solução

1. Criar um observer que monitora o DOM
2. Quando o botão `.chat-toggle` aparecer, aplicar `style.bottom` directamente
3. Verificar se estamos em mobile usando `window.innerWidth`
4. Reagir a mudanças de tamanho de janela (resize)

### Código a Implementar

```javascript
// Função para ajustar posição do botão no mobile
const adjustTogglePosition = () => {
  const isMobile = window.innerWidth <= 768;
  const toggleButton = document.querySelector('.n8n-chat button, [class*="chat-toggle"]');
  
  if (toggleButton && isMobile) {
    toggleButton.style.setProperty('bottom', '100px', 'important');
    toggleButton.style.setProperty('right', '16px', 'important');
  }
};

// Observer para detectar quando o botão é criado
const positionObserver = new MutationObserver(() => {
  adjustTogglePosition();
});
positionObserver.observe(document.body, { childList: true, subtree: true });

// Reagir a mudanças de tamanho
window.addEventListener('resize', adjustTogglePosition);
```

## Ficheiro a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| `src/components/chat/FOAAssistant.tsx` | Adicionar MutationObserver e listener de resize para ajustar posição do botão dinamicamente |

## Detalhes Técnicos

- **MutationObserver**: Detecta quando elementos são adicionados ao DOM
- **style.setProperty**: Permite aplicar estilos com `!important` via JavaScript
- **Cleanup**: Remover listeners e observers no cleanup do useEffect

## Resultado Esperado
O botão do agente será reposicionado automaticamente para `bottom: 100px` em dispositivos mobile, independentemente dos estilos inline que o n8n chat aplique.

