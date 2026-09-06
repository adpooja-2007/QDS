import React, { useState, useEffect } from 'react';
import { fetchUsers, loginUser, registerUser } from '../api';

export default function AuthPage({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('demo'); // 'demo' | 'login' | 'register'
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Receiver Node Beta');

  useEffect(() => {
    const load = async () => {
      try {
        const users = await fetchUsers();
        setUsersList(users);
      } catch (err) {
        console.error('Failed to load users for demo login:', err);
      }
    };
    load();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setError('Please provide both node username and password.');
      return;
    }
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
    if (!regUsername.trim() || !regPassword.trim()) {
      setError('Node username and password are required.');
      return;
    }
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
            ⚛
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#181B20] tracking-tight">
            QDS Sentinel Messenger
          </h1>
          <p className="text-xs md:text-sm text-[#797167] font-mono">
            GHZ / EPR Entangled · Quantum Digital Signature Network
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#FCFBF8] border border-[#DDD5C8] rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex border-b border-[#EAE3DA] pb-2 text-xs font-mono">
            <button
              onClick={() => { setActiveTab('demo'); setError(''); }}
              className={`flex-1 py-2 text-center border-b-2 font-semibold transition ${
                activeTab === 'demo'
                  ? 'border-terracotta-600 text-terracotta-600'
                  : 'border-transparent text-[#797167] hover:text-[#181B20]'
              }`}
            >
              1-Click Demo Nodes
            </button>
            <button
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`flex-1 py-2 text-center border-b-2 font-semibold transition ${
                activeTab === 'login'
                  ? 'border-terracotta-600 text-terracotta-600'
                  : 'border-transparent text-[#797167] hover:text-[#181B20]'
              }`}
            >
              Node Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(''); }}
              className={`flex-1 py-2 text-center border-b-2 font-semibold transition ${
                activeTab === 'register'
                  ? 'border-terracotta-600 text-terracotta-600'
                  : 'border-transparent text-[#797167] hover:text-[#181B20]'
              }`}
            >
              Register New Node
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-mono flex items-center gap-2">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── TAB 1: QUICK DEMO ACCESS ── */}
          {activeTab === 'demo' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#797167] font-mono">
                  Select active quantum identity to connect:
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
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
                      className="p-3.5 bg-[#F7F4EF] hover:bg-[#EAE3DA] border border-[#DDD5C8] hover:border-terracotta-600 rounded-xl cursor-pointer transition group flex items-center justify-between shadow-xs"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs text-cream-100 shrink-0 ${
                          isEve ? 'bg-terracotta-700' : isAdmin ? 'bg-[#181B20]' : 'bg-[#2D3748]'
                        }`}>
                          {u.avatar_text || u.username[0].toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-xs font-semibold text-[#181B20] group-hover:text-terracotta-600 transition truncate">
                              {u.display_name}
                            </span>
                            {isAdmin && (
                              <span className="text-[8px] font-mono px-1 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                                👑 ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-[#797167] truncate">
                            @{u.username} · {u.role}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-[#797167] group-hover:text-terracotta-600 transition ml-2 font-bold">
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
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#554F46] mb-1.5">
                  Node Username / Handle
                </label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="e.g. alice, bob, admin"
                  className="w-full bg-[#F4EFEA] border border-[#DDD5C8] rounded-xl p-3 text-xs text-[#181B20] focus:ring-1 focus:ring-black focus:border-black font-mono placeholder-[#9C9488]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#554F46] mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F4EFEA] border border-[#DDD5C8] rounded-xl p-3 text-xs text-[#181B20] focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#181B20] hover:bg-black text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 font-mono"
              >
                {loading ? 'Authenticating Quantum Keys...' : 'Sign In to Quantum Mesh ⟶'}
              </button>
            </form>
          )}

          {/* ── TAB 3: REGISTER NEW NODE ── */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#554F46] mb-1">
                    Node Username / ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. charlie, node_gamma"
                    className="w-full bg-[#F4EFEA] border border-[#DDD5C8] rounded-xl p-2.5 text-xs text-[#181B20] focus:ring-1 focus:ring-black focus:border-black font-mono placeholder-[#9C9488]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#554F46] mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={regDisplayName}
                    onChange={(e) => setRegDisplayName(e.target.value)}
                    placeholder="e.g. Charlie Kovacs"
                    className="w-full bg-[#F4EFEA] border border-[#DDD5C8] rounded-xl p-2.5 text-xs text-[#181B20] focus:ring-1 focus:ring-black focus:border-black placeholder-[#9C9488]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#554F46] mb-1">
                  Node Role in Quantum Network *
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full bg-[#F4EFEA] border border-[#DDD5C8] rounded-xl p-2.5 text-xs text-[#181B20] focus:ring-1 focus:ring-black focus:border-black font-mono"
                >
                  <option value="Signer Node Alpha">Signer Node (Alice Alpha - Transmitter)</option>
                  <option value="Receiver Node Beta">Receiver Node (Bob Beta - Verifier)</option>
                  <option value="Quantum Router / Relay">Quantum Router / QuARC Relay (Q1 / Q2)</option>
                  <option value="Security Administrator">Security Administrator (👑 Admin Access)</option>
                  <option value="Adversary Probe">Adversary Simulator (Eve / Beam Splitter)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#554F46] mb-1">
                  Secret Key / Password *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Set node access key..."
                  className="w-full bg-[#F4EFEA] border border-[#DDD5C8] rounded-xl p-2.5 text-xs text-[#181B20] focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-terracotta-600 hover:bg-terracotta-700 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 font-mono"
              >
                {loading ? 'Initializing Node EPR Pair Keys...' : 'Register & Join Network ⟶'}
              </button>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] font-mono text-[#797167] flex items-center justify-center gap-2">
          <span>🔒 Bell State & GHZ Protected</span>
          <span>·</span>
          <span>Hoeffding Threshold: 14.0%</span>
          <span>·</span>
          <span>CHSH S ≥ 2.0</span>
        </div>
      </div>
    </div>
  );
}
