// Lógica específica para testes de personagens

// Função específica chamada após login
function updateLoggedUserSpecific(user) {
    // Preenche username no formulário de criação
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.value = user.username;
    }
    
    // Adiciona botões específicos de admin para personagens
    const adminButtons = document.getElementById('adminButtons');
    if (adminButtons && user.role === 'admin') {
        adminButtons.innerHTML = `
            <button onclick="getAllCharactersAsAdmin()" class="btn-primary">⚔️ Ver Todos os Personagens</button>
            <button onclick="deleteAllCharactersAsAdmin()" class="btn-danger">🗑️ Apagar Todos os Personagens + Reset ID</button>
        `;
    }
}

// Função específica de logout para personagens
function logoutSpecific() {
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.value = '';
    }
    cancelEdit(); // Cancela edição se estiver ativa
}

// Função específica de cancelar edição para personagens
function cancelEditSpecific() {
    clearForm('createCharacterForm');
    
    // Limpar imagem de personagem
    if (typeof clearCharacterImage === 'function') {
        clearCharacterImage();
    }
    
    // Resetar campo username ao estado original
    const usernameField = document.getElementById('username');
    const usernameLabel = document.querySelector('label[for="username"]');
    const usernameHelp = usernameField ? usernameField.nextElementSibling : null;
    
    if (usernameField && usernameLabel && usernameHelp) {
        usernameField.readOnly = true;
        usernameField.style.backgroundColor = '#f8f9fa';
        usernameLabel.innerHTML = 'Username do Jogador:';
        usernameHelp.innerHTML = '<span style="color: #666;">Preenchido automaticamente com seu username logado</span>';
        usernameHelp.style.color = '#666';
        
        // Se logado, redefine o username
        if (currentUser) {
            usernameField.value = currentUser.username;
        }
    }
}

// Preencher dados de exemplo
function fillSampleData() {
    // Se logado, usa o username do usuário logado
    if (currentUser) {
        document.getElementById('username').value = currentUser.username;
    } else {
        document.getElementById('username').value = '';
    }
    document.getElementById('nome_personagem').value = 'Aragorn';
    document.getElementById('nivel').value = '10';
    document.getElementById('raca').value = 'Humano';
    document.getElementById('classe').value = 'Ranger';
    document.getElementById('ponto_vida').value = '85';
    document.getElementById('classe_armadura').value = '16';
    document.getElementById('forca').value = '16';
    document.getElementById('destreza').value = '18';
    document.getElementById('constituicao').value = '14';
    document.getElementById('inteligencia').value = '12';
    document.getElementById('sabedoria').value = '15';
    document.getElementById('carisma').value = '13';
    // Não preenche mais URL, agora usa sistema de upload
    clearCharacterImage();
}

// Buscar personagem por ID
async function getCharacter() {
    const characterId = document.getElementById('searchCharacterId').value;
    if (!characterId) {
        showResponse('getCharacterResponse', {error: 'Por favor, insira um ID válido'});
        return;
    }
    
    try {
        const response = await fetch(`/characters/${characterId}`);
        const result = await response.json();
        showResponse('getCharacterResponse', result);
    } catch (error) {
        showResponse('getCharacterResponse', {error: error.message});
    }
}

// Buscar personagens por usuário
async function getCharactersByUser() {
    const username = document.getElementById('searchByUsername').value;
    if (!username) {
        showResponse('getCharacterResponse', {error: 'Por favor, insira um username válido'});
        return;
    }
    
    try {
        const response = await fetch(`/users/${username}/characters`, {
            headers: getAuthHeaders()
        });
        const result = await response.json();
        showResponse('getCharacterResponse', result);
    } catch (error) {
        showResponse('getCharacterResponse', {error: error.message});
    }
}

// Buscar meus personagens
async function getMyCharacters() {
    if (!currentUser) {
        showResponse('getCharacterResponse', {
            success: false,
            error: 'Você deve estar logado para ver seus personagens.'
        });
        return;
    }
    
    try {
        const response = await fetch(`/users/${currentUser.username}/characters`, {
            headers: getAuthHeaders()
        });
        const result = await response.json();
        showResponse('getCharacterResponse', result);
    } catch (error) {
        showResponse('getCharacterResponse', {error: error.message});
    }
}

// Apagar personagem
async function deleteCharacter() {
    const characterId = document.getElementById('deleteCharacterId').value;
    
    if (!currentUser) {
        showResponse('deleteCharacterResponse', {
            success: false,
            error: 'Você deve estar logado para apagar personagens.'
        });
        return;
    }
    
    if (!characterId) {
        showResponse('deleteCharacterResponse', {error: 'Por favor, insira um ID válido'});
        return;
    }
    
    // Primeiro, buscar o personagem para verificar se o usuário pode apagá-lo
    try {
        const checkResponse = await fetch(`/characters/${characterId}`, {
            headers: getAuthHeaders()
        });
        const checkResult = await checkResponse.json();
        
        if (!checkResult.success) {
            showResponse('deleteCharacterResponse', checkResult);
            return;
        }
        
        const character = checkResult.character;
        const isOwner = (character.username === currentUser.username);
        const isAdmin = (currentUser.role === 'admin');
        
        // Verifica autorização: admin pode apagar qualquer personagem, usuário comum só pode apagar seus próprios personagens
        if (!isAdmin && !isOwner) {
            showResponse('deleteCharacterResponse', {
                success: false,
                error: 'Acesso negado: você só pode apagar seus próprios personagens. Apenas administradores podem apagar personagens de outros usuários.',
                character_owner: character.username,
                your_username: currentUser.username
            });
            return;
        }
        
        // Mensagem de confirmação personalizada
        let confirmMessage;
        if (isAdmin && !isOwner) {
            confirmMessage = `Tem certeza que deseja apagar o personagem "${character.nome_personagem}" (ID: ${characterId}) do usuário "${character.username}"? Como administrador, você pode apagar personagens de outros usuários. Esta ação não pode ser desfeita.`;
        } else {
            confirmMessage = `Tem certeza que deseja apagar seu personagem "${character.nome_personagem}"? Esta ação não pode ser desfeita.`;
        }
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        // Proceder com a exclusão
        const response = await fetch(`/characters/${characterId}`, {
            method: 'DELETE',
            headers: {
                'X-USERNAME': currentUser.username,
                ...getAuthHeaders()
            }
        });
        
        const result = await response.json();
        showResponse('deleteCharacterResponse', result);
        
    } catch (error) {
        showResponse('deleteCharacterResponse', {error: error.message});
    }
}

// Funções específicas para admin
async function getAllCharactersAsAdmin() {
    if (!currentUser || currentUser.role !== 'admin') {
        showResponse('getCharacterResponse', {
            success: false,
            error: 'Acesso negado: apenas administradores podem usar esta função'
        });
        return;
    }
    
    try {
        const response = await fetch('/characters/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            }
        });
        
        const result = await response.json();
        showResponse('getCharacterResponse', result);
    } catch (error) {
        showResponse('getCharacterResponse', {
            success: false,
            error: error.message
        });
    }
}

async function deleteAllCharactersAsAdmin() {
    if (!currentUser || currentUser.role !== 'admin') {
        showResponse('getCharacterResponse', {
            success: false,
            error: 'Acesso negado: apenas administradores podem usar esta função'
        });
        return;
    }
    
    if (!confirm('⚠️ ATENÇÃO: Tem certeza que deseja apagar TODOS os personagens?\n\nEsta ação não pode ser desfeita e irá remover permanentemente todos os dados de personagens do sistema.\n\nO contador de ID também será resetado para 1.')) {
        return;
    }
    
    try {
        const response = await fetch('/characters', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            }
        });
        
        const result = await response.json();
        showResponse('getCharacterResponse', result);
        
        if (result.success) {
            // Limpa os campos de busca também
            document.getElementById('searchCharacterId').value = '';
            document.getElementById('searchByUsername').value = '';
        }
    } catch (error) {
        showResponse('getCharacterResponse', {
            success: false,
            error: error.message
        });
    }
}

// Carregar personagem para edição
async function loadCharacterForEdit() {
    const characterId = document.getElementById('editCharacterId').value;
    
    if (!currentUser) {
        showResponse('editCharacterResponse', {
            success: false,
            error: 'Você deve estar logado para editar personagens.'
        });
        return;
    }
    
    if (!characterId) {
        showResponse('editCharacterResponse', {error: 'Por favor, insira um ID válido'});
        return;
    }
    
    try {
        // Busca o personagem pelo ID
        const response = await fetch(`/characters/${characterId}`, {
            headers: getAuthHeaders()
        });
        
        const result = await response.json();
        
        if (result.success && result.character) {
            const character = result.character;
            
            // Verifica se o usuário pode editar este personagem
            if (character.username !== currentUser.username && currentUser.role !== 'admin') {
                showResponse('editCharacterResponse', {
                    success: false,
                    error: 'Acesso negado: você só pode editar seus próprios personagens'
                });
                return;
            }
            
            // Muda para modo edição
            toggleEditMode(true, 'Personagem');
            
            // Configurar campo username baseado na permissão do usuário
            const usernameField = document.getElementById('username');
            const usernameLabel = document.querySelector('label[for="username"]');
            const usernameHelp = usernameField.nextElementSibling;
            
            if (currentUser.role === 'admin') {
                // Admin pode editar o username
                usernameField.readOnly = false;
                usernameField.style.backgroundColor = '#fff';
                usernameLabel.innerHTML = '🛡️ Username do Jogador (Admin):';
                usernameHelp.innerHTML = '<span style="color: #dc3545; font-weight: bold;">🛡️ ADMIN: Você pode alterar o dono deste personagem</span>';
                usernameHelp.style.color = '#dc3545';
            } else {
                // User comum não pode editar username
                usernameField.readOnly = true;
                usernameField.style.backgroundColor = '#f8f9fa';
                usernameLabel.innerHTML = 'Username do Jogador:';
                usernameHelp.innerHTML = '<span style="color: #666;">⚠️ Apenas administradores podem alterar o dono do personagem</span>';
                usernameHelp.style.color = '#666';
            }
            
            // Preenche o formulário com dados atuais
            document.getElementById('editingCharacterId').value = character.id;
            usernameField.value = character.username || '';
            document.getElementById('nome_personagem').value = character.nome_personagem || '';
            document.getElementById('nivel').value = character.nivel || '';
            document.getElementById('raca').value = character.raca || '';
            document.getElementById('classe').value = character.classe || '';
            document.getElementById('ponto_vida').value = character.ponto_vida || '';
            document.getElementById('classe_armadura').value = character.classe_armadura || '';
            document.getElementById('forca').value = character.forca || '';
            document.getElementById('destreza').value = character.destreza || '';
            document.getElementById('constituicao').value = character.constituicao || '';
            document.getElementById('inteligencia').value = character.inteligencia || '';
            document.getElementById('sabedoria').value = character.sabedoria || '';
            document.getElementById('carisma').value = character.carisma || '';
            // Mostrar imagem existente se houver (novo sistema de upload)
            if (character.imagem_personagem) {
                document.getElementById('imagem_personagem').value = character.imagem_personagem;
                document.getElementById('characterPreviewImage').src = character.imagem_personagem;
                document.getElementById('characterImageInfo').innerHTML =
                    `<small style="color: blue;">Imagem atual do personagem</small>`;
                document.getElementById('characterUploadText').style.display = 'none';
                document.getElementById('characterPreview').style.display = 'block';
            } else {
                clearCharacterImage();
            }
            
            // Scroll para o formulário
            document.getElementById('formTitle').scrollIntoView({ behavior: 'smooth' });
            
            showResponse('editCharacterResponse', {
                success: true,
                message: `Personagem "${character.nome_personagem}" carregado para edição`
            });
        } else {
            showResponse('editCharacterResponse', result);
        }
    } catch (error) {
        showResponse('editCharacterResponse', {error: error.message});
    }
}