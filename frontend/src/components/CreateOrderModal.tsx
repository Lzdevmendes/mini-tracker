import React, { useState } from 'react';
import { Plus, Trash2, X, ShoppingBag } from 'lucide-react';
import { CreateOrderPayload, OrderItem } from '../types';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateOrderPayload) => Promise<void>;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [items, setItems] = useState<OrderItem[]>([
    { name: '', quantity: 1, unitPrice: 29.9 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [...prev, { name: '', quantity: 1, unitPrice: 15.0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      )
    );
  };

  const totalPreview = items.reduce(
    (acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !deliveryAddress.trim()) {
      setError('Preencha o nome do cliente e o endereço de entrega.');
      return;
    }

    const sanitizedItems = items.map((i) => ({
      name: i.name.trim(),
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
    }));

    if (
      sanitizedItems.some(
        (i) => !i.name || i.quantity < 1 || i.unitPrice <= 0 || Number.isNaN(i.unitPrice)
      )
    ) {
      setError('Verifique os itens: informe nome, quantidade mínima de 1 e valor positivo.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        customerName: customerName.trim(),
        deliveryAddress: deliveryAddress.trim(),
        items: sanitizedItems,
      });
      setCustomerName('');
      setDeliveryAddress('');
      setItems([{ name: '', quantity: 1, unitPrice: 29.9 }]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2>Novo Pedido de Delivery</h2>
              <p>Cadastre o cliente, endereço e os itens do pedido</p>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="modal-body">
          {error && <div className="alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="customerName">Nome do Cliente *</label>
            <input
              id="customerName"
              type="text"
              placeholder="Ex.: Mariana Costa"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="deliveryAddress">Endereço de Entrega *</label>
            <input
              id="deliveryAddress"
              type="text"
              placeholder="Ex.: Rua dos Pinheiros, 450 - Apto 81, São Paulo - SP"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
            />
          </div>

          <div className="items-section">
            <div className="items-section-header">
              <span>Itens do Pedido *</span>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={handleAddItem}
              >
                <Plus size={15} />
                Adicionar Item
              </button>
            </div>

            <div className="items-list-editor">
              {items.map((item, idx) => (
                <div key={idx} className="item-editor-row">
                  <div className="item-col-name">
                    <label>Descrição do Item</label>
                    <input
                      type="text"
                      placeholder="Ex.: Pizza Margherita Grande"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="item-col-qty">
                    <label>Qtd.</label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)
                      }
                      required
                    />
                  </div>
                  <div className="item-col-price">
                    <label>Preço Unit. (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                      }
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="icon-btn danger"
                    onClick={() => handleRemoveItem(idx)}
                    disabled={items.length <= 1}
                    title="Remover item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <div className="order-total-preview">
              <span>Total estimado:</span>
              <strong>
                {totalPreview.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </strong>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Criando pedido...' : 'Criar Pedido'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
