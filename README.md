# Super Horários 8000

API de gerenciamento acadêmico e de horários para o IFFar, desenvolvida com Node.js, Express e MongoDB. A aplicação permite cadastrar, consultar, atualizar e excluir informações relacionadas a grades regulares, sábados letivos e bancas de TCC.

## 🚀 Funcionalidades

- Cadastro e gestão de grades regulares
- Cadastro e gestão de sábados letivos
- Cadastro e gestão de bancas de TCC
- Validação de conflitos de sala, professor e turma
- Integração com MongoDB via Mongoose
- API REST pronta para uso

## 🛠️ Tecnologias

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv

## 📦 Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd super-horarios8000-main
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

Copie o arquivo `.env_exemplo` para `.env` e edite os valores:

```bash
copy .env_exemplo .env
```

Exemplo de conteúdo:

```env
MONGO_URI=sua_string_de_conexao_do_mongodb
PORT=3000
```

4. Inicie a aplicação:

```bash
npm start
```

Ou em modo de desenvolvimento:

```bash
npm run dev
```

## 🌐 Endpoints da API

### Grade regular

- `GET /grade-regular` — lista todas as grades regulares
- `GET /grade-regular/:id` — busca uma grade regular pelo ID
- `POST /grade-regular` — cadastra uma nova grade regular
- `PUT /grade-regular/:id` — atualiza uma grade regular
- `DELETE /grade-regular/:id` — remove uma grade regular

### Sábados letivos

- `GET /sabados-letivos` — lista todos os sábados letivos
- `GET /sabados-letivos/:id` — busca um registro pelo ID
- `POST /sabados-letivos` — cadastra um novo sábado letivo
- `PUT /sabados-letivos/:id` — atualiza um sábado letivo
- `DELETE /sabados-letivos/:id` — remove um sábado letivo

### Bancas TCC

- `GET /bancas-tcc` — lista todas as bancas de TCC

## 🧪 Exemplo de payload

### Grade regular

```json
{
  "diaSemana": "segunda-feira",
  "horario": "08:00",
  "turma": "TADS-2024",
  "disciplina": "Programação",
  "professor": "Prof. João",
  "sala": "LAB-01"
}
```

### Sábado letivo

```json
{
  "data": "2026-07-18",
  "descricao": "Aula complementar",
  "horario": "09:00",
  "turma": "TADS-2024",
  "professor": "Prof. Maria",
  "sala": "LAB-02"
}
```

## 📄 Estrutura do projeto

```text
src/
  index.js
```

## 🤝 Contribuição

Contribuições são bem-vindas. Sinta-se à vontade para abrir issues ou pull requests com melhorias, correções de bugs ou novas funcionalidades.

## 📜 Licença

Este projeto é de uso acadêmico e pode ser adaptado conforme a necessidade do grupo ou instituição.
