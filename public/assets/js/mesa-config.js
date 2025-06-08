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
        const currentUser = DiceOrDieUtils.getCurrentUser();
        const panels = [
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
        
        // Adicionar painel de ações se usuário logado
        if (currentUser) {
            // Detectar modo atual
            const urlParams = new URLSearchParams(window.location.search);
            const mode = urlParams.get('mode');
            
            if (!mode || mode === 'create') {
                // Modo criação - mostrar ações de rascunho
                panels.unshift({
                    title: 'Ações da Mesa',
                    items: [
                        { text: 'Salvar Rascunho', type: 'button', onclick: "MesaForm.saveAsDraft()" },
                        { text: 'Carregar Rascunho', type: 'button', onclick: "MesaForm.loadDraft()" },
                        { text: 'Limpar Formulário', type: 'button', onclick: "MesaForm.clearForm()" },
                        { text: 'Ver Mesas', type: 'button', onclick: "DiceOrDieUtils.navigateTo('mesas.html')" }
                    ]
                });
            } else {
                // Modo edit/view - mostrar ações de navegação
                panels.unshift({
                    title: 'Navegação',
                    items: [
                        { text: 'Minhas Mesas', type: 'button', onclick: "this.goToMyTables()" },
                        { text: 'Nova Mesa', type: 'button', onclick: "DiceOrDieUtils.navigateTo('mesa.html')" },
                        { text: 'Ver Todas', type: 'button', onclick: "DiceOrDieUtils.navigateTo('mesas.html')" }
                    ]
                });
            }
        } else {
            // Usuário não logado - mostrar painel de autenticação
            panels.unshift({
                title: 'Acesso Necessário',
                items: [
                    { text: 'Para criar mesas, faça login primeiro', type: 'info' },
                    { text: 'Ir para Login', type: 'button', onclick: "DiceOrDieUtils.navigateTo('login.html')" },
                    { text: 'Criar Conta', type: 'button', onclick: "DiceOrDieUtils.navigateTo('conta.html')" }
                ]
            });
        }
        
        return panels;
    }

    goToMyTables() {
        const currentUser = DiceOrDieUtils.getCurrentUser();
        if (currentUser) {
            // Redirecionar para mesas do usuário atual
            window.location.href = `mesas.html?user=${currentUser.id}`;
        }
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
