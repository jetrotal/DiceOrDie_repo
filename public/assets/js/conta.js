// Classe específica para o formulário de conta, herdando da BaseForm
class ContaForm extends BaseForm {
  constructor() {
    // Use centralized configuration instead of hardcoded values
    const config = FormConstants.getFormConfig('conta');
    super('mainForm', config);

    // Propriedades específicas da conta
    this.expLevels = {
      0: { name: "Goblin", description: "Novo no mundo dos RPGs", backend: "Iniciante" },
      1: { name: "Cavaleiro", description: "Alguma experiência com RPG", backend: "Iniciante" },
      2: { name: "Mago", description: "Jogador experiente", backend: "Experiente" },
      3: { name: "Dragão", description: "Veterano em RPGs", backend: "Experiente" },
      4: { name: "Titã", description: "Mestre em sistemas diversos", backend: "Veterano" },
      5: { name: "Deus Antigo", description: "Lenda viva do RPG", backend: "Lendário" }
    };

    this.currentExp = 1; // Começa em Cavaleiro (nível 1)

    // Detectar modo baseado na URL (usando mixin centralizado)
    this.detectPageMode();

    // Inicializar componente de upload de imagem
    this.imageUpload = new ImageUploadMixin({
      purpose: 'profile',
      parentForm: this
    });

    this.setupContaSpecificElements();
    this.initContaFeatures();
    
    // Aplicar mixins específicos
    this.setupExperienceSystem(this.expLevels, this.currentExp);
    this.setupPasswordValidation();
    
    // Verificar se usuário logado está tentando acessar conta.html diretamente
    this.checkLoggedUserAccess();
    
    // Se estivermos em modo de edição ou visualização, carregar dados automaticamente
    if (this.isEditing || this.isViewing) {
      // Aguardar um pouco para garantir que todos os elementos foram inicializados
      setTimeout(() => {
        this.loadUserData();
      }, 500);
    }
  }

  setupContaSpecificElements() {
    this.elementos = {
      expDots: document.querySelectorAll(".exp-dot"),
      expLevel: document.getElementById("expLevel"),
      expDescription: document.getElementById("expDescription"),
      decreaseExp: document.getElementById("decreaseExp"),
      increaseExp: document.getElementById("increaseExp"),
      senha: document.getElementById("senha"),
      confirmarSenha: document.getElementById("confirmarSenha")
    };
  }

  initContaFeatures() {
    // Funcionalidades básicas já são configuradas pelos mixins
    // Manter apenas configurações específicas se necessário
  }

  setupEventListeners() {
    // Usar helper unificado para prevenir duplicatas
    const unifiedHandler = UnifiedFormHelpers.createUnifiedSubmitHandler(this);
    UnifiedFormHelpers.setupPreventDuplicateEvents(this.form, 'submit', unifiedHandler);
  }

  setupModeIntegration() {
    // Usar implementação padronizada da classe pai
    super.setupModeIntegration();
    
    // Configurações específicas da conta
    setTimeout(() => {
      if (this.modeManager && this.modeManager.mode === 'view') {
        this.disableExperienceControls();
      }
    }, this.config.initDelay);
  }

  // Métodos de experiência e validação de senha agora fornecidos pelos mixins
  // setupExperienceControls, setupPasswordValidation, etc. removidos
  getRequiredFields() {
    return ['nome', 'sobrenome', 'username', 'genero', 'nascimento', 'contato', 'senha', 'confirmarSenha'];
  }
  
  // Método requerido pelo helper unificado
  getEntityType() {
    return 'Conta';
  }
  
  // Método requerido pelo helper unificado
  requiresAuth() {
    return false; // Conta não requer autenticação prévia
  }

  validateForm() {
    // Usar validação da classe pai primeiro
    if (!super.validateForm()) {
      return false;
    }    const contato = document.getElementById("contato")?.value.trim();
    const username = document.getElementById("username")?.value.trim();
    const senha = this.elementos.senha?.value;
    const confirmarSenha = this.elementos.confirmarSenha?.value;
    const nascimento = document.getElementById("nascimento")?.value;

    // Validar username
    if (username) {
      const usernameValidation = ValidationStrategies.username(username);
      if (!usernameValidation.valid) {
        const usernameField = document.getElementById("username");
        this.markFieldAsError(usernameField, usernameValidation.message);
        return false;
      }
    }

    // Validar email
    if (contato) {
      const emailValidation = ValidationStrategies.email(contato);
      if (!emailValidation.valid) {
        const contatoField = document.getElementById("contato");
        this.markFieldAsError(contatoField, emailValidation.message);
        return false;
      }
    }

    // Validar senha usando ValidationStrategies
    if (senha) {
      const passwordValidation = ValidationStrategies.passwordStrength(senha);
      if (!passwordValidation.valid) {
        const senhaField = document.getElementById("senha");
        this.markFieldAsError(senhaField, passwordValidation.message);
        return false;
      }
    }

    // Validar confirmação de senha
    if (!this.validatePasswords()) {
      return false;
    }

    // Validar idade usando ValidationStrategies
    if (nascimento) {
      const ageValidation = ValidationStrategies.age(nascimento, 13);
      if (!ageValidation.valid) {
        const nascimentoField = document.getElementById("nascimento");
        this.markFieldAsError(nascimentoField, ageValidation.message);
        return false;
      }
    }

    return true;
  }
  getFormData() {
    // Mapear campos do frontend para o formato do backend
    const frontendData = {
      nome: document.getElementById("nome")?.value.trim(),
      sobrenome: document.getElementById("sobrenome")?.value.trim(),
      username: document.getElementById("username")?.value.trim(),
      genero: document.getElementById("genero")?.value,
      data_nascimento: document.getElementById("nascimento")?.value, // Backend usa data_nascimento
      email: document.getElementById("contato")?.value.trim(), // Backend usa email
      senha: this.elementos.senha?.value,
      experiencia: this.expLevels[this.currentExp - 1]?.backend || "Iniciante", // Mapear para valores do backend
      img_perfil: this.getUploadedImageUrl() // Backend usa img_perfil
    };

    // Remover senha vazia em modo de edição
    if (this.isEditing && (!frontendData.senha || frontendData.senha === '')) {
      delete frontendData.senha;
    }

    return frontendData;
  }

  // Usar método do mixin centralizado
  // getUploadedImageUrl() implementado via ImageMixin

  async submitForm(formData) {
    console.log('Enviando dados de conta:', formData);
    
    try {
      let response;
      let url;
      let method;

      if (this.isEditing) {
        // Modo edição - usar PUT
        url = `/users/${this.editingUserId}`;
        method = 'PUT';
      } else {
        // Modo criação - usar POST
        url = '/register';
        method = 'POST';
      }

      response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          // Adicionar headers de autenticação se necessário
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Conta processada com sucesso:', result);
        
        // Se foi criação de conta, pode fazer login automaticamente
        if (!this.isEditing && result.user) {
          await this.handleSuccessfulRegistration(result.user);
        } else if (this.isEditing) {
          await this.handleSuccessfulUpdate(result.user);
        }
        
        return result;
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao processar conta:', error);
      throw error;
    }
  }

  // handleSubmit agora é fornecido pelo UnifiedFormHelpers.createUnifiedSubmitHandler()
  // O comportamento específico está nos métodos handleSuccessfulRegistration/Update

  // Usar método do mixin centralizado
  // getAuthHeaders() implementado via AuthMixin

  async handleSuccessfulRegistration(user) {
    // NÃO fazer auto-login - apenas mostrar mensagem de sucesso
    this.showSuccessMessage('Conta criada com sucesso! Faça login para acessar sua conta.');
    
    // Redirecionar para a tela de login
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  }

  async handleSuccessfulUpdate(user) {
    // Atualizar dados do usuário na sessão usando mixin
    this.updateUserSession(user);
    
    // Usar método do mixin para redirecionamento padronizado
    await this.handleSuccessfulUpdateRedirect(user, 'Perfil');
  }

  // Usar método do mixin centralizado
  // showSuccessMessage() implementado via MessageMixin

  async loadUserData() {
    // Funciona tanto para edição quanto para visualização
    const userId = this.editingUserId || this.viewingUserId || this.editingId || this.viewingId;
    
    if (!userId) {
      console.warn('ID do usuário não encontrado para carregamento de dados');
      return;
    }

    try {
      const response = await fetch(`/users/${userId}`, {
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      
      if (result.success && result.user) {
        this.populateFormWithUserData(result.user);
        console.log(`Dados do usuário ${userId} carregados com sucesso em modo ${this.isEditing ? 'edição' : 'visualização'}`);
      } else {
        // Usuário não encontrado - usar helper unificado para redirecionamento
        UnifiedFormHelpers.handleEntityNotFound('user', userId);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      
      // Em caso de erro (404, etc), também usar helper unificado
      UnifiedFormHelpers.handleEntityNotFound('user', userId);
    }
  }
  
  // Manter método legacy para compatibilidade
  async loadUserDataForEdit() {
    return await this.loadUserData();
  }

  populateFormWithUserData(user) {
    // Log dos dados recebidos para debug
    console.log('PopulateFormWithUserData - Dados recebidos:', user);
    
    // Preencher campos básicos
    if (user.nome) document.getElementById("nome").value = user.nome;
    if (user.sobrenome) document.getElementById("sobrenome").value = user.sobrenome;
    if (user.username) document.getElementById("username").value = user.username;
    
    // Tratar gênero - verificar se é privado ou inválido
    const generoField = document.getElementById("genero");
    if (generoField) {
      console.log('Gênero recebido:', user.genero);
      
      if (!user.genero || user.genero === "privado" || user.genero === null || user.genero === '') {
        // Se é privado, nulo ou vazio, deixar vazio e mostrar indicador
        generoField.value = "";
        if (this.isViewing) {
          this.addPrivacyIndicator(generoField, "Privado");
        }
      } else {
        // Verificar se é um valor válido para o select
        const validOptions = Array.from(generoField.options).map(opt => opt.value);
        if (validOptions.includes(user.genero)) {
          generoField.value = user.genero;
        } else {
          // Valor inválido, tratar como privado
          generoField.value = "";
          if (this.isViewing) {
            this.addPrivacyIndicator(generoField, "Privado");
          }
        }
      }
    }
    
    // Tratar data de nascimento - verificar se é privada ou inválida
    const nascimentoField = document.getElementById("nascimento");
    if (nascimentoField) {
      console.log('Data nascimento recebida:', user.data_nascimento);
      
      if (!user.data_nascimento || user.data_nascimento === "privado" || user.data_nascimento === null || user.data_nascimento === '') {
        // Se é privado, nulo ou vazio, deixar vazio e mostrar indicador
        nascimentoField.value = "";
        if (this.isViewing) {
          this.addPrivacyIndicator(nascimentoField, "Privado");
        }
      } else {
        // Verificar se é uma data válida (formato YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(user.data_nascimento)) {
          nascimentoField.value = user.data_nascimento;
        } else {
          // Data em formato inválido, tratar como privada
          nascimentoField.value = "";
          if (this.isViewing) {
            this.addPrivacyIndicator(nascimentoField, "\nPrivado");
          }
        }
      }
    }
    
    if (user.email) document.getElementById("contato").value = user.email;

    // Mapear experiência do backend para frontend
    this.setExperienceFromBackend(user.experiencia);

    // Carregar imagem de perfil se existir
    if (user.img_perfil) {
      const preview = document.getElementById("profilePreview");
      if (preview) {
        preview.src = user.img_perfil;
      }
    }

    // Limpar campos de senha (não carregar senha existente)
    if (this.elementos.senha) this.elementos.senha.value = '';
    if (this.elementos.confirmarSenha) this.elementos.confirmarSenha.value = '';
  }

  setExperienceFromBackend(backendExp) {
    // Mapear experiência do backend para o sistema de níveis do frontend
    const expMapping = {
      'Iniciante': 1,
      'Experiente': 3,
      'Veterano': 5,
      'Lendário': 6
    };

    const frontendLevel = expMapping[backendExp] || 1;
    this.setExperience(frontendLevel);
  }

  addPrivacyIndicator(field, message) {
    // Adicionar indicador visual de que o campo é privado
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    
    // Verificar se já existe um indicador
    const existingIndicator = formGroup.querySelector('.privacy-indicator');
    if (existingIndicator) return;
    
    // Esconder o campo original completamente
    field.style.display = 'none';
    
    // Criar indicador de privacidade mais elegante
    const indicator = document.createElement('div');
    indicator.className = 'privacy-indicator';
    indicator.innerHTML = `
      <div class="privacy-content">
        <i class="privacy-icon"> </i>
        <span class="privacy-text"> ${message}</span>
      </div>
    `;
   
    
    // Estilizar o conteúdo interno
    const privacyContent = indicator.querySelector('.privacy-content');
    if (privacyContent) {
      privacyContent.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
      `;
    }
    
    // Estilizar o ícone
    const privacyIcon = indicator.querySelector('.privacy-icon');
    if (privacyIcon) {
      privacyIcon.style.cssText = `
        font-size: 16px;
        opacity: 0.7;
      `;
    }
    
    // Substituir o campo pelo indicador
    field.parentNode.insertBefore(indicator, field);
  }

  checkLoggedUserAccess() {
    // Verificar se usuário está logado e tentando acessar conta.html sem modo específico
    const currentUser = DiceOrDieUtils.getCurrentUser();
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const id = urlParams.get('id');
    
    // Se usuário está logado e acessou conta.html sem parâmetros (conta.html limpo)
    if (currentUser && currentUser.id && !mode && !id) {
      console.log('Usuário logado acessando conta.html diretamente, redirecionando para seu perfil...');
      
      // Redirecionar para o perfil do usuário logado
      window.location.href = `conta.html?mode=view&id=${currentUser.id}`;
      return;
    }
  }

  // Usar método do mixin centralizado
  // showErrorMessage() implementado via MessageMixin
}

// Aplicar mixins centralizados para eliminar redundâncias
FormMixins.applyCommonMixins(ContaForm);
EnhancedFormMixins.applyFormSpecificMixins(ContaForm);

// Nota: Inicialização movida para conta-config.js para evitar duplicação
// FormInitializer.initializeForm(ContaForm, 'conta', {
//   legacyAlias: 'gerenciadorCadastro'
// });
