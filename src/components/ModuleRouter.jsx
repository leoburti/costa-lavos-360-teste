
import React, { Suspense, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { modulesStructure } from '@/config/modulesStructure';
import { getModuleWithDefaults, getGroupWithDefaults, getPageWithDefaults } from '@/lib/moduleDefaults';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Glob import all pages to dynamically resolve
// Eagerly load standard paths to avoid waterfall
const pages = import.meta.glob('/src/pages/**/*.jsx');

export default function ModuleRouter() {
  const { module: moduleId, page: pageId } = useParams();

  // 1. Resolve Configuration
  const { module, page: pageConfig } = useMemo(() => {
    const foundModule = modulesStructure.find(m => m.id === moduleId);
    if (!foundModule) return { module: null, page: null };

    const moduleDef = getModuleWithDefaults(foundModule);
    const groups = (moduleDef.groups || []).map(getGroupWithDefaults);
    const allPages = (moduleDef.pages || []).concat(groups.flatMap(g => (g.pages || g.items || []).map(getPageWithDefaults)));
    
    const foundPage = allPages.find(p => p.id === pageId || p.path.endsWith(pageId));
    
    return { module: moduleDef, page: foundPage };
  }, [moduleId, pageId]);

  // 2. Resolve Component Path Strategy
  const ComponentImport = useMemo(() => {
    if (!moduleId || !pageId) return null;

    const toPascalCase = (str) => str.replace(/(^\w|-\w)/g, (text) => text.replace(/-/, "").toUpperCase());
    const pascalId = toPascalCase(pageId);

    // Priority List of Paths to Try
    const potentialPaths = [
      `/src/pages/${moduleId}/${pascalId}.jsx`,           // Standard: src/pages/analytics/DashboardGerencial.jsx
      `/src/pages/${moduleId}/${pageId}.jsx`,             // Kebab:    src/pages/analytics/dashboard-gerencial.jsx
      `/src/pages/${moduleId}/${pascalId}/index.jsx`,     // Folder:   src/pages/analytics/DashboardGerencial/index.jsx
      `/src/pages/${moduleId}/${pageId}/index.jsx`,       // Folder:   src/pages/analytics/dashboard-gerencial/index.jsx
      // Fallbacks for some known legacy structures if needed (though we aim to fix files)
      `/src/pages/${pascalId}.jsx`                        // Root:     src/pages/DashboardGerencial.jsx (Legacy)
    ];

    for (const path of potentialPaths) {
      if (pages[path]) {
        return pages[path];
      }
    }
    return null;
  }, [moduleId, pageId]);

  // 3. Handle 404 Configuration
  if (!module) {
    return <ErrorView title="Módulo não encontrado" message={`O módulo "${moduleId}" não existe.`} />;
  }
  if (!pageConfig) {
    return <ErrorView title="Página não encontrada" message={`A página "${pageId}" não existe neste módulo.`} />;
  }

  // 4. Handle Missing Component File
  if (!ComponentImport) {
    return (
      <ErrorView 
        title="Componente em Desenvolvimento" 
        message={`O arquivo para a rota "${moduleId}/${pageId}" ainda não foi criado.`}
        details={`Esperado: src/pages/${moduleId}/${pageId.charAt(0).toUpperCase() + pageId.slice(1)}.jsx`}
      />
    );
  }

  const LazyComponent = React.lazy(ComponentImport);

  return (
    <Suspense fallback={<LoadingView />}>
      <LazyComponent />
    </Suspense>
  );
}

function ErrorView({ title, message, details }) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] p-8 text-center animate-in fade-in">
      <div className="bg-red-50 border border-red-100 rounded-full p-4 mb-4">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="text-slate-600 mt-2 max-w-md">{message}</p>
      {details && (
        <div className="mt-4 p-3 bg-slate-100 rounded border border-slate-200 text-xs font-mono text-slate-600 break-all">
          {details}
        </div>
      )}
      <Button className="mt-6" variant="outline" onClick={() => window.history.back()}>
        Voltar
      </Button>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
      <p className="text-sm text-slate-500 font-medium">Carregando módulo...</p>
    </div>
  );
}
