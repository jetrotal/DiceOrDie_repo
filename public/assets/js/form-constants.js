// Constantes e configurações centralizadas para formulários
class FormConstants {
    // Tempos de inicialização padronizados
    static INIT_DELAYS = {
        DEFAULT: 100,
        FORM_CREATION: 100,
        MODE_INTEGRATION: 100,
        COMPONENT_LOAD: 50
    };
    
    // Configurações de upload de imagem por tipo
    static IMAGE_CONFIGS = {
        PROFILE: {
            maxSize: 2 * 1024 * 1024, // 2MB
            allowedTypes: ['image/jpeg', 'image/png'],
            previewElementId: 'profilePreview',
            uploadButtonId: 'uploadButton'
        },
        CAMPAIGN: {
            maxSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: ['image/jpeg', 'image/png'],
            previewElementId: 'campaignPreview',
            uploadButtonId: 'uploadButton'
        },
        CHARACTER: {
            maxSize: 2 * 1024 * 1024, // 2MB
            allowedTypes: ['image/jpeg', 'image/png'],
            previewElementId: 'characterPreview',
            uploadButtonId: 'uploadButton'
        }
    };
    
    // Mensagens padrão
    static MESSAGES = {
        LOADING: {
            CONTA: 'Criando conta...',
            MESA: 'Criando mesa...',
            FICHA: 'Salvando ficha...',
            LOGIN: 'Entrando...',
            DEFAULT: 'Processando...'
        },
        SUCCESS: {
            CONTA: 'Conta criada com sucesso! Redirecionando...',
            MESA: 'Mesa criada com sucesso!',
            FICHA: 'Ficha salva com sucesso!',
            LOGIN: 'Login realizado com sucesso! Redirecionando...',
            DEFAULT: 'Operação realizada com sucesso!'
        },
        ERROR: {
            DEFAULT: 'Erro ao processar. Tente novamente.',
            VALIDATION: 'Por favor, preencha todos os campos obrigatórios.',
            NETWORK: 'Erro de conexão. Verifique sua internet.',
            FILE_SIZE: 'Arquivo muito grande. Tamanho máximo: {size}MB',
            FILE_TYPE: 'Formato de arquivo não suportado. Use apenas JPG ou PNG.'
        }
    };
    
    // URLs de redirecionamento padrão
    static REDIRECT_URLS = {
        CONTA: 'mesas.html',
        MESA: 'mesas.html',
        FICHA: 'mesas.html',
        LOGIN: 'mesas.html'
    };
    
    // Delays de redirecionamento
    static REDIRECT_DELAYS = {
        CONTA: 2000,
        MESA: 1500,
        FICHA: 1500,
        LOGIN: 1500,
        DEFAULT: 2000
    };
      // Campos obrigatórios por tipo de formulário
      static REQUIRED_FIELDS = {
          CONTA: ['nome', 'sobrenome', 'username', 'genero', 'nascimento', 'contato', 'senha', 'confirmarSenha'],
          MESA: ['nomeMesa', 'sistema', 'qtdJogadores', 'autor', 'descricao'],
          FICHA: [
              'nomePersonagem', 'nivel', 'raca', 'classe',
              'pontosVida', 'classeArmadura',
              'forca', 'destreza', 'constituicao',
              'inteligencia', 'sabedoria', 'carisma'
          ],
          LOGIN: ['contato', 'senha']
      };
    
    // Método helper para obter configuração completa por tipo
    static getFormConfig(type) {
        const upperType = type.toUpperCase();
        
        return {
            loadingText: this.MESSAGES.LOADING[upperType] || this.MESSAGES.LOADING.DEFAULT,
            successMessage: this.MESSAGES.SUCCESS[upperType] || this.MESSAGES.SUCCESS.DEFAULT,
            errorMessage: this.MESSAGES.ERROR.DEFAULT,
            redirectUrl: this.REDIRECT_URLS[upperType],
            redirectDelay: this.REDIRECT_DELAYS[upperType] || this.REDIRECT_DELAYS.DEFAULT,
            initDelay: this.INIT_DELAYS.DEFAULT,
            requiredFields: this.REQUIRED_FIELDS[upperType] || []
        };
    }
    
    // Método helper para obter configuração de upload por tipo
    static getImageConfig(purpose) {
        const upperPurpose = purpose.toUpperCase();
        const config = this.IMAGE_CONFIGS[upperPurpose] || this.IMAGE_CONFIGS.PROFILE;
        
        // Convert to the format expected by ImageUploadMixin
        return {
            maxSize: config.maxSize,
            allowedTypes: config.allowedTypes,
            previewElementId: config.previewElementId,
            uploadButtonId: config.uploadButtonId
        };
    }
}

// Disponibilizar globalmente
window.FormConstants = FormConstants;