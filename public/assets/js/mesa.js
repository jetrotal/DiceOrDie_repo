// Classe específica para o formulário de mesa, herdando da BaseForm
class MesaForm extends BaseForm {
    constructor() {
        // Use centralized configuration instead of hardcoded values
        const config = FormConstants.getFormConfig('mesa');
        super('mainForm', config);

        // Detectar modo baseado na URL (usando sistema de modos)
        this.detectPageMode();

        // Inicializar componente de upload de imagem
        this.imageUpload = new ImageUploadMixin({
            purpose: 'table', // Mudança para table em vez de campaign
            parentForm: this
        });

        this.setupMesaSpecificElements();
        this.initMesaFeatures();
        
        // Atualizar título da página baseado no modo
        this.updatePageTitle();
        
        // Se estivermos em modo de edição ou visualização, carregar dados automaticamente
        if (this.isEditing || this.isViewing) {
            setTimeout(() => {
                this.loadTableData();
            }, 500);
        }
        
        // Configurar botões específicos para cada modo
        setTimeout(() => {
            this.setupModeSpecificButtons();
        }, 600);
    }

    detectPageMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const id = urlParams.get('id');
        
        this.mode = mode || 'create';
        this.isEditing = mode === 'edit';
        this.isViewing = mode === 'view';
        this.editingTableId = id;
        this.viewingTableId = id;
        
        console.log('Mesa mode detection:', {
            mode: this.mode,
            isEditing: this.isEditing,
            isViewing: this.isViewing,
            tableId: id
        });
    }

    updatePageTitle() {
        const titleElement = document.getElementById('paginaTitulo');
        if (!titleElement) return;
        
        switch (this.mode) {
            case 'create':
                titleElement.textContent = 'Criar Mesa';
                break;
            case 'edit':
                titleElement.textContent = 'Editar Mesa';
                break;
            case 'view':
                titleElement.textContent = this.currentTable ? `Mesa: ${this.currentTable.nome}` : 'Visualizar Mesa';
                break;
        }
        
        document.title = `Dice or Die - ${titleElement.textContent}`;
    }

    setupMesaSpecificElements() {
        this.publicoToggle = document.getElementById('publico');
        this.publicoLabel = document.getElementById('publicoLabel');
        this.autorField = document.getElementById('autor');
    }

    initMesaFeatures() {
        this.setupToggle();
        this.setDefaultAuthor();
    }

    setupModeIntegration() {
        // IMPORTANTE: NÃO usar PageModeManager para evitar conflitos
        // Mesa tem seu próprio sistema de modos que funciona melhor
        console.log('Mesa usando sistema de modos próprio - ignorando PageModeManager');
    }

    setupToggle() {
        if (this.publicoToggle && this.publicoLabel) {
            // Definir estado padrão apenas no modo create
            if (!this.isEditing && !this.isViewing) {
                this.publicoToggle.checked = true; // Padrão para "Sim" em novas mesas
                this.publicoLabel.textContent = 'Sim';
            }
            
            this.publicoToggle.addEventListener('change', () => {
                this.publicoLabel.textContent = this.publicoToggle.checked ? 'Sim' : 'Não';
            });
        }
    }

    setDefaultAuthor() {
        if (this.autorField) {
            // Carregar nome do usuário logado do sistema de autenticação
            const currentUser = DiceOrDieUtils.getCurrentUser();
            if (currentUser) {
                this.autorField.value = `${currentUser.nome || currentUser.username || "Usuário"}`;
            } else {
                this.autorField.value = "Usuário não logado";
            }
        }
    }

    getRequiredFields() {
        return ['nomeMesa', 'sistema', 'qtdJogadores', 'descricao'];
    }

    getFormData() {
        // Mapear campos do frontend para o formato do backend
        const currentUser = DiceOrDieUtils.getCurrentUser();
        
        if (!currentUser) {
            throw new Error('Usuário deve estar logado para criar/editar mesas');
        }

        const publicoElement = document.getElementById('publico');
        const mesaAbertaValue = publicoElement?.checked ? 1 : 0;
        
        console.log('Toggle debug:', {
            element: publicoElement,
            checked: publicoElement?.checked,
            disabled: publicoElement?.disabled,
            value: mesaAbertaValue
        });

        const frontendData = {
            nome: document.getElementById('nomeMesa')?.value.trim(),
            sistema: document.getElementById('sistema')?.value, // Usar valor direto do backend
            qntd_jogadores: parseInt(document.getElementById('qtdJogadores')?.value) || 0,
            criador_id: currentUser.id, // Força ID do usuário logado
            mesa_aberta: mesaAbertaValue,
            descricao: document.getElementById('descricao')?.value.trim(),
            capa: this.getUploadedImageUrl() // URL da imagem do servidor
        };

        console.log('Dados do formulário:', frontendData);
        return frontendData;
    }

    // Método para obter URL da imagem uploadada
    getUploadedImageUrl() {
        return this.imageUpload?.uploadedImageUrl ||
               document.getElementById('campaignPreview')?.src ||
               '';
    }

    // Método para obter headers de autenticação
    getAuthHeaders() {
        const currentUser = DiceOrDieUtils.getCurrentUser();
        if (!currentUser) {
            console.log('getAuthHeaders: Nenhum usuário logado');
            return {};
        }
        
        const headers = {
            'X-User-ID': currentUser.id.toString(),
            'X-User-Role': currentUser.role || 'user',
            'X-Criador-ID': currentUser.id.toString() // Header específico para operações de mesa
        };
        
        console.log('getAuthHeaders: Enviando headers de autenticação:', {
            userId: currentUser.id,
            userRole: currentUser.role,
            username: currentUser.username,
            headers: headers
        });
        
        return headers;
    }

    async submitForm(formData) {
        console.log('Enviando dados da mesa:', formData);
        
        try {
            let response;
            let url;
            let method;

            if (this.isEditing) {
                // Modo edição - usar PUT
                url = `/tables/${this.editingTableId}`;
                method = 'PUT';
            } else {
                // Modo criação - usar POST
                url = '/tables';
                method = 'POST';
            }

            response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    // Adicionar headers de autenticação
                    ...this.getAuthHeaders()
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('Mesa processada com sucesso:', result);
                
                if (!this.isEditing && result.table) {
                    await this.handleSuccessfulCreation(result.table);
                } else if (this.isEditing) {
                    await this.handleSuccessfulUpdate(result.table);
                }
                
                return result;
            } else {
                throw new Error(result.error || 'Erro desconhecido');
            }
        } catch (error) {
            console.error('Erro ao processar mesa:', error);
            throw error;
        }
    }

    async handleSuccessfulCreation(table) {
        DiceOrDieUtils.showSuccess('Mesa criada com sucesso!');
        
        // Redirecionar para visualização da mesa criada após delay
        setTimeout(() => {
            window.location.href = `mesa.html?mode=view&id=${table.id}`;
        }, 2000);
    }

    async handleSuccessfulUpdate(table) {
        DiceOrDieUtils.showSuccess('Mesa atualizada com sucesso!');
        
        // Redirecionar para visualização da mesa após delay
        setTimeout(() => {
            window.location.href = `mesa.html?mode=view&id=${table.id}`;
        }, 2000);
    }

    async loadTableData() {
        const tableId = this.isEditing ? this.editingTableId : this.viewingTableId;
        console.log('Loading table data for ID:', tableId);
        
        if (!tableId) {
            console.warn('No table ID provided for loading');
            return;
        }

        try {
            console.log('Fetching table data from /tables/' + tableId);
            const response = await fetch(`/tables/${tableId}`, {
                headers: this.getAuthHeaders()
            });

            const result = await response.json();
            console.log('Table data response:', result);
            
            if (result.success && result.table) {
                console.log('Table data loaded successfully:', result.table);
                this.currentTable = result.table;
                this.populateFormWithTableData(result.table);
                
                // Atualizar título com nome da mesa
                this.updatePageTitle();
                
                // No modo view, tornar campos readonly
                if (this.isViewing) {
                    console.log('Making form readonly for view mode');
                    this.makeFormReadonly();
                }
            } else {
                console.error('Failed to load table data:', result);
                // Mesa não encontrada - usar helper unificado para redirecionamento
                DiceOrDieUtils.showError('Mesa não encontrada');
                setTimeout(() => {
                    window.location.href = 'mesas.html';
                }, 2000);
            }
        } catch (error) {
            console.error('Error loading table data:', error);
            DiceOrDieUtils.showError('Erro ao carregar dados da mesa: ' + error.message);
            // setTimeout(() => {
            //     window.location.href = 'mesas.html';
            // }, 2000);
        }
    }

    populateFormWithTableData(table) {
        console.log('Populando formulário com dados da mesa:', table);
        
        // Mapear do backend para frontend com verificações de segurança
        const nomeMesaEl = document.getElementById('nomeMesa');
        if (table.nome && nomeMesaEl) {
            nomeMesaEl.value = table.nome;
        }
        
        const sistemaEl = document.getElementById('sistema');
        if (table.sistema && sistemaEl) {
            // Usar valor direto do backend (já compatível)
            sistemaEl.value = table.sistema;
        }
        
        const qtdJogadoresEl = document.getElementById('qtdJogadores');
        if (table.qntd_jogadores && qtdJogadoresEl) {
            qtdJogadoresEl.value = table.qntd_jogadores.toString();
        }
        
        // Buscar e exibir username do criador
        if (table.criador_id) {
            this.loadCreatorUsername(table.criador_id);
        }
        
        // Verificação robusta para checkbox e label (suporta boolean ou number)
        if (typeof table.mesa_aberta !== 'undefined') {
            const publicoEl = document.getElementById('publico');
            const publicoLabelEl = document.getElementById('publicoLabel');
            
            // Converter para boolean (suporta tanto true/false quanto 1/0)
            const isPublic = table.mesa_aberta === 1 || table.mesa_aberta === true || table.mesa_aberta === "1";
            
            if (publicoEl) {
                publicoEl.checked = isPublic;
            }
            
            if (publicoLabelEl) {
                publicoLabelEl.textContent = isPublic ? 'Sim' : 'Não';
            }
            
            console.log('Toggle carregado:', {
                valor_backend: table.mesa_aberta,
                tipo: typeof table.mesa_aberta,
                isPublic: isPublic,
                checkbox_checked: publicoEl?.checked
            });
        }
        
        const descricaoEl = document.getElementById('descricao');
        if (table.descricao && descricaoEl) {
            descricaoEl.value = table.descricao;
        }
        
        // Carregar imagem da mesa se existir
        if (table.capa) {
            const preview = document.getElementById('campaignPreview');
            if (preview) {
                preview.src = table.capa;
            }
        }

        // Controlar visibilidade do botão "Participar"
        this.setupParticiparButton(table);
        
        console.log('Formulário populado com sucesso');
    }

    async loadCreatorUsername(criadorId) {
        try {
            console.log('Buscando username do criador ID:', criadorId);
            
            const response = await fetch(`/users/${criadorId}`, {
                headers: this.getAuthHeaders()
            });

            const result = await response.json();
            
            if (result.success && result.user && result.user.username) {
                const autorEl = document.getElementById('autor');
                if (autorEl) {
                    autorEl.value = result.user.username;
                    console.log('Username do criador carregado:', result.user.username);
                }
            } else {
                // Fallback para ID se não conseguir buscar username
                const autorEl = document.getElementById('autor');
                if (autorEl) {
                    autorEl.value = `Usuário ID: ${criadorId}`;
                }
                console.warn('Não foi possível carregar username do criador, usando ID');
            }
        } catch (error) {
            console.error('Erro ao buscar username do criador:', error);
            
            // Fallback para ID em caso de erro
            const autorEl = document.getElementById('autor');
            if (autorEl) {
                autorEl.value = `Usuário ID: ${criadorId}`;
            }
        }
    }

    setupParticiparButton(table) {
        // Log para debug - a lógica real agora está em addViewModeActionButtons()
        const isPublic = table.mesa_aberta === 1 || table.mesa_aberta === true || table.mesa_aberta === "1";
        console.log('Configurando botão participar (será criado em addViewModeActionButtons):', {
            isViewing: this.isViewing,
            mesa_aberta: table.mesa_aberta,
            tipo: typeof table.mesa_aberta,
            isPublic: isPublic,
            shouldShow: this.isViewing && isPublic
        });
    }

    makeFormReadonly() {
        // Tornar todos os inputs readonly EXCETO checkboxes
        const inputs = document.querySelectorAll('#mainForm input:not([type="checkbox"]), #mainForm select, #mainForm textarea');
        inputs.forEach(input => {
            input.readOnly = true;
            input.disabled = true;
            input.classList.add('readonly');
        });

        // Para checkboxes, apenas adicionar classe readonly sem desabilitar funcionalidade
        const checkboxes = document.querySelectorAll('#mainForm input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            // Apenas adicionar classe visual, mas manter checkbox funcional para CSS :checked
            checkbox.classList.add('readonly');
            // Desabilitar só o clique direto, mas deixar o CSS funcionar
            checkbox.addEventListener('click', (e) => e.preventDefault());
        });

        // Excluir toggle-label da classe readonly para manter texto "Sim"/"Não"
        const toggleLabels = document.querySelectorAll('.toggle-label');
        toggleLabels.forEach(label => {
            label.classList.remove('readonly');
        });

        // No modo view, esconder botão de submit normal
        const submitBtn = document.querySelector('#mainForm button[type="submit"], #submitter');
        if (submitBtn) {
            submitBtn.style.display = 'none';
        }

        // Esconder upload de imagem
        const uploadBtn = document.getElementById('uploadButton');
        if (uploadBtn) {
            uploadBtn.style.display = 'none';
        }

        // Adicionar botões de ação no modo view baseados em permissões
        this.addViewModeActionButtons();
    }

    setupModeSpecificButtons() {
        console.log('Configurando botões específicos para modo:', this.mode);
        
        const formActions = document.querySelector('.form-actions');
        if (!formActions) {
            console.log('Elemento .form-actions não encontrado');
            return;
        }

        if (this.mode === 'create') {
            // Modo criação - criar botão de Criar Mesa
            console.log('Modo create - criando botão Criar Mesa');
            
            formActions.innerHTML = `
                <button type="submit" id="submitter" class="submit-button">Criar Mesa</button>
            `;
            
        } else if (this.mode === 'edit') {
            // Modo edição - criar botões de Salvar e Cancelar
            console.log('Modo edit - criando botões de Salvar e Cancelar');
            
            formActions.innerHTML = `
                <button type="submit" id="submitter" class="submit-button">Salvar Alterações</button>
                <button type="button" id="cancelBtn" class="cancel-button secondary">Cancelar</button>
            `;
            
            // Adicionar event listener para cancelar
            const cancelBtn = document.getElementById('cancelBtn');
            if (cancelBtn) {
                cancelBtn.onclick = () => {
                    if (confirm('Descartar alterações?')) {
                        window.location.href = `mesa.html?mode=view&id=${this.editingTableId}`;
                    }
                };
            }
            
        } else if (this.mode === 'view') {
            // Modo visualização - botões são criados pelo addViewModeActionButtons()
            console.log('Modo view - botões serão criados pelo addViewModeActionButtons');
        }
    }

    async addViewModeActionButtons() {
        const currentUser = DiceOrDieUtils.getCurrentUser();
        
        // Primeiro, sempre remover ou esconder os botões de ação existentes
        const formActions = document.querySelector('.form-actions');
        if (formActions) {
            formActions.style.display = 'none'; // Esconder por padrão
        }

        if (!currentUser) {
            console.log('Usuário não logado - não mostrando botões de ação');
            return; // Não mostrar botões se não logado
        }

        // Verificar permissões
        const canEdit = await this.checkEditPermission(this.viewingTableId);
        
        if (canEdit) {
            // Verificar se deve adicionar botão participar
            const table = this.currentTable;
            const isPublic = table && (table.mesa_aberta === 1 || table.mesa_aberta === true || table.mesa_aberta === "1");
            const shouldShowParticipate = this.isViewing && isPublic;
            
            let participarBtnHTML = '';
            if (shouldShowParticipate) {
                participarBtnHTML = `<button type="button" id="participarBtn" class="participate-button">🎮 Participar da Mesa</button>`;
            }
            
            // Criar nova div para os botões de view (só se tiver permissão)
            const viewActionsDiv = document.createElement('div');
            viewActionsDiv.className = 'form-actions';
            viewActionsDiv.innerHTML = `
                ${participarBtnHTML}
                <button type="button" class="edit-button">Editar Mesa</button>
                <button type="button" class="delete-button danger">Apagar Mesa</button>
            `;

            // Adicionar event listeners
            const editBtn = viewActionsDiv.querySelector('.edit-button');
            const deleteBtn = viewActionsDiv.querySelector('.delete-button');
            const participarBtn = viewActionsDiv.querySelector('#participarBtn');
            
            editBtn.onclick = () => this.editTable(this.viewingTableId);
            deleteBtn.onclick = () => this.deleteCurrentTable();
            
            if (participarBtn) {
                participarBtn.onclick = () => {
                    const mesaId = this.viewingTableId || table.id;
                    if (mesaId) {
                        console.log(`Redirecionando para chat da mesa ${mesaId}`);
                        window.location.href = `chat.html?mesa_id=${mesaId}`;
                    }
                };
                console.log('✅ Botão participar CRIADO junto com botões de edição');
            }

            // Substituir os botões existentes
            if (formActions) {
                formActions.parentNode.replaceChild(viewActionsDiv, formActions);
            }
            
            console.log('Botões de edição/exclusão adicionados para usuário com permissão');
        } else {
            console.log('Usuário sem permissão - criando apenas botão participar se aplicável');
            
            // Verificar se deve adicionar botão participar mesmo sem permissão de edição
            const table = this.currentTable;
            const isPublic = table && (table.mesa_aberta === 1 || table.mesa_aberta === true || table.mesa_aberta === "1");
            const shouldShowParticipate = this.isViewing && isPublic;
            
            if (shouldShowParticipate && formActions) {
                // Limpar botões existentes e criar apenas o participar
                formActions.innerHTML = `<button type="button" id="participarBtn" class="participate-button">🎮 Participar da Mesa</button>`;
                
                const participarBtn = formActions.querySelector('#participarBtn');
                if (participarBtn) {
                    participarBtn.onclick = () => {
                        const mesaId = this.viewingTableId || table.id;
                        if (mesaId) {
                            console.log(`Redirecionando para chat da mesa ${mesaId}`);
                            window.location.href = `chat.html?mesa_id=${mesaId}`;
                        }
                    };
                    console.log('✅ Botão participar CRIADO para usuário sem permissão');
                }
                
                formActions.style.display = 'block';
            } else if (formActions) {
                formActions.style.display = 'none';
            }
        }
    }

    async checkEditPermission(tableId) {
        const currentUser = DiceOrDieUtils.getCurrentUser();
        if (!currentUser) {
            console.log('checkEditPermission: Usuário não logado');
            return false;
        }

        // Admin pode editar qualquer mesa
        if (currentUser.role === 'admin') {
            console.log('checkEditPermission: Usuário é admin - permitindo edição');
            return true;
        }

        try {
            // Buscar dados da mesa para verificar o dono
            const response = await fetch(`/tables/${tableId}`, {
                headers: this.getAuthHeaders()
            });

            const result = await response.json();
            
            if (result.success && result.table) {
                // Converter ambos para números para comparação robusta
                const tableOwnerId = parseInt(result.table.criador_id);
                const currentUserId = parseInt(currentUser.id);
                
                console.log('checkEditPermission: Verificando propriedade da mesa:', {
                    tableId: tableId,
                    tableOwnerId: tableOwnerId,
                    currentUserId: currentUserId,
                    currentUser: currentUser.username,
                    isOwner: tableOwnerId === currentUserId
                });
                
                // Verificar se a mesa pertence ao usuário atual
                return tableOwnerId === currentUserId;
            }
            
            console.log('checkEditPermission: Erro na resposta da API:', result);
            return false;
        } catch (error) {
            console.error('Erro ao verificar permissões:', error);
            return false;
        }
    }

    async editTable(tableId) {
        // Verificar permissões antes de redirecionar
        const hasPermission = await this.checkEditPermission(tableId);
        if (hasPermission) {
            window.location.href = `mesa.html?mode=edit&id=${tableId}`;
        } else {
            DiceOrDieUtils.showError('Você só pode editar suas próprias mesas.');
        }
    }

    async deleteCurrentTable() {
        const tableId = this.isEditing ? this.editingTableId : this.viewingTableId;
        
        console.log('deleteCurrentTable: Iniciando processo de deleção:', {
            tableId: tableId,
            isEditing: this.isEditing,
            isViewing: this.isViewing,
            editingTableId: this.editingTableId,
            viewingTableId: this.viewingTableId
        });
        
        if (!tableId) {
            console.error('deleteCurrentTable: Nenhum ID de mesa encontrado');
            DiceOrDieUtils.showError('Nenhuma mesa carregada para deletar.');
            return;
        }

        const currentUser = DiceOrDieUtils.getCurrentUser();
        if (!currentUser) {
            console.error('deleteCurrentTable: Usuário não logado');
            DiceOrDieUtils.showError('Você deve estar logado para deletar mesas.');
            return;
        }

        console.log('deleteCurrentTable: Verificando permissões para usuário:', {
            userId: currentUser.id,
            username: currentUser.username,
            role: currentUser.role
        });

        // Verificar permissões
        const hasPermission = await this.checkEditPermission(tableId);
        if (!hasPermission) {
            console.error('deleteCurrentTable: Usuário não tem permissão para deletar esta mesa');
            DiceOrDieUtils.showError('Você só pode deletar suas próprias mesas.');
            return;
        }

        console.log('deleteCurrentTable: Permissões verificadas - usuário pode deletar a mesa');

        const tableName = this.currentTable?.nome || 'esta mesa';
        const confirmDelete = confirm(`Tem certeza que deseja deletar a mesa "${tableName}"? Esta ação não pode ser desfeita.`);
        if (!confirmDelete) {
            console.log('deleteCurrentTable: Deleção cancelada pelo usuário');
            return;
        }

        try {
            console.log('deleteCurrentTable: Enviando requisição DELETE para /tables/' + tableId);
            
            const response = await fetch(`/tables/${tableId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            const result = await response.json();
            
            console.log('deleteCurrentTable: Resposta da API:', result);
            
            if (result.success) {
                console.log('deleteCurrentTable: Mesa deletada com sucesso');
                DiceOrDieUtils.showSuccess('Mesa deletada com sucesso!');
                
                // Redirecionar para lista de mesas após delay
                setTimeout(() => {
                    window.location.href = 'mesas.html';
                }, 2000);
            } else {
                throw new Error(result.error || 'Erro ao deletar mesa');
            }
        } catch (error) {
            console.error('deleteCurrentTable: Erro ao deletar mesa:', error);
            DiceOrDieUtils.showError(`Erro ao deletar: ${error.message}`);
        }
    }

    // Métodos estáticos para uso nos painéis (mantidos para compatibilidade)
    static saveAsDraft() {
        const mesa = new MesaForm();
        const formData = mesa.getFormData();
        localStorage.setItem('mesa_draft', JSON.stringify(formData));
        DiceOrDieUtils.showSuccess('Rascunho salvo!');
    }

    static clearForm() {
        if (confirm('Tem certeza que deseja limpar o formulário?')) {
            const form = document.getElementById('mainForm');
            if (form) {
                form.reset();
            }
            
            const campaignPreview = document.getElementById('campaignPreview');
            if (campaignPreview) {
                campaignPreview.src = 'https://placehold.co/150x150/666/fff?text=Capa';
            }
            
            const publicoLabel = document.getElementById('publicoLabel');
            if (publicoLabel) {
                publicoLabel.textContent = 'Sim';
            }
            
            DiceOrDieUtils.showSuccess('Formulário limpo!');
        }
    }

    static loadDraft() {
        const draft = localStorage.getItem('mesa_draft');
        if (draft) {
            try {
                const data = JSON.parse(draft);
                
                // Preencher campos com dados do rascunho
                Object.keys(data).forEach(key => {
                    const field = document.getElementById(key);
                    if (field) {
                        if (field.type === 'checkbox') {
                            field.checked = data[key];
                        } else {
                            field.value = data[key];
                        }
                    }
                });

                // Atualizar preview da capa se existir
                if (data.capa) {
                    const campaignPreview = document.getElementById('campaignPreview');
                    if (campaignPreview) {
                        campaignPreview.src = data.capa;
                    }
                }

                // Atualizar label do toggle público
                const publicoLabel = document.getElementById('publicoLabel');
                const publicoToggle = document.getElementById('publico');
                if (publicoLabel && publicoToggle) {
                    publicoLabel.textContent = publicoToggle.checked ? 'Sim' : 'Não';
                }

                DiceOrDieUtils.showSuccess('Rascunho carregado!');
            } catch (error) {
                console.error('Erro ao carregar rascunho:', error);
                DiceOrDieUtils.showError('Erro ao carregar rascunho.');
            }
        } else {
            DiceOrDieUtils.showError('Nenhum rascunho encontrado.');
        }
    }
}

// Use standardized form initializer
FormInitializer.initializeForm(MesaForm, 'mesa');
