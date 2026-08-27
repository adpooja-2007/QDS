import {
  Activity,
  KeyRound,
  ShieldAlert,
  Search,
  Network,
  Database,
  CheckCircle2,
  Cpu,
  Zap,
  BarChart3,
  Home,
  LayoutGrid,
} from 'lucide-react';

export type SentinelPage =
  | 'home'
  | 'demonstration'
  | 'monitoring'
  | 'dashboard'
  | 'quantum-signature'
  | 'threat-detection'
  | 'investigations'
  | 'quantum-network'
  | 'sessions';

interface SidebarProps {
  activePage: SentinelPage;
  onNavigate: (page: SentinelPage) => void;
}

interface NavItemConfig {
  id: SentinelPage;
  label: string;
  icon: React.ElementType;
  symbol: string;
}


const NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'home',
    label: 'HOME PORTAL',
    icon: LayoutGrid,
    symbol: '',
  },
  {
    id: 'demonstration',
    label: 'DEMONSTRATION (A ↔ B)',
    icon: Zap,
    symbol: '',
  },
  {
    id: 'monitoring',
    label: 'SOC MONITOR & LOGS',
    icon: BarChart3,
    symbol: '',
  },

  {
    id: 'quantum-signature',
    label: 'QUANTUM SIGNATURE',
    icon: KeyRound,
    symbol: '',
  },
  {
    id: 'threat-detection',
    label: 'THREAT DETECTION',
    icon: ShieldAlert,
    symbol: '',
  },
  {
    id: 'investigations',
    label: 'INVESTIGATIONS',
    icon: Search,
    symbol: '',
  },
  {
    id: 'quantum-network',
    label: 'QUANTUM NETWORK',
    icon: Network,
    symbol: '',
  },
  {
    id: 'sessions',
    label: 'SESSION EXPLORER',
    icon: Database,
    symbol: '',
  },
];


export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  return (
    <aside className="w-[240px] min-w-[240px] h-screen bg-white border-r border-[#E4E7EC] flex flex-col sticky top-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#EEF0F5]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#4169D8] flex items-center justify-center text-white shadow-sm">
            <Cpu size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-sans font-bold text-[14px] tracking-tight text-[#182033] leading-none">
              QDS • SENTINEL
            </div>
            <div className="text-[10px] text-[#667085] font-medium tracking-wide uppercase mt-1">
              Quantum Security SOC
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="px-3 py-4 flex-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-[#98A2B3] tracking-wider uppercase px-3 mb-2 font-mono">
          Security Operations
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[12px] font-medium transition-all text-left group ${
                  isActive
                    ? 'bg-[#EEF3FF] text-[#4169D8] font-semibold border-l-2 border-[#4169D8] pl-2.5 shadow-sm'
                    : 'text-[#475467] hover:bg-[#F9FAFB] hover:text-[#182033]'
                }`}
              >
                <span className="text-[13px] opacity-80 group-hover:opacity-100 font-mono">
                  {item.symbol}
                </span>
                <span className="tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

