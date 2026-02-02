import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function FOAAssistant() {
  const { user } = useAuth();

  useEffect(() => {
    // Só carrega o chat se o usuário estiver autenticado
    if (!user) return;

    // Verificar se já foi carregado
    if (document.getElementById('n8n-chat-script')) return;

    // Adicionar link do CSS do n8n chat PRIMEIRO
    const cssLink = document.createElement('link');
    cssLink.id = 'n8n-chat-css';
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css';
    document.head.appendChild(cssLink);

    // Adicionar estilos customizados FOA DEPOIS do CSS do n8n (para sobrescrever)
    const style = document.createElement('style');
    style.id = 'n8n-chat-styles';
    style.textContent = `
      :root {
        /* Cores oficiais FOA */
        --chat--color-primary: #002D8B !important;
        --chat--color-primary-shade-50: #002472 !important;
        --chat--color-primary-shade-100: #001B59 !important;

        --chat--color-secondary: #A65628 !important;
        --chat--color-secondary-shade-50: #8F4822 !important;

        --chat--color-white: #ffffff !important;
        --chat--color-dark: #0A0E25 !important;
        --chat--color-light: #F4F6FA !important;
        --chat--color-light-shade-50: #E6E9F1 !important;
        --chat--color-light-shade-100: #C2C5CC !important;
        --chat--color-medium: #D2D4D9 !important;
        --chat--color-disabled: #777980 !important;
        --chat--color-typing: #404040 !important;

        /* Layout */
        --chat--spacing: 1rem !important;
        --chat--border-radius: 0.5rem !important;
        --chat--transition-duration: 0.15s !important;

        --chat--window--width: 400px !important;
        --chat--window--height: 600px !important;

        /* Header */
        --chat--header-height: auto !important;
        --chat--header--padding: var(--chat--spacing) !important;
        --chat--header--background: var(--chat--color-primary) !important;
        --chat--header--color: var(--chat--color-white) !important;
        --chat--header--border-top: none !important;
        --chat--header--border-bottom: 3px solid var(--chat--color-secondary) !important;
        --chat--heading--font-size: 1.8em !important;
        --chat--subtitle--font-size: inherit !important;
        --chat--subtitle--line-height: 1.6 !important;

        /* Área de digitação */
        --chat--textarea--height: 50px !important;

        /* Mensagens */
        --chat--message--font-size: 1rem !important;
        --chat--message--padding: var(--chat--spacing) !important;
        --chat--message--border-radius: var(--chat--border-radius) !important;
        --chat--message-line-height: 1.6 !important;

        /* Mensagem do BOT */
        --chat--message--bot--background: var(--chat--color-white) !important;
        --chat--message--bot--color: var(--chat--color-dark) !important;
        --chat--message--bot--border: 1px solid var(--chat--color-primary) !important;

        /* Mensagem do USUÁRIO */
        --chat--message--user--background: var(--chat--color-secondary) !important;
        --chat--message--user--color: var(--chat--color-white) !important;
        --chat--message--user--border: none !important;

        /* Bloco pré-formatado */
        --chat--message--pre--background: rgba(0, 45, 139, 0.05) !important;

        /* Botão flutuante */
        --chat--toggle--background: #A65628 !important;
        --chat--toggle--hover--background: #8F4822 !important;
        --chat--toggle--active--background: #72391C !important;
        --chat--toggle--color: var(--chat--color-white) !important;
        --chat--toggle--size: 64px !important;
      }

      /* Forçar cor castanha no botão toggle com seletores específicos */
      .n8n-chat .chat-toggle,
      .n8n-chat button.chat-toggle,
      [class*="chat-toggle"],
      .n8n-chat [class*="toggle"] {
        background-color: #A65628 !important;
        background: #A65628 !important;
      }

      .n8n-chat .chat-toggle:hover,
      .n8n-chat button.chat-toggle:hover,
      [class*="chat-toggle"]:hover {
        background-color: #8F4822 !important;
        background: #8F4822 !important;
      }

      .n8n-chat .chat-toggle:active,
      .n8n-chat button.chat-toggle:active,
      [class*="chat-toggle"]:active {
        background-color: #72391C !important;
        background: #72391C !important;
      }

      /* Remoção de branding e rodapés */
      .powered-by,
      [class*="powered"],
      footer,
      footer *,
      #footer,
      [class*="branding"],
      a[href*="n8n.io"],
      a[href*="n8n.cloud"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        pointer-events: none !important;
      }

      /* Ajustes para não conflitar com a sidebar */
      .n8n-chat {
        z-index: 9999 !important;
      }

      /* Mobile: mover botão para cima da barra de navegação inferior */
      @media (max-width: 768px) {
        .n8n-chat .chat-toggle,
        .n8n-chat button.chat-toggle,
        [class*="chat-toggle"],
        .n8n-chat [class*="toggle"] {
          bottom: 100px !important;
          right: 16px !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Criar container do chat
    let chatContainer = document.getElementById('n8n-chat');
    if (!chatContainer) {
      chatContainer = document.createElement('div');
      chatContainer.id = 'n8n-chat';
      document.body.appendChild(chatContainer);
    }

    // Função para ajustar posição do botão no mobile
    const adjustTogglePosition = () => {
      const isMobile = window.innerWidth <= 768;
      const toggleButton = document.querySelector('.n8n-chat button, [class*="chat-toggle"]') as HTMLElement;
      
      if (toggleButton && isMobile) {
        toggleButton.style.setProperty('bottom', '100px', 'important');
        toggleButton.style.setProperty('right', '16px', 'important');
      } else if (toggleButton && !isMobile) {
        // Reset para desktop
        toggleButton.style.removeProperty('bottom');
        toggleButton.style.removeProperty('right');
      }
    };

    // Observer combinado: branding + posicionamento
    const combinedObserver = new MutationObserver(() => {
      // Remoção de branding
      document.querySelectorAll('.powered-by, [class*="powered"], footer, #footer, [class*="branding"], a[href*="n8n"]').forEach(el => el.remove());
      // Ajustar posição do botão
      adjustTogglePosition();
    });
    combinedObserver.observe(document.body, { childList: true, subtree: true });

    // Listener de resize para manter posição correcta
    window.addEventListener('resize', adjustTogglePosition);
    
    // Ajustar imediatamente se já existir
    adjustTogglePosition();

    // Carregar script do n8n chat
    const script = document.createElement('script');
    script.id = 'n8n-chat-script';
    script.type = 'module';
    script.textContent = `
      import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

      createChat({
        webhookUrl: 'https://automacoes.plenuz.co.ao/webhook/971ff544-131e-4182-b709-7f9606c3d9f5/chat',
        webhookConfig: {
          method: 'POST',
          headers: {}
        },
        target: '#n8n-chat',
        mode: 'window',
        startOpen: false,
        showWelcomeScreen: false,
        defaultLanguage: 'pt',
        initialMessages: [
          '⚙️ Olá! Eu sou o assistente da FOA.',
          '📊 Posso ajudar com relatórios, análises e dados da plataforma.'
        ],
        allowFileUploads: true,
        i18n: {
          pt: {
            title: 'Bem-vindo!',
            subtitle: 'Assistente FOA • Construção com Inteligência',
            footer: '',
            getStarted: 'Nova Conversa',
            inputPlaceholder: 'Descreve a tua dúvida ou pedido...',
          },
        },
      });
    `;
    document.body.appendChild(script);

    // Cleanup ao desmontar ou logout
    return () => {
      combinedObserver.disconnect();
      window.removeEventListener('resize', adjustTogglePosition);
      document.getElementById('n8n-chat-script')?.remove();
      document.getElementById('n8n-chat-styles')?.remove();
      document.getElementById('n8n-chat-css')?.remove();
      document.getElementById('n8n-chat')?.remove();
    };
  }, [user]);

  return null;
}
