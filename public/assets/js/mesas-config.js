// Configuração específica da página de Mesas
class MesasPageConfig {
    static getSidebarConfig() {
        return [
            {
                title: 'Mesas',
                items: [
                    { text: 'Ao Vivo', type: 'button', onclick: "DiceOrDieUtils.navigateTo('mesas.html?filtro=ao-vivo')"  },
                    { text: 'Recomendadas', type: 'button', onclick: "DiceOrDieUtils.navigateTo('mesas.html?filtro=recomendadas')"  },
                    { type: 'separator' },
                    { text: 'Mesas Favoritas', type: 'button', onclick: "DiceOrDieUtils.navigateTo('mesas.html?filtro=favoritas')"  },
                    { text: 'Histórico', type: 'button', onclick: "DiceOrDieUtils.navigateTo('mesas.html?filtro=historico')"  },
                    { text: 'Minhas Mesas', type: 'button', onclick: "DiceOrDieUtils.navigateTo('mesas.html?filtro=minhas-mesas')"  },
                    { type: 'separator' },
                    { text: 'Criar Mesa', type: 'button', onclick: "DiceOrDieUtils.navigateTo('mesa.html')"  }
                ]
            },
            {
                title: 'Filtrar Mesas',
                items: [
                    { type: 'input', id: 'searchBox', placeholder: 'Digite sua busca...' },
                    { type: 'checkbox', id: 'searchTitle', label: 'Por Título' },
                    { type: 'checkbox', id: 'searchSystem', label: 'Por Sistema' },
                    { type: 'checkbox', id: 'searchCreator', label: 'Por Criador' }
                ]
            }
        ];
    }      static async initialize() {
        // Inicializar layout básico (inclui navbar inteligente)
        await ComponentManager.initializeLayout();
        
        // Configurar sidebar específica
        ComponentManager.configureSidebar(this.getSidebarConfig());
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    MesasPageConfig.initialize();
});
