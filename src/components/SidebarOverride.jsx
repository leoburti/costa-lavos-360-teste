import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { menuStructure } from '@/config/menuStructure';

// Safe Permission Filtering
const filterMenuByPermissions = (menu, user) => {
    if (!user) return [];
    
    const role = user.role;
    const canAccessCrm = user.can_access_crm; 
    const modulePermissions = user.module_permissions || user.permissions || {};
    
    const isAdmin = ['admin', 'nivel 1', 'nível 1', 'nivel 5', 'nível 5'].includes(role?.toLowerCase());

    const filter = (items) => items.map(item => {
        if (isAdmin) {
            if (item.subItems) {
                const accessibleSubItems = filter(item.subItems);
                return { ...item, subItems: accessibleSubItems };
            }
            return item;
        }

        let moduleMatch = false;
        if (!item.moduleId) {
            moduleMatch = true;
        } else {
            if (Array.isArray(modulePermissions)) {
                moduleMatch = modulePermissions.includes(item.moduleId);
            } else {
                moduleMatch = !!modulePermissions[item.moduleId];
            }
        }

        const crmAccessMatch = !item.crmRequired || (canAccessCrm === true);

        if (!moduleMatch || (item.crmRequired && !crmAccessMatch)) return null;

        if (item.subItems) {
            const accessibleSubItems = filter(item.subItems);
            if (accessibleSubItems.length > 0) {
                return { ...item, subItems: accessibleSubItems };
            }
            return null;
        }
        
        return item;
    }).filter(Boolean);

    return filter(menu);
};

const SidebarItem = ({ item, isCollapsed, isActive, depth = 0, openGroups, toggleGroup }) => {
    const Icon = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isOpen = openGroups.includes(item.id);

    if (isCollapsed && depth === 0) {
        if (hasSubItems) {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-center h-10 px-2 mb-1 hover:bg-[#7D3E3E] text-white/80 hover:text-white",
                                isActive && "bg-[#F5E6D3] text-[#6B2C2C] hover:bg-[#F5E6D3] hover:text-[#6B2C2C]"
                            )}
                        >
                            {Icon && <Icon className="h-5 w-5" />}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" className="w-56 bg-[#6B2C2C] border-[#7D3E3E] text-white ml-2">
                        <DropdownMenuLabel className="text-white">{item.label}</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[#7D3E3E]" />
                        {item.subItems.map((subItem) => (
                            <SidebarSubItemDropdown key={subItem.id} item={subItem} />
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }

        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <Link
                        to={item.path}
                        className={cn(
                            "flex h-10 w-full items-center justify-center rounded-md mb-1 transition-colors hover:bg-[#7D3E3E] text-white/80 hover:text-white",
                            isActive && "bg-[#F5E6D3] text-[#6B2C2C] hover:bg-[#F5E6D3] hover:text-[#6B2C2C]"
                        )}
                    >
                        {Icon && <Icon className="h-5 w-5" />}
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#6B2C2C] text-white border-[#7D3E3E] ml-2">
                    {item.label}
                </TooltipContent>
            </Tooltip>
        );
    }

    if (hasSubItems) {
        return (
            <Collapsible open={isOpen} onOpenChange={() => toggleGroup(item.id)} className="w-full">
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-between h-10 px-3 mb-1 hover:bg-[#7D3E3E] text-white/80 hover:text-white font-normal",
                            isActive && "text-white font-medium"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            {Icon && <Icon className="h-5 w-5 shrink-0 text-[#F5E6D3]" />}
                            <span className="truncate">{item.label}</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    {item.subItems.map((subItem) => (
                        <SidebarItem
                            key={subItem.id}
                            item={subItem}
                            isCollapsed={isCollapsed}
                            isActive={false}
                            depth={depth + 1}
                            openGroups={openGroups}
                            toggleGroup={toggleGroup}
                        />
                    ))}
                </CollapsibleContent>
            </Collapsible>
        );
    }

    return (
        <Link
            to={item.path}
            className={cn(
                "flex items-center gap-3 h-10 px-3 rounded-md mb-1 transition-colors hover:bg-[#7D3E3E] text-white/80 hover:text-white",
                isActive && "bg-[#F5E6D3] text-[#6B2C2C] hover:bg-[#F5E6D3] hover:text-[#6B2C2C] font-medium",
                depth > 0 && "text-sm"
            )}
        >
            {Icon && <Icon className={cn("h-5 w-5 shrink-0", depth > 0 && "h-4 w-4", !isActive && "text-[#F5E6D3]")} />}
            <span className="truncate">{item.label}</span>
        </Link>
    );
};

const SidebarSubItemDropdown = ({ item }) => {
    if (item.subItems && item.subItems.length > 0) {
        return (
            <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-white/80 focus:text-white focus:bg-[#7D3E3E] cursor-pointer">
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    <span>{item.label}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-[#6B2C2C] border-[#7D3E3E] text-white">
                    {item.subItems.map(sub => (
                        <SidebarSubItemDropdown key={sub.id} item={sub} />
                    ))}
                </DropdownMenuSubContent>
            </DropdownMenuSub>
        );
    }

    return (
        <DropdownMenuItem asChild>
            <Link to={item.path} className="cursor-pointer text-white/80 focus:text-white focus:bg-[#7D3E3E]">
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                <span>{item.label}</span>
            </Link>
        </DropdownMenuItem>
    );
};

const SidebarOverride = ({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
    const location = useLocation();
    const { user, loading } = useAuth();
    const [openGroups, setOpenGroups] = useState([]);

    const menuItems = useMemo(() => {
        if (loading && !user) return [];
        try {
            return filterMenuByPermissions(menuStructure, user || {});
        } catch (error) {
            console.error("Error filtering menu items:", error);
            return [];
        }
    }, [user, loading]);

    const toggleGroup = (id) => {
        setOpenGroups(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    const isPathActive = (itemPath) => {
        if (!itemPath) return false;
        if (itemPath === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(itemPath);
    };

    const isGroupActive = (item) => {
        if (item.path && isPathActive(item.path)) return true;
        if (item.subItems) {
            return item.subItems.some(sub => isGroupActive(sub));
        }
        return false;
    };

    const displayName = user?.fullName || user?.email || 'Usuário';
    const displayRole = user?.role || '...';
    const displayInitial = displayName.charAt(0).toUpperCase();

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#6B2C2C] text-white border-r border-[#7D3E3E]">
            <div className={cn(
                "flex items-center h-16 px-4 border-b border-[#7D3E3E] transition-all duration-300 shrink-0",
                isCollapsed ? "justify-center" : "justify-between"
            )}>
                {!isCollapsed ? (
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex flex-col">
                            <span className="font-bold text-white text-sm leading-tight whitespace-nowrap">Costa Lavos</span>
                            <span className="text-[10px] text-[#F5E6D3]/80 leading-tight">360° Enterprise</span>
                        </div>
                    </div>
                ) : (
                    <span className="font-bold text-white text-lg">CL</span>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex h-8 w-8 text-[#F5E6D3] hover:text-white hover:bg-[#7D3E3E]"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <ScrollArea className="flex-1 py-4">
                <div className="px-2 space-y-1">
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.id}
                            item={item}
                            isCollapsed={isCollapsed}
                            isActive={isGroupActive(item)}
                            openGroups={openGroups}
                            toggleGroup={toggleGroup}
                        />
                    ))}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-[#7D3E3E] mt-auto bg-[#6B2C2C]">
                 {!isCollapsed ? (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#F5E6D3]/20 flex items-center justify-center text-[#F5E6D3] border border-[#F5E6D3]/30 shrink-0">
                            <span className="text-xs font-bold">
                                {displayInitial}
                            </span>
                        </div>
                        <div className="flex flex-col overflow-hidden min-w-0">
                            <span className="text-sm font-medium text-white truncate" title={displayName}>
                                {displayName}
                            </span>
                            <span className="text-xs text-[#F5E6D3]/80 truncate" title={displayRole}>
                                {displayRole}
                            </span>
                        </div>
                    </div>
                 ) : (
                    <div className="flex justify-center">
                        <div className="h-8 w-8 rounded-full bg-[#F5E6D3]/20 flex items-center justify-center text-[#F5E6D3] border border-[#F5E6D3]/30 shrink-0" title={`${displayName} (${displayRole})`}>
                            <span className="text-xs font-bold">
                                {displayInitial}
                            </span>
                        </div>
                    </div>
                 )}
            </div>
        </div>
    );

    return (
        <>
            <aside
                className={cn(
                    "hidden md:flex flex-col border-r border-[#7D3E3E] bg-[#6B2C2C] transition-all duration-300 ease-in-out z-40 h-screen sticky top-0",
                    isCollapsed ? "w-[70px]" : "w-64"
                )}
            >
                <SidebarContent />
            </aside>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="p-0 w-72 bg-[#6B2C2C] border-r-[#7D3E3E] text-white">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </>
    );
};

export default SidebarOverride;