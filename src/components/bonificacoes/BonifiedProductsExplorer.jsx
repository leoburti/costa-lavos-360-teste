import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Gift, DollarSign, Package, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const formatNumber = (value) => new Intl.NumberFormat('pt-BR').format(value || 0);

const ProductCard = ({ product, index }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="border bg-card p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex justify-between items-start">
      <h3 className="font-semibold text-sm flex-1 pr-4">{product.product_name}</h3>
      <div className="flex items-center gap-2 text-pink-600 font-bold">
        <Gift className="h-4 w-4" />
        <span>{formatCurrency(product.total_bonified)}</span>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground grid grid-cols-2 gap-2">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4" />
        <div>
          <p className="font-medium">{formatNumber(product.total_quantity)}</p>
          <p className="text-gray-400">Unidades</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4" />
        <div>
          <p className="font-medium">{formatCurrency(product.avg_unit_price)}</p>
          <p className="text-gray-400">Preço Médio</p>
        </div>
      </div>
    </div>
    <div className="mt-3">
        <p className="text-xs font-semibold text-gray-500">Critérios de Bonificação:</p>
        <p className="text-xs text-gray-400 italic">Regras de negócio ainda não implementadas.</p>
    </div>
  </motion.div>
);

const BonifiedProductsExplorer = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('total_bonified');

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];
    
    const filtered = products.filter(p =>
      p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => b[sortBy] - a[sortBy]);
  }, [products, searchTerm, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar produto..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total_bonified">Maior Valor Bonificado</SelectItem>
            <SelectItem value="total_quantity">Maior Quantidade</SelectItem>
            <SelectItem value="avg_unit_price">Maior Preço Médio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[520px] -mx-4 px-4">
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
                {filteredAndSortedProducts.map((product, index) => (
                    <ProductCard key={product.product_name} product={product} index={index} />
                ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="font-semibold">Nenhum produto encontrado</p>
            <p className="text-sm text-center">Tente ajustar seus filtros de busca ou período.</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default BonifiedProductsExplorer;