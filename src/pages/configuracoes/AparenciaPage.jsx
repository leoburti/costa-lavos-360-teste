import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun, Monitor } from 'lucide-react';

const AparenciaPage = () => {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    // Mock reading from local storage or system
    const stored = localStorage.getItem('theme') || 'system';
    setTheme(stored);
  }, []);

  const handleThemeChange = (val) => {
    setTheme(val);
    localStorage.setItem('theme', val);
    // In a real app, this would trigger a context update to change classes on <html>
    if (val === 'dark') {
        document.documentElement.classList.add('dark');
    } else if (val === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        // System logic
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
  };

  return (
    <>
      <Helmet><title>Aparência - Configurações</title></Helmet>
      <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Aparência</h2>
            <p className="text-muted-foreground">Personalize a interface do sistema.</p>
        </div>

        <ConfiguracaoGrupo titulo="Tema" descricao="Escolha o tema de sua preferência.">
            <RadioGroup value={theme} onValueChange={handleThemeChange} className="grid grid-cols-3 gap-4">
                <div>
                    <RadioGroupItem value="light" id="light" className="peer sr-only" />
                    <Label
                        htmlFor="light"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                        <Sun className="mb-3 h-6 w-6" />
                        Claro
                    </Label>
                </div>
                <div>
                    <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                    <Label
                        htmlFor="dark"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                        <Moon className="mb-3 h-6 w-6" />
                        Escuro
                    </Label>
                </div>
                <div>
                    <RadioGroupItem value="system" id="system" className="peer sr-only" />
                    <Label
                        htmlFor="system"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                        <Monitor className="mb-3 h-6 w-6" />
                        Sistema
                    </Label>
                </div>
            </RadioGroup>
        </ConfiguracaoGrupo>
      </div>
    </>
  );
};

export default AparenciaPage;