import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { useFilters } from "@/contexts/FilterContext";
import { getDateRange } from "@/lib/utils";

const periodOptions = [
  { label: "Mês Atual", value: "this_month" },
  { label: "Mês Anterior", value: "last_month" },
  { label: "Ano Atual", value: "this_year" },
  { label: "Ano Anterior", value: "last_year" },
];

const QuickPeriodSelector = () => {
  const { setDateRange } = useFilters();
  const [activePeriod, setActivePeriod] = useState("this_month");

  const handlePeriodChange = useCallback((period) => {
    const newDateRange = getDateRange(period);
    setDateRange(newDateRange);
    setActivePeriod(period);
  }, [setDateRange]);

  return (
    <div className="flex items-center gap-2">
      {periodOptions.map((option) => (
        <Button
          key={option.value}
          variant={activePeriod === option.value ? "secondary" : "ghost"}
          size="sm"
          onClick={() => handlePeriodChange(option.value)}
          className="text-xs md:text-sm"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default QuickPeriodSelector;