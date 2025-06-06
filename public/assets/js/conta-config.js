// Configuração refatorada da página de Conta, herdando da BasePageConfig
class ContaPageConfig extends BasePageConfig {
    constructor() {
        super('conta');
    }

    getSidebarConfig() {
        return [
            {
                title: 'Navegação',
                items: [
                    { text: 'Ver Mesas', type: 'button', onclick: "DiceOrDieUtils.navigateTo('mesas.html')" },
                    { text: 'Fazer Login', type: 'button', onclick: "DiceOrDieUtils.navigateTo('login.html')" }
                ]
            }
        ];
    }
    
    getRightPanelConfig() {
        return [
            {
                title: 'Níveis de Experiência',
                items: [
                    { text: 'Goblin - Novo no RPG', type: 'info' },
                    { text: 'Cavaleiro - Alguma experiência', type: 'info' },
                    { text: 'Mago - Jogador experiente', type: 'info' },
                    { text: 'Dragão - Veterano', type: 'info' },
                    { text: 'Titã - Mestre em sistemas', type: 'info' },
                    { text: 'Deus Antigo - Lenda viva', type: 'info' }
                ]
            },
            {
                title: 'Dicas de Perfil',
                items: [
                    { text: 'Use uma foto de perfil clara', type: 'info' },
                    { text: 'Defina seu nível de experiência', type: 'info' },
                    { text: 'Mantenha seus dados atualizados', type: 'info' }
                ]
            }
        ];
    }

    async initialize() {
        // Usar método da classe pai
        await super.initialize();
        
        // Configurações específicas da conta se necessário
        this.setupContaSpecifics();
    }
    
    setupContaSpecifics() {
        // Configurações específicas da página de conta
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const id = urlParams.get('id');
    
        // Se estivermos em modo de edição, aguardar a inicialização do formulário e carregar dados
        if (mode === 'edit' && id) {
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
        // Aguardar até que o formulário esteja disponível
        const maxAttempts = 50;
        let attempts = 0;
        
        const waitForForm = () => {
            if (window.contaForm && window.contaForm.loadUserDataForEdit) {
                console.log('Formulário encontrado, carregando dados do usuário...');
                window.contaForm.loadUserDataForEdit();
                return true;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(waitForForm, 100);
            } else {
                console.warn('Timeout aguardando inicialização do formulário de conta');
            }
            return false;
        };
        
        // Iniciar a espera
        setTimeout(waitForForm, 100);
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new ContaPageConfig().initialize();
});
