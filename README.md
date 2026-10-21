# 🛵 Foody Delivery — Mini Rastreador de Pedidos

Sistema Full-Stack de rastreamento de pedidos de delivery desenvolvido para o Desafio Técnico da **Foody Delivery**.

A aplicação permite que usuários autenticados cadastrem pedidos de delivery (cliente, endereço de entrega e itens), acompanhem o progresso de cada entrega em tempo real, filtrem e consultem pedidos individualmente por ID e atualizem seus status ao longo de todo o ciclo do pedido.

---

## ✅ Checklist de Requisitos Entregues

### Back-end (`backend/` — Java 21 + Spring Boot 3.4 + SQLite)
- [x] **Autenticação completa**:
  - Cadastro de usuário com `nome`, `e-mail` e `senha` (`POST /api/auth/register`) com criptografia **BCrypt**;
  - Login utilizando `e-mail` e `senha` (`POST /api/auth/login`);
  - Autenticação Stateless via **Token JWT (`Bearer`)**;
  - Bloqueio de acesso: apenas usuários autenticados podem acessar os endpoints de pedidos (`/api/orders/**`).
- [x] **API REST de Pedidos**:
  - **Criar pedido** (`POST /api/orders`) contendo cliente (`customerName`), endereço de entrega (`deliveryAddress`) e lista de itens (`items` com nome, quantidade e preço unitário), iniciando automaticamente com o status `RECEBIDO`;
  - **Atualizar status do pedido** (`PATCH /api/orders/{id}/status` e `PUT /api/orders/{id}/status`) contemplando os status:
    - `RECEBIDO`
    - `EM_PREPARO`
    - `SAIU_PARA_ENTREGA`
    - `ENTREGUE`
    - `CANCELADO`
  - **Listar todos os pedidos** (`GET /api/orders`) ordenados do mais recente para o mais antigo (com filtro opcional por status `?status=...`);
  - **Buscar um pedido por ID** (`GET /api/orders/{id}`).
- [x] **Persistência**:
  - Banco de dados **SQLite** em arquivo local (`minitracker.db`), gerenciado automaticamente pelo **Spring Data JPA / Hibernate**.

### Front-end (`frontend/` — React 19 + TypeScript + Vite)
- [x] **Autenticação integrada**: Tela de Login e Cadastro conectada à API, com persistência da sessão JWT e proteção da interface;
- [x] **Listagem e Rastreamento de Pedidos**:
  - Cards com identificação do pedido (`#ID`), cliente, endereço de entrega, lista de itens, valor total calculado, badge e barra visual de progresso de entrega;
  - Contadores em tempo real e filtro rápido por cada status (`Todos`, `Recebido`, `Em Preparo`, `Saiu para Entrega`, `Entregue`, `Cancelado`);
  - Busca instantânea por cliente, endereço ou item e **busca direta de pedido por ID** (`GET /api/orders/{id}`);
  - Atualização rápida de status diretamente no seletor do card ou dentro do modal de **Detalhes do Pedido**;
- [x] **Criação de Novo Pedido**: Modal dinâmico que permite adicionar múltiplos itens com quantidades e preços unitários, exibindo prévia do valor total antes de salvar.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologias |
| :--- | :--- |
| **Back-end** | Java 21, Spring Boot 3.4.3, Spring Web, Spring Security, Spring Data JPA (Hibernate 6), Bean Validation, JJWT (`0.12.6`), SQLite JDBC (`3.49.1.0`), JUnit 5 & MockMvc |
| **Front-end** | React 19, TypeScript 5.7, Vite 6, Lucide React Icons, CSS3 Responsivo |
| **Infra / Build** | Maven Wrapper (`mvnw`), npm, Docker & Docker Compose |

---

## 🗂️ Estrutura do Projeto

```text
Mini-tracker/
├── backend/                                  # API REST em Java 21 + Spring Boot 3
│   ├── src/main/java/com/foody/minitracker/
│   │   ├── controller/                       # AuthController (/api/auth) e OrderController (/api/orders)
│   │   ├── domain/                           # Entidades JPA (User, Order, OrderItem) e Enum OrderStatus
│   │   ├── dto/                              # Records de Request/Response com validações (AuthDtos, OrderDtos)
│   │   ├── exception/                        # GlobalExceptionHandler e exceções de domínio
│   │   ├── repository/                       # UserRepository e OrderRepository (Spring Data JPA)
│   │   ├── security/                         # JwtService, JwtAuthenticationFilter e SecurityConfig
│   │   ├── service/                          # Regras de negócio (AuthService, OrderService)
│   │   └── MiniTrackerApplication.java       # Classe principal do Spring Boot
│   ├── src/main/resources/
│   │   └── application.properties            # Configuração do SQLite, JPA e chave JWT
│   ├── src/test/java/com/foody/minitracker/
│   │   └── AuthAndOrderIntegrationTest.java  # Teste de integração de ponta a ponta (Auth + CRUD Pedidos)
│   ├── Dockerfile                            # Build multi-stage para execução em container
│   ├── mvnw / mvnw.cmd                       # Maven Wrapper (dispensa instalação manual do Maven)
│   └── pom.xml                               # Configuração e dependências do Maven
│
├── frontend/                                 # Aplicação React + TypeScript + Vite
│   ├── src/
│   │   ├── components/                       # CreateOrderModal, OrderDetailsModal, StatusBadge
│   │   ├── context/                          # AuthContext (gerenciamento de sessão e token JWT)
│   │   ├── pages/                            # AuthPage (Login/Cadastro) e DashboardPage (Painel de Pedidos)
│   │   ├── services/                         # Cliente HTTP (api.ts) com injeção automática do Bearer Token
│   │   ├── types/                            # Tipagens TypeScript (Order, OrderItem, OrderStatus, UserInfo)
│   │   ├── App.tsx                           # Roteamento condicional (Autenticado vs. Login)
│   │   ├── index.css                         # Estilização completa e responsiva
│   │   └── main.tsx                          # Ponto de entrada do React
│   ├── Dockerfile                            # Container do Front-end
│   ├── index.html                            # Template HTML principal
│   ├── package.json                          # Dependências e scripts do Front-end
│   ├── tsconfig.json                         # Configurações do TypeScript
│   └── vite.config.ts                        # Configuração do Vite (porta 5173)
│
├── docker-compose.yml                        # Orquestração opcional para subir Back-end + Front-end juntos
└── README.md                                 # Documentação completa do projeto
```

---

## 🚀 Como Executar o Projeto

Você pode rodar o projeto **localmente** (usando Java + Node.js) ou via **Docker Compose**.

### Opção 1: Execução Local (Recomendado para Desenvolvimento)

#### Pré-requisitos
- **Java 21 (JDK 21)**
- **Node.js 20+** e **npm**
> *Nota: Não é necessário instalar o Maven manualmente, pois o projeto já inclui o Maven Wrapper (`mvnw` / `mvnw.cmd`).*

#### Passo 1 — Subir o Back-end (Porta `8080`)
Abra um terminal na pasta `backend/` e execute:

```bash
cd backend

# No Windows (PowerShell ou CMD):
.\mvnw.cmd spring-boot:run

# No Linux ou macOS:
./mvnw spring-boot:run
```
- A API estará disponível em `http://localhost:8080/api`.
- O banco de dados SQLite (`minitracker.db`) será criado automaticamente na pasta `backend/`.

#### Passo 2 — Subir o Front-end (Porta `5173`)
Abra um segundo terminal na pasta `frontend/` e execute:

```bash
cd frontend
npm install
npm run dev
```
- Acesse a aplicação no navegador em: **[http://localhost:5173](http://localhost:5173)**

---

### Opção 2: Execução com Docker Compose

Com o Docker em execução, basta rodar na raiz do projeto:

```bash
docker compose up --build
```
- **Front-end React**: [http://localhost:5173](http://localhost:5173)
- **Back-end API REST**: [http://localhost:8080/api](http://localhost:8080/api)

---

## 🔌 Referência da API REST

Base URL: `http://localhost:8080/api`

### 1. Autenticação (`/api/auth`) — Endpoints Públicos

#### `POST /api/auth/register` — Cadastro de Usuário
Cria uma nova conta de usuário e já retorna o token JWT para autenticação imediata.

- **Request Body**:
```json
{
  "name": "Isabella Faria",
  "email": "isabella@foodydelivery.com",
  "password": "senha123"
}
```
- **Response (`201 Created`)**:
```json
{
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "user": {
    "id": 1,
    "name": "Isabella Faria",
    "email": "isabella@foodydelivery.com"
  }
}
```

#### `POST /api/auth/login` — Login de Usuário
Autentica um usuário cadastrado utilizando e-mail e senha.

- **Request Body**:
```json
{
  "email": "isabella@foodydelivery.com",
  "password": "senha123"
}
```
- **Response (`200 OK`)**: Retorna `{ "token": "...", "user": { "id": 1, "name": "...", "email": "..." } }`.

---

### 2. Pedidos (`/api/orders`) — Endpoints Protegidos
> **Importante**: Todos os endpoints abaixo exigem o cabeçalho HTTP:
> `Authorization: Bearer <seu_token_jwt>`
> Requisições sem token válido recebem `401 Unauthorized`.

#### `POST /api/orders` — Criar um Novo Pedido
Registra um novo pedido com cliente, endereço de entrega e itens. O pedido inicia automaticamente com o status `RECEBIDO`.

- **Request Body**:
```json
{
  "customerName": "Isabella Faria",
  "deliveryAddress": "Rua das Maravilhas, 54 - Morro do Algodão",
  "items": [
    {
      "name": "Pizza 2 Queijos",
      "quantity": 1,
      "unitPrice": 29.90
    }
  ]
}
```
- **Response (`201 Created`)**:
```json
{
  "id": 1,
  "customerName": "Isabella Faria",
  "deliveryAddress": "Rua das Maravilhas, 54 - Morro do Algodão",
  "status": "RECEBIDO",
  "items": [
    {
      "name": "Pizza 2 Queijos",
      "quantity": 1,
      "unitPrice": 29.90
    }
  ],
  "totalAmount": 29.90,
  "createdAt": "2026-10-19T19:08:12.451",
  "updatedAt": "2026-10-19T19:08:12.451"
}
```

#### `GET /api/orders` — Listar Todos os Pedidos
Retorna todos os pedidos cadastrados do mais recente para o mais antigo. Aceita filtro opcional por status via query string (`?status=EM_PREPARO`).

- **Response (`200 OK`)**: Array JSON de pedidos (`OrderResponse[]`).

#### `GET /api/orders/{id}` — Buscar Pedido por ID
Busca os detalhes completos de um pedido específico pelo seu identificador numérico.

- **Response (`200 OK`)**: Objeto JSON do pedido ou `404 Not Found` caso o ID não exista.

#### `PATCH /api/orders/{id}/status` (ou `PUT /api/orders/{id}/status`) — Atualizar Status do Pedido
Atualiza o status atual do pedido.

- **Valores aceitos**:
  - `RECEBIDO`
  - `EM_PREPARO`
  - `SAIU_PARA_ENTREGA`
  - `ENTREGUE`
  - `CANCELADO`
- **Request Body**:
```json
{
  "status": "EM_PREPARO"
}
```
- **Response (`200 OK`)**: Objeto JSON do pedido atualizado com o novo `status` e `updatedAt`.

---

## 🧪 Testes Automatizados

O projeto possui teste de integração automatizado ([`AuthAndOrderIntegrationTest.java`](backend/src/test/java/com/foody/minitracker/AuthAndOrderIntegrationTest.java)) utilizando **JUnit 5** e **Spring MockMvc** em banco SQLite isolado de teste, validando todo o fluxo obrigatório:
1. Bloqueio de acesso não autenticado (`GET /api/orders` sem token -> `401 Unauthorized`);
2. Cadastro de novo usuário (`POST /api/auth/register` -> `201 Created`);
3. Login com e-mail e senha (`POST /api/auth/login` -> `200 OK` + Token JWT);
4. Criação de pedido autenticado (`POST /api/orders` -> `201 Created` com status inicial `RECEBIDO`);
5. Listagem de pedidos (`GET /api/orders` -> `200 OK`) e busca individual por ID (`GET /api/orders/{id}` -> `200 OK`);
6. Atualização sequencial por todos os status (`EM_PREPARO`, `SAIU_PARA_ENTREGA`, `ENTREGUE` e `CANCELADO`).

Para executar os testes do Back-end:

```bash
cd backend
.\mvnw.cmd test
```

Para validar a tipagem TypeScript e o build de produção do Front-end:

```bash
cd frontend
npm run build
```
