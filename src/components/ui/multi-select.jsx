import React from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  className,
  loading,
  placeholder = 'Select options',
  ...props
}) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (currentValue) => {
    const newSelected = selected.includes(currentValue)
      ? selected.filter((item) => item !== currentValue)
      : [...selected, currentValue];
    onChange(newSelected);
  };
  
  const getSelectedLabels = () => {
    if (!selected || selected.length === 0) return placeholder;
    
    const labels = selected
      .map(value => {
        const option = options.find(opt => opt.value === value);
        return option ? option.label : value;
      })
      .filter(Boolean);

    if (labels.length === 0) return placeholder;
    if (labels.length <= 2) return labels.join(', ');
    
    return `${labels.length} selecionados`;
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between h-10", className)}
            disabled={loading}
          >
            <span className="truncate">
              {getSelectedLabels()}
            </span>
            {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[336px] p-0">
          <Command {...props}>
            <CommandInput placeholder="Buscar..." />
            <CommandList>
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selected && selected.includes(option.value) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}