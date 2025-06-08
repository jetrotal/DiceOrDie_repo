// Configuração refatorada da página de Ficha, herdando da BasePageConfig
class FichaPageConfig extends BasePageConfig {
    constructor() {
        super('ficha');
    }

    getSidebarConfig() {
        return [
            {
                title: 'Navegação',
                items: UnifiedFormHelpers.getStandardNavigationItems()
            },
            {
                title: 'Ações da Ficha',
                items: [
                    { text: 'Nova Ficha', type: 'button', onclick: "fichaForm.createNewCharacter()" },
                    { text: 'Listar Fichas', type: 'button', onclick: "fichaForm.listMyCharacters()" }
                ]
            }
        ];
    }
    
    getRightPanelConfig() {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const id = urlParams.get('id');
        const currentUser = window.DiceOrDieUtils ? DiceOrDieUtils.getCurrentUser() : null;
        
        // Começar com painéis padrão
        const panels = [...UnifiedFormHelpers.getStandardHelpPanels('ficha')];

        // Painel de ações baseado no modo e permissões
        if (mode === 'view' && id) {
            // Modo visualização - sempre mostrar botão de copiar link
            const viewActions = [
                { text: '📋 Copiar Link', type: 'button', onclick: `fichaForm.copyCharacterLink(${id})` }
            ];
            
            // Para botões de edição/deletar, será verificado após carregar dados do personagem
            // usando o método setupCharacterActionButtons que será chamado depois
            
            panels.push({
                title: 'Ações do Personagem',
                items: viewActions,
                id: 'character-actions-panel' // ID para poder atualizar depois
            });
        } else if (currentUser && (mode === 'edit' || !mode)) {
            // Modo edição ou criação com usuário logado
            panels.push({
                title: 'Ações da Ficha',
                items: [
                    { text: '👥 Meus Personagens', type: 'button', onclick: 'fichaForm.listMyCharacters()' },
                    { text: '🆕 Nova Ficha', type: 'button', onclick: 'fichaForm.createNewCharacter()' }
                ]
            });
        } else if (!currentUser) {
            // Usuário não logado
            panels.push({
                title: 'Acesso Necessário',
                items: [
                    { text: '🔒 Faça login para criar fichas', type: 'info' },
                    { text: '👤 Login', type: 'button', onclick: "DiceOrDieUtils.navigateTo('login.html')" },
                    { text: '📝 Criar Conta', type: 'button', onclick: "DiceOrDieUtils.navigateTo('conta.html')" }
                ]
            });
        }

        return panels;
    }

    async initialize() {
        // Usar método da classe pai
        await super.initialize();
        
        // Inicializar o formulário de ficha
        await this.initializeFichaForm();
        
        // Configurações específicas da ficha se necessário
        this.setupFichaSpecifics();
    }

    async initializeFichaForm() {
        return await UnifiedFormHelpers.initializeFormWithConfig(
            FichaForm,
            'ficha',
            'fichaForm'
        );
    }

    setupFichaSpecifics() {
        // Configurações específicas da página de ficha
        // Por exemplo, configurar modo específico baseado em parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        if (mode === 'edit' && window.modeManager) {
            window.modeManager.setMode('edit');
        }
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new FichaPageConfig().initialize();
});
