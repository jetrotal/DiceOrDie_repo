// Classe LoginForm integrada com backend
class LoginForm extends BaseForm {
    constructor() {
        super('loginForm', {
            submitButtonId: 'loginButton',
            loadingText: 'Entrando...',
            successMessage: 'Login realizado com sucesso! Redirecionando...',
            errorMessage: 'Erro ao fazer login. Verifique suas credenciais.',
            redirectUrl: 'mesas.html',
            redirectDelay: 1500
        });
        
        this.setupPasswordToggle();
        this.setupRememberMe();
        this.setupForgotPassword();
        this.setupEnterKeyLogin();
    }
    
    setupPasswordToggle() {
        const passwordToggle = document.getElementById('passwordToggle');
        const passwordField = document.getElementById('senha');
        
        if (passwordToggle && passwordField) {
            passwordToggle.addEventListener('click', function() {
                const isPassword = passwordField.type === 'password';
                passwordField.type = isPassword ? 'text' : 'password';
                passwordToggle.textContent = isPassword ? '🙈' : '👁';
                passwordToggle.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
            });
        }
    }
    
    setupRememberMe() {
        // Verificar se usuário deve ser lembrado
        if (localStorage.getItem('rememberMe') === 'true') {
            const savedContact = localStorage.getItem('userContact');
            if (savedContact) {
                document.getElementById('contato').value = savedContact;
                document.getElementById('lembrarMe').checked = true;
            }
        }
    }
    
    setupForgotPassword() {
        const forgotPasswordLink = document.querySelector('.forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', function(e) {
                e.preventDefault();
                DiceOrDieUtils.showInfo('Funcionalidade de recuperação de senha em desenvolvimento.');
            });
        }
    }
    
    setupEnterKeyLogin() {
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.id === 'contato' || activeElement.id === 'senha')) {
                    e.preventDefault();
                    this.form.dispatchEvent(new Event('submit'));
                }
            }
        });
    }
    
    getRequiredFields() {
        return ['contato', 'senha'];
    }
    
    validateForm() {
        const contato = document.getElementById('contato').value.trim();
        const senha = document.getElementById('senha').value;
        let isValid = true;
        
        // Limpar erros anteriores
        this.clearFieldError(document.getElementById('contato'));
        this.clearFieldError(document.getElementById('senha'));
        
        // Validar contato
        if (!contato) {
            this.markFieldAsError(document.getElementById('contato'), 'Este campo é obrigatório');
            isValid = false;
        } else if (!this.isValidEmailOrUsername(contato)) {
            this.markFieldAsError(document.getElementById('contato'), 'Email ou username inválido');
            isValid = false;
        }
        
        // Validar senha
        if (!senha) {
            this.markFieldAsError(document.getElementById('senha'), 'Este campo é obrigatório');
            isValid = false;
        } else if (senha.length < 6) {
            this.markFieldAsError(document.getElementById('senha'), 'A senha deve ter pelo menos 6 caracteres');
            isValid = false;
        }
        
        return isValid;
    }
    
    isValidEmailOrUsername(input) {
        // Email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Username regex (3-20 characters, letters, numbers, underscore)
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        
        return emailRegex.test(input) || usernameRegex.test(input);
    }
    
    getFormData() {
        return {
            contato: document.getElementById('contato').value.trim(),
            senha: document.getElementById('senha').value,
            lembrarMe: document.getElementById('lembrarMe').checked
        };
    }
    
    async submitForm(formData) {
        console.log('Fazendo login:', { contato: formData.contato, lembrarMe: formData.lembrarMe });
        
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login: formData.contato,  // Backend espera 'login', não 'contato'
                    senha: formData.senha
                })
            });
            
            const result = await response.json();
            
            if (result.success && result.user) {
                console.log('Login bem-sucedido:', result.user.username);
                
                // Salvar usuário na sessão (compatibilidade com test-users.html)
                localStorage.setItem('diceordie_current_user', JSON.stringify(result.user));
                sessionStorage.setItem('currentUser', JSON.stringify(result.user)); // fallback
                
                // Gerenciar "Lembrar de mim"
                if (formData.lembrarMe) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('userContact', formData.contato);
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('userContact');
                }
                
                // Mostrar mensagem de sucesso
                DiceOrDieUtils.showSuccess(this.config.successMessage);
                
                // Redirecionar após delay
                setTimeout(() => {
                    window.location.href = this.config.redirectUrl;
                }, this.config.redirectDelay);
                
                return { success: true, user: result.user };
            } else {
                throw new Error(result.error || 'Credenciais inválidas');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }
}

// Inicializar form
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar scripts dependentes carregarem
    setTimeout(() => {
        window.loginForm = new LoginForm();
        console.log('LoginForm inicializado com sucesso');
    }, FormConstants.INIT_DELAYS.FORM_CREATION);
});

