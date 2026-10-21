import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bike,
  Eye,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../services/api';
import { CreateOrderPayload, Order, OrderStatus } from '../types';
import {
  ALL_ORDER_STATUSES,
  ORDER_STATUS_CONFIG,
  StatusBadge,
  TRACKING_STEPS,
} from '../components/StatusBadge';
import { CreateOrderModal } from '../components/CreateOrderModal';
import { OrderDetailsModal } from '../components/OrderDetailsModal';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [idLookupInput, setIdLookupInput] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersApi.list();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCreateOrder = async (payload: CreateOrderPayload) => {
    const created = await ordersApi.create(payload);
    setOrders((prev) => [created, ...prev]);
  };

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    setError(null);
    try {
      const updated = await ordersApi.updateStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (inspectedOrder?.id === orderId) {
        setInspectedOrder(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLookupById = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericId = Number(idLookupInput.trim());
    if (!numericId || Number.isNaN(numericId)) return;

    setError(null);
    try {
      const found = await ordersApi.getById(numericId);
      setInspectedOrder(found);
      setIdLookupInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : `Pedido #${numericId} não encontrado.`);
    }
  };

  const handleInspectOrder = async (orderId: number) => {
    setError(null);
    try {
      const freshOrder = await ordersApi.getById(orderId);
      setInspectedOrder(freshOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível buscar o pedido.');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        selectedStatus === 'ALL' || order.status === selectedStatus;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        String(order.id).includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.deliveryAddress.toLowerCase().includes(q) ||
        order.items.some((i) => i.name.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [orders, selectedStatus, searchQuery]);

  const countsByStatus = useMemo(() => {
    const map: Record<string, number> = { ALL: orders.length };
    for (const s of ALL_ORDER_STATUSES) {
      map[s] = orders.filter((o) => o.status === s).length;
    }
    return map;
  }, [orders]);

  return (
    <div className="dashboard-wrapper">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-group">
            <div className="brand-logo-sm">
              <Bike size={22} />
            </div>
            <div>
              <h1>Foody Delivery</h1>
              <span>Sistema de Rastreamento de Pedidos</span>
            </div>
          </div>

          <div className="user-controls">
            <div className="user-pill">
              <UserIcon size={16} />
              <div>
                <strong>{user?.name}</strong>
                <small>{user?.email}</small>
              </div>
            </div>
            <button type="button" className="btn-ghost" onClick={logout}>
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="main-container">
        <section className="hero-actions-bar">
          <div>
            <h2>Painel de Pedidos em Tempo Real</h2>
            <p>Acompanhe o preparo, saída para entrega e atualização de status dos pedidos</p>
          </div>
          <div className="hero-buttons">
            <button
              type="button"
              className="btn-secondary"
              onClick={fetchOrders}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              <span>Atualizar</span>
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={18} />
              <span>Novo Pedido</span>
            </button>
          </div>
        </section>

        {error && <div className="alert-error banner">{error}</div>}

        <section className="status-filter-cards">
          <button
            type="button"
            className={`filter-chip ${selectedStatus === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('ALL')}
          >
            <span>Todos</span>
            <strong>{countsByStatus.ALL}</strong>
          </button>
          {ALL_ORDER_STATUSES.map((st) => (
            <button
              key={st}
              type="button"
              className={`filter-chip ${selectedStatus === st ? 'active' : ''}`}
              onClick={() => setSelectedStatus(st)}
            >
              <span>{ORDER_STATUS_CONFIG[st].label}</span>
              <strong>{countsByStatus[st] ?? 0}</strong>
            </button>
          ))}
        </section>

        <section className="search-and-lookup-bar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Filtrar por cliente, endereço, item ou #ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <form className="id-lookup-form" onSubmit={handleLookupById}>
            <input
              type="number"
              min={1}
              placeholder="Buscar pedido por ID (ex: 1)"
              value={idLookupInput}
              onChange={(e) => setIdLookupInput(e.target.value)}
            />
            <button type="submit" className="btn-secondary">
              Buscar ID
            </button>
          </form>
        </section>

        {loading ? (
          <div className="empty-state">
            <RefreshCw size={28} className="spin" />
            <p>Carregando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={40} />
            <h3>Nenhum pedido encontrado</h3>
            <p>
              {orders.length === 0
                ? 'Clique em "Novo Pedido" para registrar o primeiro pedido de delivery.'
                : 'Nenhum pedido corresponde aos filtros selecionados.'}
            </p>
            {orders.length === 0 && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus size={18} />
                Criar Primeiro Pedido
              </button>
            )}
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => {
              const stepIdx = TRACKING_STEPS.indexOf(order.status);

              return (
                <article key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <span className="order-id-tag">Pedido #{order.id}</span>
                      <h3>{order.customerName}</h3>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <p className="order-address">
                    <MapPin size={15} />
                    <span>{order.deliveryAddress}</span>
                  </p>

                  {order.status !== 'CANCELADO' ? (
                    <div className="mini-progress" title={ORDER_STATUS_CONFIG[order.status].description}>
                      {TRACKING_STEPS.map((st, idx) => (
                        <div
                          key={st}
                          className={`mini-step ${idx <= stepIdx ? 'filled' : ''}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="cancelled-banner">Pedido cancelado</div>
                  )}

                  <div className="order-items-summary">
                    <ul>
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          <span>
                            <strong>{item.quantity}x</strong> {item.name}
                          </span>
                          <span>
                            {(item.quantity * item.unitPrice).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="order-card-total">
                      <span>Total</span>
                      <strong>
                        {order.totalAmount.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </strong>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <div className="status-select-group">
                      <label htmlFor={`status-select-${order.id}`}>Status:</label>
                      <select
                        id={`status-select-${order.id}`}
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                      >
                        {ALL_ORDER_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {ORDER_STATUS_CONFIG[st].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => handleInspectOrder(order.id)}
                    >
                      <Eye size={15} />
                      <span>Detalhes</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOrder}
      />

      <OrderDetailsModal
        order={inspectedOrder}
        onClose={() => setInspectedOrder(null)}
        onUpdateStatus={handleStatusChange}
        updatingId={updatingId}
      />
    </div>
  );
};
