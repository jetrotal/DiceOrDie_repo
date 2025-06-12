// Gerenciador de Fichas - Sistema completo de gestão de fichas de personagem
class GerenciadorFichas {
  constructor() {
    this.fichas = [];
    this.fichasFiltradas = [];
    this.filtroAtivo = 'todas';
    this.buscaAtiva = '';
    
    this.elementos = {
      charactersGrid: document.getElementById('charactersGrid'),
      searchBox: null, // Será definido após inicialização do layout
      searchName: null,
      searchRace: null,
      searchClass: null
    };

    // Mapeamento de filtros para funcionalidades
    this.filtroFuncoes = {
      'favoritas': () => this.filtrarFavoritas(),
      'dnd5e': () => this.filtrarDnD5e(),
      'sistema': () => this.filtrarPorSistema(),
      'nivel': () => this.filtrarPorNivel(),
      'todas': () => this.mostrarTodasFichas()
    };

    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.setupHistoryNavigation();
    await this.carregarFichas();
    // Aplicar filtro da URL após carregar fichas
    this.aplicarFiltroURL();
  }

  // Configurar navegação pelo histórico do navegador
  setupHistoryNavigation() {
    window.addEventListener('popstate', (event) => {
      console.log('Navegação pelo histórico detectada:', event.state);
      this.aplicarFiltroURL();
    });
  }

  // Detectar e aplicar filtros da URL
  aplicarFiltroURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const filtro = urlParams.get('filtro');
    
    if (filtro && this.filtroFuncoes[filtro]) {
      console.log(`Aplicando filtro da URL: ${filtro}`);
      this.filtroAtivo = filtro;
      this.filtroFuncoes[filtro]();
      
      // Atualizar botão ativo na sidebar
      this.atualizarBotaoAtivo(filtro);
    } else if (filtro) {
      console.warn(`Filtro não reconhecido: ${filtro}`);
      // Redirect para versão sem filtro inválido
      this.atualizarURL('todas');
    }
  }

  // Atualizar URL sem recarregar a página
  atualizarURL(filtro) {
    const novaURL = filtro === 'todas' ?
      window.location.pathname :
      `${window.location.pathname}?filtro=${filtro}`;
    
    window.history.pushState({ filtro }, '', novaURL);
    this.filtroAtivo = filtro;
  }

  // Atualizar botão ativo visualmente
  atualizarBotaoAtivo(filtro) {
    // Remover classe active de todos os botões
    document.querySelectorAll('.sidebar-item').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Mapear filtros para textos dos botões
    const filtroParaTexto = {
      'favoritas': 'Favoritas',
      'dnd5e': 'D&D 5e',
      'sistema': 'Por Sistema',
      'nivel': 'Por Nível',
      'todas': 'Todas'
    };
    
    const textoFiltro = filtroParaTexto[filtro];
    if (textoFiltro) {
      const botao = Array.from(document.querySelectorAll('.sidebar-item'))
        .find(btn => btn.textContent.trim() === textoFiltro);
      
      if (botao) {
        botao.classList.add('active');
      }
    }
  }

  async carregarFichas() {
    console.log('Carregando fichas da API...');
    
    // Verificar se usuário está logado
    const currentUser = DiceOrDieUtils.getCurrentUser();
    if (!currentUser) {
      this.mostrarMensagemLogin();
      return;
    }
    
    try {
      const response = await fetch(`/users/${currentUser.username}/characters`, {
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      console.log('Resposta da API:', result);
      
      if (result.success && result.characters) {
        console.log('Fichas carregadas com sucesso:', result.characters);
        this.fichas = this.transformarFichasParaFrontend(result.characters);
        this.fichasFiltradas = [...this.fichas];
        this.renderizarFichas();
      } else {
        console.warn('Falha ao carregar fichas ou lista vazia:', result);
        this.mostrarMensagemVazia();
      }
    } catch (error) {
      console.error('Erro ao carregar fichas da API:', error);
      DiceOrDieUtils.showWarning('Erro ao carregar fichas. Verifique sua conexão.');
      this.mostrarMensagemErro();
    }
  }

  // Método para obter headers de autenticação
  getAuthHeaders() {
    const currentUser = DiceOrDieUtils.getCurrentUser();
    if (!currentUser) return {};
    
    return {
      'X-User-ID': currentUser.id.toString(),
      'X-User-Role': currentUser.role || 'user'
    };
  }

  transformarFichasParaFrontend(fichasBackend) {
    return fichasBackend.map(ficha => ({
      id: ficha.id,
      nome: ficha.nome_personagem,
      nivel: ficha.nivel,
      raca: ficha.raca,
      classe: ficha.classe,
      pontoVida: ficha.ponto_vida,
      classeArmadura: ficha.classe_armadura,
      imagem: ficha.imagem_personagem || "https://placehold.co/100x100.png",
      atributos: {
        forca: ficha.forca,
        destreza: ficha.destreza,
        constituicao: ficha.constituicao,
        inteligencia: ficha.inteligencia,
        sabedoria: ficha.sabedoria,
        carisma: ficha.carisma
      },
      // Propriedades extras para filtros
      sistema: this.determinarSistema(ficha)
    }));
  }

  determinarSistema(ficha) {
    // Lógica para determinar sistema baseado na raça/classe
    if (['Humano', 'Elfo', 'Anão', 'Halfling', 'Meio-elfo', 'Meio-orc', 'Tiefling', 'Draconato'].includes(ficha.raca)) {
      return 'D&D 5e';
    }
    return 'Sistema Personalizado';
  }


  setupEventListeners() {
    // Aguardar a inicialização do layout para configurar os eventos
    setTimeout(() => {
      this.elementos.searchBox = document.getElementById('searchBox');
      this.elementos.searchName = document.getElementById('searchName');
      this.elementos.searchRace = document.getElementById('searchRace');
      this.elementos.searchClass = document.getElementById('searchClass');

      if (this.elementos.searchBox) {
        this.elementos.searchBox.addEventListener('input', () => this.filtrarFichas());
      }

      // Adicionar listeners para checkboxes de busca
      [this.elementos.searchName, this.elementos.searchRace, this.elementos.searchClass].forEach(checkbox => {
        if (checkbox) {
          checkbox.addEventListener('change', () => this.filtrarFichas());
        }
      });

      // Configurar botões da sidebar
      this.configurarBotoesSidebar();
    }, 100);
  }

  configurarBotoesSidebar() {
    // Encontrar e configurar os botões da sidebar
    const sidebarButtons = document.querySelectorAll('.sidebar-item');
    
    sidebarButtons.forEach(button => {
      const text = button.textContent.trim();
      let filtroSlug = null;
      
      switch(text) {
        case 'Favoritas':
          filtroSlug = 'favoritas';
          break;
        case 'D&D 5e':
          filtroSlug = 'dnd5e';
          break;
        case 'Por Sistema':
          filtroSlug = 'sistema';
          break;
        case 'Por Nível':
          filtroSlug = 'nivel';
          break;
        case 'Criar Ficha':
          // Não é um filtro, mas uma ação
          button.addEventListener('click', (e) => {
            e.preventDefault();
            this.criarNovaFicha();
          });
          return;
        default:
          // Botões não reconhecidos ficam sem funcionalidade específica
          return;
      }
      
      if (filtroSlug) {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          this.aplicarFiltro(filtroSlug);
        });
      }
    });
  }

  // Aplicar filtro e atualizar URL
  aplicarFiltro(filtro) {
    if (this.filtroFuncoes[filtro]) {
      this.atualizarURL(filtro);
      this.filtroFuncoes[filtro]();
      this.atualizarBotaoAtivo(filtro);
      
      console.log(`Filtro aplicado: ${filtro}`);
    } else {
      console.warn(`Filtro não encontrado: ${filtro}`);
    }
  }

  filtrarFichas() {
    const busca = this.elementos.searchBox?.value.toLowerCase() || '';
    const buscarNome = this.elementos.searchName?.checked || false;
    const buscarRaca = this.elementos.searchRace?.checked || false;
    const buscarClasse = this.elementos.searchClass?.checked || false;

    if (!busca) {
      this.fichasFiltradas = [...this.fichas];
    } else {
      this.fichasFiltradas = this.fichas.filter(ficha => {
        let match = false;
        
        if (buscarNome) {
          match = match || ficha.nome.toLowerCase().includes(busca);
        }
        if (buscarRaca) {
          match = match || ficha.raca.toLowerCase().includes(busca);
        }
        if (buscarClasse) {
          match = match || ficha.classe.toLowerCase().includes(busca);
        }
        
        // Se nenhum checkbox estiver marcado, buscar em todos os campos
        if (!buscarNome && !buscarRaca && !buscarClasse) {
          match = ficha.nome.toLowerCase().includes(busca) ||
                  ficha.raca.toLowerCase().includes(busca) ||
                  ficha.classe.toLowerCase().includes(busca) ||
                  ficha.sistema.toLowerCase().includes(busca);
        }
        
        return match;
      });
    }

    this.renderizarFichas();
  }

  filtrarFavoritas() {
    // Implementar sistema de favoritos (localStorage por enquanto)
    const favoritas = JSON.parse(localStorage.getItem('fichasFavoritas') || '[]');
    this.fichasFiltradas = this.fichas.filter(ficha => favoritas.includes(ficha.id));
    this.renderizarFichas();
  }

  filtrarDnD5e() {
    this.fichasFiltradas = this.fichas.filter(ficha => ficha.sistema === 'D&D 5e');
    this.renderizarFichas();
  }

  filtrarPorSistema() {
    // Agrupar por sistema - por enquanto mostra D&D 5e primeiro
    this.fichasFiltradas = [...this.fichas].sort((a, b) => {
      if (a.sistema === 'D&D 5e' && b.sistema !== 'D&D 5e') return -1;
      if (a.sistema !== 'D&D 5e' && b.sistema === 'D&D 5e') return 1;
      return a.sistema.localeCompare(b.sistema);
    });
    this.renderizarFichas();
  }

  filtrarPorNivel() {
    // Ordenar por nível (maior primeiro)
    this.fichasFiltradas = [...this.fichas].sort((a, b) => b.nivel - a.nivel);
    this.renderizarFichas();
  }

  mostrarTodasFichas() {
    // Mostrar todas as fichas sem filtro
    this.fichasFiltradas = [...this.fichas];
    this.renderizarFichas();
  }

  criarNovaFicha() {
    // Redirecionar para página de criação de ficha
    DiceOrDieUtils.showInfo("Redirecionando para criação de ficha...");
    setTimeout(() => {
      window.location.href = "ficha.html";
    }, 1000);
  }

  renderizarFichas() {
    if (!this.elementos.charactersGrid) return;

    if (this.fichas.length === 0) {
      this.mostrarMensagemVazia();
      return;
    }

    if (this.fichasFiltradas.length === 0) {
      this.elementos.charactersGrid.innerHTML = `
        <div class="no-results">
          <h3>Nenhuma ficha encontrada</h3>
          <p>Tente ajustar seus filtros de busca ou criar uma nova ficha.</p>
        </div>
      `;
      return;
    }

    const fichasHTML = this.fichasFiltradas.map(ficha => this.criarCardFicha(ficha)).join('');
    this.elementos.charactersGrid.innerHTML = fichasHTML;

    // Adicionar event listeners para os cards
    this.adicionarEventListenersCards();
  }

  criarCardFicha(ficha) {
    return `
      <div class="game-card" data-ficha-id="${ficha.id}">
        <img src="${ficha.imagem}" alt="${ficha.nome}" class="game-image">
        <div class="game-info">
          <div class="game-title">${ficha.nome}</div>
          <div class="game-description">
            ${ficha.raca} ${ficha.classe} - Nível ${ficha.nivel}<br>
            HP: ${ficha.pontoVida} | CA: ${ficha.classeArmadura}<br>
            Sistema: ${ficha.sistema}
          </div>
          <div class="game-tags">
            <div class="game-tag">${ficha.raca}</div>
            <div class="game-tag">${ficha.classe}</div>
            <div class="game-tag">Nível ${ficha.nivel}</div>
            <div class="game-creator self-creator">Minha Ficha</div>
          </div>
        </div>
        <div class="game-status status-available">
          ${ficha.sistema}
        </div>
      </div>
    `;
  }

  adicionarEventListenersCards() {
    const cards = document.querySelectorAll('.game-card');
    
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const fichaId = parseInt(card.dataset.fichaId);
        this.abrirFicha(fichaId);
      });
    });
  }

  abrirFicha(fichaId) {
    const ficha = this.fichas.find(f => f.id === fichaId);
    
    if (!ficha) {
      DiceOrDieUtils.showError("Ficha não encontrada.");
      return;
    }

    // Redirecionar para visualização da ficha específica
    window.location.href = `ficha.html?mode=view&id=${fichaId}`;
  }

  mostrarMensagemLogin() {
    this.elementos.charactersGrid.innerHTML = `
      <div class="no-results">
        <h3>Login Necessário</h3>
        <p>Você precisa estar logado para ver suas fichas de personagem.</p>
        <button onclick="DiceOrDieUtils.navigateTo('login.html')" class="btn-primary">Fazer Login</button>
      </div>
    `;
  }

  mostrarMensagemVazia() {
    this.elementos.charactersGrid.innerHTML = `
      <div class="no-results">
        <h3>Nenhuma ficha encontrada</h3>
        <p>Você ainda não criou nenhuma ficha de personagem.</p>
        <button onclick="DiceOrDieUtils.navigateTo('ficha.html')" class="btn-primary">Criar Primeira Ficha</button>
      </div>
    `;
  }

  mostrarMensagemErro() {
    this.elementos.charactersGrid.innerHTML = `
      <div class="no-results">
        <h3>Erro ao carregar fichas</h3>
        <p>Houve um problema ao carregar suas fichas. Tente novamente.</p>
        <button onclick="window.location.reload()" class="btn-primary">Tentar Novamente</button>
      </div>
    `;
  }

  adicionarAosFavoritos(fichaId) {
    const favoritas = JSON.parse(localStorage.getItem('fichasFavoritas') || '[]');
    
    if (!favoritas.includes(fichaId)) {
      favoritas.push(fichaId);
      localStorage.setItem('fichasFavoritas', JSON.stringify(favoritas));
      DiceOrDieUtils.showSuccess("Ficha adicionada aos favoritos!");
    } else {
      DiceOrDieUtils.showInfo("Ficha já está nos favoritos.");
    }
  }

  removerDosFavoritos(fichaId) {
    const favoritas = JSON.parse(localStorage.getItem('fichasFavoritas') || '[]');
    const novasFavoritas = favoritas.filter(id => id !== fichaId);
    
    localStorage.setItem('fichasFavoritas', JSON.stringify(novasFavoritas));
    DiceOrDieUtils.showSuccess("Ficha removida dos favoritos!");
  }
}

// Função global para buscar fichas (chamada pelo botão na sidebar)
function searchCharacters() {
  if (window.gerenciadorFichas) {
    window.gerenciadorFichas.filtrarFichas();
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.gerenciadorFichas = new GerenciadorFichas();
});