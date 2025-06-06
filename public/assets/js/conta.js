// Classe específica para o formulário de conta, herdando da BaseForm
class ContaForm extends BaseForm {
  constructor() {
    // Use centralized configuration instead of hardcoded values
    const config = FormConstants.getFormConfig('conta');
    super('mainForm', config);

    // Propriedades específicas da conta
    this.expLevels = {
      0: { name: "Goblin", description: "Novo no mundo dos RPGs" },
      1: { name: "Cavaleiro", description: "Alguma experiência com RPG" },
      2: { name: "Mago", description: "Jogador experiente" },
      3: { name: "Dragão", description: "Veterano em RPGs" },
      4: { name: "Titã", description: "Mestre em sistemas diversos" },
      5: { name: "Deus Antigo", description: "Lenda viva do RPG" }
    };

    this.currentExp = 1; // Começa em Cavaleiro (nível 1)

    // Inicializar componente de upload de imagem
    this.imageUpload = new ImageUploadMixin({
      purpose: 'profile'
    });

    this.setupContaSpecificElements();
    this.initContaFeatures();
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
    return {
      nome: document.getElementById("nome")?.value.trim(),
      sobrenome: document.getElementById("sobrenome")?.value.trim(),
      username: document.getElementById("username")?.value.trim(),
      genero: document.getElementById("genero")?.value,
      nascimento: document.getElementById("nascimento")?.value,
      contato: document.getElementById("contato")?.value.trim(),
      senha: this.elementos.senha?.value,
      experiencia: this.currentExp,
      fotoPerfil: document.getElementById("profilePreview")?.src
    };
  }

  async submitForm(formData) {
    // Simular envio para o servidor
    console.log('Enviando dados de conta:', formData);
    
    // Simular delay de rede
    await this.simulateNetworkDelay(1500);
    
    // Simular sucesso (em um sistema real, isso viria da API)
    return { success: true };
  }
}

// Use standardized form initializer
FormInitializer.initializeForm(ContaForm, 'conta', {
  legacyAlias: 'gerenciadorCadastro'
});
