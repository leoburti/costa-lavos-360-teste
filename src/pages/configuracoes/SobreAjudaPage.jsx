import React from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Book, FileText } from 'lucide-react';

const SobreAjudaPage = () => {
  return (
    <>
      <Helmet><title>Sobre e Ajuda - Configurações</title></Helmet>
      <div className="space-y-8">
        <ConfiguracaoGrupo
          titulo="Sobre o Sistema"
          descricao="Informações sobre a versão atual e o desenvolvedor."
        >
          <div className="text-sm space-y-2">
            <p><span className="font-semibold">Versão do Sistema:</span> 2.1.0 "Órion"</p>
            <p><span className="font-semibold">Data da Versão:</span> 19 de Novembro de 2025</p>
            <p><span className="font-semibold">Desenvolvido por:</span> Hostinger Horizons AI</p>
            <p className="text-muted-foreground pt-2">© 2025 Costa Lavos. Todos os direitos reservados.</p>
          </div>
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo
          titulo="Suporte e Ajuda"
          descricao="Precisa de ajuda? Acesse nossos canais de suporte e documentação."
        >
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <LifeBuoy className="mr-2 h-4 w-4" /> Central de Ajuda
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <Book className="mr-2 h-4 w-4" /> Documentação da API
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 h-4 w-4" /> Termos de Serviço
              </a>
            </Button>
          </div>
        </ConfiguracaoGrupo>
      </div>
    </>
  );
};

export default SobreAjudaPage;