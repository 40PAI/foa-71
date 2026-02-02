import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function FOAAssistant() {
  const { user } = useAuth();

  useEffect(() => {
    // Só carrega o chat se o usuário estiver autenticado
    if (!user) return;

    // Verificar se já foi carregado
    if (document.getElementById('n8n-chat-script')) return;

    // Adicionar estilos customizados FOA
    const style = document.createElement('style');
    style.id = 'n8n-chat-styles';
    style.textContent = `
      :root {
        /* Cores oficiais FOA */
        --chat--color-primary: #002D8B;
        --chat--color-primary-shade-50: #002472;
        --chat--color-primary-shade-100: #001B59;

        --chat--color-secondary: #A65628;
        --chat--color-secondary-shade-50: #8F4822;

        --chat--color-white: #ffffff;
        --chat--color-dark: #0A0E25;
        --chat--color-light: #F4F6FA;
        --chat--color-light-shade-50: #E6E9F1;
        --chat--color-light-shade-100: #C2C5CC;
        --chat--color-medium: #D2D4D9;
        --chat--color-disabled: #777980;
        --chat--color-typing: #404040;

        /* Layout */
        --chat--spacing: 1rem;
        --chat--border-radius: 0.5rem;
        --chat--transition-duration: 0.15s;

        --chat--window--width: 400px;
        --chat--window--height: 600px;

        /* Header */
        --chat--header-height: auto;
        --chat--header--padding: var(--chat--spacing);
        --chat--header--background: var(--chat--color-primary);
        --chat--header--color: var(--chat--color-white);
        --chat--header--border-top: none;
        --chat--header--border-bottom: 3px solid var(--chat--color-secondary);
        --chat--heading--font-size: 1.8em;
        --chat--subtitle--font-size: inherit;
        --chat--subtitle--line-height: 1.6;

        /* Área de digitação */
        --chat--textarea--height: 50px;

        /* Mensagens */
        --chat--message--font-size: 1rem;
        --chat--message--padding: var(--chat--spacing);
        --chat--message--border-radius: var(--chat--border-radius);
        --chat--message-line-height: 1.6;

        /* Mensagem do BOT */
        --chat--message--bot--background: var(--chat--color-white);
        --chat--message--bot--color: var(--chat--color-dark);
        --chat--message--bot--border: 1px solid var(--chat--color-primary);

        /* Mensagem do USUÁRIO */
        --chat--message--user--background: var(--chat--color-secondary);
        --chat--message--user--color: var(--chat--color-white);
        --chat--message--user--border: none;

        /* Bloco pré-formatado */
        --chat--message--pre--background: rgba(0, 45, 139, 0.05);

        /* Botão flutuante */
        --chat--toggle--background: var(--chat--color-secondary);
        --chat--toggle--hover--background: #8F4822;
        --chat--toggle--active--background: #72391C;
        --chat--toggle--color: var(--chat--color-white);
        --chat--toggle--size: 64px;
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
    `;
    document.head.appendChild(style);

    // Remoção dinâmica de branding
    const brandingObserver = new MutationObserver(() => {
      document.querySelectorAll('.powered-by, [class*="powered"], footer, #footer, [class*="branding"], a[href*="n8n"]').forEach(el => el.remove());
    });
    brandingObserver.observe(document.body, { childList: true, subtree: true });

    // Adicionar link do CSS do n8n chat
    const cssLink = document.createElement('link');
    cssLink.id = 'n8n-chat-css';
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css';
    document.head.appendChild(cssLink);

    // Criar container do chat
    let chatContainer = document.getElementById('n8n-chat');
    if (!chatContainer) {
      chatContainer = document.createElement('div');
      chatContainer.id = 'n8n-chat';
      document.body.appendChild(chatContainer);
    }

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
      brandingObserver.disconnect();
      document.getElementById('n8n-chat-script')?.remove();
      document.getElementById('n8n-chat-styles')?.remove();
      document.getElementById('n8n-chat-css')?.remove();
      document.getElementById('n8n-chat')?.remove();
    };
  }, [user]);

  return null;
}
