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
        // Por exemplo, configurar modo específico baseado em parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
    
        if (mode === 'edit' && window.contaModeManager) {
            window.contaModeManager.setMode('edit');
        }
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new ContaPageConfig().initialize();
});
