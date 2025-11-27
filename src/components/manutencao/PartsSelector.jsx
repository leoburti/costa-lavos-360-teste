import React, { useState } from 'react';
import { usePartsSearch } from '@/hooks/usePartsSearch';
import PartsSearchInput from './PartsSearchInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Package, Wrench, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const PartsSelector = ({ selectedParts, onPartsChange, availableEquipments = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { parts, isLoading } = usePartsSearch(searchTerm);

  const handleAddPart = (part) => {
    // When adding a part, default to first equipment if available, or null
    const defaultEquipId = availableEquipments.length === 1 ? availableEquipments[0].id : '';
    
    // Always add as a NEW line item to allow assigning same part to different equipments
    // Unique ID for UI listing
    const newPartEntry = {
        ...part,
        uiId: `${part.id}-${Date.now()}`,
        quantity: 1,
        unitPrice: part.valor,
        equipmentId: defaultEquipId
    };
    
    onPartsChange([...selectedParts, newPartEntry]);
    setSearchTerm(''); 
  };

  const handleRemovePart = (uiId) => {
    onPartsChange(selectedParts.filter(p => p.uiId !== uiId));
  };

  const handleUpdateQuantity = (uiId, newQuantity) => {
    if (newQuantity < 1) return;
    onPartsChange(selectedParts.map(p => 
      p.uiId === uiId ? { ...p, quantity: parseInt(newQuantity) } : p
    ));
  };

  const handleUpdatePrice = (uiId, newPrice) => {
    onPartsChange(selectedParts.map(p => 
      p.uiId === uiId ? { ...p, unitPrice: parseFloat(newPrice) } : p
    ));
  };

  const handleUpdateEquipment = (uiId, newEquipmentId) => {
    onPartsChange(selectedParts.map(p => 
      p.uiId === uiId ? { ...p, equipmentId: newEquipmentId } : p
    ));
  };

  const totalCost = selectedParts.reduce((sum, part) => sum + (part.quantity * (part.unitPrice || 0)), 0);

  return (
    <div className="space-y-6 bg-gray-50 border rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
      {/* Search Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Wrench className="h-4 w-4" />
            Buscar no Catálogo de Peças
        </div>
        <div className="relative">
            <PartsSearchInput 
                value={searchTerm} 
                onChange={setSearchTerm} 
                isLoading={isLoading} 
            />
            {/* Dropdown Results */}
            {searchTerm.length >= 2 && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-[200px] overflow-hidden">
                    <ScrollArea className="h-[200px]">
                        {parts.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground text-sm">
                                Nenhuma peça encontrada.
                            </div>
                        ) : (
                            <div className="p-1">
                                {parts.map(part => (
                                    <div 
                                        key={part.id}
                                        className="flex justify-between items-center p-2 hover:bg-blue-50 cursor-pointer rounded transition-colors"
                                        onClick={() => handleAddPart(part)}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{part.nome}</span>
                                            <span className="text-xs text-muted-foreground">{part.descricao}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold text-gray-600">{formatCurrency(part.valor)}</span>
                                            <Button size="icon" variant="ghost" className="h-6 w-6">
                                                <Plus className="h-4 w-4 text-blue-600" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            )}
        </div>
      </div>

      {/* Selected Parts Table */}
      {selectedParts.length > 0 ? (
        <div className="rounded-md border bg-white overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-gray-50">
                    <TableRow>
                        <TableHead>Peça</TableHead>
                        <TableHead className="w-[200px]">Aplicado Em (Equipamento)</TableHead>
                        <TableHead className="w-[80px] text-center">Qtd</TableHead>
                        <TableHead className="w-[110px] text-right">Valor Unit.</TableHead>
                        <TableHead className="w-[110px] text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {selectedParts.map((part) => {
                        // Find associated equipment details for validation style
                        const associatedEq = availableEquipments.find(e => e.id === part.equipmentId);
                        const isMissingEquip = !part.equipmentId;

                        return (
                        <TableRow key={part.uiId}>
                            <TableCell className="py-2">
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">{part.nome}</span>
                                    {isMissingEquip && (
                                        <span className="text-[10px] text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> Selecione o equipamento
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="py-2">
                                <Select 
                                    value={part.equipmentId} 
                                    onValueChange={(val) => handleUpdateEquipment(part.uiId, val)}
                                >
                                    <SelectTrigger className={`h-8 text-xs ${!part.equipmentId ? 'border-red-300 text-red-600' : ''}`}>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableEquipments.map(eq => (
                                            <SelectItem key={eq.id} value={eq.id}>
                                                <span className="flex items-center gap-2">
                                                    {eq.nome} 
                                                    <Badge variant="outline" className="text-[9px] h-4 px-1">
                                                        {eq.source === 'comodato' ? 'Comodato' : 'Cliente'}
                                                    </Badge>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell className="text-center py-2">
                                <Input 
                                    type="number" 
                                    min="1"
                                    className="h-8 w-14 text-center mx-auto p-1"
                                    value={part.quantity}
                                    onChange={(e) => handleUpdateQuantity(part.uiId, e.target.value)}
                                />
                            </TableCell>
                            <TableCell className="text-right py-2">
                                <div className="relative">
                                    <span className="absolute left-1 top-1.5 text-[10px] text-muted-foreground">R$</span>
                                    <Input 
                                        type="number"
                                        step="0.01"
                                        className="h-8 w-20 text-right pl-5 ml-auto p-1 text-xs"
                                        value={part.unitPrice}
                                        onChange={(e) => handleUpdatePrice(part.uiId, e.target.value)}
                                    />
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-medium text-gray-700 py-2 text-sm">
                                {formatCurrency(part.quantity * part.unitPrice)}
                            </TableCell>
                            <TableCell className="py-2">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-gray-400 hover:text-destructive hover:bg-red-50"
                                    onClick={() => handleRemovePart(part.uiId)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    )})}
                </TableBody>
            </Table>
            <div className="flex justify-end items-center p-4 bg-gray-50/50 border-t">
                <span className="text-sm font-medium text-gray-500 mr-2">Total Peças:</span>
                <span className="text-lg font-bold text-blue-700">{formatCurrency(totalCost)}</span>
            </div>
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/30">
            <Package className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma peça selecionada.</p>
            <p className="text-xs text-muted-foreground mt-1">Utilize a busca acima para adicionar.</p>
        </div>
      )}
    </div>
  );
};

export default PartsSelector;