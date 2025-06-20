# Diagrama de Casos de Uso - DiceOrDie

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': { 'primaryColor': '#f5f5f5'}}}%%
flowchart LR
    %% Atores
    User([Usuário]):::actor
    System([Sistema Backend]):::actor
    
    %% Casos de Uso - Grupo Usuário
    subgraph GestaoUsuario["Gestão de Usuário"]
        direction TB
        UC1((Cadastrar Usuário)):::usecase
        UC2((Validar Dados)):::usecase
        UC3((Fazer Login)):::usecase
        UC4((Verificar Credenciais)):::usecase
    end
    
    %% Casos de Uso - Grupo Personagem
    subgraph GestaoPersonagem["Gestão de Personagem"]
        direction TB
        UC5((Criar Ficha de Personagem)):::usecase
        UC6((Validar Atributos)):::usecase
        UC7((Selecionar Jogadores/NPCs)):::usecase
    end
    
    %% Casos de Uso - Grupo Mesa
    subgraph GestaoMesa["Gestão de Mesa"]
        direction TB
        UC8((Criar Mesa de Jogo)):::usecase
        UC9((Definir Configurações)):::usecase
        UC10((Iniciar Partida)):::usecase
        UC15((Convidar Jogadores)):::usecase
        UC16((Gerenciar Turnos)):::usecase
    end
    
    %% Casos de Uso - Sistema
    subgraph OperacoesSistema["Operações do Sistema"]
        direction TB
        UC11((Operações CRUD)):::usecase
        UC12((Gerar Resposta JSON)):::usecase
        UC13((Logs de cada ação)):::usecase
        UC14((Gerenciar Banco de Dados)):::usecase
    end
    
    %% Relacionamentos Usuário
    User --> UC1
    UC1 -->|include| UC2
    User --> UC3
    UC3 -->|include| UC4
    
    %% Relacionamentos Personagem
    User --> UC5
    UC5 -->|include| UC6
    User --> UC7
    
    %% Relacionamentos Mesa
    User --> UC8
    UC8 -->|include| UC9
    User --> UC10
    User --> UC15
    User --> UC16
    
    %% Relacionamentos Sistema
    System --> UC11
    System --> UC12
    System --> UC13
    System --> UC14
    
    %% Validações e dependências
    UC4 -.->|extends| UC2
    UC9 -.->|extends| UC6
    
    %% Estilos
    classDef actor fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef usecase fill:#f3e5f5,stroke:#4a148c,stroke-width:1px
    classDef sistema fill:#fff3e0,stroke:#e65100,stroke-width:1px
```

## Descrição dos Casos de Uso

### Gestão de Usuário
- **UC1 - Cadastrar Usuário**: Permite ao usuário criar uma nova conta no sistema
- **UC2 - Validar Dados**: Validação de formato de e-mail e senha
- **UC3 - Fazer Login**: Autenticação do usuário no sistema
- **UC4 - Verificar Credenciais**: Verificação das credenciais fornecidas

### Gestão de Personagem
- **UC5 - Criar Ficha de Personagem**: Criação de uma nova ficha de personagem
- **UC6 - Validar Atributos**: Validação dos atributos do personagem (valores 1-20)
- **UC7 - Selecionar Jogadores/NPCs**: Seleção de jogadores e NPCs para a partida

### Gestão de Mesa
- **UC8 - Criar Mesa de Jogo**: Criação de uma nova mesa de jogo
- **UC9 - Definir Configurações**: Configuração das regras e parâmetros da mesa
- **UC10 - Iniciar Partida**: Início efetivo da partida
- **UC15 - Convidar Jogadores**: Convite de outros usuários para participar da mesa
- **UC16 - Gerenciar Turnos**: Controle da ordem e tempo dos turnos durante a partida

### Operações do Sistema
- **UC11 - Operações CRUD**: Operações de Create, Read, Update, Delete
- **UC12 - Gerar Resposta JSON**: Geração de respostas em formato JSON
- **UC13 - Logs de cada ação**: Registro e armazenamento de cada ação realizada no sistema
- **UC14 - Gerenciar Banco de Dados**: Persistência e recuperação de dados

## Relacionamentos
- **include**: Relacionamento obrigatório entre casos de uso (o caso base inclui o comportamento do caso incluído)
- **extends**: Relacionamento opcional onde um caso de uso estende o comportamento de outro (a seta vai do caso que estende para o caso base)
- **→**: Associação direta entre ator e caso de uso
