import React, { useState } from 'react';
import { Bike, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { setSession } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response =
        mode === 'login'
          ? await authApi.login(email, password)
          : await authApi.register(name, email, password);

      setSession(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Falha na autenticação. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (target: 'login' | 'register') => {
    setMode(target);
    setError(null);
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-logo">
            <Bike size={28} />
          </div>
          <div>
            <h1>Foody Delivery</h1>
            <p>Mini Rastreador de Pedidos</p>
          </div>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => toggleMode('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => toggleMode('register')}
          >
            Criar Conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert-error">{error}</div>}

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Nome Completo</label>
              <div className="input-with-icon">
                <User size={18} />
                <input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input
                id="email"
                type="email"
                placeholder="voce@foodydelivery.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input
                id="password"
                type="password"
                placeholder="Mínimo de 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            <span>
              {loading
                ? 'Processando...'
                : mode === 'login'
                ? 'Acessar Painel de Pedidos'
                : 'Cadastrar e Entrar'}
            </span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
