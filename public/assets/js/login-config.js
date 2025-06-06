// Configuração específica da página de Login
document.addEventListener('DOMContentLoaded', async function() {
    // Inicializar layout básico (logo + userbar + navbar inteligente)
    await ComponentManager.initializeLayout();
    
    // Configurar sidebar com informações sobre o jogo
    ComponentManager.configureSidebar([
        {
            title: 'Bem-vindo ao Dice or Die',
            content: `
                <div class="welcome-panel">
                    <p>Entre na sua conta para acessar mesas de RPG incríveis e conectar-se com outros jogadores!</p>
                    <ul>
                        <li>🎲 Crie e participe de mesas</li>
                        <li>👥 Converse com outros jogadores</li>
                        <li>📊 Acompanhe suas estatísticas</li>
                        <li>🎮 Sistema de dados integrado</li>
                    </ul>
                </div>
            `,
            type: 'info'
        }
    ]);
    
    // Se não há userbar para login, podemos ocultar ou mostrar links úteis
    const rightPanels = document.getElementById('right-panels');
    if (rightPanels) {
        rightPanels.innerHTML = `
            <div class="side-panel">
                <div class="panel-header">
                    <h3>Precisa de Ajuda?</h3>
                </div>
                <div class="panel-content">
                    <div class="help-links">
                        <a href="#" class="help-link">Como criar uma conta</a>
                        <a href="#" class="help-link">Esqueci minha senha</a>
                        <a href="#" class="help-link">Suporte técnico</a>
                        <a href="#" class="help-link">Regras da comunidade</a>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Foco automático no campo de email/celular
    const contatoField = document.getElementById('contato');
    if (contatoField) {
        contatoField.focus();
    }
    
    console.log('Página de login configurada com sucesso!');
});
