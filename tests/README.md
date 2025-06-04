# 🧪 Testes do DiceOrDie

Esta pasta contém arquivos organizados para testar as funcionalidades do sistema DiceOrDie.

## 📁 Estrutura dos Arquivos

- **`TestUsers.php`** - Testes para criação de usuários
- **`TestCharacters.php`** - Testes para criação de personagens
- **`TestGameTables.php`** - Testes para criação de mesas de jogo
- **`TestRunner.php`** - Executor de testes completos

## 🌐 Rotas de Teste Disponíveis

### Usuários
- `GET /test/user` - Cria um usuário de exemplo (Gandalf)
- `GET /test/users` - Cria múltiplos usuários (Gandalf, Aragorn, Legolas, Éowyn)

### Personagens
- `GET /test/character` - Cria um personagem de exemplo (Mithrandir)
- `GET /test/characters` - Cria múltiplos personagens para os usuários existentes

### Mesas de Jogo
- `GET /test/table` - Cria uma mesa de exemplo (A Sociedade do Anel)
- `GET /test/tables` - Cria múltiplas mesas temáticas do Senhor dos Anéis

### Testes Completos
- `GET /test/basic` - Executa teste básico (1 usuário + 1 personagem + 1 mesa)
- `GET /test/all` - Executa todos os testes (usuários → personagens → mesas)

## 🎯 Como Usar

1. **Inicie o servidor PHP:**
   ```bash
   php -S localhost:8001 -t public
   ```

2. **Execute os testes via browser ou curl:**
   ```bash
   # Teste completo
   curl http://localhost:8001/test/all
   
   # Testes individuais
   curl http://localhost:8001/test/users
   curl http://localhost:8001/test/characters
   curl http://localhost:8001/test/tables
   ```

3. **Veja os dados criados:**
   ```bash
   curl http://localhost:8001/
   ```

## 📊 Dados de Teste

### Usuários Criados
- **Gandalf** (gandalf) - Wizard Lendário
- **Aragorn** (strider) - Ranger Experiente  
- **Legolas** (elfprince) - Archer Veterano
- **Éowyn** (shieldmaiden) - Fighter Iniciante

### Personagens Criados
- **Mithrandir** - Wizard nível 20 (Gandalf)
- **Aragorn Elessar** - Ranger nível 15 (Aragorn)
- **Legolas Greenleaf** - Archer nível 12 (Legolas)
- **Éowyn de Rohan** - Fighter nível 10 (Éowyn)

### Mesas Criadas
- **A Sociedade do Anel** - D&D 5e (4 jogadores)
- **As Duas Torres** - D&D 5e (6 jogadores)
- **O Retorno do Rei** - Pathfinder (5 jogadores)
- **Aventuras em Rohan** - D&D 3.5 (3 jogadores)
- **A Defesa de Gondor** - D&D 5e (8 jogadores)

## 🔧 Dependências

Os testes seguem as dependências corretas:
1. **Usuários** devem ser criados primeiro
2. **Personagens** dependem de usuários existentes
3. **Mesas** dependem de usuários existentes (criador_id)

## ⚠️ Notas Importantes

- Os testes podem gerar erros se executados múltiplas vezes (usernames/emails duplicados)
- Para resetar, delete o arquivo `database.sqlite` e reinicie o servidor
- Os testes usam dados temáticos do Senhor dos Anéis para facilitar identificação
