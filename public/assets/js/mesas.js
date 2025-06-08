// Gerenciador de Mesas - Sistema completo de gestão de mesas de RPG
class GerenciadorMesas {
  constructor() {
    this.mesas = [];
    this.mesasFiltradas = [];
    this.filtroAtivo = 'todas';
    this.buscaAtiva = '';
    
    this.elementos = {
      gamesGrid: document.querySelector('.games-grid'),
      searchBox: null, // Será definido após inicialização do layout
      searchTitle: null,
      searchSystem: null,
      searchCreator: null
    };

    this.statusMesas = {
      available: { text: 'Disponível', class: 'status-available' },
      full: { text: 'Lotado', class: 'status-full' },
      private: { text: 'Privada', class: 'status-private' },
      starting: { text: 'Iniciando', class: 'status-starting' }
    };

    // Mapeamento de filtros para funcionalidades
    this.filtroFuncoes = {
      'ao-vivo': () => this.filtrarAoVivo(),
      'recomendadas': () => this.filtrarRecomendadas(),
      'favoritas': () => this.filtrarFavoritas(),
      'historico': () => this.mostrarHistorico(),
      'minhas-mesas': () => this.filtrarMinhasMesas(),
      'criar-mesa': () => this.criarNovaMesa(),
      'todas': () => this.mostrarTodasMesas(),
      'disponiveis': () => this.filtrarDisponiveis(),
      'privadas': () => this.filtrarPrivadas(),
      'lotadas': () => this.filtrarLotadas()
    };

    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.setupHistoryNavigation();
    await this.carregarMesas();
    // Aplicar filtro da URL após carregar mesas
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
      'ao-vivo': 'Ao Vivo',
      'recomendadas': 'Recomendadas',
      'favoritas': 'Mesas Favoritas',
      'historico': 'Histórico',
      'minhas-mesas': 'Minhas Mesas',
      'criar-mesa': 'Criar Mesa',
      'todas': 'Todas as Mesas',
      'disponiveis': 'Disponíveis',
      'privadas': 'Privadas',
      'lotadas': 'Lotadas'
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

  async carregarMesas() {
    console.log('Carregando mesas da API...');
    
    try {
      const response = await fetch('/tables', {
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      console.log('Resposta da API:', result);
      
      if (result.success && result.tables) {
        console.log('Mesas carregadas com sucesso:', result.tables);
        this.mesas = await this.transformarMesasParaFrontend(result.tables);
        this.mesasFiltradas = [...this.mesas];
        this.renderizarMesas();
      } else {
        console.warn('Falha ao carregar mesas ou lista vazia:', result);
        // Fallback para dados mockup se API falhar
        this.carregarMesasMockup();
      }
    } catch (error) {
      console.error('Erro ao carregar mesas da API:', error);
      DiceOrDieUtils.showWarning('Erro ao carregar mesas. Usando dados de exemplo.');
      // Fallback para dados mockup se API falhar
      this.carregarMesasMockup();
    }
  }

  // Método para obter headers de autenticação (seguindo padrão do mesa.js)
  getAuthHeaders() {
    const currentUser = DiceOrDieUtils.getCurrentUser();
    if (!currentUser) return {};
    
    return {
      'X-User-ID': currentUser.id.toString(),
      'X-User-Role': currentUser.role || 'user'
    };
  }

  async transformarMesasParaFrontend(mesasBackend) {
    const currentUser = DiceOrDieUtils.getCurrentUser();
    const mesasTransformadas = [];

    for (const mesa of mesasBackend) {
      try {
        // Buscar nome do criador
        const criadorNome = await this.buscarNomeCriador(mesa.criador_id);
        
        // Determinar status da mesa
        const status = this.determinarStatusMesa(mesa);
        
        // Verificar se é mesa do usuário atual
        const isMinha = currentUser ? mesa.criador_id === currentUser.id : false;
        
        // Transformar para formato do frontend
        const mesaTransformada = {
          id: mesa.id,
          titulo: mesa.nome,
          descricao: mesa.descricao || "Sem descrição disponível",
          sistema: mesa.sistema,
          maxJogadores: mesa.qntd_jogadores,
          jogadoresAtuais: mesa.jogadores_atuais || 0, // Será implementado no backend futuramente
          criador: criadorNome,
          criador_id: mesa.criador_id,
          imagem: mesa.capa || "https://placehold.co/100x100.png",
          status: status,
          tags: this.gerarTags(mesa),
          isMinha: isMinha,
          mesa_aberta: mesa.mesa_aberta
        };

        mesasTransformadas.push(mesaTransformada);
      } catch (error) {
        console.error('Erro ao transformar mesa:', mesa, error);
        // Continuar com as outras mesas mesmo se uma falhar
      }
    }

    console.log('Mesas transformadas:', mesasTransformadas);
    return mesasTransformadas;
  }

  async buscarNomeCriador(criadorId) {
    try {
      const response = await fetch(`/users/${criadorId}`, {
        headers: this.getAuthHeaders()
      });

      const result = await response.json();
      
      if (result.success && result.user && result.user.username) {
        return result.user.username;
      } else {
        return `Usuário ID: ${criadorId}`;
      }
    } catch (error) {
      console.error('Erro ao buscar nome do criador:', error);
      return `Usuário ID: ${criadorId}`;
    }
  }

  determinarStatusMesa(mesa) {
    // Lógica para determinar status baseado nos dados da mesa
    const isPublic = mesa.mesa_aberta === 1 || mesa.mesa_aberta === true || mesa.mesa_aberta === "1";
    
    if (!isPublic) {
      return 'private';
    }
    
    // Por enquanto, sempre retornar 'available' para mesas públicas
    // Futuramente, verificar se está lotada baseado em jogadores_atuais vs qntd_jogadores
    if (mesa.jogadores_atuais >= mesa.qntd_jogadores) {
      return 'full';
    }
    
    return 'available';
  }

  gerarTags(mesa) {
    const tags = [];
    
    // Tag do sistema
    if (mesa.sistema) {
      tags.push(mesa.sistema);
    }
    
    // Tag de quantidade de jogadores
    tags.push(`Até ${mesa.qntd_jogadores} jogadores`);
    
    return tags;
  }

  carregarMesasMockup() {
    // Dados mockup como fallback
    console.log('Carregando dados mockup como fallback');
    this.mesas = [
      {
        id: 1,
        titulo: "Aventuras em Faerûn",
        descricao: "Uma campanha épica no mundo de Dungeons & Dragons. Explorando as terras místicas de Faerûn, os heróis enfrentarão desafios únicos e criaturas lendárias.",
        sistema: "D&D 5e",
        maxJogadores: 6,
        jogadoresAtuais: 6,
        criador: "Marco",
        imagem: "https://placehold.co/100x100.png",
        status: "full",
        tags: ["D&D 5e", "Até 6 jogadores"],
        isMinha: false
      },
      {
        id: 2,
        titulo: "Aventura em Tormenta",
        descricao: "Revivendo uma aventura de Arton! Jogadores interessados devem entrar em contato com email@gmail.com. Data limite: 25/08/1994. Horário das partidas: 22 horas.",
        sistema: "3D&T",
        maxJogadores: 7,
        jogadoresAtuais: 3,
        criador: "teste",
        imagem: "https://placehold.co/100x100.png",
        status: "available",
        tags: ["3D&T", "Até 7 jogadores"],
        isMinha: false
      },
      {
        id: 3,
        titulo: "Ritmo de Festa",
        descricao: "Uma aventura descontraída para quem quer se divertir com amigos. Sistema simples e narrativa focada na diversão.",
        sistema: "Sistema Próprio",
        maxJogadores: 6,
        jogadoresAtuais: 2,
        criador: "Usuario",
        imagem: "https://placehold.co/100x100.png",
        status: "available",
        tags: ["Sistema Próprio", "Até 6 jogadores"],
        isMinha: true
      }
    ];

    this.mesasFiltradas = [...this.mesas];
    this.renderizarMesas();
  }

  setupEventListeners() {
    // Aguardar a inicialização do layout para configurar os eventos
    setTimeout(() => {
      this.elementos.searchBox = document.getElementById('searchBox');
      this.elementos.searchTitle = document.getElementById('searchTitle');
      this.elementos.searchSystem = document.getElementById('searchSystem');
      this.elementos.searchCreator = document.getElementById('searchCreator');

      if (this.elementos.searchBox) {
        this.elementos.searchBox.addEventListener('input', () => this.filtrarMesas());
      }

      // Adicionar listeners para checkboxes de busca
      [this.elementos.searchTitle, this.elementos.searchSystem, this.elementos.searchCreator].forEach(checkbox => {
        if (checkbox) {
          checkbox.addEventListener('change', () => this.filtrarMesas());
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
        case 'Ao Vivo':
          filtroSlug = 'ao-vivo';
          break;
        case 'Recomendadas':
          filtroSlug = 'recomendadas';
          break;
        case 'Mesas Favoritas':
          filtroSlug = 'favoritas';
          break;
        case 'Histórico':
          filtroSlug = 'historico';
          break;
        case 'Minhas Mesas':
          filtroSlug = 'minhas-mesas';
          break;
        case 'Criar Mesa':
          filtroSlug = 'criar-mesa';
          break;
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

  filtrarMesas() {
    const busca = this.elementos.searchBox?.value.toLowerCase() || '';
    const buscarTitulo = this.elementos.searchTitle?.checked || false;
    const buscarSistema = this.elementos.searchSystem?.checked || false;
    const buscarCriador = this.elementos.searchCreator?.checked || false;

    if (!busca) {
      this.mesasFiltradas = [...this.mesas];
    } else {
      this.mesasFiltradas = this.mesas.filter(mesa => {
        let match = false;
        
        if (buscarTitulo) {
          match = match || mesa.titulo.toLowerCase().includes(busca);
        }
        if (buscarSistema) {
          match = match || mesa.sistema.toLowerCase().includes(busca);
        }
        if (buscarCriador) {
          match = match || mesa.criador.toLowerCase().includes(busca);
        }
        
        // Se nenhum checkbox estiver marcado, buscar em todos os campos
        if (!buscarTitulo && !buscarSistema && !buscarCriador) {
          match = mesa.titulo.toLowerCase().includes(busca) ||
                  mesa.sistema.toLowerCase().includes(busca) ||
                  mesa.criador.toLowerCase().includes(busca) ||
                  mesa.descricao.toLowerCase().includes(busca);
        }
        
        return match;
      });
    }

    this.renderizarMesas();
  }

  filtrarPorStatus(status) {
    this.mesasFiltradas = this.mesas.filter(mesa => mesa.status === status);
    this.renderizarMesas();
  }

  filtrarRecomendadas() {
    // Lógica para mesas recomendadas (baseada em sistema favorito do usuário, etc.)
    this.mesasFiltradas = this.mesas.filter(mesa => mesa.sistema === "D&D 5e" || mesa.status === "available");
    this.renderizarMesas();
  }

  filtrarFavoritas() {
    // Implementar sistema de favoritos (localStorage por enquanto)
    const favoritas = JSON.parse(localStorage.getItem('mesasFavoritas') || '[]');
    this.mesasFiltradas = this.mesas.filter(mesa => favoritas.includes(mesa.id));
    this.renderizarMesas();
  }

  filtrarMinhasMesas() {
    this.mesasFiltradas = this.mesas.filter(mesa => mesa.isMinha);
    this.renderizarMesas();
  }

  // Novos métodos de filtro
  filtrarAoVivo() {
    // Filtrar mesas que estão "ao vivo" - status starting ou recently created
    this.mesasFiltradas = this.mesas.filter(mesa =>
      mesa.status === 'starting' || mesa.status === 'available'
    );
    this.renderizarMesas();
  }

  mostrarTodasMesas() {
    // Mostrar todas as mesas sem filtro
    this.mesasFiltradas = [...this.mesas];
    this.renderizarMesas();
  }

  filtrarDisponiveis() {
    // Filtrar apenas mesas disponíveis
    this.mesasFiltradas = this.mesas.filter(mesa => mesa.status === 'available');
    this.renderizarMesas();
  }

  filtrarPrivadas() {
    // Filtrar apenas mesas privadas
    this.mesasFiltradas = this.mesas.filter(mesa => mesa.status === 'private');
    this.renderizarMesas();
  }

  filtrarLotadas() {
    // Filtrar apenas mesas lotadas
    this.mesasFiltradas = this.mesas.filter(mesa => mesa.status === 'full');
    this.renderizarMesas();
  }

  mostrarHistorico() {
    // Implementar histórico de mesas - por enquanto, mostrar mesas antigas ou do usuário
    const currentUser = DiceOrDieUtils.getCurrentUser();
    if (currentUser) {
      // Filtrar mesas do usuário + mesas que ele já participou (simulado por now)
      this.mesasFiltradas = this.mesas.filter(mesa =>
        mesa.isMinha || mesa.status === 'full'
      );
      this.renderizarMesas();
    } else {
      DiceOrDieUtils.showInfo("Funcionalidade de histórico requer login.");
    }
  }

  criarNovaMesa() {
    // Redirecionar para página de criação de mesa
    DiceOrDieUtils.showInfo("Redirecionando para criação de mesa...");
    setTimeout(() => {
      window.location.href = "mesa.html?mode=create";
    }, 1000);
  }

  renderizarMesas() {
    if (!this.elementos.gamesGrid) return;

    if (this.mesasFiltradas.length === 0) {
      this.elementos.gamesGrid.innerHTML = `
        <div class="no-results">
          <h3>Nenhuma mesa encontrada</h3>
          <p>Tente ajustar seus filtros de busca ou criar uma nova mesa.</p>
        </div>
      `;
      return;
    }

    const mesasHTML = this.mesasFiltradas.map(mesa => this.criarCardMesa(mesa)).join('');
    this.elementos.gamesGrid.innerHTML = mesasHTML;

    // Adicionar event listeners para os cards
    this.adicionarEventListenersCards();
  }

  criarCardMesa(mesa) {
    const statusInfo = this.statusMesas[mesa.status];
    const creatorClass = mesa.isMinha ? 'self-creator' : '';
    
    return `
      <div class="game-card" data-mesa-id="${mesa.id}">
        <img src="${mesa.imagem}" alt="${mesa.titulo}" class="game-image">
        <div class="game-info">
          <div class="game-title">${mesa.titulo}</div>
          <div class="game-description">${mesa.descricao}</div>
          <div class="game-tags">
            ${mesa.tags.map(tag => `<div class="game-tag">${tag}</div>`).join('')}
            <div class="game-creator ${creatorClass}">Mesa criada por ${mesa.criador}</div>
          </div>
        </div>
        <div class="game-status ${statusInfo.class}">${statusInfo.text}</div>
      </div>
    `;
  }

  adicionarEventListenersCards() {
    const cards = document.querySelectorAll('.game-card');
    
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const mesaId = parseInt(card.dataset.mesaId);
        this.abrirMesa(mesaId);
      });
    });
  }

  abrirMesa(mesaId) {
    const mesa = this.mesas.find(m => m.id === mesaId);
    
    if (!mesa) {
      DiceOrDieUtils.showError("Mesa não encontrada.");
      return;
    }

    if (mesa.status === 'full') {
      DiceOrDieUtils.showWarning("Esta mesa está lotada.");
      return;
    }

    if (mesa.status === 'private') {
      window.location.href = `mesa.html?mode=view&id=${mesaId}`;

      return;
    }

    // Redirecionar para visualização da mesa específica
      window.location.href = `mesa.html?mode=view&id=${mesaId}`;
  }

  adicionarAosFavoritos(mesaId) {
    const favoritas = JSON.parse(localStorage.getItem('mesasFavoritas') || '[]');
    
    if (!favoritas.includes(mesaId)) {
      favoritas.push(mesaId);
      localStorage.setItem('mesasFavoritas', JSON.stringify(favoritas));
      DiceOrDieUtils.showSuccess("Mesa adicionada aos favoritos!");
    } else {
      DiceOrDieUtils.showInfo("Mesa já está nos favoritos.");
    }
  }

  removerDosFavoritos(mesaId) {
    const favoritas = JSON.parse(localStorage.getItem('mesasFavoritas') || '[]');
    const novasFavoritas = favoritas.filter(id => id !== mesaId);
    
    localStorage.setItem('mesasFavoritas', JSON.stringify(novasFavoritas));
    DiceOrDieUtils.showSuccess("Mesa removida dos favoritos!");
  }
}

// Função global para buscar mesas (chamada pelo botão na sidebar)
function searchTables() {
  if (window.gerenciadorMesas) {
    window.gerenciadorMesas.filtrarMesas();
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.gerenciadorMesas = new GerenciadorMesas();
});
