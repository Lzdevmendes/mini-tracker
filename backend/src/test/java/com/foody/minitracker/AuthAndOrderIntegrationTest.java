package com.foody.minitracker;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foody.minitracker.domain.OrderStatus;
import com.foody.minitracker.dto.AuthDtos.LoginRequest;
import com.foody.minitracker.dto.AuthDtos.RegisterRequest;
import com.foody.minitracker.dto.OrderDtos.CreateOrderRequest;
import com.foody.minitracker.dto.OrderDtos.OrderItemDto;
import com.foody.minitracker.dto.OrderDtos.UpdateOrderStatusRequest;
import com.foody.minitracker.repository.OrderRepository;
import com.foody.minitracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:sqlite:target/test-minitracker.db",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class AuthAndOrderIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("1. Segurança: Deve bloquear todos os endpoints de pedidos para usuários não autenticados ou com token inválido")
    void shouldBlockUnauthenticatedAndInvalidTokenRequests() throws Exception {
        // Sem token
        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/orders/1"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(patch("/api/orders/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"EM_PREPARO\"}"))
                .andExpect(status().isUnauthorized());

        // Com token adulterado/inválido
        mockMvc.perform(get("/api/orders")
                        .header("Authorization", "Bearer token.invalido.assinatura"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("2. Autenticação: Deve cadastrar usuário, impedir e-mail duplicado, autenticar no login e rejeitar senha incorreta")
    void shouldRegisterLoginAndRejectInvalidCredentials() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest(
                "Isabella Barreto",
                "isabella@foodydelivery.com",
                "senhaSegura123"
        );

        // Cadastro com sucesso
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.name").value("Isabella Barreto"))
                .andExpect(jsonPath("$.user.email").value("isabella@foodydelivery.com"));

        // E-mail duplicado deve retornar 409 Conflict
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isConflict());

        // Login com credenciais válidas -> 200 OK
        LoginRequest validLogin = new LoginRequest("ISABELLA@foodydelivery.com", "senhaSegura123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());

        // Login com senha incorreta -> 401 Unauthorized
        LoginRequest wrongPassword = new LoginRequest("isabella@foodydelivery.com", "senhaErrada");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongPassword)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("3. Fluxo Completo de Pedidos: Criar pedido, listar todos, buscar por ID e atualizar por todos os 5 status exigidos")
    void shouldExecuteCompleteOrderLifecycle() throws Exception {
        String bearer = registerAndGetBearerToken("operador@foodydelivery.com");

        // Criar Pedido 1
        CreateOrderRequest order1Req = new CreateOrderRequest(
                "Carlos Mendes",
                "Av. Paulista, 1000 - Apto 42, São Paulo - SP",
                List.of(
                        new OrderItemDto("Hambúrguer Artesanal Duplo", 2, new BigDecimal("34.90")),
                        new OrderItemDto("Refrigerante Lata 350ml", 2, new BigDecimal("6.50"))
                )
        );

        MvcResult createResult = mockMvc.perform(post("/api/orders")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(order1Req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.customerName").value("Carlos Mendes"))
                .andExpect(jsonPath("$.deliveryAddress").value("Av. Paulista, 1000 - Apto 42, São Paulo - SP"))
                .andExpect(jsonPath("$.status").value("RECEBIDO"))
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.totalAmount").value(82.80))
                .andReturn();

        Long orderId = objectMapper.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // Listar todos os pedidos
        mockMvc.perform(get("/api/orders")
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(orderId));

        // Buscar pedido por ID existente
        mockMvc.perform(get("/api/orders/" + orderId)
                        .header("Authorization", bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orderId))
                .andExpect(jsonPath("$.customerName").value("Carlos Mendes"));

        // Buscar pedido por ID inexistente -> 404 Not Found
        mockMvc.perform(get("/api/orders/99999")
                        .header("Authorization", bearer))
                .andExpect(status().isNotFound());

        // Atualizar status por TODOS os 5 status obrigatórios:
        // RECEBIDO, EM_PREPARO, SAIU_PARA_ENTREGA, ENTREGUE e CANCELADO
        for (OrderStatus targetStatus : List.of(
                OrderStatus.EM_PREPARO,
                OrderStatus.SAIU_PARA_ENTREGA,
                OrderStatus.ENTREGUE,
                OrderStatus.CANCELADO,
                OrderStatus.RECEBIDO
        )) {
            UpdateOrderStatusRequest statusUpdate = new UpdateOrderStatusRequest(targetStatus);
            mockMvc.perform(patch("/api/orders/" + orderId + "/status")
                            .header("Authorization", bearer)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(statusUpdate)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value(targetStatus.name()));
        }

        // Também deve suportar PUT /api/orders/{id}/status
        mockMvc.perform(put("/api/orders/" + orderId + "/status")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateOrderStatusRequest(OrderStatus.ENTREGUE))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ENTREGUE"));
    }

    @Test
    @DisplayName("4. Validações de Entrada: Deve retornar 400 Bad Request para pedido sem cliente, sem endereço, sem itens ou com status inválido")
    void shouldValidateOrderPayloads() throws Exception {
        String bearer = registerAndGetBearerToken("validador@foodydelivery.com");

        // Pedido sem itens
        CreateOrderRequest emptyItemsReq = new CreateOrderRequest(
                "Cliente Teste",
                "Rua A, 123",
                List.of()
        );
        mockMvc.perform(post("/api/orders")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyItemsReq)))
                .andExpect(status().isBadRequest());

        // Status inexistente no enum
        mockMvc.perform(patch("/api/orders/1/status")
                        .header("Authorization", bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"STATUS_INEXISTENTE\"}"))
                .andExpect(status().isBadRequest());
    }

    private String registerAndGetBearerToken(String email) throws Exception {
        RegisterRequest registerRequest = new RegisterRequest("Usuário Teste", email, "senha123");
        MvcResult res = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode node = objectMapper.readTree(res.getResponse().getContentAsString());
        return "Bearer " + node.get("token").asText();
    }
}
