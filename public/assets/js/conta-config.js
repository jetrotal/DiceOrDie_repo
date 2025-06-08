// Configuração refatorada da página de Conta, herdando da BasePageConfig
class ContaPageConfig extends BasePageConfig {
    constructor() {
        super('conta');
    }

    getSidebarConfig() {
        return [
            {
                title: 'Navegação',
                items: UnifiedFormHelpers.getStandardNavigationItems()
            }
        ];
    }
    
    getRightPanelConfig() {
        return UnifiedFormHelpers.getStandardHelpPanels('conta');
    }

    async initialize() {
        // Usar método da classe pai
        await super.initialize();
        
        // Inicializar o formulário de conta
        await this.initializeContaForm();
        
        // Configurações específicas da conta se necessário
        this.setupContaSpecifics();
    }

    async initializeContaForm() {
        return await UnifiedFormHelpers.initializeFormWithConfig(
            ContaForm,
            'conta',
            'contaForm',
            'gerenciadorCadastro' // Legacy alias
        );
    }
    
    setupContaSpecifics() {
        // Configurações específicas da página de conta
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const id = urlParams.get('id');
    
        // Se estivermos em modo de edição ou visualização, aguardar a inicialização do formulário e carregar dados
        if ((mode === 'edit' || mode === 'view') && id) {
            this.waitForFormAndLoadData(id);
        }

        // Configurar o gerenciador de modo se disponível
        if (window.contaModeManager) {
            if (mode) {
                window.contaModeManager.setMode(mode);
            }
        }
    }

    async waitForFormAndLoadData(userId) {
        return await UnifiedFormHelpers.waitForFormAndLoadData(
            'contaForm',
            'loadUserData',
            userId
        );
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new ContaPageConfig().initialize();
});
