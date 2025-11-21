import React, { useState, cloneElement } from 'react';
import { motion } from 'framer-motion';
import { Download, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ChartCard = ({ title, children, className = '', height = 'auto', childClassName = 'p-4' }) => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "🚧 O download de gráficos ainda não foi implementado, mas está no nosso radar! Você pode solicitar prioridade para esta funcionalidade. 🚀",
    });
  };

  const cardHeight = height === 'auto' ? {} : { height: `${height}px` };

  const renderModalContent = () => {
    if (!React.isValidElement(children)) {
      return null;
    }
    // Use a unique key to force re-mount and re-animation of the chart in the modal
    return cloneElement(children, { key: `modal-chart-${title}-${Date.now()}` });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("bg-card rounded-xl border border-border shadow-sm flex flex-col overflow-hidden", className)}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-md font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8" onClick={handleDownload}>
            <Download size={16} />
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
                <Maximize2 size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
              <DialogHeader className="p-4 border-b">
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              <div className="flex-grow p-6 overflow-hidden">
                <div className="w-full h-full">
                  {isModalOpen && renderModalContent()}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className={cn("flex-grow", childClassName)} style={cardHeight}>
        <div className="w-full h-full">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default ChartCard;