
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { KeyRound as UsersRound, GanttChartSquare, Users, Bot, BarChart3, Users2, HeartHandshake as Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const crmTabs = [
    { value: 'pipeline', label: 'Pipeline', path: '/crm/pipeline', icon: GanttChartSquare },
    { value: 'contacts', label: 'Contatos', path: '/crm/contacts', icon: Users },
    { value: 'relationship', label: 'Relacionamento', path: '/crm/relationship', icon: Handshake },
    { value: 'automations', label: 'Automações', path: '/crm/automations', icon: Bot },
    { value: 'reports', label: 'Relatórios', path: '/crm/reports', icon: BarChart3 },
    { value: 'team', label: 'Equipe', path: '/crm/team', icon: Users2 },
];

const CRM = () => {
    const location = useLocation();

    const getCurrentTab = () => {
        const currentPath = location.pathname;
        const currentTab = crmTabs.find(tab => currentPath.startsWith(tab.path));
        return currentTab ? currentTab.value : 'pipeline';
    };
    
    const activeTab = getCurrentTab();

    return (
        <>
            <Helmet>
                <title>CRM - Costa Lavos</title>
                <meta name="description" content="Gerencie seus contatos, pipeline de vendas, automações e muito mais." />
            </Helmet>
            <div className="flex flex-col lg:flex-row h-full gap-8 p-1 -m-1">
                <aside className="lg:w-60 xl:w-64 shrink-0">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl shadow-inner">
                            <UsersRound className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                                CRM
                            </h1>
                            <p className="text-sm text-muted-foreground">Central de Vendas</p>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-2">
                        {crmTabs.map(tab => (
                            <Link
                                key={tab.value}
                                to={tab.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 transform hover:-translate-y-0.5",
                                    activeTab === tab.value
                                        ? "bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <tab.icon className="h-5 w-5" />
                                {tab.label}
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1 min-w-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-2xl p-6 border">
                     <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default CRM;
