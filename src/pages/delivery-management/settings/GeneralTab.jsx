
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Mail, Phone, MapPin, FileText } from 'lucide-react';

const GeneralTab = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Gerais</CardTitle>
        <CardDescription>Detalhes básicos da operação de entregas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#6B2C2C]" /> Nome da Empresa
            </Label>
            <Input 
              id="companyName" 
              value={data.companyName || ''} 
              onChange={(e) => handleChange('companyName', e.target.value)} 
              placeholder="Ex: Logística Express"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoUrl" className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#6B2C2C]" /> URL do Logo
            </Label>
            <Input 
              id="logoUrl" 
              value={data.logoUrl || ''} 
              onChange={(e) => handleChange('logoUrl', e.target.value)} 
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#6B2C2C]" /> Email de Suporte
            </Label>
            <Input 
              id="email" 
              type="email"
              value={data.email || ''} 
              onChange={(e) => handleChange('email', e.target.value)} 
              placeholder="suporte@empresa.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#6B2C2C]" /> Telefone de Contato
            </Label>
            <Input 
              id="phone" 
              value={data.phone || ''} 
              onChange={(e) => handleChange('phone', e.target.value)} 
              placeholder="(00) 0000-0000"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#6B2C2C]" /> Endereço Principal
          </Label>
          <Input 
            id="address" 
            value={data.address || ''} 
            onChange={(e) => handleChange('address', e.target.value)} 
            placeholder="Rua, Número, Bairro, Cidade - UF"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#6B2C2C]" /> Descrição Operacional
          </Label>
          <Textarea 
            id="description" 
            value={data.description || ''} 
            onChange={(e) => handleChange('description', e.target.value)} 
            placeholder="Breve descrição das operações de entrega..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralTab;
