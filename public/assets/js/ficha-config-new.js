// Configurações específicas para a página de ficha
class FichaConfig {
    constructor() {
        this.init();
    }

    init() {
        this.setupPageMode();
        this.loadComponentes();
    }

    setupPageMode() {
        // Usar o PageModeManager como os outros formulários
        window.fichaModeManager = PageModeManager.initialize('ficha');
    }

    async loadComponentes() {
        try {
            // Carregar componentes da interface
            await ComponentLoader.loadComponent('logo', 'logo-slot');
            await ComponentLoader.loadComponent('navbar', 'navbar');
            await ComponentLoader.loadComponent('sidebar', 'menu-panels', {
                currentPage: 'ficha'
            });
            await ComponentLoader.loadComponent('userbar', 'userbar-slot');
            await ComponentLoader.loadComponent('rightpanel', 'right-panels');
            
            // Configurar navbar após carregamento
            this.configureNavbar();
        } catch (error) {
            console.error('Erro ao carregar componentes:', error);
        }
    }
    
    configureNavbar() {
        // Configurar links da navbar para contexto de ficha
        const navbar = document.getElementById('navbar');
        if (navbar) {
            const navLinks = [
                { text: 'Mesas', url: 'mesas.html', active: false },
                { text: 'Fichas', url: 'ficha.html', active: true },
                { text: 'Loja', url: 'https://jetrotal.github.io/DiceOrDie/html/loja.html', active: false }
            ];
            
            const navHTML = navLinks.map(link => 
                `<a href="${link.url}" ${link.active ? 'class="active"' : ''}>${link.text}</a>`
            ).join('');
            
            navbar.innerHTML = navHTML;
        }
    }
}

// Inicialização da configuração
document.addEventListener('DOMContentLoaded', function() {
    window.fichaConfig = new FichaConfig();
    console.log('Ficha config initialized');
});
