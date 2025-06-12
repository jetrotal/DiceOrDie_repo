// Configuração específica da página de Fichas
class FichasPageConfig {
    static getSidebarConfig() {
        return [
            {
                title: 'Fichas',
                items: [
                    { text: 'Todas', type: 'button', onclick: "DiceOrDieUtils.navigateTo('fichas.html?filtro=todas')"  },
                    { text: 'Favoritas', type: 'button', onclick: "DiceOrDieUtils.navigateTo('fichas.html?filtro=favoritas')"  },
                    { text: 'D&D 5e', type: 'button', onclick: "DiceOrDieUtils.navigateTo('fichas.html?filtro=dnd5e')"  },
                    { type: 'separator' },
                    { text: 'Por Sistema', type: 'button', onclick: "DiceOrDieUtils.navigateTo('fichas.html?filtro=sistema')"  },
                    { text: 'Por Nível', type: 'button', onclick: "DiceOrDieUtils.navigateTo('fichas.html?filtro=nivel')"  },
                    { type: 'separator' },
                    { text: 'Criar Ficha', type: 'button', onclick: "DiceOrDieUtils.navigateTo('ficha.html')"  }
                ]
            },
            {
                title: 'Filtrar Fichas',
                items: [
                    { type: 'input', id: 'searchBox', placeholder: 'Digite sua busca...' },
                    { type: 'checkbox', id: 'searchName', label: 'Por Nome' },
                    { type: 'checkbox', id: 'searchRace', label: 'Por Raça' },
                    { type: 'checkbox', id: 'searchClass', label: 'Por Classe' }
                ]
            }
        ];
    }

    static async initialize() {
        // Inicializar layout básico (inclui navbar inteligente)
        await ComponentManager.initializeLayout();
        
        // Configurar sidebar específica
        ComponentManager.configureSidebar(this.getSidebarConfig());
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    FichasPageConfig.initialize();
});