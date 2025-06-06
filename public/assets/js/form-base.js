// Classe base para formulários com funcionalidades comuns
class BaseForm {
    constructor(formId, config = {}) {
        this.formId = formId;
        this.form = document.getElementById(formId);
        this.config = {
            submitButtonId: 'submitter',
            loadingText: 'Processando...',
            successMessage: 'Operação realizada com sucesso!',
            errorMessage: 'Erro ao processar. Tente novamente.',
            redirectUrl: null,
            redirectDelay: 2000,
            validationRules: {},
            initDelay: 100, // Standardize initialization timing
            ...config
        };
        
        this.submitButton = document.getElementById(this.config.submitButtonId);
        this.originalSubmitText = this.submitButton?.textContent || 'Enviar';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupModeIntegration();
    }
    
    // Standardized method for getting mode manager reference
    getModeManager() {
        // Try common mode manager patterns
        return window.modeManager ||
               window[`${this.getPageType()}ModeManager`] ||
               null;
    }
    
    // Helper to get page type from class name or config
    getPageType() {
        const className = this.constructor.name.toLowerCase();
        if (className.includes('conta')) return 'conta';
        if (className.includes('mesa')) return 'mesa';
        if (className.includes('ficha')) return 'ficha';
        return 'unknown';
    }
    
    setupEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }
    
    setupModeIntegration() {
        // Integração com o sistema de modos - será sobrescrito pelas classes filhas se necessário
        setTimeout(() => {
            this.modeManager = this.getModeManager();
            if (this.modeManager && this.modeManager.mode === 'view') {
                this.disableForm();
            }
        }, this.config.initDelay);
    }    disableForm() {
        // Desabilitar todos os inputs do formulário
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.disabled = true;
            } else {
                input.readOnly = true;
                input.classList.add('readonly-field');
            }
        });
        
        // Desabilitar botões separadamente, exceto botões de ação (editar/apagar)
        const buttons = this.form.querySelectorAll('button:not(.edit-button):not(.delete-button):not(.participate-button)');
        buttons.forEach(button => {
            button.disabled = true;
        });
    }
    
    enableForm() {
        // Habilitar todos os inputs do formulário
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.disabled = false;
            } else {
                if (!input.classList.contains('readonly')) {
                    input.readOnly = false;
                    input.classList.remove('readonly-field');
                }
            }
        });
        
        // Habilitar botões separadamente
        const buttons = this.form.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = false;
        });
    }
    
    // Método para validação básica - pode ser sobrescrito
    validateForm() {
        const requiredFields = this.getRequiredFields();
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                this.markFieldAsError(field);
                isValid = false;
            } else if (field) {
                this.clearFieldError(field);
            }
        });
        
        if (!isValid) {
            DiceOrDieUtils.showError('Por favor, preencha todos os campos obrigatórios.');
        }
        
        return isValid;
    }
    
    // Método abstrato - deve ser implementado pelas classes filhas
    getRequiredFields() {
        return [];
    }
    
    // Standardized error handling methods using DiceOrDieUtils
    markFieldAsError(field, message = null) {
        DiceOrDieUtils.markFieldError(field, message);
    }
    
    clearFieldError(field) {
        DiceOrDieUtils.clearFieldError(field);
    }
    
    // Gerenciamento do estado do botão de submit
    setSubmitLoading(loading = true) {
        if (!this.submitButton) return;
        
        if (loading) {
            this.submitButton.disabled = true;
            this.submitButton.textContent = this.config.loadingText;
        } else {
            this.submitButton.disabled = false;
            this.submitButton.textContent = this.originalSubmitText;
        }
    }
    
    // Método principal de submit - pode ser sobrescrito
    async handleSubmit(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        this.setSubmitLoading(true);        try {
            let formData;
            try {
                formData = this.getFormData();
            } catch (error) {
                // Se getFormData não foi implementado, usar coleta genérica
                formData = this.collectGenericFormData();
            }
            
            // Imprimir JSON dos dados do formulário no console
            console.log('=== DADOS DO FORMULÁRIO SALVOS ===');
            console.log(JSON.stringify(formData, null, 2));
            console.log('===================================');
            
            const result = await this.submitForm(formData);
            
            if (result.success) {
                DiceOrDieUtils.showSuccess(this.config.successMessage);
                
                if (this.config.redirectUrl) {
                    setTimeout(() => {
                        DiceOrDieUtils.navigateTo(this.config.redirectUrl);
                    }, this.config.redirectDelay);
                }
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
    
    // Método unificado para coletar dados do formulário
    collectFormData() {
        const formData = {};
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
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
    
    // Keep legacy method for compatibility
    collectGenericFormData() {
        return this.collectFormData();
    }

    // Método abstrato - deve ser implementado pelas classes filhas
    getFormData() {
        throw new Error('getFormData() deve ser implementado pela classe filha');
    }
    
    // Método abstrato - deve ser implementado pelas classes filhas
    async submitForm(formData) {
        throw new Error('submitForm() deve ser implementado pela classe filha');
    }
    
    // Método para simular delay de rede
    async simulateNetworkDelay(delay = 1500) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }
}

// Mixin para funcionalidade de upload de imagem
class ImageUploadMixin {
    constructor(config = {}) {
        // Standardized image upload configuration
        const defaultConfig = ImageUploadMixin.getDefaultConfig(config.purpose || 'generic');
        this.uploadConfig = {
            ...defaultConfig,
            ...config
        };
        
        this.setupImageUpload();
    }
    
    // Centralized configuration using FormConstants to eliminate duplication
    static getDefaultConfig(purpose) {
        return FormConstants.getImageConfig(purpose);
    }
    
    setupImageUpload() {
        this.uploadButton = document.getElementById(this.uploadConfig.uploadButtonId);
        this.previewElement = document.getElementById(this.uploadConfig.previewElementId);
        
        // Criar input file invisível
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = this.uploadConfig.allowedTypes.join(',');
        this.fileInput.style.display = 'none';
        document.body.appendChild(this.fileInput);
        
        this.setupImageEventListeners();
    }
    
    setupImageEventListeners() {
        if (this.uploadButton) {
            this.uploadButton.addEventListener('click', () => {
                this.fileInput.click();
            });
        }
        
        this.fileInput.addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });
    }
    
    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validar tipo de arquivo
        if (!this.uploadConfig.allowedTypes.includes(file.type)) {
            DiceOrDieUtils.showError('Formato de arquivo não suportado. Use apenas JPG ou PNG.');
            return;
        }
        
        // Validar tamanho
        if (file.size > this.uploadConfig.maxSize) {
            const sizeMB = (this.uploadConfig.maxSize / (1024 * 1024)).toFixed(0);
            DiceOrDieUtils.showError(`Arquivo muito grande. Tamanho máximo: ${sizeMB}MB`);
            return;
        }
        
        // Criar preview local primeiro
        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.previewElement) {
                this.previewElement.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
        
        // Se for upload de perfil, enviar para servidor automaticamente
        if (this.uploadConfig.purpose === 'profile') {
            await this.uploadToServer(file);
        } else {
            // Para outros tipos, usar comportamento original
            this.onImageLoaded && this.onImageLoaded(reader.result, file);
            DiceOrDieUtils.showSuccess('Imagem carregada com sucesso!');
        }
    }

    async uploadToServer(file) {
        try {
            DiceOrDieUtils.showInfo('Enviando imagem...');
            
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/upload-profile-picture', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Armazenar URL da imagem uploadada
                this.uploadedImageUrl = result.image_url;
                
                // Atualizar preview com URL do servidor
                if (this.previewElement) {
                    this.previewElement.src = result.image_url;
                }
                
                DiceOrDieUtils.showSuccess('Imagem enviada com sucesso!');
                console.log('Image uploaded:', result.image_url);
                
                // Chamar callback se definido
                this.onImageLoaded && this.onImageLoaded(result.image_url, file);
            } else {
                throw new Error(result.error || 'Erro no upload da imagem');
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            DiceOrDieUtils.showError(`Erro no upload: ${error.message}`);
            
            // Limpar preview em caso de erro
            if (this.previewElement) {
                this.previewElement.src = '';
            }
        }
    }
    
    // Callback que pode ser sobrescrito
    onImageLoaded(imageSrc, file) {
        // Implementação específica nas classes filhas
    }
}

// Classe base para configuração de páginas
class BasePageConfig {
    constructor(pageName) {
        this.pageName = pageName;
    }
    
    async initialize() {
        // Inicializar gerenciador de modos
        window.modeManager = PageModeManager.initialize(this.pageName);
        
        // Inicializar layout básico
        await ComponentManager.initializeLayout();
        
        // Configurar componentes específicos
        this.configurePage();
    }
    
    configurePage() {
        // Configurar sidebar
        const sidebarConfig = this.getSidebarConfig();
        if (sidebarConfig) {
            ComponentManager.configureSidebar(sidebarConfig);
        }
        
        // Configurar painel direito
        const rightPanelConfig = this.getRightPanelConfig();
        if (rightPanelConfig) {
            ComponentManager.configureRightPanel(rightPanelConfig);
        }
    }
    
    // Métodos abstratos - devem ser implementados pelas classes filhas
    getSidebarConfig() {
        return null;
    }
    
    getRightPanelConfig() {
        return null;
    }
}

// Standardized form initializer to eliminate duplicated initialization patterns
class FormInitializer {
    static initializeForm(FormClass, formType, options = {}) {
        document.addEventListener('DOMContentLoaded', () => {
            const config = FormConstants.getFormConfig(formType);
            const delay = options.customDelay || config.initDelay;
            
            setTimeout(() => {
                try {
                    const formInstance = new FormClass();
                    window[`${formType}Form`] = formInstance;
                    
                    // Legacy compatibility support
                    if (options.legacyAlias) {
                        window[options.legacyAlias] = formInstance;
                    }
                    
                    console.log(`${FormClass.name} initialized successfully`);
                    return formInstance;
                } catch (error) {
                    console.error(`Error initializing ${FormClass.name}:`, error);
                    throw error;
                }
            }, delay);
        });
    }
}

// Make FormInitializer globally available
window.FormInitializer = FormInitializer;

// Validation strategies for consistent form validation
class ValidationStrategies {
    static password(senha, confirmarSenha) {
        if (!DiceOrDieUtils.validatePasswords(senha, confirmarSenha)) {
            return { valid: false, message: 'As senhas não coincidem' };
        }
        return { valid: true };
    }
    
    static attribute(value, min = 1, max = 20) {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < min || numValue > max) {
            return { valid: false, message: `Valor deve estar entre ${min} e ${max}` };
        }
        return { valid: true };
    }
    
    static age(birthDate, minAge = 13) {
        if (!DiceOrDieUtils.validateAge(birthDate, minAge)) {
            return { valid: false, message: `É necessário ter pelo menos ${minAge} anos` };
        }
        return { valid: true };
    }
    
    static email(email) {
        if (!DiceOrDieUtils.validateEmail(email)) {
            return { valid: false, message: 'Email inválido' };
        }
        return { valid: true };
    }
    
    static phone(phone) {
        if (!DiceOrDieUtils.validatePhone(phone)) {
            return { valid: false, message: 'Telefone inválido' };
        }
        return { valid: true };
    }
      static contact(contact) {
        if (!DiceOrDieUtils.validateEmail(contact)) {
            return { valid: false, message: 'Insira um email válido' };
        }
        return { valid: true };
    }
    
    static passwordStrength(password) {
        if (!DiceOrDieUtils.validatePassword(password)) {
            return { valid: false, message: 'A senha deve ter pelo menos 6 caracteres' };
        }
        return { valid: true };
    }
    
    static required(value) {
        if (!DiceOrDieUtils.validateRequired(value)) {
            return { valid: false, message: 'Campo obrigatório' };
        }
        return { valid: true };
    }
      static range(value, min, max) {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < min || numValue > max) {
            return { valid: false, message: `Valor deve estar entre ${min} e ${max}` };
        }
        return { valid: true };
    }
    
    static username(username) {
        if (!DiceOrDieUtils.validateUsername(username)) {
            return { valid: false, message: 'Username deve ter entre 3-20 caracteres, apenas letras, números e underscore' };
        }
        return { valid: true };
    }
}

// Make ValidationStrategies globally available
window.ValidationStrategies = ValidationStrategies;
