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

    this.init();
  }

  init() {
    this.carregarMesas();
    this.setupEventListeners();
    this.renderizarMesas();
  }

  carregarMesas() {
    // Dados mockup das mesas - posteriormente virá de uma API
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
      
      switch(text) {
        case 'Ao Vivo':
          button.addEventListener('click', () => this.filtrarPorStatus('starting'));
          break;
        case 'Recomendadas':
          button.addEventListener('click', () => this.filtrarRecomendadas());
          break;
        case 'Mesas Favoritas':
          button.addEventListener('click', () => this.filtrarFavoritas());
          break;
        case 'Histórico':
          button.addEventListener('click', () => this.mostrarHistorico());
          break;
        case 'Minhas Mesas':
          button.addEventListener('click', () => this.filtrarMinhasMesas());
          break;
        case 'Criar Mesa':
          button.addEventListener('click', () => this.criarNovaMesa());
          break;
      }
    });
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

  mostrarHistorico() {
    // Implementar histórico de mesas
    DiceOrDieUtils.showInfo("Funcionalidade de histórico em desenvolvimento.");
  }

  criarNovaMesa() {
    // Redirecionar para página de criação de mesa
    DiceOrDieUtils.showInfo("Redirecionando para criação de mesa...");
    setTimeout(() => {
      DiceOrDieUtils.navigateTo("mesa.html");
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

    // Redirecionar para a mesa específica
    DiceOrDieUtils.showSuccess(`Entrando na mesa: ${mesa.titulo}`);
    setTimeout(() => {
      DiceOrDieUtils.navigateTo(`mesa.html?id=${mesaId}`);
    }, 1000);
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
