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
        const form = document.getElementById('mainForm');
        if (form) {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (!input.classList.contains('readonly')) {
                    input.readOnly = false;
                    input.classList.remove('readonly-field');
                }
            });
        }
    }

    disableForm() {
        const form = document.getElementById('mainForm');
        if (form) {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    input.disabled = true;
                } else {
                    input.readOnly = true;
                    input.classList.add('readonly-field');
                }
            });
            
            // Ocultar controles de upload
            const uploadButtons = form.querySelectorAll('.upload-button');
            uploadButtons.forEach(btn => btn.style.display = 'none');
            
            const uploadHints = form.querySelectorAll('.upload-hint');
            uploadHints.forEach(hint => hint.style.display = 'none');
        }
    }

    async loadFichaData() {
        if (!this.fichaId) return;

        try {
            // Simular carregamento de dados (em produção seria uma chamada real à API)
            console.log(`Loading ficha data for ID: ${this.fichaId}`);
            
            // Dados simulados para teste
            const fichaData = this.getSimulatedFichaData();
            
            // Popular o formulário
            if (window.fichaForm) {
                window.fichaForm.populateForm(fichaData);
            }
            
        } catch (error) {
            console.error('Erro ao carregar dados da ficha:', error);
            this.showError('Erro ao carregar os dados da ficha');
        }
    }

    getSimulatedFichaData() {
        // Dados simulados para demonstração
        return {
            nomeJogador: "Jogador Exemplo",
            nomePersonagem: "Aragorn",
            nivel: 5,
            raca: "humano",
            classe: "patrulheiro",
            pontosVida: 45,
            classeArmadura: 16,
            forca: 16,
            destreza: 18,
            constituicao: 14,
            inteligencia: 12,
            sabedoria: 16,
            carisma: 13
        };
    }

    showError(message) {
        // Implementar exibição de erro
        console.error(message);
        
        // Aqui poderia ser um toast ou modal de erro
        alert(message);
    }

    // Métodos para diferentes ações da ficha
    async saveFicha(fichaData) {
        try {
            console.log('Saving ficha:', fichaData);
            
            // Simular salvamento (em produção seria uma chamada real à API)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return {
                success: true,
                fichaId: this.fichaId || `ficha_${Date.now()}`,
                message: 'Ficha salva com sucesso!'
            };
            
        } catch (error) {
            console.error('Erro ao salvar ficha:', error);
            throw error;
        }
    }    async deleteFicha() {
        if (!this.fichaId) return;

        // Obter nome do personagem para a confirmação
        const nomePersonagem = document.getElementById('nomePersonagem')?.value || 'esta ficha';
        
        const confirmDelete = confirm(
            `Tem certeza que deseja excluir a ficha "${nomePersonagem}"?\n\n` +
            'Esta ação não pode ser desfeita e todos os dados serão perdidos permanentemente.'
        );
        
        if (confirmDelete) {
            try {
                console.log(`Deleting ficha: ${this.fichaId}`);
                
                // Simular exclusão (em produção seria uma chamada real à API)
                await new Promise(resolve => setTimeout(resolve, 500));
                
                alert('Ficha excluída com sucesso!');
                window.location.href = 'mesas.html';
                
            } catch (error) {
                console.error('Erro ao excluir ficha:', error);
                this.showError('Erro ao excluir a ficha');
            }
        }
    }

    // Método para duplicar uma ficha
    duplicateFicha() {
        if (!window.fichaForm) return;

        const currentData = window.fichaForm.collectFormData();
        
        // Remover dados específicos da ficha atual
        delete currentData.fichaId;
        currentData.nomePersonagem = `${currentData.nomePersonagem} (Cópia)`;
        
        // Resetar formulário e popular com dados duplicados
        window.fichaForm.resetForm();
        window.fichaForm.populateForm(currentData);
        
        // Mudar para modo de criação
        window.fichaModeManager.setMode('create');
    }

    setupViewModeButtons() {
        const editButton = document.getElementById('editButton');
        const deleteButton = document.getElementById('deleteButton');

        if (editButton) {
            editButton.addEventListener('click', () => {
                this.switchToEditMode();
            });
        }

        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                this.deleteFicha();
            });
        }
    }

    switchToEditMode() {
        // Mudar para modo de edição mantendo o ID da ficha
        const url = new URL(window.location.href);
        url.searchParams.set('mode', 'edit');
        window.location.href = url.toString();
    }
}

// Inicialização da configuração
document.addEventListener('DOMContentLoaded', function() {
    window.fichaConfig = new FichaConfig();
    console.log('Ficha config initialized');
});
