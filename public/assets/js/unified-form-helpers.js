// Utilitários unificados para eliminar redundâncias entre formulários
class UnifiedFormHelpers {
    
    // **HELPER 1: Inicialização de Formulários Unificada**
    static async initializeFormWithConfig(FormClass, formType, globalVarName, legacyAlias = null) {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    if (typeof FormClass !== 'undefined') {
                        const formInstance = new FormClass();
                        window[globalVarName] = formInstance;
                        
                        // Legacy compatibility
                        if (legacyAlias) {
                            window[legacyAlias] = formInstance;
                        }
                        
                        console.log(`${FormClass.name} inicializado com sucesso via ${formType}PageConfig`);
                        resolve(formInstance);
                    } else {
                        console.error(`${FormClass.name} não está disponível`);
                        resolve(null);
                    }
                } catch (error) {
                    console.error(`Erro ao inicializar ${FormClass.name}:`, error);
                    resolve(null);
                }
            }, 200); // Delay padrão
        });
    }
    
    // **HELPER 2: Carregamento de Dados por ID Unificado**
    static async waitForFormAndLoadData(formVarName, loadMethodName, entityId, maxAttempts = 50) {
        let attempts = 0;
        
        const waitForForm = () => {
            const formInstance = window[formVarName];
            if (formInstance && formInstance[loadMethodName]) {
                console.log(`Formulário ${formVarName} encontrado, carregando dados...`);
                formInstance[loadMethodName]();
                return true;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(waitForForm, 100);
            } else {
                console.warn(`Timeout aguardando inicialização do formulário ${formVarName}`);
            }
            return false;
        };
        
        setTimeout(waitForForm, 100);
    }
    
    // **HELPER 2.1: Redirecionamento Inteligente Quando Entidade Não Encontrada**
    static handleEntityNotFound(entityType, entityId, customRedirectUrl = null) {
        const entityTypeMap = {
            'user': { name: 'Usuário', page: 'conta.html' },
            'character': { name: 'Personagem', page: 'ficha.html' },
            'conta': { name: 'Usuário', page: 'conta.html' },
            'ficha': { name: 'Personagem', page: 'ficha.html' }
        };
        
        const entityConfig = entityTypeMap[entityType.toLowerCase()];
        if (!entityConfig) {
            console.error(`Tipo de entidade desconhecido: ${entityType}`);
            return;
        }
        
        // Lógica inteligente para redirecionamento baseado no tipo de entidade e estado do usuário
        let redirectUrl = customRedirectUrl;
        let message;
        
        if (!redirectUrl) {
            if (entityType.toLowerCase() === 'user' || entityType.toLowerCase() === 'conta') {
                // Para usuários: verificar se está logado
                const currentUser = window.DiceOrDieUtils ? DiceOrDieUtils.getCurrentUser() : null;
                
                if (currentUser && currentUser.id) {
                    // Usuário logado: redirecionar para seu próprio perfil
                    redirectUrl = `conta.html?mode=view&id=${currentUser.id}`;
                    message = `${entityConfig.name} não encontrado${entityId ? ` (ID: ${entityId})` : ''}. Redirecionando para seu perfil...`;
                } else {
                    // Usuário não logado: redirecionar para nova conta
                    redirectUrl = entityConfig.page;
                    message = `${entityConfig.name} não encontrado${entityId ? ` (ID: ${entityId})` : ''}. Redirecionando para criação de nova conta...`;
                }
            } else {
                // Para outras entidades (personagens): sempre redirecionar para nova criação
                redirectUrl = entityConfig.page;
                message = `${entityConfig.name} não encontrado${entityId ? ` (ID: ${entityId})` : ''}. Redirecionando para criação de nova ${entityConfig.name.toLowerCase()}...`;
            }
        } else {
            message = `${entityConfig.name} não encontrado${entityId ? ` (ID: ${entityId})` : ''}. Redirecionando...`;
        }
        
        console.warn(message);
        
        // Mostrar mensagem de erro usando DiceOrDieUtils se disponível
        if (window.DiceOrDieUtils && typeof DiceOrDieUtils.showError === 'function') {
            DiceOrDieUtils.showError(message);
        } else {
            alert(message);
        }
        
        // Redirecionar imediatamente
        window.location.href = redirectUrl;
    }
    
    // **HELPER 3: Configuração de Navegação Padrão**
    static getStandardNavigationItems() {
        return [
            { text: 'Ver Mesas', type: 'button', onclick: "DiceOrDieUtils.navigateTo('mesas.html')" },
            { text: 'Fazer Login', type: 'button', onclick: "DiceOrDieUtils.navigateTo('login.html')" }
        ];
    }
    
    // **HELPER 4: Submit Handler Unificado**
    static createUnifiedSubmitHandler(formInstance) {
        return async function(event) {
            event.preventDefault();
            
            // Debug padronizado
            console.log(`🚨 handleSubmit chamado para ${formInstance.constructor.name}`, new Date().toISOString());
            
            // Proteção contra submits duplos unificada
            if (formInstance.isSubmitting) {
                console.log('⚠️ Submit já em andamento, ignorando');
                return;
            }
            formInstance.isSubmitting = true;
            
            // Verificação de usuário logado para formulários que requerem
            if (formInstance.requiresAuth && formInstance.requiresAuth()) {
                const currentUser = DiceOrDieUtils.getCurrentUser();
                if (!currentUser) {
                    DiceOrDieUtils.showError('Você deve estar logado para esta operação. Faça login primeiro.');
                    formInstance.isSubmitting = false;
                    return;
                }
            }
            
            if (!formInstance.validateForm()) {
                formInstance.isSubmitting = false;
                return;
            }
            
            formInstance.setSubmitLoading(true);
            
            try {
                const formData = formInstance.getFormData();
                
                // Console logging padronizado
                console.log(`=== DADOS DO ${formInstance.getEntityType().toUpperCase()} SALVOS ===`);
                console.log(JSON.stringify(formData, null, 2));
                console.log('===================================');
                
                const result = await formInstance.submitForm(formData);
                
                if (result.success) {
                    console.log(`${formInstance.getEntityType()} processado com sucesso - redirecionamento controlado pela classe filha`);
                } else {
                    throw new Error(result.message || formInstance.config.errorMessage);
                }
                
            } catch (error) {
                console.error('Erro no submit:', error);
                DiceOrDieUtils.showError(error.message || formInstance.config.errorMessage);
            } finally {
                formInstance.setSubmitLoading(false);
                formInstance.isSubmitting = false;
            }
        };
    }
    
    // **HELPER 5: Validação Numérica Unificada**
    static createNumericValidator(min = 1, max = 999, fieldName = 'campo') {
        return function(value) {
            const numValue = parseInt(value);
            if (isNaN(numValue) || numValue < min || numValue > max) {
                return {
                    valid: false, 
                    message: `${fieldName} deve estar entre ${min} e ${max}`
                };
            }
            return { valid: true };
        };
    }
    
    // **HELPER 6: Setup de Event Listeners Unificado**
    static setupPreventDuplicateEvents(form, eventType, handler) {
        if (form && !form.hasEventListener) {
            form.addEventListener(eventType, handler);
            form.hasEventListener = true; // Flag para prevenir duplicatas
        }
    }
    
    // **HELPER 7: Configuração de Painéis de Ajuda Unificada**
    static getStandardHelpPanels(formType) {
        const panels = {
            'conta': [
                {
                    title: 'Níveis de Experiência',
                    items: [
                        { text: 'Goblin - Novo no RPG', type: 'info' },
                        { text: 'Cavaleiro - Alguma experiência', type: 'info' },
                        { text: 'Mago - Jogador experiente', type: 'info' },
                        { text: 'Dragão - Veterano', type: 'info' },
                        { text: 'Titã - Mestre em sistemas', type: 'info' },
                        { text: 'Deus Antigo - Lenda viva', type: 'info' }
                    ]
                },
                {
                    title: 'Dicas de Perfil',
                    items: [
                        { text: 'Use uma foto de perfil clara', type: 'info' },
                        { text: 'Defina seu nível de experiência', type: 'info' },
                        { text: 'Mantenha seus dados atualizados', type: 'info' }
                    ]
                }
            ],
            'ficha': [
                {
                    title: 'Sistemas de RPG',
                    items: [
                        { text: 'D&D 5e - Dungeons & Dragons', type: 'info' },
                        { text: 'Pathfinder - Sistema d20', type: 'info' },
                        { text: 'Call of Cthulhu - Horror', type: 'info' },
                        { text: 'Vampire - World of Darkness', type: 'info' }
                    ]
                },
                {
                    title: 'Dicas de Ficha',
                    items: [
                        { text: 'Preencha todos os campos obrigatórios', type: 'info' },
                        { text: 'Defina os atributos cuidadosamente', type: 'info' },
                        { text: 'Use imagens em JPG ou PNG (máx 2MB)', type: 'info' }
                    ]
                }
            ]
        };
        
        return panels[formType] || [];
    }
}

// Disponibilizar globalmente
window.UnifiedFormHelpers = UnifiedFormHelpers;