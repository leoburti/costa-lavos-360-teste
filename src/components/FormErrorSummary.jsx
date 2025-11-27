import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const FormErrorSummary = ({ errors }) => {
  if (!errors || Object.keys(errors).length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erros encontrados</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          {Object.entries(errors).map(([key, error]) => (
            <li key={key} className="text-sm">
              <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> {error.message || 'Campo inválido'}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default FormErrorSummary;