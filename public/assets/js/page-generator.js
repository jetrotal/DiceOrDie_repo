// Gerador de Páginas para Dice or Die
class PageGenerator {
    static templateCache = {};
    
    // Carregar template base
    static async loadTemplate(templateName = 'base') {
        if (this.templateCache[templateName]) {
            return this.templateCache[templateName];
        }
        
        try {
            const response = await fetch(`../templates/${templateName}.html`);
            if (!response.ok) {
                throw new Error(`Erro ao carregar template ${templateName}: ${response.status}`);
            }
            const html = await response.text();
            this.templateCache[templateName] = html;
            return html;
        } catch (error) {
            console.error(`Erro ao carregar template ${templateName}:`, error);
            return null;
        }
    }
    
    // Gerar HTML da página usando template
    static async generatePage(config) {
        const template = await this.loadTemplate(config.template || 'base');
        if (!template) return null;
        
        let html = template;
        
        // Substituir placeholders
        html = html.replace('{{PAGE_TITLE}}', config.title || 'Página');
        html = html.replace('{{PAGE_CSS}}', config.css || '');
        html = html.replace('{{PAGE_CONTENT}}', config.content || '');
        html = html.replace('{{PAGE_SCRIPTS}}', config.scripts || '');
        
        return html;
    }
    
    // Criar configuração padrão de página
    static createPageConfig({
        title = 'Nova Página',
        css = '',
        content = '<div>Conteúdo da página</div>',
        scripts = '',
        navbar = [],
        sidebar = [],
        rightPanel = [],
        showUserbar = true
    }) {
        return {
            title,
            css,
            content,
            scripts: scripts + `
                <script>
                    class PageConfig {
                        static getNavbarConfig() {
                            return ${JSON.stringify(navbar)};
                        }
                        
                        static getSidebarConfig() {
                            return ${JSON.stringify(sidebar)};
                        }
                        
                        static getRightPanelConfig() {
                            return ${JSON.stringify(rightPanel)};
                        }
                        
                        static async initialize() {
                            await ComponentManager.initializeLayout();
                            ComponentManager.configureNavbar(this.getNavbarConfig());
                            ComponentManager.configureSidebar(this.getSidebarConfig());
                            ComponentManager.configureRightPanel(this.getRightPanelConfig());
                            ${showUserbar ? '' : 'document.getElementById("userbar-slot").style.display = "none";'}
                        }
                    }
                    
                    document.addEventListener('DOMContentLoaded', () => {
                        PageConfig.initialize();
                    });
                </script>
            `
        };
    }
}

// Utilitário para criar páginas rapidamente
class QuickPageBuilder {
    // Criar página de listagem (ex: mesas, usuários, etc)
    static createListingPage(config) {
        const content = `
            <div class="listing-container">
                ${config.items ? config.items.map(item => `
                    <div class="item-card">
                        ${item.image ? `<img src="${item.image}" alt="${item.title}" class="item-image">` : ''}
                        <div class="item-info">
                            <div class="item-title">${item.title}</div>
                            ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
                            ${item.tags ? `<div class="item-tags">
                                ${item.tags.map(tag => `<div class="item-tag">${tag}</div>`).join('')}
                            </div>` : ''}
                        </div>
                        ${item.status ? `<div class="item-status status-${item.status.type}">${item.status.text}</div>` : ''}
                    </div>
                `).join('') : '<p>Nenhum item encontrado.</p>'}
            </div>
        `;
        
        return PageGenerator.createPageConfig({
            title: config.title,
            content,
            navbar: config.navbar || [],
            sidebar: config.sidebar || [],
            rightPanel: config.rightPanel || []
        });
    }
    
    // Criar página de formulário
    static createFormPage(config) {
        const content = `
            <div class="form-card">
                <div class="form-header">
                    <h1>${config.formTitle}</h1>
                    ${config.formDescription ? `<p>${config.formDescription}</p>` : ''}
                </div>
                
                <form id="mainForm" class="${config.formClass || 'main-form'}">
                    ${config.sections ? config.sections.map(section => `
                        <div class="form-section">
                            <h2 class="section-title">${section.title}</h2>
                            ${section.fields.map(field => `
                                <div class="form-group">
                                    <label for="${field.id}">${field.label}</label>
                                    <input type="${field.type}" 
                                           id="${field.id}" 
                                           name="${field.name || field.id}"
                                           ${field.required ? 'required' : ''}
                                           ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}>
                                </div>
                            `).join('')}
                        </div>
                    `).join('') : ''}
                    
                    <div class="form-actions">
                        <button type="submit" class="submit-button">${config.submitText || 'Enviar'}</button>
                    </div>
                </form>
            </div>
        `;
        
        return PageGenerator.createPageConfig({
            title: config.title,
            css: '<link rel="stylesheet" href="../assets/css/forms.css">',
            content,
            navbar: config.navbar || [],
            sidebar: config.sidebar || [],
            rightPanel: config.rightPanel || []
        });
    }
}
