import React from 'react';
import { MapPin, User, Calendar, X, Package } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import {
  ALL_ORDER_STATUSES,
  ORDER_STATUS_CONFIG,
  StatusBadge,
  TRACKING_STEPS,
} from './StatusBadge';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: number, status: OrderStatus) => Promise<void>;
  updatingId: number | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  updatingId,
}) => {
  if (!order) return null;

  const currentStepIndex = TRACKING_STEPS.indexOf(order.status);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon">
              <Package size={20} />
            </div>
            <div>
              <h2>Detalhes do Pedido #{order.id}</h2>
              <p>Consulta individual via endpoint GET /api/orders/{order.id}</p>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="details-top-bar">
            <StatusBadge status={order.status} />
            <span className="details-date">
              <Calendar size={14} />
              Criado em {new Date(order.createdAt).toLocaleString('pt-BR')}
            </span>
          </div>

          {order.status !== 'CANCELADO' && (
            <div className="stepper-track">
              {TRACKING_STEPS.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const StepIcon = ORDER_STATUS_CONFIG[step].Icon;
                return (
                  <div
                    key={step}
                    className={`stepper-node ${isCompleted ? 'completed' : ''} ${
                      isCurrent ? 'current' : ''
                    }`}
                  >
                    <div className="stepper-circle">
                      <StepIcon size={15} />
                    </div>
                    <span>{ORDER_STATUS_CONFIG[step].label}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="details-info-grid">
            <div className="info-box">
              <span className="info-label">
                <User size={14} /> Cliente
              </span>
              <strong>{order.customerName}</strong>
            </div>
            <div className="info-box">
              <span className="info-label">
                <MapPin size={14} /> Endereço de Entrega
              </span>
              <strong>{order.deliveryAddress}</strong>
            </div>
          </div>

          <div className="details-items-box">
            <h4>Itens do Pedido ({order.items.length})</h4>
            <ul className="details-items-list">
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
            <div className="details-total-row">
              <span>Valor Total</span>
              <strong>
                {order.totalAmount.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </strong>
            </div>
          </div>

          <div className="status-updater-section">
            <label>Atualizar Status do Pedido:</label>
            <div className="status-buttons-grid">
              {ALL_ORDER_STATUSES.map((statusOption) => {
                const active = order.status === statusOption;
                return (
                  <button
                    key={statusOption}
                    type="button"
                    disabled={active || updatingId === order.id}
                    className={`status-action-btn ${active ? 'active' : ''}`}
                    onClick={() => onUpdateStatus(order.id, statusOption)}
                  >
                    {ORDER_STATUS_CONFIG[statusOption].label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
