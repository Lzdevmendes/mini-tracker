import React from 'react';
import {
  CheckCircle2,
  ChefHat,
  Clock,
  Truck,
  XCircle,
} from 'lucide-react';
import { OrderStatus } from '../types';

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    description: string;
    badgeClass: string;
    Icon: React.ComponentType<{ size?: number }>;
  }
> = {
  RECEBIDO: {
    label: 'Recebido',
    description: 'Pedido registrado no sistema',
    badgeClass: 'status-badge status-recebido',
    Icon: Clock,
  },
  EM_PREPARO: {
    label: 'Em Preparo',
    description: 'Cozinha preparando os itens',
    badgeClass: 'status-badge status-em-preparo',
    Icon: ChefHat,
  },
  SAIU_PARA_ENTREGA: {
    label: 'Saiu para Entrega',
    description: 'Entregador a caminho do destino',
    badgeClass: 'status-badge status-saiu-entrega',
    Icon: Truck,
  },
  ENTREGUE: {
    label: 'Entregue',
    description: 'Entrega concluída com sucesso',
    badgeClass: 'status-badge status-entregue',
    Icon: CheckCircle2,
  },
  CANCELADO: {
    label: 'Cancelado',
    description: 'Pedido cancelado',
    badgeClass: 'status-badge status-cancelado',
    Icon: XCircle,
  },
};

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  'RECEBIDO',
  'EM_PREPARO',
  'SAIU_PARA_ENTREGA',
  'ENTREGUE',
  'CANCELADO',
];

export const TRACKING_STEPS: OrderStatus[] = [
  'RECEBIDO',
  'EM_PREPARO',
  'SAIU_PARA_ENTREGA',
  'ENTREGUE',
];

export const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const config = ORDER_STATUS_CONFIG[status];
  const { Icon } = config;
  return (
    <span className={config.badgeClass}>
      <Icon size={14} />
      <span>{config.label}</span>
    </span>
  );
};
