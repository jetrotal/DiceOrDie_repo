// Lógica específica para testes de mesas

// Função específica chamada após login
function updateLoggedUserSpecific(user) {
    // Preenche criador_id no formulário de criação
    const criadorField = document.getElementById('criador_id');
    if (criadorField) {
        criadorField.value = user.id;
    }
    
    // Adiciona botões específicos de admin para mesas
    const adminButtons = document.getElementById('adminButtons');
    if (adminButtons && user.role === 'admin') {
        adminButtons.innerHTML = `
            <button onclick="getAllTablesAsAdmin()" class="btn-primary">🎯 Ver Todas as Mesas</button>
            <button onclick="deleteAllTablesAsAdmin()" class="btn-danger">🗑️ Apagar Todas as Mesas + Reset ID</button>
        `;
    }
}

// Função específica de logout para mesas
function logoutSpecific() {
    const criadorField = document.getElementById('criador_id');
    if (criadorField) {
        criadorField.value = '';
    }
    cancelEdit(); // Cancela edição se estiver ativa
}

// Função específica de cancelar edição para mesas
function cancelEditSpecific() {
    clearForm('createTableForm');
    
    // Limpar imagem de mesa
    if (typeof clearTableImage === 'function') {
        clearTableImage();
    }
    
    // Resetar campo criador_id ao estado original
    const criadorField = document.getElementById('criador_id');
    const criadorLabel = document.querySelector('label[for="criador_id"]');
    const criadorHelp = criadorField ? criadorField.nextElementSibling : null;
    
    if (criadorField && criadorLabel && criadorHelp) {
        criadorField.readOnly = true;
        criadorField.style.backgroundColor = '#f8f9fa';
        criadorLabel.innerHTML = 'ID do Criador:';
        criadorHelp.innerHTML = '<span style="color: #666;">Preenchido automaticamente com seu ID logado</span>';
        criadorHelp.style.color = '#666';
        
        // Se logado, redefine o criador_id
        if (currentUser) {
            criadorField.value = currentUser.id;
        }
    }
}

// Preencher dados de exemplo
function fillSampleTableData() {
    // Se logado, usa o ID do usuário logado
    if (currentUser) {
        document.getElementById('criador_id').value = currentUser.id;
    } else {
        document.getElementById('criador_id').value = '';
    }
    document.getElementById('nome').value = 'A Taverna do Dragão Dourado';
    document.getElementById('sistema').value = 'D&D 5e';
    document.getElementById('qntd_jogadores').value = '4';
    document.getElementById('mesa_aberta').checked = true;
    // Limpa a imagem da mesa para exemplo
    if (typeof clearTableImage === 'function') {
        clearTableImage();
    }
    document.getElementById('descricao').value = 'Uma aventura épica na famosa Taverna do Dragão Dourado! Junte-se aos nossos heróis em uma jornada através de masmorras perigosas, criaturas místicas e tesouros lendários. Mesa focada em roleplay e exploração, ideal para jogadores de todos os níveis.';
}

// Buscar mesa por ID
async function getTable() {
    const tableId = document.getElementById('searchTableId').value;
    if (!tableId) {
        showResponse('getTableResponse', {error: 'Por favor, insira um ID válido'});
        return;
    }
    
    try {
        const response = await fetch(`/tables/${tableId}`);
        const result = await response.json();
        showResponse('getTableResponse', result);
    } catch (error) {
        showResponse('getTableResponse', {error: error.message});
    }
}

// Buscar mesas por usuário
async function getTablesByUser() {
    const userId = document.getElementById('searchByUserId').value;
    if (!userId) {
        showResponse('getTableResponse', {error: 'Por favor, insira um ID de usuário válido'});
        return;
    }
    
    try {
        const response = await fetch(`/users/${userId}/tables`, {
            headers: getAuthHeaders()
        });
        const result = await response.json();
        showResponse('getTableResponse', result);
    } catch (error) {
        showResponse('getTableResponse', {error: error.message});
    }
}

// Buscar minhas mesas
async function getMyTables() {
    if (!currentUser) {
        showResponse('getTableResponse', {
            success: false,
            error: 'Você deve estar logado para ver suas mesas.'
        });
        return;
    }
    
    try {
        const response = await fetch(`/users/${currentUser.id}/tables`, {
            headers: getAuthHeaders()
        });
        const result = await response.json();
        showResponse('getTableResponse', result);
    } catch (error) {
        showResponse('getTableResponse', {error: error.message});
    }
}

// Listar todas as mesas
async function getAllTables() {
    try {
        const response = await fetch('/tables', {
            headers: getAuthHeaders()
        });
        const result = await response.json();
        showResponse('getTableResponse', result);
    } catch (error) {
        showResponse('getTableResponse', {error: error.message});
    }
}

// Apagar mesa
async function deleteTable() {
    const tableId = document.getElementById('deleteTableId').value;
    
    if (!currentUser) {
        showResponse('deleteTableResponse', {
            success: false,
            error: 'Você deve estar logado para apagar mesas.'
        });
        return;
    }
    
    if (!tableId) {
        showResponse('deleteTableResponse', {error: 'Por favor, insira um ID válido'});
        return;
    }
    
    // Primeiro, buscar a mesa para verificar se o usuário pode apagá-la
    try {
        const checkResponse = await fetch(`/tables/${tableId}`, {
            headers: getAuthHeaders()
        });
        const checkResult = await checkResponse.json();
        
        if (!checkResult.success) {
            showResponse('deleteTableResponse', checkResult);
            return;
        }
        
        const table = checkResult.table;
        const isOwner = (table.criador_id === currentUser.id);
        const isAdmin = (currentUser.role === 'admin');
        
        // Verifica autorização: admin pode apagar qualquer mesa, usuário comum só pode apagar suas próprias mesas
        if (!isAdmin && !isOwner) {
            showResponse('deleteTableResponse', {
                success: false,
                error: 'Acesso negado: você só pode apagar suas próprias mesas. Apenas administradores podem apagar mesas de outros usuários.',
                table_owner: table.criador_id,
                your_id: currentUser.id
            });
            return;
        }
        
        // Mensagem de confirmação personalizada
        let confirmMessage;
        if (isAdmin && !isOwner) {
            confirmMessage = `Tem certeza que deseja apagar a mesa "${table.nome}" (ID: ${tableId})? Como administrador, você pode apagar mesas de outros usuários. Esta ação não pode ser desfeita.`;
        } else {
            confirmMessage = `Tem certeza que deseja apagar sua mesa "${table.nome}"? Esta ação não pode ser desfeita.`;
        }
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        // Proceder com a exclusão
        const response = await fetch(`/tables/${tableId}`, {
            method: 'DELETE',
            headers: {
                'X-CRIADOR-ID': currentUser.id.toString(),
                ...getAuthHeaders()
            }
        });
        
        const result = await response.json();
        showResponse('deleteTableResponse', result);
        
    } catch (error) {
        showResponse('deleteTableResponse', {error: error.message});
    }
}

// Funções específicas para admin
async function getAllTablesAsAdmin() {
    if (!currentUser || currentUser.role !== 'admin') {
        showResponse('getTableResponse', {
            success: false,
            error: 'Acesso negado: apenas administradores podem usar esta função'
        });
        return;
    }
    
    try {
        const response = await fetch('/tables/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            }
        });
        
        const result = await response.json();
        showResponse('getTableResponse', result);
    } catch (error) {
        showResponse('getTableResponse', {
            success: false,
            error: error.message
        });
    }
}

async function deleteAllTablesAsAdmin() {
    if (!currentUser || currentUser.role !== 'admin') {
        showResponse('getTableResponse', {
            success: false,
            error: 'Acesso negado: apenas administradores podem usar esta função'
        });
        return;
    }
    
    if (!confirm('⚠️ ATENÇÃO: Tem certeza que deseja apagar TODAS as mesas?\n\nEsta ação não pode ser desfeita e irá remover permanentemente todos os dados de mesas do sistema.\n\nO contador de ID também será resetado para 1.')) {
        return;
    }
    
    try {
        const response = await fetch('/tables', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            }
        });
        
        const result = await response.json();
        showResponse('getTableResponse', result);
        
        if (result.success) {
            // Limpa os campos de busca também
            document.getElementById('searchTableId').value = '';
            document.getElementById('searchByUserId').value = '';
        }
    } catch (error) {
        showResponse('getTableResponse', {
            success: false,
            error: error.message
        });
    }
}

// Carregar mesa para edição
async function loadTableForEdit() {
    const tableId = document.getElementById('editTableId').value;
    
    if (!currentUser) {
        showResponse('editTableResponse', {
            success: false,
            error: 'Você deve estar logado para editar mesas.'
        });
        return;
    }
    
    if (!tableId) {
        showResponse('editTableResponse', {error: 'Por favor, insira um ID válido'});
        return;
    }
    
    try {
        // Busca a mesa pelo ID
        const response = await fetch(`/tables/${tableId}`, {
            headers: getAuthHeaders()
        });
        
        const result = await response.json();
        
        if (result.success && result.table) {
            const table = result.table;
            
            // Verifica se o usuário pode editar esta mesa
            if (table.criador_id !== currentUser.id && currentUser.role !== 'admin') {
                showResponse('editTableResponse', {
                    success: false,
                    error: 'Acesso negado: você só pode editar suas próprias mesas'
                });
                return;
            }
            
            // Muda para modo edição
            toggleEditMode(true, 'Mesa');
            
            // Configurar campo criador_id baseado na permissão do usuário
            const criadorField = document.getElementById('criador_id');
            const criadorLabel = document.querySelector('label[for="criador_id"]');
            const criadorHelp = criadorField.nextElementSibling;
            
            if (currentUser.role === 'admin') {
                // Admin pode editar o criador_id
                criadorField.readOnly = false;
                criadorField.style.backgroundColor = '#fff';
                criadorLabel.innerHTML = '🛡️ ID do Criador (Admin):';
                criadorHelp.innerHTML = '<span style="color: #dc3545; font-weight: bold;">🛡️ ADMIN: Você pode alterar o criador desta mesa</span>';
                criadorHelp.style.color = '#dc3545';
            } else {
                // User comum não pode editar criador_id
                criadorField.readOnly = true;
                criadorField.style.backgroundColor = '#f8f9fa';
                criadorLabel.innerHTML = 'ID do Criador:';
                criadorHelp.innerHTML = '<span style="color: #666;">⚠️ Apenas administradores podem alterar o criador da mesa</span>';
                criadorHelp.style.color = '#666';
            }
            
            // Preenche o formulário com dados atuais
            document.getElementById('editingTableId').value = table.id;
            criadorField.value = table.criador_id || '';
            document.getElementById('nome').value = table.nome || '';
            document.getElementById('sistema').value = table.sistema || '';
            document.getElementById('qntd_jogadores').value = table.qntd_jogadores || '';
            document.getElementById('mesa_aberta').checked = table.mesa_aberta == 1;
            document.getElementById('capa').value = table.capa || '';
            document.getElementById('descricao').value = table.descricao || '';
            
            // Carregar imagem de mesa existente se houver
            if (typeof loadTableImageForEdit === 'function') {
                loadTableImageForEdit(table);
            }
            
            // Scroll para o formulário
            document.getElementById('formTitle').scrollIntoView({ behavior: 'smooth' });
            
            showResponse('editTableResponse', {
                success: true,
                message: `Mesa "${table.nome}" carregada para edição`
            });
        } else {
            showResponse('editTableResponse', result);
        }
    } catch (error) {
        showResponse('editTableResponse', {error: error.message});
    }
}