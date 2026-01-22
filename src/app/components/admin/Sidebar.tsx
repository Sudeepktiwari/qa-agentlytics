import React from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Database,
  FileText,
  Users,
  Settings,
  Cpu,
  CreditCard,
  BookOpen,
  Zap,
  LogOut,
  GraduationCap,
  X,
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigate,
  onLogout,
  isOpen,
  onClose,
}) => {
  const menuGroups = [
    {
      title: "Core",
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "qualification", label: "Qualification", icon: GraduationCap },
        // { id: "live-preview", label: "Live Preview", icon: MessageSquare },
      ],
    },
    {
      title: "Data",
      items: [
        { id: "knowledge", label: "Knowledge Base", icon: Database },
        // { id: "documents", label: "Documents", icon: FileText },
      ],
    },
    {
      title: "Customers",
      items: [
        { id: "leads", label: "Leads", icon: Users },
        { id: "bookings", label: "Bookings", icon: BookOpen },
      ],
    },
    {
      title: "Admin",
      items: [
        { id: "configuration", label: "Configuration", icon: Settings },
        // { id: "testing", label: "Testing", icon: Cpu },
        { id: "subscription", label: "Subscription", icon: CreditCard },
      ],
    },
    {
      title: "More",
      items: [
        // { id: "customers", label: "Customers", icon: Users },
        { id: "onboarding", label: "Onboarding", icon: Zap },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-[90] md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`
        fixed inset-y-0 left-0 z-[100] w-64 max-w-[85vw] h-full bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-out shadow-2xl md:shadow-none
        md:translate-x-0 md:static md:shrink-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shadow-blue-200">
              A
            </div>
            <span className="font-semibold text-slate-800 text-lg tracking-tight">
              Admin Panel
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
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
                      onClick={() => {
                        onNavigate(item.id);
                        onClose(); // Close sidebar on mobile when item clicked
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={
                          isActive ? "text-blue-600" : "text-slate-400"
                        }
                      />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
