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
    this.isEditing = false;
    this.editingUserId = null;

    // Detectar modo baseado na URL
    this.detectPageMode();

    // Inicializar componente de upload de imagem
    this.imageUpload = new ImageUploadMixin({
      purpose: 'profile'
    });

    this.setupContaSpecificElements();
    this.initContaFeatures();
    
    // Se estivermos em modo de edição, carregar dados automaticamente
    if (this.isEditing) {
      // Aguardar um pouco para garantir que todos os elementos foram inicializados
      setTimeout(() => {
        this.loadUserDataForEdit();
      }, 500);
    }
  }

  detectPageMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const id = urlParams.get('id');
    
    if (mode === 'edit' && id) {
      this.isEditing = true;
      this.editingUserId = id;
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
    this.setupExperienceControls();
    this.setupPasswordValidation();
    this.updateExperienceDisplay();
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

  setupExperienceControls() {
    // Event listeners para controles de experiência
    if (this.elementos.decreaseExp) {
      this.elementos.decreaseExp.addEventListener("click", () => {
        this.changeExperience(-1);
      });
    }

    if (this.elementos.increaseExp) {
      this.elementos.increaseExp.addEventListener("click", () => {
        this.changeExperience(1);
      });
    }

    // Event listeners para os dots de experiência
    this.elementos.expDots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        this.setExperience(index + 1);
      });
    });
  }

  setupPasswordValidation() {
    if (this.elementos.senha) {
      this.elementos.senha.addEventListener("input", () => {
        this.validatePasswords();
      });
    }

    if (this.elementos.confirmarSenha) {
      this.elementos.confirmarSenha.addEventListener("input", () => {
        this.validatePasswords();
      });
    }
  }

  disableExperienceControls() {
    // Ocultar controles de experiência no modo view
    if (this.elementos.decreaseExp) this.elementos.decreaseExp.style.display = 'none';
    if (this.elementos.increaseExp) this.elementos.increaseExp.style.display = 'none';
    
    // Remover event listeners dos dots
    this.elementos.expDots.forEach(dot => {
      const newDot = dot.cloneNode(true);
      dot.parentNode.replaceChild(newDot, dot);
    });
  }

  changeExperience(delta) {
    const newExp = this.currentExp + delta;
    if (newExp >= 1 && newExp <= 6) {
      this.setExperience(newExp);
    }
  }

  setExperience(level) {
    this.currentExp = level;
    this.updateExperienceDisplay();
  }

  updateExperienceDisplay() {
    const levelData = this.expLevels[this.currentExp - 1];
    
    if (this.elementos.expLevel) {
      this.elementos.expLevel.textContent = levelData.name;
    }
    
    if (this.elementos.expDescription) {
      this.elementos.expDescription.textContent = levelData.description;
    }

    // Atualizar dots
    this.elementos.expDots.forEach((dot, index) => {
      dot.classList.toggle("active", index < this.currentExp);
    });

    // Atualizar botões
    if (this.elementos.decreaseExp) {
      this.elementos.decreaseExp.disabled = this.currentExp <= 1;
    }
    
    if (this.elementos.increaseExp) {
      this.elementos.increaseExp.disabled = this.currentExp >= 6;
    }
  }

  validatePasswords() {
    const senha = this.elementos.senha?.value;
    const confirmarSenha = this.elementos.confirmarSenha?.value;

    if (senha && confirmarSenha) {
      const validation = ValidationStrategies.password(senha, confirmarSenha);
      if (!validation.valid) {
        this.markFieldAsError(this.elementos.confirmarSenha, validation.message);
        return false;
      } else {
        this.clearFieldError(this.elementos.confirmarSenha);
        return true;
      }
    }
    
    // Reset se estiver vazio
    if (this.elementos.confirmarSenha) {
      this.clearFieldError(this.elementos.confirmarSenha);
    }
    
    return true;
  }
  getRequiredFields() {
    return ['nome', 'sobrenome', 'username', 'genero', 'nascimento', 'contato', 'senha', 'confirmarSenha'];
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

  getUploadedImageUrl() {
    // Primeiro verificar se há uma URL de imagem já uploadada via ImageUploadMixin
    if (this.imageUpload && this.imageUpload.uploadedImageUrl) {
      return this.imageUpload.uploadedImageUrl;
    }
    
    // Fallback: verificar se há imagem carregada via preview
    const preview = document.getElementById("profilePreview");
    if (preview && preview.src && !preview.src.includes('placehold.co') && !preview.src.startsWith('data:')) {
      return preview.src;
    }
    
    return null;
  }

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

  // Sobrescrever handleSubmit para controlar redirecionamento em modo de edição
  async handleSubmit(event) {
    event.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }
    
    this.setSubmitLoading(true);
    
    try {
      const formData = this.getFormData();
      
      // Imprimir JSON dos dados do formulário no console
      console.log('=== DADOS DO FORMULÁRIO SALVOS ===');
      console.log(JSON.stringify(formData, null, 2));
      console.log('===================================');
      
      const result = await this.submitForm(formData);
      
      if (result.success) {
        // Para conta, não usar o redirecionamento padrão da classe pai
        // O redirecionamento é controlado pelos métodos handleSuccessfulRegistration/Update
        console.log('Conta processada com sucesso - redirecionamento controlado pela classe filha');
      } else {
        throw new Error(result.message || this.config.errorMessage);
      }
      
    } catch (error) {
      console.error('Erro no submit:', error);
      DiceOrDieUtils.showError(error.message || this.config.errorMessage);
    } finally {
      this.setSubmitLoading(false);
    }
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
        console.log('Usuário encontrado no localStorage:', currentUser.username);
      } catch (e) {
        console.warn('Erro ao parsear usuário do localStorage:', e);
      }
    }
    
    // Se não encontrou, tenta sessionStorage (fallback)
    if (!currentUser) {
      const sessionUser = sessionStorage.getItem('currentUser');
      if (sessionUser) {
        try {
          currentUser = JSON.parse(sessionUser);
          console.log('Usuário encontrado no sessionStorage:', currentUser.username);
        } catch (e) {
          console.warn('Erro ao parsear usuário do sessionStorage:', e);
        }
      }
    }
    
    // Se encontrou usuário logado, adicionar headers de autenticação
    if (currentUser && currentUser.id) {
      headers['X-User-ID'] = currentUser.id.toString();
      headers['X-User-Role'] = currentUser.role || 'user';
      console.log('getAuthHeaders: Enviando headers:', headers);
      console.log('getAuthHeaders: Role do usuário:', currentUser.role);
    } else {
      console.log('getAuthHeaders: Nenhum usuário logado encontrado');
    }
    
    return headers;
  }

  async handleSuccessfulRegistration(user) {
    // Armazenar dados do usuário criado (compatibilidade com test-users.html)
    if (user) {
      localStorage.setItem('diceordie_current_user', JSON.stringify(user));
      sessionStorage.setItem('currentUser', JSON.stringify(user)); // fallback
      console.log('Usuário registrado e salvo na sessão:', user.username);
    }
    
    // Mostrar mensagem de sucesso
    this.showSuccessMessage('Conta criada com sucesso!');
    
    // Redirecionar após delay (pode ser para login ou dashboard)
    setTimeout(() => {
      // Redirecionar para página de login ou dashboard
      window.location.href = 'login.html';
    }, 2000);
  }

  async handleSuccessfulUpdate(user) {
    // Atualizar dados do usuário na sessão (compatibilidade com test-users.html)
    if (user) {
      localStorage.setItem('diceordie_current_user', JSON.stringify(user));
      sessionStorage.setItem('currentUser', JSON.stringify(user)); // fallback
      console.log('Usuário atualizado e salvo na sessão:', user.username);
    }
    
    // Mostrar mensagem de sucesso
    this.showSuccessMessage('Perfil atualizado com sucesso!');
    
    // Redirecionar para modo de visualização da mesma página (não para mesas.html)
    setTimeout(() => {
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('mode', 'view');
      newUrl.searchParams.set('id', this.editingUserId); // Manter o mesmo ID
      window.location.href = newUrl.toString();
    }, 1500);
  }

  showSuccessMessage(message) {
    // Criar elemento de mensagem de sucesso
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-weight: bold;
    `;
    
    document.body.appendChild(messageDiv);
    
    // Remover após 3 segundos
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 3000);
  }

  async loadUserDataForEdit() {
    if (!this.isEditing || !this.editingUserId) return;

    try {
      const response = await fetch(`/users/${this.editingUserId}`, {
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      
      if (result.success && result.user) {
        this.populateFormWithUserData(result.user);
      } else {
        console.error('Erro ao carregar dados do usuário:', result.error);
        this.showErrorMessage('Erro ao carregar dados do usuário');
      }
    } catch (error) {
      console.error('Erro ao carregar usuário para edição:', error);
      this.showErrorMessage('Erro ao carregar dados do usuário');
    }
  }

  populateFormWithUserData(user) {
    // Preencher campos básicos
    if (user.nome) document.getElementById("nome").value = user.nome;
    if (user.sobrenome) document.getElementById("sobrenome").value = user.sobrenome;
    if (user.username) document.getElementById("username").value = user.username;
    if (user.genero) document.getElementById("genero").value = user.genero;
    if (user.data_nascimento) document.getElementById("nascimento").value = user.data_nascimento;
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

  showErrorMessage(message) {
    // Criar elemento de mensagem de erro
    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 10000;
      font-weight: bold;
    `;
    
    document.body.appendChild(messageDiv);
    
    // Remover após 4 segundos
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 4000);
  }
}

// Use standardized form initializer
FormInitializer.initializeForm(ContaForm, 'conta', {
  legacyAlias: 'gerenciadorCadastro'
});
