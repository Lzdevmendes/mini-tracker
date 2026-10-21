export type OrderStatus =
  | 'RECEBIDO'
  | 'EM_PREPARO'
  | 'SAIU_PARA_ENTREGA'
  | 'ENTREGUE'
  | 'CANCELADO';

export interface UserInfo {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: UserInfo;
}

export interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  customerName: string;
  deliveryAddress: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  customerName: string;
  deliveryAddress: string;
  items: OrderItem[];
}
