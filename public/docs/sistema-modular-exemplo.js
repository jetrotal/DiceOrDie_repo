// Exemplo de uso do sistema de componentes modulares

// 1. EXEMPLO: Criando uma nova página usando o sistema modular

// Configuração da página de exemplo
const exemploPageConfig = {
    title: 'Minha Nova Página',
    navbar: [
        { url: 'mesas.html', text: 'Mesas', active: false },
        { url: 'exemplo.html', text: 'Exemplo', active: true },
        { url: 'conta.html', text: 'Conta', active: false }
    ],
    sidebar: [
        {
            title: 'Menu Principal',
            items: [
                { text: 'Opção 1', type: 'button', onclick: 'console.log("Opção 1")' },
                { text: 'Opção 2', type: 'button', onclick: 'console.log("Opção 2")' },
                { type: 'separator' },
                { text: 'Buscar', type: 'input', id: 'busca', placeholder: 'Digite aqui...' }
            ]
        }
    ],
    rightPanel: [
        {
            title: 'Informações',
            items: [
                { text: 'Esta é uma página de exemplo', type: 'info' },
                { type: 'separator' },
                { text: 'Clique no botão abaixo', type: 'info' },
                { text: 'Ação', type: 'button', onclick: 'alert("Oi!")' }
            ]
        }
    ]
};

// 2. EXEMPLO: Como inicializar uma página
function inicializarPaginaExemplo() {
    document.addEventListener('DOMContentLoaded', async () => {
        // Inicializar layout básico
        await ComponentManager.initializeLayout();
        
        // Configurar componentes específicos
        ComponentManager.configureNavbar(exemploPageConfig.navbar);
        ComponentManager.configureSidebar(exemploPageConfig.sidebar);
        ComponentManager.configureRightPanel(exemploPageConfig.rightPanel);
    });
}

// 3. EXEMPLO: Criando uma página de listagem rápida
const configListagemRapida = QuickPageBuilder.createListingPage({
    title: 'Lista de Personagens',
    navbar: [
        { url: 'mesas.html', text: 'Mesas', active: false },
        { url: 'personagens.html', text: 'Personagens', active: true }
    ],
    sidebar: [
        {
            title: 'Filtros',
            items: [
                { text: 'Todos', type: 'button' },
                { text: 'Ativos', type: 'button' },
                { text: 'Arquivados', type: 'button' }
            ]
        }
    ],
    items: [
        {
            title: 'Legolas',
            description: 'Elfo Arqueiro - Nível 5',
            tags: ['D&D 5e', 'Ativo'],
            status: { type: 'available', text: 'Ativo' }
        },
        {
            title: 'Gimli',
            description: 'Anão Guerreiro - Nível 4',
            tags: ['D&D 5e', 'Ativo'],
            status: { type: 'available', text: 'Ativo' }
        }
    ]
});

// 4. EXEMPLO: Criando uma página de formulário rápida
const configFormularioRapido = QuickPageBuilder.createFormPage({
    title: 'Criar Personagem',
    formTitle: 'Novo Personagem',
    formDescription: 'Preencha os dados do seu personagem',
    navbar: [
        { url: 'mesas.html', text: 'Mesas', active: false },
        { url: 'criar-personagem.html', text: 'Criar Personagem', active: true }
    ],
    sections: [
        {
            title: 'Informações Básicas',
            fields: [
                { id: 'nome', label: 'Nome', type: 'text', required: true },
                { id: 'classe', label: 'Classe', type: 'text', required: true },
                { id: 'nivel', label: 'Nível', type: 'number', required: true }
            ]
        }
    ],
    submitText: 'Criar Personagem'
});

// 5. EXEMPLO: Estrutura HTML mínima para usar o sistema
const exemploHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dice or Die - Exemplo</title>
    <link rel="stylesheet" href="../assets/css/base.css">
    <link rel="stylesheet" href="../assets/css/components.css">
</head>
<body>
    <div class="body-shadow"></div>
    <div class="main-container">
        <!-- Left Column (Sidebar) -->
        <div class="left-column" id="sidebar">
            <div id="logo-slot"></div>
            <div id="menu-panels"></div>
        </div>
        
        <!-- Middle Column -->
        <div class="middle-column">
            <div class="top-nav" id="navbar"></div>
            
            <!-- SEU CONTEÚDO AQUI -->
            <div id="main-content">
                <h1>Minha Página</h1>
                <p>Conteúdo da página...</p>
            </div>
        </div>
        
        <!-- Right Column -->
        <div class="right-column">
            <div id="userbar-slot"></div>
            <div id="right-panels"></div>
        </div>
    </div>

    <script src="../assets/js/utils.js"></script>
    <script src="../assets/js/components.js"></script>
    <script>
        // SUA CONFIGURAÇÃO AQUI
        document.addEventListener('DOMContentLoaded', async () => {
            await ComponentManager.initializeLayout();
            ComponentManager.configureNavbar(suaConfigNavbar);
            ComponentManager.configureSidebar(suaConfigSidebar);
            ComponentManager.configureRightPanel(suaConfigPainelDireito);
        });
    </script>
</body>
</html>
`;

// 6. VANTAGENS DO SISTEMA MODULAR:
/*
✅ Reutilização: Logo, navbar, sidebar e userbar são reutilizados
✅ Manutenção: Mudanças em um componente afetam todas as páginas
✅ Consistência: Visual e comportamento padronizados
✅ Produtividade: Criação rápida de novas páginas
✅ Flexibilidade: Cada página pode ter configuração específica
✅ Organização: Código mais limpo e organizado
*/
