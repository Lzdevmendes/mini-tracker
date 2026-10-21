import { AuthResponse, CreateOrderPayload, Order, OrderStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const TOKEN_STORAGE_KEY = 'foody_auth_token';
const USER_STORAGE_KEY = 'foody_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function clearStoredSession(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'Ocorreu um erro ao processar a solicitação.';
    try {
      const errorBody = await response.json();
      if (errorBody?.error) {
        errorMessage = errorBody.error;
      }
    } catch {
      // Fallback message used if body is not JSON
    }

    if (response.status === 401 && !path.startsWith('/auth/')) {
      clearStoredSession();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  register(name: string, email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

export const ordersApi = {
  list(status?: OrderStatus): Promise<Order[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<Order[]>(`/orders${query}`);
  },

  getById(id: number): Promise<Order> {
    return request<Order>(`/orders/${id}`);
  },

  create(payload: CreateOrderPayload): Promise<Order> {
    return request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateStatus(id: number, status: OrderStatus): Promise<Order> {
    return request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
