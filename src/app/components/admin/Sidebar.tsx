import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Database, 
  FileText, 
  Users, 
  Settings, 
  Cpu, 
  BookOpen,
  Zap,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onNavigate, onLogout }) => {
  const menuGroups = [
    {
      title: 'Core',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'live-preview', label: 'Live Preview', icon: MessageSquare },
      ]
    },
    {
      title: 'Data',
      items: [
        { id: 'knowledge', label: 'Knowledge Base', icon: Database },
        { id: 'documents', label: 'Documents', icon: FileText },
      ]
    },
    {
      title: 'Engage',
      items: [
        { id: 'leads', label: 'Leads', icon: Users },
        { id: 'bookings', label: 'Bookings', icon: BookOpen },
      ]
    },
    {
      title: 'Admin',
      items: [
        { id: 'configuration', label: 'Configuration', icon: Settings },
        { id: 'testing', label: 'Testing', icon: Cpu },
      ]
    },
    {
      title: 'More',
      items: [
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'onboarding', label: 'Onboarding', icon: Zap },
      ]
    }
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0 shrink-0">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
             A
           </div>
           <span className="font-semibold text-slate-800 text-lg">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {menuGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
              {group.title}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
           <LogOut size={18} />
           <span>Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
