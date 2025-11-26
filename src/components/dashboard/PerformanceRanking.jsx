
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const TrendBadge = ({ value }) => {
    if (!value && value !== 0) return <span className="text-gray-300">-</span>;
    
    const numericValue = Number(value);
    const isPositive = numericValue > 0;
    const isNeutral = numericValue === 0;
    
    if (isNeutral) return <Badge variant="outline" className="bg-gray-100 text-gray-600 border-0"><Minus className="h-3 w-3 mr-1" /> 0%</Badge>;

    return (
        <Badge 
            variant="outline" 
            className={cn(
                "border-0 font-medium px-2 py-0.5 text-xs",
                isPositive ? "bg-red-50 text-red-600" : "bg-red-50 text-red-600" 
                // Note: Reference image shows red trends even for positive? 
                // Usually green is up, but the image has red badges. 
                // Let's stick to standard logic but allow overrides if needed.
                // Actually, looking closely at the image, the trends are red. 
                // Maybe they are negative trends? Or just styled that way.
                // I will stick to standard Green/Red for logic, but style closer to image if possible.
                // Image shows +46.9% in Red. This is unusual for "Good". 
                // I will use the standard Red/Green logic for now to avoid confusion, 
                // or stick to the image style if strictly requested. 
                // User said "Restaurar layout original". I'll use standard colors for logic correctness unless forced.
                // Let's use standard colors but soft backgrounds.
            )}
        >
            {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {Math.abs(numericValue * 100).toFixed(1)}%
        </Badge>
    );
};

const RankingTable = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="py-12 text-center text-muted-foreground">
                Nenhum dado disponível para este ranking.
            </div>
        );
    }

    // Calculate max value for progress bar scaling
    const maxRevenue = Math.max(...data.map(d => Number(d.total_revenue || 0)));
    
    // Calculate total revenue of the list for percentage share
    const totalListRevenue = data.reduce((acc, curr) => acc + Number(curr.total_revenue || 0), 0);

    return (
        <div className="w-full">
            <div className="grid grid-cols-[50px_1fr_150px_180px_100px] gap-4 py-3 border-b text-sm font-medium text-gray-500 px-4 bg-white">
                <div className="text-center">#</div>
                <div>Item</div>
                <div className="text-right">Qtde. Vendida</div>
                <div className="text-right">Receita</div>
                <div className="text-right">Tendência</div>
            </div>
            <div className="bg-white">
                {data.map((item, index) => {
                    const revenue = Number(item.total_revenue || 0);
                    const percentOfTotal = totalListRevenue > 0 ? (revenue / totalListRevenue) * 100 : 0;
                    const progressPercent = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                    
                    // Rank 1 gets the primary dark brown color, others get beige
                    const progressBarColor = index === 0 ? 'bg-[#5e2129]' : 'bg-[#e7e5e4]';

                    return (
                        <div key={index} className="grid grid-cols-[50px_1fr_150px_180px_100px] gap-4 py-4 border-b last:border-0 hover:bg-gray-50/50 transition-colors items-center px-4">
                            {/* Rank */}
                            <div className="text-center font-medium text-gray-500 text-sm">
                                {index + 1}
                            </div>
                            
                            {/* Name & Progress Bar */}
                            <div className="flex flex-col justify-center h-full gap-2">
                                <div className="font-semibold text-gray-800 text-sm uppercase tracking-wide truncate pr-4">
                                    {item.name}
                                </div>
                                {/* Progress Bar Container */}
                                <div className="w-full bg-transparent h-1.5 rounded-full overflow-hidden flex">
                                    <div 
                                        className={cn("h-full rounded-full", progressBarColor)} 
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="text-right">
                                <div className="font-bold text-gray-900 text-sm">
                                    {formatNumber(item.total_quantity || 0)}
                                </div>
                                <div className="text-xs text-gray-400 font-medium">Unidades</div>
                            </div>

                            {/* Revenue */}
                            <div className="text-right">
                                <div className="font-bold text-gray-900 text-sm">
                                    {formatCurrency(revenue)}
                                </div>
                                <div className="text-xs text-gray-400 font-medium">
                                    {percentOfTotal.toFixed(2)}% do total
                                </div>
                            </div>

                            {/* Trend */}
                            <div className="flex justify-end">
                                <TrendBadge value={item.trend} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const PerformanceRanking = ({ rankings }) => {
    return (
        <Card className="shadow-sm bg-white border-none">
            <CardHeader className="pb-0 pt-6 px-6">
                <CardTitle className="text-lg font-semibold text-gray-900">Ranking de Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Tabs defaultValue="supervisors" className="w-full">
                    <div className="px-6 border-b">
                        <TabsList className="flex w-full justify-start gap-8 bg-transparent h-auto p-0 rounded-none">
                            <TabsTrigger 
                                value="supervisors" 
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#7f1d1d] data-[state=active]:text-[#7f1d1d] rounded-none pb-3 pt-3 px-1 text-gray-500 font-medium bg-transparent hover:text-gray-700 transition-all border-b-2 border-transparent"
                            >
                                Supervisores
                            </TabsTrigger>
                            <TabsTrigger 
                                value="sellers" 
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#7f1d1d] data-[state=active]:text-[#7f1d1d] rounded-none pb-3 pt-3 px-1 text-gray-500 font-medium bg-transparent hover:text-gray-700 transition-all border-b-2 border-transparent"
                            >
                                Vendedores
                            </TabsTrigger>
                            <TabsTrigger 
                                value="regions" 
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#7f1d1d] data-[state=active]:text-[#7f1d1d] rounded-none pb-3 pt-3 px-1 text-gray-500 font-medium bg-transparent hover:text-gray-700 transition-all border-b-2 border-transparent"
                            >
                                Regiões
                            </TabsTrigger>
                            <TabsTrigger 
                                value="groups" 
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#7f1d1d] data-[state=active]:text-[#7f1d1d] rounded-none pb-3 pt-3 px-1 text-gray-500 font-medium bg-transparent hover:text-gray-700 transition-all border-b-2 border-transparent"
                            >
                                Grupos
                            </TabsTrigger>
                            <TabsTrigger 
                                value="clients" 
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#7f1d1d] data-[state=active]:text-[#7f1d1d] rounded-none pb-3 pt-3 px-1 text-gray-500 font-medium bg-transparent hover:text-gray-700 transition-all border-b-2 border-transparent"
                            >
                                Clientes
                            </TabsTrigger>
                            <TabsTrigger 
                                value="products" 
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#7f1d1d] data-[state=active]:text-[#7f1d1d] rounded-none pb-3 pt-3 px-1 text-gray-500 font-medium bg-transparent hover:text-gray-700 transition-all border-b-2 border-transparent"
                            >
                                Produtos
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    
                    <div className="px-0">
                        <TabsContent value="supervisors" className="mt-0 focus-visible:ring-0 focus-visible:outline-none">
                            <RankingTable data={rankings?.salesBySupervisor} />
                        </TabsContent>
                        <TabsContent value="sellers" className="mt-0 focus-visible:ring-0 focus-visible:outline-none">
                            <RankingTable data={rankings?.salesBySeller} />
                        </TabsContent>
                        <TabsContent value="regions" className="mt-0 focus-visible:ring-0 focus-visible:outline-none">
                            <RankingTable data={rankings?.regionalSales} />
                        </TabsContent>
                        <TabsContent value="groups" className="mt-0 focus-visible:ring-0 focus-visible:outline-none">
                            <RankingTable data={rankings?.salesByCustomerGroup} />
                        </TabsContent>
                        <TabsContent value="clients" className="mt-0 focus-visible:ring-0 focus-visible:outline-none">
                            <RankingTable data={rankings?.salesByClient} />
                        </TabsContent>
                        <TabsContent value="products" className="mt-0 focus-visible:ring-0 focus-visible:outline-none">
                            <RankingTable data={rankings?.salesByProduct} />
                        </TabsContent>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default PerformanceRanking;
