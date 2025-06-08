// Mixins específicos para funcionalidades avançadas dos formulários
class EnhancedFormMixins {
    
    // **MIXIN: Gerenciamento de Estado de Experiência (para ContaForm)**
    static ExperienceMixin = {
        setupExperienceSystem(levels, initialLevel = 1) {
            this.expLevels = levels;
            this.currentExp = initialLevel;
            this.setupExperienceControls();
            this.updateExperienceDisplay();
        },
        
        setupExperienceControls() {
            const decreaseBtn = document.getElementById("decreaseExp");
            const increaseBtn = document.getElementById("increaseExp");
            const expDots = document.querySelectorAll(".exp-dot");
            
            if (decreaseBtn) {
                decreaseBtn.addEventListener("click", () => this.changeExperience(-1));
            }
            
            if (increaseBtn) {
                increaseBtn.addEventListener("click", () => this.changeExperience(1));
            }
            
            expDots.forEach((dot, index) => {
                dot.addEventListener("click", () => this.setExperience(index + 1));
            });
        },
        
        changeExperience(delta) {
            const newExp = this.currentExp + delta;
            const maxLevel = Object.keys(this.expLevels).length;
            if (newExp >= 1 && newExp <= maxLevel) {
                this.setExperience(newExp);
            }
        },
        
        setExperience(level) {
            this.currentExp = level;
            this.updateExperienceDisplay();
        },
        
        updateExperienceDisplay() {
            const levelData = this.expLevels[this.currentExp - 1];
            const expLevel = document.getElementById("expLevel");
            const expDescription = document.getElementById("expDescription");
            const expDots = document.querySelectorAll(".exp-dot");
            const decreaseBtn = document.getElementById("decreaseExp");
            const increaseBtn = document.getElementById("increaseExp");
            
            if (expLevel && levelData) {
                expLevel.textContent = levelData.name;
            }
            
            if (expDescription && levelData) {
                expDescription.textContent = levelData.description;
            }
            
            // Atualizar dots
            expDots.forEach((dot, index) => {
                dot.classList.toggle("active", index < this.currentExp);
            });
            
            // Atualizar botões
            if (decreaseBtn) {
                decreaseBtn.disabled = this.currentExp <= 1;
            }
            
            if (increaseBtn) {
                const maxLevel = Object.keys(this.expLevels).length;
                increaseBtn.disabled = this.currentExp >= maxLevel;
            }
        },
        
        disableExperienceControls() {
            const decreaseBtn = document.getElementById("decreaseExp");
            const increaseBtn = document.getElementById("increaseExp");
            const expDots = document.querySelectorAll(".exp-dot");
            
            if (decreaseBtn) decreaseBtn.style.display = 'none';
            if (increaseBtn) increaseBtn.style.display = 'none';
            
            // Remover event listeners dos dots
            expDots.forEach(dot => {
                const newDot = dot.cloneNode(true);
                dot.parentNode.replaceChild(newDot, dot);
            });
        }
    };
    
    // **MIXIN: Sistema de Atributos RPG (para FichaForm)**
    static AttributesMixin = {
        setupAttributeSystem(attributeIds) {
            this.attributeInputs = {};
            
            attributeIds.forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    this.attributeInputs[id] = input;
                    this.setupAttributeEventListeners(input);
                }
            });
        },
        
        setupAttributeEventListeners(input) {
            input.addEventListener('input', (e) => {
                this.validateAttribute(e.target);
            });
            
            input.addEventListener('blur', (e) => {
                this.calculateModifier(e.target);
            });
        },
        
        calculateModifier(input) {
            const value = parseInt(input.value);
            if (!isNaN(value)) {
                const modifier = Math.floor((value - 10) / 2);
                const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                input.title = `Modificador: ${modifierText}`;
            }
        },
        
        validateAllAttributes() {
            let allValid = true;
            Object.values(this.attributeInputs).forEach(input => {
                if (input && !this.validateAttribute(input)) {
                    allValid = false;
                }
            });
            return allValid;
        },
        
        recalculateAllModifiers() {
            Object.values(this.attributeInputs).forEach(input => {
                if (input && input.value) {
                    this.calculateModifier(input);
                }
            });
        }
    };
    
    // **MIXIN: Sistema de Classes RPG (para FichaForm)**
    static ClassSystemMixin = {
        setupClassSystem() {
            const classeField = document.getElementById('classe');
            const nivelField = document.getElementById('nivel');
            
            if (classeField) {
                classeField.addEventListener('change', () => {
                    this.updateClasseBasedStats();
                });
            }
            
            if (nivelField) {
                nivelField.addEventListener('change', () => {
                    this.updateLevelBasedStats();
                });
            }
        },
        
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
        },
        
        updateClasseBasedStats() {
            const classeField = document.getElementById('classe');
            const pontosVidaField = document.getElementById('pontosVida');
            
            if (!classeField || !pontosVidaField) return;
            
            const selectedClass = classeField.value;
            
            if (selectedClass) {
                const classeData = this.getClasseData(selectedClass);
                if (classeData) {
                    pontosVidaField.placeholder = `Sugerido: ${classeData.suggestedHP}`;
                    pontosVidaField.title = classeData.description;
                }
            }
        },
        
        updateLevelBasedStats() {
            const nivelField = document.getElementById('nivel');
            const pontosVidaField = document.getElementById('pontosVida');
            
            if (!nivelField || !pontosVidaField) return;
            
            const level = parseInt(nivelField.value);
            if (!isNaN(level)) {
                const baseHP = parseInt(pontosVidaField.placeholder.replace(/\D/g, '')) || 25;
                const suggestedHP = baseHP + ((level - 1) * 5);
                pontosVidaField.placeholder = `Sugerido: ${suggestedHP}`;
            }
        }
    };
    
    // **MIXIN: Validação de Senhas (para ContaForm)**
    static PasswordValidationMixin = {
        setupPasswordValidation() {
            const senhaField = document.getElementById("senha");
            const confirmarSenhaField = document.getElementById("confirmarSenha");
            
            if (senhaField) {
                senhaField.addEventListener("input", () => this.validatePasswords());
            }
            
            if (confirmarSenhaField) {
                confirmarSenhaField.addEventListener("input", () => this.validatePasswords());
            }
        },
        
        validatePasswords() {
            const senhaField = document.getElementById("senha");
            const confirmarSenhaField = document.getElementById("confirmarSenha");
            
            if (!senhaField || !confirmarSenhaField) return true;
            
            const senha = senhaField.value;
            const confirmarSenha = confirmarSenhaField.value;
            
            if (senha && confirmarSenha) {
                const validation = ValidationStrategies.password(senha, confirmarSenha);
                if (!validation.valid) {
                    this.markFieldAsError(confirmarSenhaField, validation.message);
                    return false;
                } else {
                    this.clearFieldError(confirmarSenhaField);
                    return true;
                }
            }
            
            // Reset se estiver vazio
            this.clearFieldError(confirmarSenhaField);
            return true;
        }
    };
    
    // **UTILITÁRIO: Aplicar mixins específicos baseados no tipo de formulário**
    static applyFormSpecificMixins(targetClass) {
        const className = targetClass.name;
        
        if (className.includes('Conta')) {
            this.applyMixins(targetClass, this.ExperienceMixin, this.PasswordValidationMixin);
        } else if (className.includes('Ficha')) {
            this.applyMixins(targetClass, this.AttributesMixin, this.ClassSystemMixin);
        }
    }
    
    // **UTILITÁRIO: Aplicar mixins**
    static applyMixins(targetClass, ...mixins) {
        mixins.forEach(mixin => {
            Object.getOwnPropertyNames(mixin).forEach(name => {
                if (name !== 'constructor') {
                    targetClass.prototype[name] = mixin[name];
                }
            });
        });
    }
}

// Disponibilizar globalmente
window.EnhancedFormMixins = EnhancedFormMixins;