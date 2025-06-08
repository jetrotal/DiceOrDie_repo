// Mixins centralizados para eliminar redundâncias entre formulários
class FormMixins {
    
    // **MIXIN 1: Sistema de Mensagens Unificado**
    static MessageMixin = {
        showSuccessMessage(message, duration = 3000) {
            this._showMessage(message, 'success', duration);
        },
        
        showErrorMessage(message, duration = 4000) {
            this._showMessage(message, 'error', duration);
        },
        
        showInfoMessage(message, duration = 3000) {
            this._showMessage(message, 'info', duration);
        },
        
        _showMessage(message, type, duration) {
            // Remover mensagens existentes do mesmo tipo
            const existingMessages = document.querySelectorAll(`.${type}-message`);
            existingMessages.forEach(msg => msg.remove());
            
            const messageDiv = document.createElement('div');
            messageDiv.className = `${type}-message`;
            messageDiv.textContent = message;
            
            // Estilos centralizados baseados no tipo
            const styles = this._getMessageStyles(type);
            messageDiv.style.cssText = styles;
            
            document.body.appendChild(messageDiv);
            
            // Auto-remoção
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, duration);
        },
        
        _getMessageStyles(type) {
            const baseStyles = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                z-index: 10000;
                font-weight: bold;
                color: white;
                max-width: 300px;
                word-wrap: break-word;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            `;
            
            const typeColors = {
                success: 'background: #4CAF50;',
                error: 'background: #f44336;',
                info: 'background: #2196F3;'
            };
            
            return baseStyles + (typeColors[type] || typeColors.info);
        }
    };
    
    // **MIXIN 2: Sistema de Autenticação Unificado**
    static AuthMixin = {
        getAuthHeaders() {
            const headers = {};
            let currentUser = null;
            
            // Tentar localStorage primeiro (sistema principal)
            const savedUser = localStorage.getItem('diceordie_current_user');
            if (savedUser) {
                try {
                    currentUser = JSON.parse(savedUser);
                    console.log('Usuário encontrado no localStorage:', currentUser.username);
                } catch (e) {
                    console.warn('Erro ao parsear usuário do localStorage:', e);
                }
            }
            
            // Fallback para sessionStorage
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
            
            // Adicionar headers de autenticação se usuário encontrado
            if (currentUser && currentUser.id) {
                headers['X-User-ID'] = currentUser.id.toString();
                headers['X-User-Role'] = currentUser.role || 'user';
                
                // Header específico para personagens se for o contexto
                if (this.constructor.name.includes('Ficha')) {
                    headers['X-USERNAME'] = currentUser.username;
                }
                
                console.log('AuthMixin: Headers enviados:', headers);
            } else {
                console.log('AuthMixin: Nenhum usuário logado encontrado');
            }
            
            return headers;
        },
        
        updateUserSession(user) {
            if (user) {
                localStorage.setItem('diceordie_current_user', JSON.stringify(user));
                sessionStorage.setItem('currentUser', JSON.stringify(user)); // fallback
                console.log('AuthMixin: Usuário salvo na sessão:', user.username);
            }
        },
        
        getCurrentUser() {
            return DiceOrDieUtils.getCurrentUser();
        }
    };
    
    // **MIXIN 3: Detecção de Modo de Página Unificada**
    static PageModeMixin = {
        detectPageMode() {
            const urlParams = new URLSearchParams(window.location.search);
            const mode = urlParams.get('mode');
            const id = urlParams.get('id');
            
            // Reset de propriedades
            this.isEditing = false;
            this.isViewing = false;
            this.editingId = null;
            this.viewingId = null;
            
            if (mode === 'edit' && id) {
                this.isEditing = true;
                this.editingId = id;
                
                // Propriedades específicas por tipo de formulário
                if (this.constructor.name.includes('Conta')) {
                    this.editingUserId = id;
                } else if (this.constructor.name.includes('Ficha')) {
                    this.editingCharacterId = id;
                }
            } else if (mode === 'view' && id) {
                this.isViewing = true;
                this.viewingId = id;
                
                // Propriedades específicas por tipo de formulário
                if (this.constructor.name.includes('Ficha')) {
                    this.viewingCharacterId = id;
                }
            }
            
            return { mode, id };
        },
        
        updatePageTitle(customTitle = null) {
            const titleElement = document.getElementById('paginaTitulo');
            if (!titleElement) return;
            
            if (customTitle) {
                titleElement.textContent = customTitle;
                return;
            }
            
            const urlParams = new URLSearchParams(window.location.search);
            const mode = urlParams.get('mode');
            const id = urlParams.get('id');
            
            // Títulos baseados no tipo de formulário
            const formType = this.constructor.name.replace('Form', '');
            
            if (mode === 'view' && id) {
                titleElement.textContent = `Visualizar ${formType} #${id}`;
            } else if (mode === 'edit' && id) {
                titleElement.textContent = `Editar ${formType} #${id}`;
            } else {
                const createTitles = {
                    'Conta': 'Criar Conta',
                    'Ficha': 'Criar Nova Ficha',
                    'Mesa': 'Criar Nova Mesa'
                };
                titleElement.textContent = createTitles[formType] || `Novo ${formType}`;
            }
        }
    };
    
    // **MIXIN 4: Upload de Imagem Unificado**
    static ImageMixin = {
        getUploadedImageUrl() {
            // Verificar ImageUploadMixin primeiro
            if (this.imageUpload && this.imageUpload.uploadedImageUrl) {
                return this.imageUpload.uploadedImageUrl;
            }
            
            // Determinar ID do preview baseado no tipo de formulário
            let previewId;
            if (this.constructor.name.includes('Conta')) {
                previewId = 'profilePreview';
            } else if (this.constructor.name.includes('Ficha')) {
                previewId = 'characterPreview';
            } else if (this.constructor.name.includes('Mesa')) {
                previewId = 'tablePreview';
            }
            
            // Fallback: verificar preview se ID foi determinado
            if (previewId) {
                const preview = document.getElementById(previewId);
                if (preview && preview.src && 
                    !preview.src.includes('placehold.co') && 
                    !preview.src.startsWith('data:')) {
                    return preview.src;
                }
            }
            
            return null;
        },
        
        setImagePreview(imageUrl) {
            let previewId;
            if (this.constructor.name.includes('Conta')) {
                previewId = 'profilePreview';
            } else if (this.constructor.name.includes('Ficha')) {
                previewId = 'characterPreview';
            } else if (this.constructor.name.includes('Mesa')) {
                previewId = 'tablePreview';
            }
            
            if (previewId && imageUrl) {
                const preview = document.getElementById(previewId);
                if (preview) {
                    preview.src = imageUrl;
                }
            }
        }
    };
    
    // **MIXIN 5: Redirecionamento Padronizado**
    static RedirectMixin = {
        async handleSuccessfulCreationRedirect(entity, entityType = 'item') {
            this.showSuccessMessage(`${entityType} criado com sucesso!`);
            
            setTimeout(() => {
                if (entity && entity.id) {
                    // Redirecionar para modo de visualização do item criado
                    const newUrl = new URL(window.location);
                    newUrl.searchParams.set('mode', 'view');
                    newUrl.searchParams.set('id', entity.id);
                    window.location.href = newUrl.toString();
                } else {
                    // Fallback para página de listagem ou inicial
                    this.redirectToFallbackPage();
                }
            }, 2000);
        },
        
        async handleSuccessfulUpdateRedirect(entity, entityType = 'item') {
            this.showSuccessMessage(`${entityType} atualizado com sucesso!`);
            
            setTimeout(() => {
                // Redirecionar para modo de visualização
                const newUrl = new URL(window.location);
                newUrl.searchParams.set('mode', 'view');
                newUrl.searchParams.set('id', this.editingId || this.editingCharacterId || this.editingUserId);
                window.location.href = newUrl.toString();
            }, 1500);
        },
        
        redirectToFallbackPage() {
            // Páginas de fallback baseadas no tipo de formulário
            const fallbackPages = {
                'Conta': 'login.html',
                'Ficha': 'ficha.html',
                'Mesa': 'mesas.html'
            };
            
            const formType = this.constructor.name.replace('Form', '');
            const fallbackPage = fallbackPages[formType] || 'index.html';
            
            window.location.href = fallbackPage;
        }
    };
    
    // **UTILITÁRIO: Aplicar mixins a uma classe**
    static applyMixins(targetClass, ...mixins) {
        mixins.forEach(mixin => {
            Object.getOwnPropertyNames(mixin).forEach(name => {
                if (name !== 'constructor') {
                    targetClass.prototype[name] = mixin[name];
                }
            });
        });
    }
    
    // **UTILITÁRIO: Aplicar todos os mixins comuns**
    static applyCommonMixins(targetClass) {
        this.applyMixins(
            targetClass, 
            this.MessageMixin, 
            this.AuthMixin, 
            this.PageModeMixin, 
            this.ImageMixin, 
            this.RedirectMixin
        );
    }
}

// Disponibilizar globalmente
window.FormMixins = FormMixins;