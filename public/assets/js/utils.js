// Utilitários compartilhados para o Dice or Die
class DiceOrDieUtils {
  // Gerenciamento do dropdown do usuário
  static initUserDropdown() {
    const dropdown = document.querySelector('.user-dropdown');
    const userProfile = document.querySelector('.user-diamond-picture');
    const userName = document.querySelector('.user-name');

    if (!dropdown) return;

    // Toggle dropdown
    const toggleDropdown = () => {
      dropdown.classList.toggle('show');
    };

    // Event listeners
    if (userProfile) userProfile.addEventListener('click', toggleDropdown);
    if (userName) userName.addEventListener('click', toggleDropdown);

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.user-profile')) {
        dropdown.classList.remove('show');
      }
    });

    // Funções dos itens do menu
    window.goToProfile = () => {
      alert('Ir para Meu Perfil');
      dropdown.classList.remove('show');
    };

    window.goToSettings = () => {
      alert('Ir para Configurações');
      dropdown.classList.remove('show');
    };

    window.goToNotifications = () => {
      alert('Ir para Notificações');
      dropdown.classList.remove('show');
    };

    window.goToHelp = () => {
      alert('Ir para Ajuda');
      dropdown.classList.remove('show');
    };

    window.goToFeedback = () => {
      alert('Enviar Feedback');
      dropdown.classList.remove('show');
    };

    window.logout = () => {
      if (confirm('Tem certeza que deseja sair?')) {
        alert('Logout realizado!');
        // Aqui você faria o logout real
      }
      dropdown.classList.remove('show');
    };
  }

  // Validação de formulários
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone) {
    const phoneRegex = /^(\(?\d{2}\)?\s?)?9?\d{4}-?\d{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
  static validatePassword(password) {
    return password.length >= 6;
  }

  static validateUsername(username) {
    // Username deve ter entre 3-20 caracteres, apenas letras, números e underscore
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  // Validações expandidas
  static validateRequired(value) {
    return value && value.toString().trim().length > 0;
  }

  static validateMinLength(value, minLength) {
    return value && value.toString().length >= minLength;
  }

  static validateMaxLength(value, maxLength) {
    return value && value.toString().length <= maxLength;
  }

  static validateAge(birthDate, minAge = 13) {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= minAge;
  }

  static validatePasswords(password, confirmPassword) {
    return password === confirmPassword;
  }

  // Validação de arquivos
  static validateFileSize(file, maxSizeInMB) {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  static validateFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type);
  }

  // Utilitários de formulário
  static markFieldError(field, message = null) {
    field.style.borderColor = '#e32636';
    
    // Adicionar mensagem de erro se fornecida
    if (message) {
      this.showFieldError(field, message);
    }
    
    // Remover erro após 3 segundos
    setTimeout(() => {
      this.clearFieldError(field);
    }, 3000);
  }

  static clearFieldError(field) {
    field.style.borderColor = '';
    this.hideFieldError(field);
  }

  static showFieldError(field, message) {
    // Remover mensagem anterior se existir
    this.hideFieldError(field);
    
    const errorEl = document.createElement('div');
    errorEl.className = 'field-error-message';
    errorEl.textContent = message;
    errorEl.style.color = '#e32636';
    errorEl.style.fontSize = '0.8em';
    errorEl.style.marginTop = '4px';
    
    field.parentNode.appendChild(errorEl);
  }

  static hideFieldError(field) {
    const errorEl = field.parentNode.querySelector('.field-error-message');
    if (errorEl) {
      errorEl.remove();
    }
  }

  // Utilitários de estado de formulário
  static setFormLoading(formId, loading = true, loadingText = 'Processando...') {
    const form = document.getElementById(formId);
    if (!form) return;

    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) return;

    if (loading) {
      submitButton.disabled = true;
      submitButton.dataset.originalText = submitButton.textContent;
      submitButton.textContent = loadingText;
    } else {
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.originalText || submitButton.textContent;
    }
  }

  // Formatação de dados
  static formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  // Navegação
  static navigateTo(page) {
    window.location.href = page;
  }

  // Gerenciamento de Navbar Inteligente
  static getCurrentPage() {
    const path = window.location.pathname;
    const fileName = path.split('/').pop() || 'index.html';
    return fileName.replace('.html', '');
  }

  static isUserLoggedIn() {
    // Por enquanto, vamos considerar que usuário está logado se estiver em páginas específicas
    // Depois isso pode ser baseado em localStorage, sessionStorage ou API
    const currentPage = this.getCurrentPage();
    const guestPages = ['login', 'conta'];
    return !guestPages.includes(currentPage);
  }

  // Configuração do Navbar baseada no status de autenticação
  static getNavbarConfig() {
    const isLoggedIn = this.isUserLoggedIn();
    const currentPage = this.getCurrentPage();
    
    if (isLoggedIn) {
      // Navbar para usuário logado
      return [
        { text: 'Home', url: '../index.html', active: currentPage === 'index' },
        { text: 'Amigos', url: 'amigos.html', active: currentPage === 'amigos' },
        { text: 'Mesas', url: 'mesas.html', active: currentPage === 'mesas' },
        { text: 'Loja', url: 'loja.html', active: currentPage === 'loja' }
      ];
    } else {
      // Navbar para visitante
      return [
        { text: 'Home', url: '../index.html', active: currentPage === 'index' },
        { text: 'Criar Conta', url: 'conta.html', active: currentPage === 'conta' },
        { text: 'Fazer Login', url: 'login.html', active: currentPage === 'login' }
      ];
    }
  }

  static getUserbarContent() {
    const isLoggedIn = this.isUserLoggedIn();

    if (isLoggedIn) {      // Userbar para usuário logado - perfil completo
      return `
        <div class="user-profile" onclick="DiceOrDieUtils.toggleDropdown()">
          <div class="user-diamond-picture">
            <img src="https://placehold.co/50x50/4CAF50/FFFFFF/png?text=U" alt="Foto do usuário" class="user-profile-image">
          </div>
          <div class="user-dropdown">
            <div class="user-name">Usuario</div>
            <div class="user-dropdown-content">
              <div class="user-dropdown-item" onclick="goToProfile()">👤 Meu Perfil</div>
              <div class="user-dropdown-item" onclick="goToSettings()">⚙️ Configurações</div>
              <div class="user-dropdown-item" onclick="goToNotifications()">🔔 Notificações</div>
              <div class="user-dropdown-separator"></div>
              <div class="user-dropdown-item" onclick="goToHelp()">❓ Ajuda</div>
              <div class="user-dropdown-item" onclick="goToFeedback()">💬 Feedback</div>
              <div class="user-dropdown-separator"></div>
              <div class="user-dropdown-item" onclick="logout()">🚪 Sair</div>
            </div>
          </div>
          <div style="opacity:0" class="user-diamond"></div>
        </div>
      `;    } else {
      // Userbar para visitante - mantém o padrão visual da versão logada
      return `
        <div class="user-profile" onclick="DiceOrDieUtils.toggleDropdown()">
          <div class="user-diamond-picture">
            <img src="https://placehold.co/50x50/4CAF50/FFFFFF/png?text=?" alt="Visitante" class="user-profile-image">
          </div>
          <div class="user-dropdown">
            <div class="user-name">Visitante</div>
            <div class="user-dropdown-content">
              <div class="user-dropdown-item" onclick="DiceOrDieUtils.navigateTo('login.html')">🚪 Fazer Login</div>
              <div class="user-dropdown-item" onclick="DiceOrDieUtils.navigateTo('conta.html')">✨ Criar Conta</div>
              <div class="user-dropdown-separator"></div>
              <div class="user-dropdown-item" onclick="goToHelp()">❓ Ajuda</div>
              <div class="user-dropdown-item" onclick="goToFeedback()">💬 Feedback</div>
            </div>
          </div>
          <div style="opacity:0" class="user-diamond"></div>
        </div>
      `;
    }
  }

  // Feedback visual
  static showSuccess(message) {
    this.showNotification(message, 'success');
  }

  static showError(message) {
    this.showNotification(message, 'error');
  }

  static showWarning(message) {
    this.showNotification(message, 'warning');
  }

  static showInfo(message) {
    this.showNotification(message, 'info');
  }

  static showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos inline para a notificação
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 20px',
      borderRadius: '4px',
      color: 'white',
      fontWeight: '600',
      zIndex: '9999',
      opacity: '0',
      transform: 'translateX(100%)',
      transition: 'all 0.3s ease'
    });

    // Cores baseadas no tipo
    const colors = {
      success: '#4CAF50',
      error: '#e32636',
      info: '#2196F3',
      warning: '#FF9800'
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    // Adicionar ao body
    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Remover após 3 segundos
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Inicialização geral
  static init() {
    // Inicializar componentes compartilhados
    this.initUserDropdown();
    
    // Adicionar classe para indicar que JS foi carregado
    document.documentElement.classList.add('js-loaded');
    
    console.log('Dice or Die Utils initialized');
  }

  // Função global para toggle do dropdown (usada inline no HTML)
  static toggleDropdown() {
    const dropdown = document.querySelector('.user-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  }
}

// Auto-inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  DiceOrDieUtils.init();
});

// Exportar para uso global
window.DiceOrDieUtils = DiceOrDieUtils;
