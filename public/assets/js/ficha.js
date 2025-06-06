// Classe específica para o formulário de ficha, herdando da BaseForm
class FichaForm extends BaseForm {
    constructor() {
        // Use centralized configuration instead of hardcoded values
        const config = FormConstants.getFormConfig('ficha');
        super('mainForm', config);

        // Inicializar componente de upload de imagem
        this.imageUpload = new ImageUploadMixin({
            purpose: 'character'
        });

        this.setupFichaSpecificElements();
        this.initFichaFeatures();
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
    
    setupModeIntegration() {
        // Usar implementação padronizada da classe pai
        super.setupModeIntegration();
    }

    setDefaultPlayerName() {
        // Simula o nome do jogador logado
        if (this.nomeJogadorField) {
            this.nomeJogadorField.value = "Jogador Teste"; // Em produção, seria obtido do sistema de autenticação
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

        // Use ValidationStrategies for consistency
        const validation = ValidationStrategies.attribute(value, min, max);
        
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

        // Validação de pontos de vida usando ValidationStrategies
        if (this.pontosVidaField) {
            const validation = ValidationStrategies.range(this.pontosVidaField.value, 1, 999);
            if (!validation.valid) {
                this.markFieldAsError(this.pontosVidaField, 'Pontos de vida devem ser pelo menos 1');
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

    getFormData() {
        // Usar método unificado da classe pai e adicionar dados específicos
        const baseData = this.collectFormData();
        
        return {
            ...baseData,
            fichaType: 'generica',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
    }

    async submitForm(formData) {
        try {
            // Simular envio para API
            await this.simulateNetworkDelay(1000);
            
            // Simular salvamento
            console.log('Dados da ficha enviados:', formData);
            
            // Em produção, seria algo como:
            // const response = await fetch('/api/fichas', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData)
            // });
            // return await response.json();
            
            return {
                success: true,
                fichaId: `ficha_${Date.now()}`,
                message: 'Ficha salva com sucesso!'
            };
            
        } catch (error) {
            console.error('Erro ao enviar ficha:', error);
            return {
                success: false,
                message: 'Erro ao salvar a ficha. Tente novamente.'
            };
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

    // Método para simular delay de rede (herdado da BaseForm)
    async simulateNetworkDelay(delay = 1500) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }
}

// Use standardized form initializer
FormInitializer.initializeForm(FichaForm, 'ficha');
