// Componentes compartilhados para os testes

// Cria seção de usuário logado padrão
function createLoggedUserSection() {
    return `
        <div id="loggedUserSection" class="section" style="display:none; background-color: #e8f5e8;">
            <h2>👤 Usuário Logado</h2>
            <div id="loggedUserInfo"></div>
            <button onclick="logout()" class="btn-secondary">🚪 Logout</button>
            <div id="adminControls" style="display:none; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                <p><strong>🛡️ Controles de Admin:</strong></p>
                <div id="adminButtons"></div>
            </div>
        </div>
    `;
}

// Cria seção de informações padrão
function createInfoSection(specificInfo = '') {
    return `
        <div class="section">
            <h2>ℹ️ Informações Importantes</h2>
            <p><strong>🔐 Sistema de Segurança:</strong> O sistema implementa controle de acesso baseado em login.</p>
            <p><strong>🛡️ Permissões por Tipo de Usuário:</strong></p>
            <ul>
                <li>🌍 <strong>Todos:</strong> Ver dados públicos</li>
                <li>👤 <strong>User Logado:</strong> Criar/editar/apagar próprios dados + permissões públicas</li>
                <li>🛡️ <strong>Admin:</strong> Acesso total + operações administrativas</li>
            </ul>
            <p><strong>⚠️ Restrições de Segurança:</strong></p>
            <ul>
                <li>✅ <strong>Dados vinculados:</strong> Criações são vinculadas ao usuário logado</li>
                <li>✅ <strong>Operações restritas:</strong> Apenas próprios dados ou admin</li>
                <li>✅ <strong>Headers de autenticação:</strong> Sistema compatível entre test-pages</li>
            </ul>
            <p><strong>📱 Sessão Persistente:</strong> O login é compartilhado entre todas as test-pages.</p>
            ${specificInfo}
        </div>
    `;
}

// Cria seção de login padrão
function createLoginSection() {
    return `
        <div class="section">
            <h2>🔐 Login Required</h2>
            <p style="color: #dc3545; font-weight: bold;">⚠️ Para operações restritas, você deve estar logado.</p>
            <p>Faça login na página de <a href="test-users.html" target="_blank">Testes de Usuários</a> e retorne aqui.</p>
            <button onclick="checkLoginStatus()" class="btn-primary">🔄 Verificar Status de Login</button>
            <div id="loginStatusResponse" class="response" style="display:none;"></div>
        </div>
    `;
}

// Cria seção de testes rápidos
function createQuickTestSection(tests = []) {
    const testButtons = tests.map(test => 
        `<button onclick="runTest('${test.endpoint}')" class="btn-warning">${test.label}</button>`
    ).join('\n            ');
    
    return `
        <div class="section">
            <h2>⚡ Testes Rápidos</h2>
            <p>Execute os testes pré-configurados do sistema:</p>
            ${testButtons}
            <div id="quickTestResponse" class="response" style="display:none;"></div>
        </div>
    `;
}

// Cria formulário de busca genérico
function createSearchSection(entity, searchFields) {
    const fields = searchFields.map(field => `
        <div class="form-group">
            <label for="${field.id}">${field.label}:</label>
            <input type="${field.type || 'text'}" id="${field.id}" placeholder="${field.placeholder}" ${field.min ? `min="${field.min}"` : ''}>
        </div>
    `).join('\n                ');
    
    return `
        <div class="section">
            <h2>🔍 Buscar ${entity}</h2>
            <p style="color: #28a745; font-weight: bold;">🌍 PÚBLICO: Todos podem buscar dados públicos.</p>
            <p style="color: #dc3545; font-weight: bold;">🛡️ ADMIN: Administradores têm acesso completo.</p>
            <div class="form-row">
                ${fields}
            </div>
            <div id="searchButtons"></div>
            <div id="getResponse" class="response" style="display:none;"></div>
        </div>
    `;
}

// Cria seção de edição genérica
function createEditSection(entity) {
    return `
        <div class="section">
            <h2>✏️ Editar ${entity}</h2>
            <p style="color: #dc3545; font-weight: bold;">⚠️ RESTRITO: Você só pode editar seus próprios dados. Admins podem editar qualquer dado.</p>
            <div class="form-group">
                <label for="editId">ID do ${entity} a Editar:</label>
                <input type="number" id="editId" placeholder="Ex: 1" min="1">
            </div>
            <button onclick="loadForEdit()" class="btn-warning">📝 Carregar para Edição</button>
            <div id="editResponse" class="response" style="display:none;"></div>
        </div>
    `;
}

// Cria seção de exclusão genérica
function createDeleteSection(entity) {
    return `
        <div class="section">
            <h2>🗑️ Apagar ${entity}</h2>
            <p style="color: #dc3545; font-weight: bold;">⚠️ RESTRITO: Você só pode apagar seus próprios dados. Admins podem apagar qualquer dado.</p>
            <div class="form-group">
                <label for="deleteId">ID do ${entity} a Apagar:</label>
                <input type="number" id="deleteId" placeholder="Ex: 1" min="1">
            </div>
            <button onclick="deleteEntity()" class="btn-danger">Apagar ${entity}</button>
            <div id="deleteResponse" class="response" style="display:none;"></div>
        </div>
    `;
}

// Função auxiliar para cancelar edição
function cancelEdit() {
    document.getElementById('formTitle').textContent = '✨ Criar';
    document.getElementById('submitBtn').textContent = 'Criar';
    document.getElementById('submitBtn').className = 'btn-success';
    
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.style.display = 'none';
    }
    
    const editingField = document.getElementById('editingId') || 
                        document.getElementById('editingUserId') || 
                        document.getElementById('editingCharacterId') ||
                        document.getElementById('editingTableId');
    if (editingField) {
        editingField.value = '';
    }
    
    // Chama função específica da página se existir
    if (typeof cancelEditSpecific === 'function') {
        cancelEditSpecific();
    }
}

// Função para alternar modo edição
function toggleEditMode(isEditing, entityName) {
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');
    
    if (isEditing) {
        formTitle.textContent = `✏️ Editar ${entityName}`;
        submitBtn.textContent = `Atualizar ${entityName}`;
        submitBtn.className = 'btn-warning';
        if (cancelBtn) cancelBtn.style.display = 'inline-block';
    } else {
        formTitle.textContent = `✨ Criar ${entityName}`;
        submitBtn.textContent = `Criar ${entityName}`;
        submitBtn.className = 'btn-success';
        if (cancelBtn) cancelBtn.style.display = 'none';
    }
}

// Função auxiliar para cancelar edição
function cancelEdit() {
    document.getElementById('formTitle').textContent = '✨ Criar';
    document.getElementById('submitBtn').textContent = 'Criar';
    document.getElementById('submitBtn').className = 'btn-success';
    
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) {
        cancelBtn.style.display = 'none';
    }
    
    const editingField = document.getElementById('editingId') ||
                        document.getElementById('editingUserId') ||
                        document.getElementById('editingCharacterId') ||
                        document.getElementById('editingTableId');
    if (editingField) {
        editingField.value = '';
    }
    
    // Chama função específica da página se existir
    if (typeof cancelEditSpecific === 'function') {
        cancelEditSpecific();
    }
}