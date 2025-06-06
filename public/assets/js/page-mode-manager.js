// Gerenciador de Modos de Página - Sistema para criar, editar e visualizar
class PageModeManager {
    constructor(pageType) {
        this.pageType = pageType; // 'mesa' ou 'conta'
        this.mode = this.detectMode();
        this.itemId = this.getItemId();
        this.data = null;
        this.originalFormData = null;
    }
    
    detectMode() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('mode') || 'create';
    }
    
    getItemId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
    
    async initialize() {
        console.log(`Inicializando página ${this.pageType} no modo ${this.mode}`);
        
        if (this.mode !== 'create' && this.itemId) {
            await this.loadData();
        }
        
        this.configureUI();
        this.setupEventListeners();
    }
      async loadData() {
            // Carregar dados reais da API
            if (this.pageType === 'mesa') {
                this.data = await this.loadMesaData(this.itemId);
            } else if (this.pageType === 'conta') {
                this.data = await this.loadContaDataFromAPI(this.itemId);
            } else if (this.pageType === 'ficha') {
                this.data = await this.loadFichaData(this.itemId);
            }
        }
    
        async loadContaDataFromAPI(userId) {
            try {
                const response = await fetch(`/users/${userId}`, {
                    headers: this.getAuthHeaders()
                });
    
                const result = await response.json();
                
                if (result.success && result.user) {
                    // Mapear dados do backend para o formato esperado pelo frontend
                    return {
                        id: result.user.id,
                        nome: result.user.nome,
                        sobrenome: result.user.sobrenome,
                        username: result.user.username,
                        genero: result.user.genero,
                        nascimento: result.user.data_nascimento,
                        contato: result.user.email,
                        experiencia: this.mapBackendExperienceToFrontend(result.user.experiencia),
                        avatarUrl: result.user.img_perfil || "https://placehold.co/150x150/333/fff?text=" + (result.user.nome?.charAt(0) || 'U')
                    };
                } else {
                    console.error('Erro ao carregar dados do usuário:', result.error);
                    return null;
                }
            } catch (error) {
                console.error('Erro ao carregar usuário:', error);
                return null;
            }
        }
    
        mapBackendExperienceToFrontend(backendExp) {
            // Mapear experiência do backend para o sistema de níveis do frontend
            const expMapping = {
                'Iniciante': 1,
                'Experiente': 3,
                'Veterano': 5,
                'Lendário': 6
            };
    
            return expMapping[backendExp] || 1;
        }
    
        getAuthHeaders() {
            const headers = {};
            
            // Tentar obter do localStorage (compatibilidade total com test-users.html)
            let currentUser = null;
            
            // Primeiro tenta localStorage (sistema principal usado por test-users.html)
            const savedUser = localStorage.getItem('diceordie_current_user');
            if (savedUser) {
                try {
                    currentUser = JSON.parse(savedUser);
                    console.log('PageModeManager - Usuário encontrado no localStorage:', currentUser.username);
                } catch (e) {
                    console.warn('PageModeManager - Erro ao parsear usuário do localStorage:', e);
                }
            }
            
            // Se não encontrou, tenta sessionStorage (fallback)
            if (!currentUser) {
                const sessionUser = sessionStorage.getItem('currentUser');
                if (sessionUser) {
                    try {
                        currentUser = JSON.parse(sessionUser);
                        console.log('PageModeManager - Usuário encontrado no sessionStorage:', currentUser.username);
                    } catch (e) {
                        console.warn('PageModeManager - Erro ao parsear usuário do sessionStorage:', e);
                    }
                }
            }
            
            // Se encontrou usuário logado, adicionar headers de autenticação
            if (currentUser && currentUser.id) {
                headers['X-User-ID'] = currentUser.id.toString();
                headers['X-User-Role'] = currentUser.role || 'user';
                console.log('PageModeManager - getAuthHeaders: Enviando headers:', headers);
                console.log('PageModeManager - getAuthHeaders: Role do usuário:', currentUser.role);
            } else {
                console.log('PageModeManager - getAuthHeaders: Nenhum usuário logado encontrado');
            }
            
            return headers;
        }
    
        getCurrentUser() {
            // Método helper para obter usuário atual
            let currentUser = null;
            
            // Primeiro tenta localStorage
            const savedUser = localStorage.getItem('diceordie_current_user');
            if (savedUser) {
                try {
                    currentUser = JSON.parse(savedUser);
                } catch (e) {
                    console.warn('Erro ao parsear usuário do localStorage:', e);
                }
            }
            
            // Se não encontrou, tenta sessionStorage
            if (!currentUser) {
                const sessionUser = sessionStorage.getItem('currentUser');
                if (sessionUser) {
                    try {
                        currentUser = JSON.parse(sessionUser);
                    } catch (e) {
                        console.warn('Erro ao parsear usuário do sessionStorage:', e);
                    }
                }
            }
            
            return currentUser;
        }
    
        canEditProfile() {
            // Verificar se o usuário pode editar este perfil
            const currentUser = this.getCurrentUser();
            
            if (!currentUser) {
                console.log('canEditProfile: Nenhum usuário logado');
                return false;
            }
            
            // Admin pode editar qualquer perfil
            if (currentUser.role === 'admin') {
                console.log('canEditProfile: Admin pode editar qualquer perfil');
                return true;
            }
            
            // Usuário comum só pode editar seu próprio perfil
            const profileUserId = this.itemId ? this.itemId.toString() : null;
            const currentUserId = currentUser.id ? currentUser.id.toString() : null;
            
            const canEdit = profileUserId === currentUserId;
            console.log('canEditProfile:', {
                currentUserId,
                profileUserId,
                currentUserRole: currentUser.role,
                canEdit
            });
            
            return canEdit;
        }
    
    async loadMesaData(id) {
        // Mock data para mesa
        return {
            id: id,
            nomeMesa: "Campanha dos Anéis Perdidos",
            sistema: "dnd",
            qtdJogadores: "5",
            autor: "Mestre João",
            publico: true,
            descricao: "Uma aventura épica baseada no universo de Tolkien, onde os heróis devem recuperar anéis mágicos perdidos...",
            capaUrl: "https://placehold.co/150x150/4a90e2/fff?text=RPG",
            participantes: 3,
            status: "ativa"
        };
    }
    
    async loadContaData(id) {
        // Mock data para conta
        return {
            id: id,
            nome: "João",
            sobrenome: "Silva",
            username:"joao.silva",
            genero: "masculino",
            nascimento: "1990-05-15",
            contato: "joao.silva@email.com",
            experiencia: 3,
            avatarUrl: "https://placehold.co/150x150/333/fff?text=JS"
        };
    }
    
    async loadFichaData(id) {
        // Mock data para ficha
        return {
            id: id,
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
    
    configureUI() {
        this.setTitle();
        this.setFieldStates();
        this.setButtons();
        if (this.data) {
            this.loadFieldData();
        }
        this.applyModeStyles();
    }
    
    setTitle() {
        const titleElement = document.getElementById('paginaTitulo');
        if (!titleElement) return;
        
        let title = '';
        if (this.pageType === 'mesa') {
            switch (this.mode) {
                case 'create':
                    title = 'Criar Mesa';
                    break;
                case 'edit':
                    title = 'Editar Mesa';
                    break;
                case 'view':
                    title = this.data ? `Mesa: ${this.data.nomeMesa}` : 'Visualizar Mesa';
                    break;
            }        } else if (this.pageType === 'conta') {
            switch (this.mode) {
                case 'create':
                    title = 'Criar Conta';
                    break;
                case 'edit':
                    title = 'Editar Perfil';
                    break;
                case 'view':
                    title = this.data ? `Perfil: ${this.data.nome} ${this.data.sobrenome}` : 'Visualizar Perfil';
                    break;
            }
        } else if (this.pageType === 'ficha') {
            switch (this.mode) {
                case 'create':
                    title = 'Nova Ficha Genérica';
                    break;
                case 'edit':
                    title = 'Editar Ficha Genérica';
                    break;
                case 'view':
                    title = this.data ? `Ficha: ${this.data.nomePersonagem}` : 'Visualizar Ficha Genérica';
                    break;
            }
        }
        
        titleElement.textContent = title;
        document.title = `Dice or Die - ${title}`;
    }
    
    setFieldStates() {
        const form = document.getElementById('mainForm');
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, select, textarea');
        
        if (this.mode === 'view') {
            // Modo visualização - tornar campos readonly
            inputs.forEach(input => {
                if (input.type === 'password') {
                    // Ocultar campos de senha no modo view
                    const formGroup = input.closest('.form-group');
                    if (formGroup) formGroup.style.display = 'none';
                } else if (input.type === 'checkbox') {
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
            uploadHints.forEach(btn => btn.style.display = 'none');

            // Tratar controles especiais
            this.handleSpecialViewControls();
            
        } else {
            // Modo edição/criação - garantir que campos estão editáveis
            inputs.forEach(input => {
                if (input.id !== 'autor') { // Autor sempre readonly
                    input.readOnly = false;
                    input.disabled = false;
                    input.classList.remove('readonly-field');
                }
            });
        }
    }
    
    handleSpecialViewControls() {
        if (this.pageType === 'conta') {
            // Desabilitar controles de experiência no modo view
            const expControls = document.querySelectorAll('.exp-controls');
            expControls.forEach(ctrl => ctrl.style.display = 'none');
        }
        
        if (this.pageType === 'mesa') {
            // Converter toggle público para badge visual
            const toggleContainer = document.querySelector('.toggle-container');
            if (toggleContainer && this.data) {
                const badge = document.createElement('span');
                badge.className = `status-badge ${this.data.publico ? 'public' : 'private'}`;
                badge.textContent = this.data.publico ? 'Público' : 'Privado';
                toggleContainer.replaceWith(badge);
            }
        }
    }
    
    setButtons() {
        const submitButton = document.getElementById('submitter');
        const formActions = document.querySelector('.form-actions');
        
        if (!submitButton || !formActions) return;
        
        // Limpar botões existentes
        formActions.innerHTML = '';
        
        if (this.mode === 'create') {
            const createBtn = this.createButton('submit-button', this.getCreateButtonText(), 'submit');
            formActions.appendChild(createBtn);
            
        } else if (this.mode === 'edit') {
            const saveBtn = this.createButton('submit-button', 'Salvar Alterações', 'submit');
            const cancelBtn = this.createButton('cancel-button secondary', 'Cancelar', 'button');
            cancelBtn.onclick = () => this.handleCancel();
            
            formActions.appendChild(saveBtn);
            formActions.appendChild(cancelBtn);
            
        } else if (this.mode === 'view') {
            this.createViewModeButtons(formActions);
        }
    }
      getCreateButtonText() {
        if (this.pageType === 'mesa') return 'Criar Mesa';
        if (this.pageType === 'conta') return 'Criar Conta';
        if (this.pageType === 'ficha') return 'Criar Ficha';
        return 'Criar';
    }
    
    createViewModeButtons(container) {
        if (this.pageType === 'mesa') {
            // Botões para mesa no modo view
            const editBtn = this.createButton('edit-button', 'Editar', 'button');
            editBtn.onclick = () => this.switchToEditMode();
            
            const participateBtn = this.createButton('participate-button primary', 'Participar', 'button');
            participateBtn.onclick = () => this.handleParticipate();
            
            const deleteBtn = this.createButton('delete-button danger', 'Apagar', 'button');
            deleteBtn.onclick = () => this.handleDelete();
            
            container.appendChild(editBtn);
            container.appendChild(participateBtn);
            container.appendChild(deleteBtn);
              } else if (this.pageType === 'conta') {
                  // Botões para conta no modo view - verificar permissões
                  if (this.canEditProfile()) {
                      const editBtn = this.createButton('edit-button primary', 'Editar Perfil', 'button');
                      editBtn.onclick = () => this.switchToEditMode();
                      container.appendChild(editBtn);
                  }
                  
              } else if (this.pageType === 'ficha') {
            // Botões para ficha no modo view
            const editBtn = this.createButton('edit-button', 'Editar Ficha', 'button');
            editBtn.onclick = () => this.switchToEditMode();
            
            const deleteBtn = this.createButton('delete-button danger', 'Apagar Ficha', 'button');
            deleteBtn.onclick = () => this.handleDeleteFicha();
            
            container.appendChild(editBtn);
            container.appendChild(deleteBtn);
        }
    }
    
    createButton(className, text, type = 'button') {
        const button = document.createElement('button');
        button.type = type;
        button.className = className;
        button.textContent = text;
        return button;
    }
    
    loadFieldData() {
        if (!this.data) return;
        
        Object.keys(this.data).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = this.data[key];
                } else {
                    field.value = this.data[key];
                }
            }
        });
        
        // Carregar dados especiais
        this.loadSpecialFields();
    }
    
    loadSpecialFields() {
        if (this.pageType === 'conta' && this.data.avatarUrl) {
            const preview = document.getElementById('profilePreview');
            if (preview) preview.src = this.data.avatarUrl;
            
            // Configurar nível de experiência
            if (typeof this.data.experiencia !== 'undefined') {
                this.setExperienceLevel(this.data.experiencia);
            }
        }
        
        if (this.pageType === 'mesa' && this.data.capaUrl) {
            const preview = document.getElementById('campaignPreview');
            if (preview) preview.src = this.data.capaUrl;
        }
    }
    
    setExperienceLevel(level) {
        // Atualizar controles de experiência (se existirem na página conta)
        const dots = document.querySelectorAll('.exp-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === level);
        });
        
        // Simular o sistema de níveis (assumindo que existe)
        if (window.GerenciadorCadastro && window.gerenciadorCadastro) {
            gerenciadorCadastro.currentExp = level;
            gerenciadorCadastro.atualizarExperiencia();
        }
    }
    
    applyModeStyles() {
        const body = document.body;
        body.classList.remove('mode-create', 'mode-edit', 'mode-view');
        body.classList.add(`mode-${this.mode}`);
    }
    
    setupEventListeners() {
        const form = document.getElementById('mainForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }    handleSubmit(e) {
        e.preventDefault();
        
        console.log(`PageModeManager: modo ${this.mode}, tipo ${this.pageType}`);
        
        // Tentar usar os métodos da classe de formulário se disponível
        const formInstance = this.getFormInstance();
        console.log('FormInstance encontrada:', formInstance ? 'SIM' : 'NÃO');
        
        if (this.mode === 'create') {
            if (formInstance && formInstance.handleSubmit) {
                console.log('Usando handleSubmit da classe de formulário para create');
                // Usar o método da classe de formulário para create
                formInstance.handleSubmit(e);
            } else {
                console.log('Usando handleCreate do PageModeManager');
                this.handleCreate();
            }
        } else if (this.mode === 'edit') {
            if (formInstance && formInstance.handleSubmit) {
                console.log('Usando handleUpdateWithFormData para edit');
                // Para edit, queremos pegar os dados mas não redirecionar
                this.handleUpdateWithFormData(formInstance);
            } else {
                console.log('Usando handleUpdate do PageModeManager');
                this.handleUpdate();
            }
        }
    }
      getFormInstance() {
        // Tentar encontrar a instância da classe de formulário
        console.log('Procurando instâncias de formulário...', {
            contaForm: !!window.contaForm,
            mesaForm: !!window.mesaForm,
            fichaForm: !!window.fichaForm
        });
        
        if (window.contaForm) {
            console.log('Usando contaForm');
            return window.contaForm;
        }
        if (window.mesaForm) {
            console.log('Usando mesaForm');
            return window.mesaForm;
        }
        if (window.fichaForm) {
            console.log('Usando fichaForm');
            return window.fichaForm;
        }
        
        console.log('Nenhuma instância de formulário encontrada');
        return null;
    }
    
    async handleUpdateWithFormData(formInstance) {
        console.log('Atualizando item...');
        
        try {
            // Coletar dados usando o método da classe de formulário
            let formData;
            if (formInstance.getFormData) {
                formData = formInstance.getFormData();
            } else if (formInstance.collectFormData) {
                formData = formInstance.collectFormData();
            } else {
                formData = this.collectFormData();
            }
            
            console.log('=== DADOS DO FORMULÁRIO (EDITAR) ===');
            console.log(JSON.stringify(formData, null, 2));
            console.log('=====================================');            // Simular delay de rede
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            alert('Alterações salvas com sucesso!');
            
            // Redirecionar usando a configuração da classe de formulário se disponível
            console.log('Verificando redirecionamento...', {
                hasConfig: !!formInstance.config,
                redirectUrl: formInstance.config?.redirectUrl,
                redirectDelay: formInstance.config?.redirectDelay
            });
            
            if (formInstance.config && formInstance.config.redirectUrl) {
                const delay = formInstance.config.redirectDelay || 1500;
                console.log(`Redirecionando para ${formInstance.config.redirectUrl} em ${delay}ms`);
                setTimeout(() => {
                    window.location.href = formInstance.config.redirectUrl;
                }, delay);
            } else {
                console.log('Sem configuração de redirecionamento encontrada');
            }
        } catch (error) {
            console.error('Erro ao atualizar:', error);
            alert('Erro ao salvar alterações!');
        }
    }
      handleCreate() {
        console.log('Criando novo item...');
        
        // Coletar dados do formulário
        const formData = this.collectFormData();
        console.log('=== DADOS DO FORMULÁRIO (CRIAR) ===');
        console.log(JSON.stringify(formData, null, 2));
        console.log('====================================');
        
        // Aqui seria a lógica de criação
        alert(`${this.pageType === 'mesa' ? 'Mesa' : this.pageType === 'conta' ? 'Conta' : 'Ficha'} criada com sucesso!`);
    }
    
    handleUpdate() {
        console.log('Atualizando item...');
        
        // Coletar dados do formulário
        const formData = this.collectFormData();
        console.log('=== DADOS DO FORMULÁRIO (EDITAR) ===');
        console.log(JSON.stringify(formData, null, 2));
        console.log('=====================================');
        
        // Aqui seria a lógica de atualização
        alert('Alterações salvas com sucesso!');
    }
    
    handleCancel() {
        if (confirm('Descartar alterações?')) {
            this.switchToViewMode();
        }
    }
    
    handleParticipate() {
        alert('Solicitação de participação enviada!');
    }
    
    handleDelete() {
        if (confirm('Tem certeza que deseja apagar esta mesa?')) {
            alert('Mesa apagada com sucesso!');
            // Redirecionar para lista de mesas
            window.location.href = 'mesas.html';
        }
    }
    
    handleDeleteFicha() {
        // Obter nome do personagem para a confirmação
        const nomePersonagem = document.getElementById('nomePersonagem')?.value || 'esta ficha';
        
        if (confirm(
            `Tem certeza que deseja excluir a ficha "${nomePersonagem}"?\n\n` +
            'Esta ação não pode ser desfeita e todos os dados serão perdidos permanentemente.'
        )) {
            alert('Ficha excluída com sucesso!');
            // Redirecionar para lista de mesas
            window.location.href = 'mesas.html';
        }
    }

    switchToEditMode() {
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('mode', 'edit');
        window.location.href = newUrl.toString();
    }
    
    switchToViewMode() {
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('mode', 'view');
        window.location.href = newUrl.toString();
    }
    
    setMode(newMode) {
        this.mode = newMode;
        this.configureUI();
    }
    
    // Método estático para inicializar o gerenciador
    static initialize(pageType) {
        const manager = new PageModeManager(pageType);
        manager.initialize();
        return manager;
    }
    
    collectFormData() {
        const form = document.getElementById('mainForm');
        if (!form) return {};
        
        const formData = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name) {
                if (input.type === 'checkbox') {
                    formData[input.name] = input.checked;
                } else if (input.type === 'radio') {
                    if (input.checked) {
                        formData[input.name] = input.value;
                    }
                } else {
                    formData[input.name] = input.value;
                }
            }
        });
        
        return formData;
    }
}

// Disponibilizar globalmente
window.PageModeManager = PageModeManager;
