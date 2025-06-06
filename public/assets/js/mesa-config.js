// Configuração refatorada da página de Mesa, herdando da BasePageConfig
class MesaPageConfig extends BasePageConfig {
    constructor() {
        super('mesa');
    }

    getSidebarConfig() {
        return [
            {
                title: 'Navegação',
                items: [
                    { text: 'Ver Mesas', type: 'button', onclick: "DiceOrDieUtils.navigateTo('mesas.html')" },
                    { text: 'Minha Conta', type: 'button', onclick: "DiceOrDieUtils.navigateTo('conta.html')" }
                ]
            }
            
        ];
    }
    
    getRightPanelConfig() {
        return [
            {
                title: 'Dicas para Mestres',
                items: [
                    { text: 'Escolha um sistema que você conhece bem', type: 'info' },
                    { text: 'Defina expectativas claras na descrição', type: 'info' },
                    { text: 'Use uma imagem atrativa para a capa', type: 'info' }
                ]
            },
            {
                title: 'Sistemas Populares',
                items: [
                    { text: 'D&D 5e', type: 'info' },
                    { text: 'GURPS', type: 'info' },
                    { text: 'Cyberpunk 2020', type: 'info' },
                    { text: 'Vampiro', type: 'info' }
                ]
            }
        ];
    }

    async initialize() {
        // Usar método da classe pai
        await super.initialize();
        
        // Configurações específicas da mesa se necessário
        this.setupMesaSpecifics();
    }

    setupMesaSpecifics() {
        // Configurações específicas da página de mesa
        // Por exemplo, carregar rascunho automaticamente se existir
       
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new MesaPageConfig().initialize();
});
