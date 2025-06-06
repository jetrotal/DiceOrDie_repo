// Configuração refatorada da página de Ficha, herdando da BasePageConfig
class FichaPageConfig extends BasePageConfig {
    constructor() {
        super('ficha');
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
                title: 'Sistemas de RPG',
                items: [
                    { text: 'D&D 5e - Dungeons & Dragons', type: 'info' },
                    { text: 'Pathfinder - Sistema d20', type: 'info' },
                    { text: 'Call of Cthulhu - Horror', type: 'info' },
                    { text: 'Vampire - World of Darkness', type: 'info' }
                ]
            },
            {
                title: 'Dicas de Ficha',
                items: [
                    { text: 'Preencha todos os campos obrigatórios', type: 'info' },
                    { text: 'Defina os atributos cuidadosamente', type: 'info' },
                    { text: 'Adicione uma descrição interessante', type: 'info' }
                ]
            }
        ];
    }

    async initialize() {
        // Usar método da classe pai
        await super.initialize();
        
        // Configurações específicas da ficha se necessário
        this.setupFichaSpecifics();
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
