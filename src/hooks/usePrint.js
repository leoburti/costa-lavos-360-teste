
import { useRef, useState, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';

export const usePrint = () => {
    const componentRef = useRef();
    const [isPrinting, setIsPrinting] = useState(false);
    
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: 'Relatorio-Entrega-Costa-Lavos',
        bodyClass: 'bg-white print-body',
        onBeforeGetContent: () => {
            setIsPrinting(true);
            return Promise.resolve();
        },
        onAfterPrint: () => {
            setIsPrinting(false);
        },
        onPrintError: (error) => {
            console.error("Print failed", error);
            setIsPrinting(false);
        }
    });

    return { componentRef, handlePrint, isPrinting };
};
