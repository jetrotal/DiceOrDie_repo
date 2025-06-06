// Lógica específica para testes de usuários

// Função específica chamada após login
function updateLoggedUserSpecific(user) {
    // Adiciona informações específicas do usuário logado para users
    const info = document.getElementById('loggedUserInfo');
    if (info && user.email) {
        info.innerHTML += `
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Experiência:</strong> ${user.experiencia}</p>
            ${user.img_perfil ? `<p><strong>Foto:</strong> <img src="${user.img_perfil}" style="max-width: 50px; border-radius: 50%;"></p>` : ''}
        `;
    }
    
    // Adiciona botões específicos de admin para usuários
    const adminButtons = document.getElementById('adminButtons');
    if (adminButtons && user.role === 'admin') {
        adminButtons.innerHTML = `
            <button onclick="editLoggedUser()" class="btn-warning">✏️ Editar Meus Dados</button>
            <button onclick="clearSessionManually()" class="btn-secondary" style="font-size: 11px;">🗑️ Limpar Sessão</button>
            <button onclick="getAllUsersAsAdmin()" class="btn-primary">👥 Ver Todos os Usuários</button>
            <button onclick="deleteAllUsersAsAdmin()" class="btn-danger">🗑️ Apagar Todos + Reset ID</button>
        `;
    }
}

// Função específica de logout para usuários
function logoutSpecific() {
    cancelEdit(); // Cancela edição se estiver ativa
}

// Função específica de cancelar edição para usuários
function cancelEditSpecific() {
    clearForm('createUserForm');
}

// Editar usuário logado
function editLoggedUser() {
    if (!currentUser) return;
    
    // Muda para modo edição
    toggleEditMode(true, 'Usuário');
    document.getElementById('formTitle').textContent = '✏️ Editar Meus Dados';
    
    // Preenche o formulário com dados atuais
    document.getElementById('editingUserId').value = currentUser.id;
    document.getElementById('nome').value = currentUser.nome || '';
    document.getElementById('sobrenome').value = currentUser.sobrenome || '';
    document.getElementById('username').value = currentUser.username || '';
    document.getElementById('genero').value = currentUser.genero || '';
    document.getElementById('data_nascimento').value = currentUser.data_nascimento || '';
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('senha').value = ''; // Senha sempre vazia na edição
    document.getElementById('experiencia').value = currentUser.experiencia || '';
    document.getElementById('img_perfil').value = currentUser.img_perfil || '';
    
    // Scroll para o formulário
    document.getElementById('formTitle').scrollIntoView({ behavior: 'smooth' });
}

// Limpar sessão manualmente
function clearSessionManually() {
    if (confirm('Tem certeza que deseja limpar a sessão salva? Você precisará fazer login novamente.')) {
        logout();
        alert('Sessão limpa! Recarregue a página para confirmar.');
    }
}

// Preencher dados de exemplo
function fillSampleUserData() {
    document.getElementById('nome').value = 'Legolas';
    document.getElementById('sobrenome').value = 'Greenleaf';
    document.getElementById('username').value = 'elfprince';
    document.getElementById('genero').value = 'Masculino';
    document.getElementById('data_nascimento').value = '1000-05-15';
    document.getElementById('email').value = 'legolas@mirkwood.com';
    document.getElementById('senha').value = 'BowMaster123';
    document.getElementById('experiencia').value = 'Veterano';
    document.getElementById('img_perfil').value = 'https://i.imgur.com/legolas_avatar.jpg';
}

// Buscar usuário por ID
async function getUser() {
    const userId = document.getElementById('searchUserId').value;
    if (!userId) {
        showResponse('getUserResponse', {error: 'Por favor, insira um ID válido'});
        return;
    }
    
    try {
        const response = await fetch(`/users/${userId}`, {
            headers: getAuthHeaders()
        });
        const result = await response.json();
        showResponse('getUserResponse', result);
    } catch (error) {
        showResponse('getUserResponse', {error: error.message});
    }
}

// Listar todos os usuários
async function getAllUsers() {
    try {
        const response = await fetch('/users', {
            headers: getAuthHeaders()
        });
        const result = await response.json();
        showResponse('getUserResponse', result);
    } catch (error) {
        showResponse('getUserResponse', {error: error.message});
    }
}

// Funções específicas para admin
async function getAllUsersAsAdmin() {
    if (!currentUser || currentUser.role !== 'admin') {
        showResponse('getUserResponse', {error: 'Acesso negado: apenas administradores'});
        return;
    }
    await getAllUsers();
}

async function deleteAllUsersAsAdmin() {
    if (!currentUser || currentUser.role !== 'admin') {
        showResponse('deleteUserResponse', {error: 'Acesso negado: apenas administradores'});
        return;
    }
    // Chama a função deleteAllUsers que agora já tem as verificações adequadas
    await deleteAllUsers();
}

// Apagar usuário
async function deleteUser() {
    const userId = document.getElementById('deleteUserId').value;
    if (!userId) {
        showResponse('deleteUserResponse', {error: 'Por favor, insira um ID válido'});
        return;
    }
    
    // Verifica se o usuário está logado
    if (!currentUser) {
        showResponse('deleteUserResponse', {
            success: false,
            error: 'Você deve estar logado para apagar usuários.'
        });
        return;
    }
    
    // Verifica autorização: admin pode apagar qualquer usuário, usuário comum só pode apagar a si mesmo
    const isAdmin = currentUser.role === 'admin';
    const isOwnProfile = (currentUser.id == userId);
    
    if (!isAdmin && !isOwnProfile) {
        showResponse('deleteUserResponse', {
            success: false,
            error: 'Acesso negado: você só pode apagar sua própria conta. Apenas administradores podem apagar outros usuários.'
        });
        return;
    }
    
    // Mensagem de confirmação personalizada
    let confirmMessage;
    if (isAdmin && !isOwnProfile) {
        confirmMessage = `Tem certeza que deseja apagar o usuário ID ${userId}? Como administrador, você pode apagar qualquer usuário. Esta ação não pode ser desfeita.`;
    } else {
        confirmMessage = `Tem certeza que deseja apagar sua própria conta? Esta ação não pode ser desfeita e você será deslogado do sistema.`;
    }
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    try {
        const response = await fetch(`/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        const result = await response.json();
        showResponse('deleteUserResponse', result);
        
        // Se o usuário apagou sua própria conta, fazer logout
        if (result.success && isOwnProfile) {
            setTimeout(() => {
                logout();
                alert('Sua conta foi apagada. Você será deslogado do sistema.');
            }, 2000);
        }
    } catch (error) {
        showResponse('deleteUserResponse', {error: error.message});
    }
}

// Apagar todos os usuários
async function deleteAllUsers() {
    // Verifica se o usuário está logado
    if (!currentUser) {
        showResponse('deleteUserResponse', {
            success: false,
            error: 'Você deve estar logado para apagar usuários.'
        });
        return;
    }
    
    // Apenas administradores podem apagar todos os usuários
    if (currentUser.role !== 'admin') {
        showResponse('deleteUserResponse', {
            success: false,
            error: 'Acesso negado: apenas administradores podem apagar todos os usuários.'
        });
        return;
    }
    
    if (!confirm('⚠️ ATENÇÃO ADMINISTRADOR: Tem certeza que deseja apagar TODOS os usuários?\n\nEsta ação não pode ser desfeita e irá remover permanentemente todos os dados de usuários do sistema.')) {
        return;
    }
    
    if (!confirm('🔥 CONFIRMAÇÃO FINAL: Você realmente quer apagar TODOS os usuários?\n\nClique "OK" apenas se tiver certeza absoluta.')) {
        return;
    }
    
    try {
        const response = await fetch('/users', {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        const result = await response.json();
        showResponse('deleteUserResponse', result);
        
        // Se todos os usuários foram apagados, fazer logout
        if (result.success) {
            setTimeout(() => {
                logout();
                alert('Todos os usuários foram apagados pelo administrador. Sistema resetado.');
            }, 2000);
        }
    } catch (error) {
        showResponse('deleteUserResponse', {error: error.message});
    }
}

// Carregar usuário para edição
async function loadUserForEdit() {
    const userId = document.getElementById('editUserId').value;
    
    if (!currentUser) {
        showResponse('editUserResponse', {
            success: false,
            error: 'Você deve estar logado para editar usuários.'
        });
        return;
    }
    
    if (!userId) {
        showResponse('editUserResponse', {error: 'Por favor, insira um ID válido'});
        return;
    }
    
    try {
        // Busca o usuário pelo ID
        const response = await fetch(`/users/${userId}`, {
            headers: getAuthHeaders()
        });
        
        const result = await response.json();
        
        if (result.success && result.user) {
            const user = result.user;
            
            // Verifica se o usuário pode editar este perfil
            if (user.id !== currentUser.id && currentUser.role !== 'admin') {
                showResponse('editUserResponse', {
                    success: false,
                    error: 'Acesso negado: você só pode editar seu próprio perfil'
                });
                return;
            }
            
            // Muda para modo edição
            toggleEditMode(true, 'Usuário');
            
            // Preenche o formulário com dados atuais
            document.getElementById('editingUserId').value = user.id;
            document.getElementById('nome').value = user.nome || '';
            document.getElementById('sobrenome').value = user.sobrenome || '';
            document.getElementById('username').value = user.username || '';
            document.getElementById('genero').value = user.genero || '';
            document.getElementById('data_nascimento').value = user.data_nascimento || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('senha').value = ''; // Senha sempre vazia na edição
            document.getElementById('experiencia').value = user.experiencia || '';
            document.getElementById('img_perfil').value = user.img_perfil || '';
            
            // Admin pode editar role
            if (currentUser.role === 'admin') {
                document.getElementById('role').value = user.role || '';
            }
            
            // Scroll para o formulário
            document.getElementById('formTitle').scrollIntoView({ behavior: 'smooth' });
            
            showResponse('editUserResponse', {
                success: true,
                message: `Usuário "${user.nome}" carregado para edição`
            });
        } else {
            showResponse('editUserResponse', result);
        }
    } catch (error) {
        showResponse('editUserResponse', {error: error.message});
    }
}