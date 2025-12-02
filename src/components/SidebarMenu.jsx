import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { modulesStructure } from '@/config/modulesStructure';
import { getIcon } from '@/utils/iconMap';
import { ChevronRight, ChevronDown, LogOut, Menu, UserCircle, AlertTriangle, Wrench } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useModulesValidation } from '@/hooks/useModulesValidation';
import { getModuleWithDefaults, getGroupWithDefaults, getPageWithDefaults } from '@/lib/moduleDefaults';
import { getMaintenanceInfo } from '@/utils/maintenance';

// Memoized Icon Component
const MenuIcon = React.memo(({ icon, className, color }) => {
  if (!icon) return null;
  const IconComponent = typeof icon === 'string' ? getIcon(icon) : icon;
  if (!IconComponent) return null;
  return <IconComponent className={className} style={color ? { color } : {}} />;
});

const MenuItem = ({ item, isActive, isCollapsed, moduleId }) => {
  const safeItem = getPageWithDefaults(item);
  const pageSlug = safeItem.path || safeItem.id;
  const fullPath = pageSlug.startsWith('/') ? pageSlug : `/${moduleId}/${pageSlug}`;

  return (
    <Link
      to={fullPath}
      className={cn(
        "flex items-center gap-3 px-3 py-2 mx-2 rounded-md text-sm font-medium transition-all duration-200 relative group",
        isActive 
          ? "bg-[#F5E6D3] text-[#6B2C2C] shadow-sm" 
          : "text-white/80 hover:bg-[#7D3E3E] hover:text-white"
      )}
      title={isCollapsed ? safeItem.label : undefined}
    >
      <MenuIcon 
        icon={safeItem.icon} 
        className={cn("h-4 w-4 transition-colors", isActive ? "text-[#6B2C2C]" : "text-white/70 group-hover:text-white")} 
      />
      
      {!isCollapsed && <span>{safeItem.label}</span>}
    </Link>
  );
};

const MenuGroup = ({ label, items, currentPath, isCollapsed, moduleId }) => {
  const [isOpen, setIsOpen] = useState(true); 
  const safeItems = useMemo(() => (items || []).map(getPageWithDefaults), [items]);

  // Auto-expand if child is active
  useEffect(() => {
    const hasActiveChild = safeItems.some(p => {
      const pageSlug = p.path || p.id;
      return currentPath.includes(pageSlug);
    });
    if (hasActiveChild) setIsOpen(true);
  }, [safeItems, currentPath]);

  if (isCollapsed) return null;
  if (safeItems.length === 0) return null;

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-1.5 text-xs font-semibold text-[#F5E6D3]/60 uppercase tracking-wider hover:text-[#F5E6D3] transition-colors"
      >
        <span>{label}</span>
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      
      {isOpen && (
        <div className="mt-1 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
          {safeItems.map(page => {
             const pageSlug = page.path || page.id;
             const isActive = currentPath.includes(pageSlug);
             return (
              <MenuItem 
                key={page.id} 
                item={page} 
                isActive={isActive} 
                isCollapsed={false}
                moduleId={moduleId}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const SidebarMenu = ({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { isValid } = useModulesValidation();
  // Safe maintenance info retrieval
  const maintenanceInfo = getMaintenanceInfo ? getMaintenanceInfo() : { isEnabled: false };

  // Logo Costa Lavos
  const logoUrl = "https://horizons-cdn.hostinger.com/af07f265-a066-448a-97b1-ed36097a0659/57dbfe1751f3624beca74d6a94873b8e.jpg";

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-[#6B2C2C] border-r border-[#7D3E3E] transition-all duration-300 ease-in-out flex flex-col shadow-xl",
          isCollapsed ? "w-[70px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* HEADER WITH LOGO */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-[#7D3E3E] shrink-0 bg-[#6B2C2C]">
          <div className={cn("flex items-center gap-3 w-full", isCollapsed && "justify-center")}>
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0 p-1">
               <img src={logoUrl} alt="Costa Lavos Logo" className="h-full w-full object-contain" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-none min-w-0 overflow-hidden">
                <span className="font-bold text-lg text-white tracking-tight whitespace-nowrap">Costa Lavos 360</span>
                <span className="text-[10px] font-medium text-[#F5E6D3]/70 uppercase tracking-widest mt-1 truncate">Enterprise System</span>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex h-8 w-8 text-[#F5E6D3] hover:bg-[#7D3E3E] hover:text-white"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Validation Error Warning (Dev Only) */}
        {!isValid && !isCollapsed && process.env.NODE_ENV === 'development' && (
          <div className="px-4 py-2 m-2 bg-red-900/50 border border-red-400 rounded-md text-xs text-red-200 flex gap-2 items-start">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <strong>Configuração Inválida</strong>
            </div>
          </div>
        )}

        {/* SCROLLABLE MENU AREA */}
        <ScrollArea className="flex-1 py-4">
          <div className="space-y-6">
            {modulesStructure.map((rawModule) => {
              const module = getModuleWithDefaults(rawModule);
              const groups = (module.groups || []).map(getGroupWithDefaults);
              
              // Flatten pages for collapsed view
              const allPages = (module.pages || []).concat(groups.flatMap(g => (g.pages || g.items || []).map(getPageWithDefaults)));

              if (allPages.length === 0) return null;

              return (
                <div key={module.id}>
                  {/* Module Header */}
                  <div 
                    className={cn(
                      "flex items-center gap-2 px-4 mb-2",
                      isCollapsed ? "justify-center" : ""
                    )}
                  >
                    {!isCollapsed ? (
                      <div className="flex items-center w-full">
                        <div className="p-1 rounded bg-[#7D3E3E]/50 mr-2">
                           <MenuIcon icon={module.icon} className="h-3 w-3 text-[#F5E6D3]" />
                        </div>
                        <h3 className="text-xs font-bold text-white/90 uppercase tracking-wider">{module.label}</h3>
                        <Separator className="flex-1 ml-2 opacity-20 bg-[#F5E6D3]" />
                      </div>
                    ) : (
                      <Separator className="w-8 opacity-20 bg-[#F5E6D3] my-2" />
                    )}
                  </div>

                  {/* Content */}
                  {isCollapsed ? (
                    allPages.map(page => {
                      const pageSlug = page.path || page.id;
                      const isActive = location.pathname.includes(pageSlug);
                      return (
                        <MenuItem 
                          key={page.id} 
                          item={page} 
                          isActive={isActive} 
                          isCollapsed={true}
                          moduleId={module.id}
                        />
                      );
                    })
                  ) : (
                    groups.map((group) => (
                      <MenuGroup 
                        key={group.id}
                        label={group.label}
                        items={group.pages || group.items}
                        currentPath={location.pathname}
                        isCollapsed={false}
                        moduleId={module.id}
                      />
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* FOOTER with User & Maintenance Status */}
        <div className="border-t border-[#7D3E3E] p-4 bg-[#5c2424] shrink-0">
          
          {/* Maintenance Badge (Discreet) */}
          {maintenanceInfo.isEnabled && !isCollapsed && (
             <div className="mb-3 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded flex items-center gap-2 text-amber-200 text-xs animate-pulse shadow-sm">
                <Wrench className="h-3 w-3" />
                <span className="font-semibold">Modo Manutenção</span>
             </div>
          )}

          <div className="flex items-center justify-between gap-3">
            {!isCollapsed && (
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-[#7D3E3E] flex items-center justify-center shrink-0 text-[#F5E6D3] shadow-sm border border-white/10">
                  <UserCircle className="h-5 w-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-white truncate">
                    {user?.email || 'Usuário'}
                  </span>
                  <span className="text-[10px] text-white/60 truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    Online
                  </span>
                </div>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={signOut}
              className="text-[#F5E6D3]/70 hover:text-white hover:bg-[#7D3E3E] shrink-0 h-9 w-9 rounded-full"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarMenu;