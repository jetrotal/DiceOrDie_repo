// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
      // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateLoginForm()) {
            return;
        }
        
        const contato = document.getElementById('contato').value.trim();
        const senha = document.getElementById('senha').value;
        const lembrarMe = document.getElementById('lembrarMe').checked;
        
        // Show loading state
        setLoading(true);
        
        // Simulate login API call
        setTimeout(() => {
            // Here you would make the actual API call
            // For now, we'll simulate a successful login
            
            if (lembrarMe) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('userContact', contato);
            }
            
            // Simulate successful login
            showMessage('Login realizado com sucesso! Redirecionando...', 'success');
            
            setTimeout(() => {
                // Redirect to main page or dashboard
                window.location.href = 'mesas.html';
            }, 1500);
            
            setLoading(false);
        }, 1000);
    });
    
    // Check if user should be remembered
    if (localStorage.getItem('rememberMe') === 'true') {
        const savedContact = localStorage.getItem('userContact');
        if (savedContact) {
            document.getElementById('contato').value = savedContact;
            document.getElementById('lembrarMe').checked = true;
        }
    }
    
    // Handle forgot password
    const forgotPasswordLink = document.querySelector('.forgot-password');
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        showMessage('Funcionalidade de recuperação de senha em desenvolvimento.', 'info');
    });
    
    // Password toggle functionality
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
    
    // Real-time validation
    const contatoField = document.getElementById('contato');
    const senhaField = document.getElementById('senha');
      // Validate contact field on blur
    contatoField.addEventListener('blur', function() {
        const value = this.value.trim();
        if (value && !isValidEmailOrUsername(value)) {
            showFieldError(this, 'Email ou username inválido');
        } else {
            clearFieldError(this);
        }
    });
    
    // Clear error on focus
    contatoField.addEventListener('focus', function() {
        clearFieldError(this);
    });
    
    senhaField.addEventListener('focus', function() {
        clearFieldError(this);
    });
    
    // Allow login with Enter key
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.id === 'contato' || activeElement.id === 'senha')) {
                e.preventDefault();
                loginForm.dispatchEvent(new Event('submit'));
            }
        }
    });
});

function setLoading(isLoading) {
    const loginButton = document.getElementById('loginButton');
    const form = document.getElementById('loginForm');
    
    if (isLoading) {
        loginButton.textContent = 'Entrando...';
        loginButton.disabled = true;
        form.style.opacity = '0.7';
    } else {
        loginButton.textContent = 'Entrar';
        loginButton.disabled = false;
        form.style.opacity = '1';
    }
}

function isValidEmailOrUsername(input) {
    // Email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Username regex (3-20 characters, letters, numbers, underscore)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    
    return emailRegex.test(input) || usernameRegex.test(input);
}

function showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    
    // Style the message
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 4px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        max-width: 300px;
        box-shadow: var(--shadow-default);
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            messageEl.style.backgroundColor = 'var(--color-success)';
            break;
        case 'error':
            messageEl.style.backgroundColor = 'var(--color-error)';
            break;
        case 'warning':
            messageEl.style.backgroundColor = 'var(--color-warning)';
            break;
        default: // info
            messageEl.style.backgroundColor = 'var(--color-info)';
    }
    
    // Add to DOM
    document.body.appendChild(messageEl);
    
    // Animate in
    setTimeout(() => {
        messageEl.style.opacity = '1';
        messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 4000);
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('error');
    
    const errorEl = document.createElement('div');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.appendChild(errorEl);
    }
}

function clearFieldError(field) {
    field.classList.remove('error');
    
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        const errorEl = formGroup.querySelector('.field-error');
        if (errorEl) {
            errorEl.remove();
        }
    }
}

// Enhanced form validation
function validateLoginForm() {
    const contato = document.getElementById('contato').value.trim();
    const senha = document.getElementById('senha').value;
    
    let isValid = true;
    
    // Clear previous errors
    clearFieldError(document.getElementById('contato'));
    clearFieldError(document.getElementById('senha'));
    
    // Validate contact
    if (!contato) {
        showFieldError(document.getElementById('contato'), 'Este campo é obrigatório');
        isValid = false;    } else if (!isValidEmailOrUsername(contato)) {
        showFieldError(document.getElementById('contato'), 'Email ou username inválido');
        isValid = false;
    }
    
    // Validate password
    if (!senha) {
        showFieldError(document.getElementById('senha'), 'Este campo é obrigatório');
        isValid = false;
    } else if (senha.length < 6) {
        showFieldError(document.getElementById('senha'), 'A senha deve ter pelo menos 6 caracteres');
        isValid = false;
    }
    
    return isValid;
}
