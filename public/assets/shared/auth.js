// Sistema de autenticação compartilhado para todos os testes
let currentUser = null;

// Carrega sessão salva ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    loadSavedSession();
});

// Carrega sessão do localStorage
function loadSavedSession() {
    const savedUser = localStorage.getItem('diceordie_current_user');
    if (savedUser) {
        try {
            const userData = JSON.parse(savedUser);
            showLoggedUser(userData);
            console.log('Sessão carregada automaticamente:', userData.username);
        } catch (error) {
            console.error('Erro ao carregar sessão salva:', error);
            localStorage.removeItem('diceordie_current_user');
        }
    }
}

// Salva sessão no localStorage
function saveSession(user) {
    localStorage.setItem('diceordie_current_user', JSON.stringify(user));
}

// Remove sessão do localStorage
function clearSession() {
    localStorage.removeItem('diceordie_current_user');
}

// Mostrar usuário logado (genérico)
function showLoggedUser(user) {
    currentUser = user;
    if (typeof saveSession === 'function') {
        saveSession(user); // Salva sessão automaticamente
    }
    
    const section = document.getElementById('loggedUserSection');
    const info = document.getElementById('loggedUserInfo');
    const adminControls = document.getElementById('adminControls');
    
    if (section && info) {
        const roleDisplay = user.role === 'admin' ? '🛡️ Admin' : '👤 User';
        const roleColor = user.role === 'admin' ? 'color: #dc3545; font-weight: bold;' : 'color: #28a745;';
        
        info.innerHTML = `
            <p><strong>Nome:</strong> ${user.nome} ${user.sobrenome}</p>
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Role:</strong> <span style="${roleColor}">${roleDisplay}</span></p>
            <p><strong>ID:</strong> ${user.id}</p>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">📱 Sessão compartilhada entre test-pages</p>
        `;
        
        // Mostra controles de admin se for admin
        if (adminControls) {
            if (user.role === 'admin') {
                adminControls.style.display = 'block';
            } else {
                adminControls.style.display = 'none';
            }
        }
        
        section.style.display = 'block';
        
        // Chama função específica da página se existir
        if (typeof updateLoggedUserSpecific === 'function') {
            updateLoggedUserSpecific(user);
        }
        
        // Só faz scroll se não for carregamento automático
        if (!document.querySelector('body').hasAttribute('data-loading')) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Logout genérico
function logout() {
    currentUser = null;
    clearSession();
    
    const section = document.getElementById('loggedUserSection');
    if (section) {
        section.style.display = 'none';
    }
    
    // Chama função específica da página se existir
    if (typeof logoutSpecific === 'function') {
        logoutSpecific();
    }
    
    console.log('Logout realizado - sessão removida');
}

// Função para criar headers de autenticação
function getAuthHeaders() {
    if (!currentUser) {
        console.log('getAuthHeaders: Nenhum usuário logado');
        return {};
    }
    
    const headers = {
        'X-User-ID': currentUser.id.toString(),
        'X-User-Role': currentUser.role
    };
    
    console.log('getAuthHeaders: Enviando headers:', headers);
    return headers;
}

// Verificar status de login
function checkLoginStatus() {
    const responseElementId = 'loginStatusResponse';
    
    if (currentUser) {
        showResponse(responseElementId, {
            success: true,
            message: 'Usuário logado com sucesso',
            user: {
                username: currentUser.username,
                role: currentUser.role,
                id: currentUser.id
            }
        });
    } else {
        showResponse(responseElementId, {
            success: false,
            message: 'Nenhum usuário logado. Faça login em test-users.html primeiro.'
        });
    }
}

// Função utilitária para mostrar resposta
function showResponse(elementId, data) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
        element.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
    }
}

// Função utilitária para limpar formulário
function clearForm(formId) {
    document.getElementById(formId).reset();
}

// Executar testes rápidos
async function runTest(endpoint) {
    try {
        const response = await fetch(endpoint, {
            headers: getAuthHeaders()
        });
        const result = await response.json();
        showResponse('quickTestResponse', result);
    } catch (error) {
        showResponse('quickTestResponse', {error: error.message});
    }
}