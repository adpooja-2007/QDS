import React, { useState, useEffect } from 'react';
import { fetchUsers, loginUser, registerUser } from '../api';

const DEFAULT_DEMO_USERS = [
  {
    username: 'alice',
    display_name: 'Alice Kovacs',
    role: 'Signer Node Alpha',
    node_id: '#9042',
    avatar_text: 'AK',
    avatar_bg: 'bg-[#181B20]',
    is_admin: false,
  },
  {
    username: 'bob',
    display_name: 'Bob (Receiver Node Beta)',
    role: 'Receiver Node Beta',
    node_id: '#260827',
    avatar_text: 'B',
    avatar_bg: 'bg-[#181B20]',
    is_admin: false,
  },
  {
    username: 'admin',
    display_name: 'Security Administrator',
    role: 'Chief Quantum Security Officer',
    node_id: '#000001',
    avatar_text: 'AD',
    avatar_bg: 'bg-[#181B20]',
    is_admin: true,
  },
  {
    username: 'charlie',
    display_name: 'Charlie (Relay Q2)',
    role: 'Quantum Router Q2',
    node_id: '#881029',
    avatar_text: 'C',
    avatar_bg: 'bg-[#2D3748]',
    is_admin: false,
  },
  {
    username: 'eve',
    display_name: 'Eve (MitM Simulator)',
    role: 'Intercept-Resend Attacker',
    node_id: '#666999',
    avatar_text: 'EV',
    avatar_bg: 'bg-terracotta-700',
    is_admin: false,
  },
];

export default function AuthPage({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('demo'); // 'demo' | 'login' | 'register'
  const [usersList, setUsersList] = useState(DEFAULT_DEMO_USERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state & validation
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});

  // Register form state & validation
  const [regUsername, setRegUsername] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Receiver Node Beta');
  const [regErrors, setRegErrors] = useState({});

  const USERNAME_REGEX = /^[a-zA-Z0-9_-]{2,30}$/;

  useEffect(() => {
    const load = async () => {
      try {
        const users = await fetchUsers();
        if (users && users.length > 0) {
          setUsersList(users);
        }
      } catch (err) {
        console.error('Failed to load users for demo login:', err);
      }
    };
    load();
  }, []);

  const validateLoginForm = () => {
    const errors = {};
    const u = loginUsername.trim();
    if (!u) {
      errors.username = 'Node username is required.';
    } else if (!USERNAME_REGEX.test(u)) {
      errors.username = 'Username must be 2-30 characters (letters, numbers, _ or -).';
    }

    if (!loginPassword) {
      errors.password = 'Password is required.';
    } else if (loginPassword.length < 2) {
      errors.password = 'Password must be at least 2 characters.';
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors = {};
    const u = regUsername.trim();
    if (!u) {
      errors.username = 'Node username is required.';
    } else if (!USERNAME_REGEX.test(u)) {
      errors.username = 'Username must be 2-30 characters (letters, numbers, _ or - only).';
    }

    const d = regDisplayName.trim();
    if (d && d.length > 50) {
      errors.displayName = 'Display name must not exceed 50 characters.';
    }

    if (!regPassword) {
      errors.password = 'Password is required.';
    } else if (regPassword.length < 3) {
      errors.password = 'Password must be at least 3 characters.';
    } else if (regPassword.length > 64) {
      errors.password = 'Password cannot exceed 64 characters.';
    }

    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateLoginForm()) return;

    setLoading(true);
    try {
      const res = await loginUser(loginUsername.trim().toLowerCase(), loginPassword);
      if (res.user) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateRegisterForm()) return;

    setLoading(true);
    try {
      const res = await registerUser({
        username: regUsername.trim().toLowerCase(),
        password: regPassword,
        display_name: regDisplayName.trim() || regUsername.trim().toUpperCase(),
        role: regRole,
      });
      if (res.user) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Node username may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = (user) => {
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen w-full bg-[#FBF9F5] flex flex-col items-center justify-center p-4 md:p-8 relative font-sans text-[#181B20] select-none">
      {/* Subtle Sentinel header background border */}
      <div className="w-full max-w-xl space-y-6 z-10">
        {/* Brand Header in QDS Sentinel Style */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#181B20] text-cream-100 shadow-md text-2xl mb-1 border border-[#2D3139]">
            <svg className="w-7 h-7 text-cream-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#181B20] tracking-tight">
            QDS Sentinel Messenger
          </h1>
          <p className="text-xs md:text-sm text-[#797167] font-mono">
            GHZ / EPR Entangled · Quantum Digital Signature Network
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#FCFBF8] border border-[#DDD5C8] rounded-2xl shadow-xl p-6 md:p-8 space-y-6 shadcn-dialog-content">
          {/* Navigation Tabs */}
          <div className="flex border-b border-[#EAE3DA] pb-2 text-xs font-mono gap-1">
            <button
              onClick={() => { setActiveTab('demo'); setError(''); setLoginErrors({}); setRegErrors({}); }}
              className={`flex-1 py-2 text-center border-b-2 font-semibold shadcn-btn rounded-t-lg ${
                activeTab === 'demo'
                  ? 'border-terracotta-600 text-terracotta-600 bg-terracotta-50/40'
                  : 'border-transparent text-[#797167] hover:text-[#181B20] hover:bg-[#F4EFEA]/60'
              }`}
            >
              1-Click Demo Nodes
            </button>
            <button
              onClick={() => { setActiveTab('login'); setError(''); setLoginErrors({}); setRegErrors({}); }}
              className={`flex-1 py-2 text-center border-b-2 font-semibold shadcn-btn rounded-t-lg ${
                activeTab === 'login'
                  ? 'border-terracotta-600 text-terracotta-600 bg-terracotta-50/40'
                  : 'border-transparent text-[#797167] hover:text-[#181B20] hover:bg-[#F4EFEA]/60'
              }`}
            >
              Node Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(''); setLoginErrors({}); setRegErrors({}); }}
              className={`flex-1 py-2 text-center border-b-2 font-semibold shadcn-btn rounded-t-lg ${
                activeTab === 'register'
                  ? 'border-terracotta-600 text-terracotta-600 bg-terracotta-50/40'
                  : 'border-transparent text-[#797167] hover:text-[#181B20] hover:bg-[#F4EFEA]/60'
              }`}
            >
              Register New Node
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-terracotta-50 border border-terracotta-200 rounded-xl text-terracotta-800 text-xs font-mono flex items-center gap-2 shadcn-slide-in">
              <svg className="w-4 h-4 text-terracotta-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* ── TAB 1: QUICK DEMO ACCESS ── */}
          {activeTab === 'demo' && (
            <div className="space-y-4 shadcn-slide-in">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#797167] font-mono">
                  Select active quantum identity to connect:
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forest-50 text-forest-800 border border-forest-200 font-semibold shadcn-pop-in">
                  Zero Setup
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {usersList.map((u) => {
                  const isAdmin = u.is_admin || u.username === 'admin' || u.role?.toLowerCase().includes('admin');
                  const isEve = u.username === 'eve';

                  return (
                    <div
                      key={u.username}
                      onClick={() => handleQuickDemoSelect(u)}
                      className="p-3.5 bg-[#F7F4EF] hover:bg-[#EFEAE2] border border-[#DDD5C8] hover:border-terracotta-600 rounded-xl cursor-pointer shadcn-card group flex items-center justify-between shadow-xs hover:shadow-md select-none transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs text-cream-100 shrink-0 group-hover:scale-110 group-hover:shadow-xs transition-transform duration-150 ${
                          isEve ? 'bg-terracotta-700' : isAdmin ? 'bg-[#181B20]' : 'bg-[#2D3748]'
                        }`}>
                          {u.avatar_text || u.username[0].toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-xs font-semibold text-[#181B20] group-hover:text-terracotta-600 transition-colors truncate">
                              {u.display_name}
                            </span>
                            {isAdmin && (
                              <span className="text-[8px] font-mono px-1 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-[#797167] group-hover:text-[#554F46] truncate transition-colors">
                            @{u.username} · {u.role}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-[#797167] group-hover:text-terracotta-600 group-hover:translate-x-1 transition-all duration-150 ml-2 font-bold">
                        →
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB 2: SIGN IN ── */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 shadcn-slide-in" noValidate>
              <div>
                <label className="block text-xs font-mono text-[#554F46] mb-1.5">
                  Node Username / Handle *
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={loginUsername}
                  onChange={(e) => {
                    setLoginUsername(e.target.value);
                    if (loginErrors.username) setLoginErrors((prev) => ({ ...prev, username: null }));
                  }}
                  placeholder="e.g. alice, bob, admin"
                  className={`w-full bg-[#F4EFEA] border rounded-xl p-3 text-xs text-[#181B20] focus:ring-2 font-mono placeholder-[#9C9488] transition duration-150 ${
                    loginErrors.username
                      ? 'border-terracotta-500 focus:border-terracotta-600 focus:ring-terracotta-100'
                      : 'border-[#DDD5C8] hover:border-[#B5AA9A] focus:ring-black/10 focus:border-[#181B20]'
                  }`}
                />
                {loginErrors.username && (
                  <p className="text-[11px] font-mono text-terracotta-700 mt-1 shadcn-slide-in">
                    {loginErrors.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono text-[#554F46] mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  maxLength={64}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (loginErrors.password) setLoginErrors((prev) => ({ ...prev, password: null }));
                  }}
                  placeholder="••••••••"
                  className={`w-full bg-[#F4EFEA] border rounded-xl p-3 text-xs text-[#181B20] focus:ring-2 transition duration-150 ${
                    loginErrors.password
                      ? 'border-terracotta-500 focus:border-terracotta-600 focus:ring-terracotta-100'
                      : 'border-[#DDD5C8] hover:border-[#B5AA9A] focus:ring-black/10 focus:border-[#181B20]'
                  }`}
                />
                {loginErrors.password && (
                  <p className="text-[11px] font-mono text-terracotta-700 mt-1 shadcn-slide-in">
                    {loginErrors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#181B20] hover:bg-black hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 font-mono shadcn-btn"
              >
                {loading ? 'Authenticating Quantum Keys...' : 'Sign In to Quantum Mesh ⟶'}
              </button>
            </form>
          )}

          {/* ── TAB 3: REGISTER NEW NODE ── */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 shadcn-slide-in" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#554F46] mb-1">
                    Node Username / ID *
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    value={regUsername}
                    onChange={(e) => {
                      setRegUsername(e.target.value);
                      if (regErrors.username) setRegErrors((prev) => ({ ...prev, username: null }));
                    }}
                    placeholder="e.g. charlie, node_gamma"
                    className={`w-full bg-[#F4EFEA] border rounded-xl p-2.5 text-xs text-[#181B20] focus:ring-2 font-mono placeholder-[#9C9488] transition duration-150 ${
                      regErrors.username
                        ? 'border-terracotta-500 focus:border-terracotta-600 focus:ring-terracotta-100'
                        : 'border-[#DDD5C8] hover:border-[#B5AA9A] focus:ring-black/10 focus:border-[#181B20]'
                    }`}
                  />
                  {regErrors.username && (
                    <p className="text-[10px] font-mono text-terracotta-700 mt-1 shadcn-slide-in">
                      {regErrors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#554F46] mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={regDisplayName}
                    onChange={(e) => {
                      setRegDisplayName(e.target.value);
                      if (regErrors.displayName) setRegErrors((prev) => ({ ...prev, displayName: null }));
                    }}
                    placeholder="e.g. Charlie Kovacs"
                    className={`w-full bg-[#F4EFEA] border rounded-xl p-2.5 text-xs text-[#181B20] focus:ring-2 placeholder-[#9C9488] transition duration-150 ${
                      regErrors.displayName
                        ? 'border-terracotta-500 focus:border-terracotta-600 focus:ring-terracotta-100'
                        : 'border-[#DDD5C8] hover:border-[#B5AA9A] focus:ring-black/10 focus:border-[#181B20]'
                    }`}
                  />
                  {regErrors.displayName && (
                    <p className="text-[10px] font-mono text-terracotta-700 mt-1 shadcn-slide-in">
                      {regErrors.displayName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#554F46] mb-1">
                  Node Role in Quantum Network *
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full bg-[#F4EFEA] border border-[#DDD5C8] hover:border-[#B5AA9A] rounded-xl p-2.5 text-xs text-[#181B20] focus:ring-2 focus:ring-black/10 focus:border-[#181B20] font-mono transition duration-150 cursor-pointer"
                >
                  <option value="Signer Node Alpha">Signer Node (Alice Alpha - Transmitter)</option>
                  <option value="Receiver Node Beta">Receiver Node (Bob Beta - Verifier)</option>
                  <option value="Quantum Router / Relay">Quantum Router / QuARC Relay (Q1 / Q2)</option>
                  <option value="Security Administrator">Security Administrator (Admin Access)</option>
                  <option value="Adversary Probe">Adversary Simulator (Eve / Beam Splitter)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#554F46] mb-1">
                  Secret Key / Password *
                </label>
                <input
                  type="password"
                  maxLength={64}
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    if (regErrors.password) setRegErrors((prev) => ({ ...prev, password: null }));
                  }}
                  placeholder="Set node access key (min 3 chars)..."
                  className={`w-full bg-[#F4EFEA] border rounded-xl p-2.5 text-xs text-[#181B20] focus:ring-2 transition duration-150 ${
                    regErrors.password
                      ? 'border-terracotta-500 focus:border-terracotta-600 focus:ring-terracotta-100'
                      : 'border-[#DDD5C8] hover:border-[#B5AA9A] focus:ring-black/10 focus:border-[#181B20]'
                  }`}
                />
                {regErrors.password && (
                  <p className="text-[10px] font-mono text-terracotta-700 mt-1 shadcn-slide-in">
                    {regErrors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-terracotta-600 hover:bg-terracotta-700 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 font-mono shadcn-btn"
              >
                {loading ? 'Initializing Node EPR Pair Keys...' : 'Register & Join Network ⟶'}
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] font-mono text-[#797167] flex items-center justify-center gap-2">
          <span>Bell State & GHZ Protected</span>
          <span>·</span>
          <span>Hoeffding Threshold: 14.0%</span>
          <span>·</span>
          <span>CHSH S ≥ 2.0</span>
        </div>

      </div>
    </div>
  );
}
