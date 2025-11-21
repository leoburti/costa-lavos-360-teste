import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/components/ui/use-toast';
import { UploadCloud, X, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';

const SortableItem = ({ id, file, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="relative group p-2 bg-background border rounded-md flex items-center gap-2">
      <div {...attributes} {...listeners} className="cursor-grab touch-none p-1">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <img src={file.preview} alt={file.name} className="w-16 h-16 object-cover rounded-md" />
      <div className="flex-1 truncate text-sm">
        <p className="font-medium truncate">{file.name}</p>
        <p className="text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
      </div>
      <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => onRemove(file)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

const PhotoUpload = ({ title, files, setFiles, maxFiles = 2 }) => {
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor));

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    const currentFiles = Array.from(files || []); 

    if (currentFiles.length + acceptedFiles.length > maxFiles) {
      toast({ variant: 'destructive', title: `Limite de ${maxFiles} fotos excedido.` });
      return;
    }

    fileRejections.forEach(({ file, errors }) => {
      errors.forEach(error => {
        if (error.code === 'file-too-large') {
          toast({ variant: 'destructive', title: `Arquivo muito grande: ${file.name}`, description: 'O limite é de 8MB.' });
        } else {
          toast({ variant: 'destructive', title: `Erro no arquivo: ${file.name}`, description: error.message });
        }
      });
    });

    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      id: `${file.path}-${file.lastModified}-${Math.random()}`, // Create a more unique ID
      preview: URL.createObjectURL(file)
    }));
    
    // The `setFiles` prop from react-hook-form's `Controller` expects a value, not a function.
    // So we calculate the new state and call `setFiles` with it.
    const updatedFiles = [...currentFiles, ...newFiles];
    if (typeof setFiles === 'function') {
      setFiles(updatedFiles);
    }

  }, [files, setFiles, maxFiles, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [] },
    maxSize: 8 * 1024 * 1024, // 8MB
  });

  const handleRemove = (fileToRemove) => {
    const updatedFiles = Array.from(files || []).filter(file => file.id !== fileToRemove.id);
    setFiles(updatedFiles);
    URL.revokeObjectURL(fileToRemove.preview);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
        const currentItems = Array.from(files || []);
        const oldIndex = currentItems.findIndex(item => item.id === active.id);
        const newIndex = currentItems.findIndex(item => item.id === over.id);
        const reorderedItems = arrayMove(currentItems, oldIndex, newIndex);
        setFiles(reorderedItems);
    }
  };

  const safeFiles = Array.from(files || []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-input'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {isDragActive ? 'Solte as fotos aqui...' : 'Arraste e solte ou clique para selecionar'}
        </p>
        <p className="text-xs text-muted-foreground">JPG, PNG (máx. 8MB, até {maxFiles} fotos)</p>
      </div>
      {(safeFiles.length > 0) && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={safeFiles.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {safeFiles.map(file => (
                <SortableItem key={file.id} id={file.id} file={file} onRemove={handleRemove} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default PhotoUpload;