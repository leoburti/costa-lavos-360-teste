
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet.jsx";
import { MultiSelect } from "@/components/ui/multi-select";
import { useFilters } from '@/contexts/FilterContext';
import { Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const FilterPanel = () => {
    const { filters, updateFilters, resetFilters, filterOptions, loading: loadingOptions } = useFilters();

    const [selectedSupervisors, setSelectedSupervisors] = useState(filters.supervisors || []);
    const [selectedSellers, setSelectedSellers] = useState(filters.sellers || []);
    const [selectedCustomerGroups, setSelectedCustomerGroups] = useState(filters.customerGroups || []);
    const [selectedClients, setSelectedClients] = useState(filters.clients || []);
    const [selectedRegions, setSelectedRegions] = useState(filters.regions || []);
    const [selectedProducts, setSelectedProducts] = useState(filters.products || []);
    const [excludeEmployees, setExcludeEmployees] = useState(filters.excludeEmployees);
    const [showDefinedGroupsOnly, setShowDefinedGroupsOnly] = useState(filters.showDefinedGroupsOnly);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        if (isSheetOpen) {
            setSelectedSupervisors(filters.supervisors || []);
            setSelectedSellers(filters.sellers || []);
            setSelectedCustomerGroups(filters.customerGroups || []);
            setSelectedClients(filters.clients || []);
            setSelectedRegions(filters.regions || []);
            setSelectedProducts(filters.products || []);
            setExcludeEmployees(filters.excludeEmployees);
            setShowDefinedGroupsOnly(filters.showDefinedGroupsOnly);
        }
    }, [isSheetOpen, filters]);

    const handleApplyFilters = () => {
        updateFilters({
            supervisors: selectedSupervisors.length > 0 ? selectedSupervisors : null,
            sellers: selectedSellers.length > 0 ? selectedSellers : null,
            customerGroups: selectedCustomerGroups.length > 0 ? selectedCustomerGroups : null,
            clients: selectedClients.length > 0 ? selectedClients : null,
            regions: selectedRegions.length > 0 ? selectedRegions : null,
            products: selectedProducts.length > 0 ? selectedProducts : null,
            excludeEmployees,
            showDefinedGroupsOnly,
        });
        setIsSheetOpen(false);
    };

    const handleClearFilters = () => {
        resetFilters();
        setSelectedSupervisors([]);
        setSelectedSellers([]);
        setSelectedCustomerGroups([]);
        setSelectedClients([]);
        setSelectedRegions([]);
        setSelectedProducts([]);
        setExcludeEmployees(true); // Default to excluding employees
        setShowDefinedGroupsOnly(false);
    };

    const hasActiveFilters = [
        filters.supervisors,
        filters.sellers,
        filters.customerGroups,
        filters.clients,
        filters.regions,
        filters.products
    ].some(f => f && f.length > 0) || !filters.excludeEmployees || filters.showDefinedGroupsOnly;

    const selectOptions = (key) => (filterOptions?.[key] || []).map(item => ({ value: item, label: item }));

    const renderFilters = () => {
        if (loadingOptions) {
            return (
                <div className="space-y-6 p-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i}>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                </div>
            )
        }
        return (
            <div className="space-y-4">
                <MultiSelect
                    label="Supervisores"
                    options={selectOptions('supervisors')}
                    selected={selectedSupervisors}
                    onChange={setSelectedSupervisors}
                    placeholder="Todos"
                />
                <MultiSelect
                    label="Vendedores"
                    options={selectOptions('sellers')}
                    selected={selectedSellers}
                    onChange={setSelectedSellers}
                    placeholder="Todos"
                />
                <MultiSelect
                    label="Grupos de Clientes"
                    options={selectOptions('customerGroups')}
                    selected={selectedCustomerGroups}
                    onChange={setSelectedCustomerGroups}
                    placeholder="Todos"
                />
                <MultiSelect
                    label="Clientes"
                    options={selectOptions('clients')}
                    selected={selectedClients}
                    onChange={setSelectedClients}
                    placeholder="Todos"
                />
                <MultiSelect
                    label="Regiões"
                    options={selectOptions('regions')}
                    selected={selectedRegions}
                    onChange={setSelectedRegions}
                    placeholder="Todas"
                />
                <MultiSelect
                    label="Produtos"
                    options={selectOptions('products')}
                    selected={selectedProducts}
                    onChange={setSelectedProducts}
                    placeholder="Todos"
                />
                <Separator />
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="include-employees-filter" className="cursor-pointer">Incluir grupo "Funcionários"</Label>
                        <Switch
                            id="include-employees-filter"
                            checked={!excludeEmployees}
                            onCheckedChange={(checked) => setExcludeEmployees(!checked)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="show-defined-groups-only" className="cursor-pointer">Apenas Grupos Definidos</Label>
                        <Switch
                            id="show-defined-groups-only"
                            checked={showDefinedGroupsOnly}
                            onCheckedChange={setShowDefinedGroupsOnly}
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                <Button variant={hasActiveFilters ? "default" : 'outline'} className="relative">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                    {hasActiveFilters && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="py-4 flex-1 overflow-y-auto pr-2">
                    {renderFilters()}
                </div>
                <SheetFooter className="mt-auto pt-4 border-t">
                    <Button variant="outline" onClick={handleClearFilters} className="w-full sm:w-auto">Limpar</Button>
                    <Button onClick={handleApplyFilters} className="w-full sm:w-auto">Aplicar Filtros</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default FilterPanel;
