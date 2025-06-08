// Classe específica para o formulário de ficha, herdando da BaseForm
class FichaForm extends BaseForm {
    constructor() {
        // Use centralized configuration instead of hardcoded values
        const config = FormConstants.getFormConfig('ficha');
        super('mainForm', config);

        // Detectar modo baseado na URL (usando mixin centralizado)
        this.detectPageMode();

        // Inicializar componente de upload de imagem
        this.imageUpload = new ImageUploadMixin({
            purpose: 'character',
            parentForm: this
        });

        this.setupFichaSpecificElements();
        this.initFichaFeatures();
        
        // Aplicar mixins específicos
        this.setupAttributeSystem(['forca', 'destreza', 'constituicao', 'inteligencia', 'sabedoria', 'carisma']);
        this.setupClassSystem();
        
        // Atualizar título da página baseado no modo (usando mixin)
        this.updatePageTitle();
        
        // Se estivermos em modo de edição ou visualização, carregar dados automaticamente
        if (this.isEditing || this.isViewing) {
            setTimeout(() => {
                this.loadCharacterData();
            }, 500);
        }
    }

    setupFichaSpecificElements() {
        this.nomeJogadorField = document.getElementById('nomeJogador');
        this.attributeInputs = {
            forca: document.getElementById('forca'),
            destreza: document.getElementById('destreza'),
            constituicao: document.getElementById('constituicao'),
            inteligencia: document.getElementById('inteligencia'),
            sabedoria: document.getElementById('sabedoria'),
            carisma: document.getElementById('carisma')
        };
        this.pontosVidaField = document.getElementById('pontosVida');
        this.classeField = document.getElementById('classe');
        this.nivelField = document.getElementById('nivel');
    }

    initFichaFeatures() {
        this.setDefaultPlayerName();
        this.setupAttributeValidation();
        this.setupClasseBasedFeatures();
    }
    
    setupEventListeners() {
        // Usar helper unificado para prevenir duplicatas
        const unifiedHandler = UnifiedFormHelpers.createUnifiedSubmitHandler(this);
        UnifiedFormHelpers.setupPreventDuplicateEvents(this.form, 'submit', unifiedHandler);
    }

    setupModeIntegration() {
        // Usar implementação padronizada da classe pai
        super.setupModeIntegration();
    }

    setDefaultPlayerName() {
        // Carregar nome do jogador logado do sistema de autenticação
        if (this.nomeJogadorField) {
            const currentUser = DiceOrDieUtils.getCurrentUser();
            if (currentUser) {
                this.nomeJogadorField.value = currentUser.nome || currentUser.username || "Jogador";
            } else {
                this.nomeJogadorField.value = "Usuário não logado";
            }
        }
    }

    setupAttributeValidation() {
        // Adiciona validação em tempo real para atributos
        Object.values(this.attributeInputs).forEach(input => {
            if (input) {
                input.addEventListener('input', (e) => {
                    this.validateAttribute(e.target);
                });
                input.addEventListener('blur', (e) => {
                    this.calculateModifier(e.target);
                });
            }
        });
    }

    validateAttribute(input) {
        const value = input.value;
        const min = parseInt(input.min) || 1;
        const max = parseInt(input.max) || 20;

        // Usar helper unificado para validação numérica
        const validator = UnifiedFormHelpers.createNumericValidator(min, max, input.getAttribute('name') || 'Atributo');
        const validation = validator(value);
        
        if (!validation.valid) {
            this.markFieldAsError(input, validation.message);
            return false;
        } else {
            this.clearFieldError(input);
            return true;
        }
    }

    calculateModifier(input) {
        const value = parseInt(input.value);
        if (!isNaN(value)) {
            const modifier = Math.floor((value - 10) / 2);
            const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            
            // Adiciona tooltip ou display do modificador
            input.title = `Modificador: ${modifierText}`;
        }
    }

    setupClasseBasedFeatures() {
        if (this.classeField) {
            this.classeField.addEventListener('change', () => {
                this.updateClasseBasedStats();
            });
        }

        if (this.nivelField) {
            this.nivelField.addEventListener('change', () => {
                this.updateLevelBasedStats();
            });
        }
    }

    updateClasseBasedStats() {
        const selectedClass = this.classeField.value;
        
        // Dicas baseadas na classe selecionada
        if (selectedClass && this.pontosVidaField) {
            const classeData = this.getClasseData(selectedClass);
            if (classeData) {
                this.pontosVidaField.placeholder = `Sugerido: ${classeData.suggestedHP}`;
                this.pontosVidaField.title = classeData.description;
            }
        }
    }

    updateLevelBasedStats() {
        const level = parseInt(this.nivelField.value);
        if (!isNaN(level) && this.pontosVidaField) {
            // Ajusta sugestão de HP baseado no nível
            const baseHP = parseInt(this.pontosVidaField.placeholder.replace(/\D/g, '')) || 25;
            const suggestedHP = baseHP + ((level - 1) * 5); // Exemplo de cálculo
            this.pontosVidaField.placeholder = `Sugerido: ${suggestedHP}`;
        }
    }

    getClasseData(classe) {
        const classeData = {
            'barbaro': { suggestedHP: 35, description: 'Bárbaro: Alta constituição, foco em combate corpo a corpo' },
            'bardo': { suggestedHP: 20, description: 'Bardo: Versátil, foco em carisma e habilidades sociais' },
            'bruxo': { suggestedHP: 18, description: 'Bruxo: Magia através de pactos, foco em carisma' },
            'clerigo': { suggestedHP: 25, description: 'Clérigo: Conjurador divino, foco em sabedoria' },
            'druida': { suggestedHP: 22, description: 'Druida: Magia natural, foco em sabedoria' },
            'feiticeiro': { suggestedHP: 15, description: 'Feiticeiro: Magia inata, foco em carisma' },
            'guerreiro': { suggestedHP: 30, description: 'Guerreiro: Especialista em combate, versátil' },
            'ladino': { suggestedHP: 20, description: 'Ladino: Furtividade e precisão, foco em destreza' },
            'mago': { suggestedHP: 12, description: 'Mago: Conjurador arcano, foco em inteligência' },
            'monge': { suggestedHP: 22, description: 'Monge: Artes marciais, foco em destreza e sabedoria' },
            'paladino': { suggestedHP: 28, description: 'Paladino: Guerreiro sagrado, foco em força e carisma' },
            'patrulheiro': { suggestedHP: 25, description: 'Patrulheiro: Explorador, foco em destreza e sabedoria' }
        };

        return classeData[classe] || null;
    }

    // Sobrescrever método de validação para incluir validações específicas da ficha
    validateForm() {
        let isValid = super.validateForm();

        // Validação específica dos atributos
        Object.values(this.attributeInputs).forEach(input => {
            if (input && !this.validateAttribute(input)) {
                isValid = false;
            }
        });

        // Validação de pontos de vida usando helper unificado
        if (this.pontosVidaField) {
            const validator = UnifiedFormHelpers.createNumericValidator(1, 999, 'Pontos de vida');
            const validation = validator(this.pontosVidaField.value);
            if (!validation.valid) {
                this.markFieldAsError(this.pontosVidaField, validation.message);
                isValid = false;
            } else {
                this.clearFieldError(this.pontosVidaField);
            }
        }

        return isValid;
    }

    // Implementação dos métodos abstratos da BaseForm
    getRequiredFields() {
        return [
            'nomePersonagem',
            'nivel',
            'raca',
            'classe',
            'pontosVida',
            'classeArmadura',
            'forca',
            'destreza',
            'constituicao',
            'inteligencia',
            'sabedoria',
            'carisma'
        ];
    }
    
    // Método requerido pelo helper unificado
    getEntityType() {
        return 'Personagem';
    }
    
    // Método requerido pelo helper unificado
    requiresAuth() {
        return true; // Ficha requer autenticação
    }

    getFormData() {
        // Mapear campos do frontend para o formato do backend
        const currentUser = DiceOrDieUtils.getCurrentUser();
        
        if (!currentUser) {
            throw new Error('Usuário deve estar logado para criar/editar personagens');
        }

        const frontendData = {
            username: currentUser.username, // Força username do usuário logado
            nome_personagem: document.getElementById("nomePersonagem")?.value.trim(),
            nivel: parseInt(document.getElementById("nivel")?.value) || 1,
            raca: document.getElementById("raca")?.value,
            classe: document.getElementById("classe")?.value,
            ponto_vida: parseInt(document.getElementById("pontosVida")?.value) || 1,
            classe_armadura: parseInt(document.getElementById("classeArmadura")?.value) || 10,
            forca: parseInt(document.getElementById("forca")?.value) || 10,
            destreza: parseInt(document.getElementById("destreza")?.value) || 10,
            constituicao: parseInt(document.getElementById("constituicao")?.value) || 10,
            inteligencia: parseInt(document.getElementById("inteligencia")?.value) || 10,
            sabedoria: parseInt(document.getElementById("sabedoria")?.value) || 10,
            carisma: parseInt(document.getElementById("carisma")?.value) || 10,
            imagem_personagem: this.getUploadedImageUrl() // URL da imagem do servidor
        };

        return frontendData;
    }

    // Usar método do mixin centralizado
    // getUploadedImageUrl() implementado via ImageMixin

    async submitForm(formData) {
        console.log('Enviando dados de personagem:', formData);
        
        try {
            let response;
            let url;
            let method;

            if (this.isEditing) {
                // Modo edição - usar PUT
                url = `/characters/${this.editingCharacterId}`;
                method = 'PUT';
            } else {
                // Modo criação - usar POST
                url = '/characters';
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
                console.log('Personagem processado com sucesso:', result);
                
                if (!this.isEditing && result.character) {
                    await this.handleSuccessfulCreation(result.character);
                } else if (this.isEditing) {
                    await this.handleSuccessfulUpdate(result.character);
                }
                
                return result;
            } else {
                throw new Error(result.error || 'Erro desconhecido');
            }
        } catch (error) {
            console.error('Erro ao processar personagem:', error);
            throw error;
        }
    }

    // Método para popular a ficha com dados existentes
    populateForm(fichaData) {
        if (!fichaData) return;

        Object.entries(fichaData).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = Boolean(value);
                } else {
                    element.value = value;
                }
            }
        });

        // Atualizar displays dependentes
        this.updateClasseBasedStats();
        this.updateLevelBasedStats();
    }

    // Método para resetar a ficha
    resetForm() {
        super.resetForm();
        
        // Resetar valores específicos da ficha
        Object.values(this.attributeInputs).forEach(input => {
            if (input) {
                input.value = '';
                input.classList.remove('error');
                input.title = '';
            }
        });

        this.setDefaultPlayerName();
    }

    onSubmitSuccess(response) {
        super.onSubmitSuccess(response);
        
        // Lógica adicional após sucesso no salvamento da ficha
        console.log('Ficha salva:', response);
    }

    onSubmitError(error) {
        super.onSubmitError(error);
        
        // Lógica adicional para erros específicos da ficha
        console.error('Erro ao salvar ficha:', error);
    }

    // Usar método do mixin centralizado
    // getAuthHeaders() implementado via AuthMixin

    async handleSuccessfulCreation(character) {
        // Usar método do mixin para redirecionamento padronizado
        await this.handleSuccessfulCreationRedirect(character, 'Personagem');
    }

    async handleSuccessfulUpdate(character) {
        // Usar método do mixin para redirecionamento padronizado
        await this.handleSuccessfulUpdateRedirect(character, 'Personagem');
    }

    async loadCharacterData() {
        const characterId = this.isEditing ? this.editingCharacterId : this.viewingCharacterId;
        if (!characterId) return;

        try {
            const response = await fetch(`/characters/${characterId}`, {
                headers: this.getAuthHeaders()
            });

            const result = await response.json();
            
            if (result.success && result.character) {
                this.populateFormWithCharacterData(result.character);
                
                // No modo view, tornar campos readonly
                if (this.isViewing) {
                    this.makeFormReadonly();
                }
            } else {
                // Personagem não encontrado - usar helper unificado para redirecionamento
                UnifiedFormHelpers.handleEntityNotFound('character', characterId);
            }
        } catch (error) {
            console.error('Erro ao carregar personagem:', error);
            
            // Em caso de erro (404, etc), também usar helper unificado
            UnifiedFormHelpers.handleEntityNotFound('character', characterId);
        }
    }

    populateFormWithCharacterData(character) {
        // Preencher campos básicos - mapear do backend para frontend
        if (character.username) document.getElementById("nomeJogador").value = character.username;
        if (character.nome_personagem) document.getElementById("nomePersonagem").value = character.nome_personagem;
        if (character.nivel) document.getElementById("nivel").value = character.nivel;
        if (character.raca) document.getElementById("raca").value = character.raca;
        if (character.classe) document.getElementById("classe").value = character.classe;
        if (character.ponto_vida) document.getElementById("pontosVida").value = character.ponto_vida;
        if (character.classe_armadura) document.getElementById("classeArmadura").value = character.classe_armadura;
        
        // Atributos
        if (character.forca) document.getElementById("forca").value = character.forca;
        if (character.destreza) document.getElementById("destreza").value = character.destreza;
        if (character.constituicao) document.getElementById("constituicao").value = character.constituicao;
        if (character.inteligencia) document.getElementById("inteligencia").value = character.inteligencia;
        if (character.sabedoria) document.getElementById("sabedoria").value = character.sabedoria;
        if (character.carisma) document.getElementById("carisma").value = character.carisma;

        // Carregar imagem de personagem se existir
        if (character.imagem_personagem) {
            const preview = document.getElementById("characterPreview");
            if (preview) {
                preview.src = character.imagem_personagem;
            }
        }

        // Atualizar displays dependentes
        this.updateClasseBasedStats();
        this.updateLevelBasedStats();
        
        // Recalcular modificadores para todos os atributos
        Object.values(this.attributeInputs).forEach(input => {
            if (input && input.value) {
                this.calculateModifier(input);
            }
        });

        // Atualizar título da página com nome do personagem
        const titleElement = document.getElementById('paginaTitulo');
        if (titleElement && character.nome_personagem) {
            const urlParams = new URLSearchParams(window.location.search);
            const mode = urlParams.get('mode');
            
            if (mode === 'view') {
                titleElement.textContent = `${character.nome_personagem} (Visualização)`;
            } else if (mode === 'edit') {
                titleElement.textContent = `Editando: ${character.nome_personagem}`;
            }
        }

        // Configurar botões de ação no modo view
        if (this.isViewing) {
            this.setupCharacterActionButtons(character);
        }
    }

    makeFormReadonly() {
        // Tornar todos os inputs readonly
        const inputs = document.querySelectorAll('#mainForm input, #mainForm select, #mainForm textarea');
        inputs.forEach(input => {
            input.readOnly = true;
            input.disabled = true;
            input.classList.add('readonly');
        });

        // Esconder botão de submit
        const submitBtn = document.querySelector('#mainForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.style.display = 'none';
        }

        // Esconder upload de imagem
        const uploadBtn = document.getElementById('uploadButton');
        if (uploadBtn) {
            uploadBtn.style.display = 'none';
        }

        // Esconder input de arquivo
        const fileInput = document.getElementById('imageInput');
        if (fileInput) {
            fileInput.style.display = 'none';
        }

        // Adicionar botões de ação no modo view baseados em permissões
        this.addViewModeActionButtons();
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

        // Buscar dados do personagem para verificar permissões
        try {
            const response = await fetch(`/characters/${this.viewingCharacterId}`, {
                headers: this.getAuthHeaders()
            });

            const result = await response.json();
            
            if (result.success && result.character) {
                const canEdit = currentUser.role === 'admin' || result.character.username === currentUser.username;
                
                console.log('Verificação de permissões:', {
                    currentUser: currentUser.username,
                    userRole: currentUser.role,
                    characterOwner: result.character.username,
                    canEdit: canEdit
                });
                
                if (canEdit) {
                    // Criar nova div para os botões de view (só se tiver permissão)
                    const viewActionsDiv = document.createElement('div');
                    viewActionsDiv.className = 'form-actions';
                    viewActionsDiv.innerHTML = `
                        <button type="button" class="edit-button">Editar Ficha</button>
                        <button type="button" class="delete-button danger">Apagar Ficha</button>
                    `;

                    // Adicionar event listeners
                    const editBtn = viewActionsDiv.querySelector('.edit-button');
                    const deleteBtn = viewActionsDiv.querySelector('.delete-button');
                    
                    editBtn.onclick = () => this.editCharacter(this.viewingCharacterId);
                    deleteBtn.onclick = () => this.deleteCurrentCharacter();

                    // Substituir os botões existentes
                    if (formActions) {
                        formActions.parentNode.replaceChild(viewActionsDiv, formActions);
                    }
                    
                    console.log('Botões de edição/exclusão adicionados para usuário com permissão');
                } else {
                    console.log('Usuário sem permissão - botões permanecerão escondidos');
                }
            }
        } catch (error) {
            console.error('Erro ao verificar permissões para botões:', error);
        }
    }

    // Usar métodos do mixin centralizado
    // showSuccessMessage() e showErrorMessage() implementados via MessageMixin

    // handleSubmit agora é fornecido pelo UnifiedFormHelpers.createUnifiedSubmitHandler()
    // O comportamento específico está nos métodos handleSuccessfulCreation/Update

    // Métodos de navegação e controle da ficha
    createNewCharacter() {
        window.location.href = 'ficha.html';
    }

    async listMyCharacters() {
        const currentUser = DiceOrDieUtils.getCurrentUser();
        if (!currentUser) {
            DiceOrDieUtils.showError('Você deve estar logado para ver suas fichas.');
            return;
        }

        try {
            const response = await fetch(`/users/${currentUser.username}/characters`, {
                headers: this.getAuthHeaders()
            });

            const result = await response.json();
            
            if (result.success && result.characters) {
                this.displayCharactersList(result.characters);
            } else {
                console.error('Erro ao carregar personagens:', result.error);
                DiceOrDieUtils.showError('Erro ao carregar suas fichas');
            }
        } catch (error) {
            console.error('Erro ao listar personagens:', error);
            DiceOrDieUtils.showError('Erro ao carregar suas fichas');
        }
    }

    displayCharactersList(characters) {
        let message = `Você tem ${characters.length} personagens:\n\n`;
        
        characters.forEach((char, index) => {
            message += `${index + 1}. ${char.nome_personagem} (${char.classe} ${char.raca}) - Nível ${char.nivel}\n`;
            message += `   ID: ${char.id}\n\n`;
        });
        
        message += '\nVocê pode editar qualquer personagem através da URL:\n';
        message += 'ficha.html?mode=edit&id=[ID_DO_PERSONAGEM]';
        
        alert(message);
    }

    async deleteCurrentCharacter() {
        const characterId = this.isEditing ? this.editingCharacterId : this.viewingCharacterId;
        
        if (!characterId) {
            DiceOrDieUtils.showError('Nenhum personagem carregado para deletar.');
            return;
        }

        const currentUser = DiceOrDieUtils.getCurrentUser();
        if (!currentUser) {
            DiceOrDieUtils.showError('Você deve estar logado para deletar personagens.');
            return;
        }

        // Verificar permissões
        const hasPermission = await this.checkEditPermission(characterId);
        if (!hasPermission) {
            DiceOrDieUtils.showError('Você só pode deletar seus próprios personagens.');
            return;
        }

        const confirmDelete = confirm('Tem certeza que deseja deletar este personagem? Esta ação não pode ser desfeita.');
        if (!confirmDelete) return;

        try {
            const response = await fetch(`/characters/${characterId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });

            const result = await response.json();
            
            if (result.success) {
                this.showSuccessMessage('Personagem deletado com sucesso!');
                
                // Redirecionar para nova ficha após delay
                setTimeout(() => {
                    window.location.href = 'ficha.html';
                }, 2000);
            } else {
                throw new Error(result.error || 'Erro ao deletar personagem');
            }
        } catch (error) {
            console.error('Erro ao deletar personagem:', error);
            DiceOrDieUtils.showError(`Erro ao deletar: ${error.message}`);
        }
    }

    async checkEditPermission(characterId) {
        const currentUser = DiceOrDieUtils.getCurrentUser();
        if (!currentUser) return false;

        // Admin pode editar qualquer personagem
        if (currentUser.role === 'admin') return true;

        try {
            // Buscar dados do personagem para verificar o dono
            const response = await fetch(`/characters/${characterId}`, {
                headers: this.getAuthHeaders()
            });

            const result = await response.json();
            
            if (result.success && result.character) {
                // Verificar se o personagem pertence ao usuário atual
                return result.character.username === currentUser.username;
            }
            
            return false;
        } catch (error) {
            console.error('Erro ao verificar permissões:', error);
            return false;
        }
    }

    async setupCharacterActionButtons(character) {
        const currentUser = DiceOrDieUtils.getCurrentUser();
        if (!currentUser) return; // Usuário não logado, não mostrar botões

        // Verificar permissões
        const canEdit = currentUser.role === 'admin' || character.username === currentUser.username;
        
        if (canEdit) {
            // Adicionar botões de edição e deletar
            this.addCharacterActionButtons();
        }
    }

    addCharacterActionButtons() {
        // Procurar pelo painel de ações do personagem
        const rightPanels = document.getElementById('right-panels');
        if (!rightPanels) return;

        // Encontrar o painel "Ações do Personagem"
        const panels = rightPanels.querySelectorAll('.panel');
        let actionPanel = null;
        
        for (const panel of panels) {
            const titleElement = panel.querySelector('.panel-title');
            if (titleElement && titleElement.textContent.trim() === 'Ações do Personagem') {
                actionPanel = panel;
                break;
            }
        }

        if (!actionPanel) return;

        // Adicionar botões de edição e deletar
        const panelBody = actionPanel.querySelector('.panel-body');
        if (panelBody) {
            // Criar botões de ação
            const editButton = document.createElement('button');
            editButton.className = 'panel-button';
            editButton.textContent = '✏️ Editar Ficha';
            editButton.onclick = () => this.editCharacter(this.viewingCharacterId);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'panel-button danger';
            deleteButton.textContent = '🗑️ Deletar Ficha';
            deleteButton.onclick = () => this.deleteCurrentCharacter();

            // Adicionar os botões ao painel
            panelBody.appendChild(editButton);
            panelBody.appendChild(deleteButton);
        }
    }

    async editCharacter(characterId) {
        // Verificar permissões antes de redirecionar
        const hasPermission = await this.checkEditPermission(characterId);
        if (hasPermission) {
            window.location.href = `ficha.html?mode=edit&id=${characterId}`;
        } else {
            DiceOrDieUtils.showError('Você só pode editar seus próprios personagens.');
        }
    }

    copyCharacterLink(characterId) {
        const link = `${window.location.origin}/pages/ficha.html?mode=view&id=${characterId}`;
        
        // Tentar usar a API moderna de clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(link).then(() => {
                this.showSuccessMessage('Link copiado para a área de transferência!');
            }).catch(() => {
                this.fallbackCopyTextToClipboard(link);
            });
        } else {
            this.fallbackCopyTextToClipboard(link);
        }
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                this.showSuccessMessage('Link copiado para a área de transferência!');
            } else {
                throw new Error('Comando copy falhou');
            }
        } catch (err) {
            // Fallback final: mostrar o link em um prompt
            prompt('Copie o link abaixo:', text);
        }
        
        document.body.removeChild(textArea);
    }
}

// Aplicar mixins centralizados para eliminar redundâncias
FormMixins.applyCommonMixins(FichaForm);
EnhancedFormMixins.applyFormSpecificMixins(FichaForm);

// Nota: Inicialização movida para ficha-config.js para evitar duplicação
// FormInitializer.initializeForm(FichaForm, 'ficha');
