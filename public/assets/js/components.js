// Sistema de Componentes Reutilizáveis para Dice or Die
class ComponentManager {
    static components = {};
    
    // Carregar um componente HTML
    static async loadComponent(name) {
        if (this.components[name]) {
            return this.components[name];
        }
        
        try {
            const response = await fetch(`../components/${name}.html`);
            if (!response.ok) {
                throw new Error(`Erro ao carregar componente ${name}: ${response.status}`);
            }
            const html = await response.text();
            this.components[name] = html;
            return html;
        } catch (error) {
            console.error(`Erro ao carregar componente ${name}:`, error);
            return `<!-- Erro ao carregar ${name} -->`;
        }
    }
    
    // Renderizar componente em um elemento
    static async renderComponent(componentName, targetSelector) {
        const html = await this.loadComponent(componentName);
        const target = document.querySelector(targetSelector);
        if (target) {
            target.innerHTML = html;
        } else {
            console.warn(`Elemento não encontrado: ${targetSelector}`);
        }
    }
    
    // Configurar navbar com links específicos da página
    static configureNavbar(links) {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        const navHTML = links.map(link => 
            `<a href="${link.url}" ${link.active ? 'class="active"' : ''}>${link.text}</a>`
        ).join('');
        
        navbar.innerHTML = navHTML;
    }
    
    // Configurar sidebar com painéis específicos da página
    static configureSidebar(panels) {
        const menuPanels = document.getElementById('menu-panels');
        if (!menuPanels) return;
        
        const panelsHTML = panels.map(panel => `
            <div class="panel">
                <div class="panel-header">${panel.title}</div>
                <div class="panel-content">
                    ${panel.items.map(item => {
                        if (item.type === 'separator') {
                            return '<div class="panel-separator"></div>';
                        } else if (item.type === 'input') {
                            return `<div class="panel-item">
                                <input type="${item.inputType || 'text'}" 
                                       id="${item.id}" 
                                       placeholder="${item.placeholder || ''}">
                            </div>`;
                        } else if (item.type === 'checkbox') {
                            return `<div class="panel-item">
                                <input type="checkbox" id="${item.id}" checked>
                                <label for="${item.id}">${item.label}</label>
                            </div>`;
                        } else if (item.type === 'info') {
                            return `<div class="panel-item">${item.text}</div>`;
                        } else {
                            return `<div class="panel-item panel-bt"
                                ${item.onclick ? `onclick="${item.onclick}"` : ''}>${item.text}</div>`;
                        }
                    }).join('')}
                </div>
            </div>
        `).join('');
        
        menuPanels.innerHTML = panelsHTML;
    }
    
    // Configurar painel direito com painéis específicos da página
    static configureRightPanel(panels) {
        const rightPanels = document.getElementById('right-panels');
        if (!rightPanels) return;
        
        const panelsHTML = panels.map(panel => `
            <div class="panel">
                <div class="panel-header">${panel.title}</div>
                <div class="panel-content">
                    ${panel.items.map(item => {
                        if (item.type === 'separator') {
                            return '<div class="panel-separator"></div>';
                        } else if (item.type === 'info') {
                            return `<div class="panel-item">${item.text}</div>`;
                        } else {
                            return `<div class="panel-item panel-bt" 
                                ${item.onclick ? `onclick="${item.onclick}"` : ''}>${item.text}</div>`;
                        }
                    }).join('')}
                </div>
            </div>
        `).join('');
        
        rightPanels.innerHTML = panelsHTML;
    }    // Inicializar layout básico da página
    static async initializeLayout() {
        // Carregar logo no slot
        await this.renderComponent('logo', '#logo-slot');
        
        // Carregar userbar inteligente
        this.configureSmartUserbar();
        
        // Inicializar funcionalidades dos componentes
        this.initializeComponents();

        // Configurar navbar automaticamente (após tudo estar carregado)
        this.configureSmartNavbar();
    }

    // Configurar userbar de forma inteligente baseado no estado do usuário
    static configureSmartUserbar() {
        if (typeof DiceOrDieUtils !== 'undefined' && DiceOrDieUtils.getUserbarContent) {
            const userbarSlot = document.getElementById('userbar-slot');
            if (userbarSlot) {
                const userbarContent = DiceOrDieUtils.getUserbarContent();
                userbarSlot.innerHTML = userbarContent;
            }
        }
    }    // Configurar navbar de forma inteligente baseado no estado do usuário
    static configureSmartNavbar() {
        // Aguardar um pouco para garantir que DiceOrDieUtils está disponível
        setTimeout(() => {
            if (typeof DiceOrDieUtils !== 'undefined' && DiceOrDieUtils.getNavbarConfig) {
                const navbarConfig = DiceOrDieUtils.getNavbarConfig();
                this.configureNavbar(navbarConfig);
            } else {
                // Configuração baseada no estado de autenticação
                const navbarConfig = this.getNavbarByAuthStatus();
                this.configureNavbar(navbarConfig);
            }
        }, 100);
    }
    
    // Obter configuração do navbar baseado no estado de autenticação
    static getNavbarByAuthStatus() {
        const isLoggedIn = this.checkUserAuthStatus();
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        if (isLoggedIn) {
            return [
                { text: 'Home', url: '../index.html', active: currentPage === 'index.html' },
                { text: 'Minhas Fichas', url: 'fichas.html', active: currentPage === 'fichas.html' },
                { text: 'Mesas', url: 'mesas.html', active: currentPage === 'mesas.html' },
                { text: 'Loja', url: 'https://jetrotal.github.io/DiceOrDie/html/loja.html', active: currentPage === 'https://jetrotal.github.io/DiceOrDie/html/loja.html' }
            ];
        } else {
            return [
                { text: 'Home', url: '../index.html', active: currentPage === 'index.html' },
                { text: 'Criar Conta', url: 'conta.html', active: currentPage === 'conta.html' },
                { text: 'Fazer Login', url: 'login.html', active: currentPage === 'login.html' }
            ];
        }
    }
    
    // Verificar status de autenticação do usuário
    static checkUserAuthStatus() {
        // Verificar localStorage, sessionStorage ou cookies
        return localStorage.getItem('userToken') || 
               sessionStorage.getItem('isLoggedIn') || 
               document.cookie.includes('auth=');
    }

    // Inicializar funcionalidades dos componentes carregados
    static initializeComponents() {
        // Inicializar dropdown do usuário se existir
        if (typeof DiceOrDieUtils !== 'undefined' && DiceOrDieUtils.initUserDropdown) {
            DiceOrDieUtils.initUserDropdown();
        }
    }
}

// Loader de componentes mais simples para compatibilidade
class ComponentLoader {
    static async loadComponent(componentName, targetId, config = {}) {
        try {
            const response = await fetch(`../components/${componentName}.html`);
            if (!response.ok) {
                console.warn(`Componente ${componentName} não encontrado`);
                return;
            }
            
            const html = await response.text();
            const target = document.getElementById(targetId);
            
            if (target) {
                target.innerHTML = html;
                
                // Aplicar configurações específicas se fornecidas
                if (config.currentPage && componentName === 'sidebar') {
                    // Marcar página atual no sidebar se aplicável
                    ComponentLoader.markCurrentPage(config.currentPage);
                }
            }
        } catch (error) {
            console.error(`Erro ao carregar componente ${componentName}:`, error);
        }
    }
    
    static markCurrentPage(currentPage) {
        // Implementar lógica para marcar página atual no sidebar
        setTimeout(() => {
            const sidebarItems = document.querySelectorAll('.panel-item');
            sidebarItems.forEach(item => {
                if (item.textContent.toLowerCase().includes(currentPage.toLowerCase())) {
                    item.classList.add('active');
                }
            });
        }, 100);
    }
}
