package com.foody.minitracker.service;

import com.foody.minitracker.domain.Order;
import com.foody.minitracker.domain.OrderItem;
import com.foody.minitracker.domain.OrderStatus;
import com.foody.minitracker.dto.OrderDtos.CreateOrderRequest;
import com.foody.minitracker.dto.OrderDtos.OrderItemDto;
import com.foody.minitracker.dto.OrderDtos.OrderResponse;
import com.foody.minitracker.exception.ResourceNotFoundException;
import com.foody.minitracker.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        List<OrderItem> domainItems = request.items().stream()
                .map(OrderItemDto::toDomain)
                .toList();

        Order order = new Order(
                request.customerName().trim(),
                request.deliveryAddress().trim(),
                domainItems
        );

        Order saved = orderRepository.save(order);
        return OrderResponse.fromDomain(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> listOrders(OrderStatus status) {
        List<Order> orders = (status != null)
                ? orderRepository.findByStatusOrderByCreatedAtDesc(status)
                : orderRepository.findAllByOrderByCreatedAtDesc();

        return orders.stream()
                .map(OrderResponse::fromDomain)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido #" + id + " não encontrado."));
        return OrderResponse.fromDomain(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido #" + id + " não encontrado."));
        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        return OrderResponse.fromDomain(updated);
    }
}
