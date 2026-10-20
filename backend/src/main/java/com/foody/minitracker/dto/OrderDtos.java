package com.foody.minitracker.dto;

import com.foody.minitracker.domain.Order;
import com.foody.minitracker.domain.OrderItem;
import com.foody.minitracker.domain.OrderStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDtos {

    public record OrderItemDto(
            @NotBlank(message = "O nome do item é obrigatório.")
            String name,

            @NotNull(message = "A quantidade do item é obrigatória.")
            @Min(value = 1, message = "A quantidade deve ser de pelo menos 1.")
            Integer quantity,

            @NotNull(message = "O preço unitário é obrigatório.")
            @DecimalMin(value = "0.01", message = "O preço unitário deve ser maior que zero.")
            BigDecimal unitPrice
    ) {
        public OrderItem toDomain() {
            return new OrderItem(name.trim(), quantity, unitPrice);
        }

        public static OrderItemDto fromDomain(OrderItem item) {
            return new OrderItemDto(item.getName(), item.getQuantity(), item.getUnitPrice());
        }
    }

    public record CreateOrderRequest(
            @NotBlank(message = "O nome do cliente é obrigatório.")
            String customerName,

            @NotBlank(message = "O endereço de entrega é obrigatório.")
            String deliveryAddress,

            @NotEmpty(message = "O pedido deve conter pelo menos um item.")
            @Valid
            List<OrderItemDto> items
    ) {}

    public record UpdateOrderStatusRequest(
            @NotNull(message = "O novo status do pedido é obrigatório.")
            OrderStatus status
    ) {}

    public record OrderResponse(
            Long id,
            String customerName,
            String deliveryAddress,
            OrderStatus status,
            List<OrderItemDto> items,
            BigDecimal totalAmount,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        public static OrderResponse fromDomain(Order order) {
            List<OrderItemDto> itemDtos = order.getItems().stream()
                    .map(OrderItemDto::fromDomain)
                    .toList();

            return new OrderResponse(
                    order.getId(),
                    order.getCustomerName(),
                    order.getDeliveryAddress(),
                    order.getStatus(),
                    itemDtos,
                    order.calculateTotal(),
                    order.getCreatedAt(),
                    order.getUpdatedAt()
            );
        }
    }
}
