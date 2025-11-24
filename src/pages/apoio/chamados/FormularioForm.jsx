
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, Trash2, GripVertical, Settings, Eye, Save, ArrowLeft, 
  Type, Image as ImageIcon, ListChecks, List, CheckSquare, X 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Field Types & Icons ---
const FIELD_TYPES = {
  text: { label: 'Texto Curto', icon: Type },
  textarea: { label: 'Texto Longo', icon: Type }, // Added textarea for better flexibility
  photo: { label: 'Foto / Imagem', icon: ImageIcon },
  checklist: { label: 'Checklist', icon: ListChecks },
  alternatives: { label: 'Alternativas', icon: List }, // Radio or Select
};

// --- Sub-components ---

const SortableFieldItem = ({ field, index, onEdit, onDelete, isActive }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    zIndex: isDragging ? 999 : 1,
  };

  const Icon = FIELD_TYPES[field.type]?.icon || Type;

  return (
    <div ref={setNodeRef} style={style} className={cn("group flex items-center gap-3 p-3 bg-card border rounded-lg mb-2 hover:border-primary/50 transition-colors", isActive && "border-primary ring-1 ring-primary")}>
      <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground p-1">
        <GripVertical className="h-5 w-5" />
      </div>
      
      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{field.label || 'Sem título'}</span>
          {field.required && <Badge variant="outline" className="text-[10px] h-5 border-destructive/50 text-destructive">Obrigatório</Badge>}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
          <Badge variant="secondary" className="text-[10px] h-4 px-1">{FIELD_TYPES[field.type]?.label}</Badge>
          {field.config?.placeholder && <span className="truncate max-w-[200px]">Placeholder: {field.config.placeholder}</span>}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon" onClick={() => onEdit(index)} className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(index)} className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const FieldEditorDialog = ({ open, onOpenChange, onSave, initialData }) => {
  const [type, setType] = useState(initialData?.type || 'text');
  const [label, setLabel] = useState(initialData?.label || '');
  const [required, setRequired] = useState(initialData?.required || false);
  const [config, setConfig] = useState(initialData?.config || {});
  const [options, setOptions] = useState(initialData?.config?.options || []);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    if (open) {
      setType(initialData?.type || 'text');
      setLabel(initialData?.label || '');
      setRequired(initialData?.required || false);
      setConfig(initialData?.config || {});
      setOptions(initialData?.config?.options || []);
    }
  }, [open, initialData]);

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const finalConfig = { ...config };
    if (['checklist', 'alternatives'].includes(type)) {
      finalConfig.options = options;
    }
    onSave({ type, label, required, config: finalConfig });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Campo' : 'Adicionar Campo'}</DialogTitle>
          <DialogDescription>Configure as propriedades do campo.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo do Campo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(FIELD_TYPES).map(([key, { label, icon: Icon }]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2"><Icon className="h-4 w-4" /> {label}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rótulo (Pergunta)</Label>
              <Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex: Nome do Cliente" />
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-md">
            <Switch id="req-mode" checked={required} onCheckedChange={setRequired} />
            <Label htmlFor="req-mode" className="cursor-pointer">Campo Obrigatório</Label>
          </div>

          <Separator />

          {/* Configurações Específicas */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Configurações Específicas</h4>
            
            {(type === 'text' || type === 'textarea') && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Placeholder</Label>
                  <Input 
                    value={config.placeholder || ''} 
                    onChange={e => setConfig({...config, placeholder: e.target.value})} 
                    placeholder="Texto de ajuda dentro do campo" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Máximo de Caracteres</Label>
                  <Input 
                    type="number" 
                    value={config.maxLength || ''} 
                    onChange={e => setConfig({...config, maxLength: parseInt(e.target.value)})} 
                    placeholder="Ex: 200" 
                  />
                </div>
              </div>
            )}

            {type === 'photo' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Formatos Aceitos</Label>
                  <div className="flex gap-4">
                    {['image/jpeg', 'image/png'].map(fmt => (
                      <div key={fmt} className="flex items-center space-x-2">
                        <Checkbox 
                          checked={config.allowedFormats?.includes(fmt)}
                          onCheckedChange={(checked) => {
                            const current = config.allowedFormats || [];
                            const next = checked ? [...current, fmt] : current.filter(f => f !== fmt);
                            setConfig({...config, allowedFormats: next});
                          }}
                        />
                        <Label className="text-xs font-normal">{fmt.split('/')[1].toUpperCase()}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(type === 'checklist' || type === 'alternatives') && (
              <div className="space-y-3">
                {type === 'alternatives' && (
                  <div className="space-y-2">
                    <Label>Estilo de Seleção</Label>
                    <RadioGroup 
                      value={config.inputType || 'radio'} 
                      onValueChange={v => setConfig({...config, inputType: v})}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="radio" id="r-radio" />
                        <Label htmlFor="r-radio">Radio Buttons</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="select" id="r-select" />
                        <Label htmlFor="r-select">Dropdown (Select)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Opções</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={newOption} 
                      onChange={e => setNewOption(e.target.value)} 
                      placeholder="Nova opção..." 
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                    />
                    <Button type="button" onClick={handleAddOption} size="icon"><Plus className="h-4 w-4" /></Button>
                  </div>
                  <ScrollArea className="h-[120px] border rounded-md p-2">
                    {options.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhuma opção adicionada</p>}
                    <ul className="space-y-1">
                      {options.map((opt, idx) => (
                        <li key={idx} className="flex justify-between items-center bg-background p-2 rounded text-sm border">
                          <span>{opt}</span>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveOption(idx)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-[#6B2C2C] hover:bg-[#6B2C2C]/90">Salvar Campo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const FormPreview = ({ fields, title, description }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border p-6 max-w-2xl mx-auto min-h-[500px]">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-[#6B2C2C]">{title || 'Título do Formulário'}</h2>
        <p className="text-muted-foreground mt-1">{description || 'Descrição do formulário...'}</p>
      </div>

      <div className="space-y-6">
        {fields.length === 0 && (
          <div className="text-center py-10 text-muted-foreground italic">
            Nenhum campo adicionado. Adicione campos na aba de Construção.
          </div>
        )}
        
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label className="text-base font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            
            {(field.type === 'text') && (
              <Input placeholder={field.config?.placeholder} disabled />
            )}
            
            {(field.type === 'textarea') && (
              <Textarea placeholder={field.config?.placeholder} disabled className="resize-none" />
            )}

            {field.type === 'photo' && (
              <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-sm">Clique ou arraste para upload</span>
                <span className="text-xs mt-1 opacity-70">
                  {field.config?.allowedFormats?.map(f => f.split('/')[1].toUpperCase()).join(', ') || 'JPG, PNG'}
                </span>
              </div>
            )}

            {field.type === 'checklist' && (
              <div className="space-y-2">
                {field.config?.options?.map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Checkbox id={`chk-${field.id}-${idx}`} disabled />
                    <Label htmlFor={`chk-${field.id}-${idx}`} className="font-normal">{opt}</Label>
                  </div>
                ))}
              </div>
            )}

            {field.type === 'alternatives' && field.config?.inputType === 'select' && (
              <Select disabled>
                <SelectTrigger><SelectValue placeholder="Selecione uma opção" /></SelectTrigger>
              </Select>
            )}

            {field.type === 'alternatives' && field.config?.inputType !== 'select' && (
              <RadioGroup disabled>
                {field.config?.options?.map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt} id={`rad-${field.id}-${idx}`} />
                    <Label htmlFor={`rad-${field.id}-${idx}`} className="font-normal">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        ))}
        
        {fields.length > 0 && (
          <div className="pt-6 border-t">
            <Button className="w-full bg-[#6B2C2C]" disabled>Enviar Formulário</Button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Page Component ---

const FormularioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('build');

  // Form Basics
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState('geral'); // 'entrega', 'troca', etc.
  const [fields, setFields] = useState([]);

  // Editor State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Sensors for Dnd
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (isEditing) {
      fetchForm(id);
    }
  }, [id]);

  const fetchForm = async (formId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('apoio_formularios_execucao')
      .select('*')
      .eq('id', formId)
      .single();

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao carregar', description: error.message });
      navigate('/admin/apoio/chamados/formularios');
    } else if (data) {
      setFormName(data.nome_formulario);
      setFormType(data.tipo_chamado);
      // We store description inside 'campos.meta.description' typically or handle if it was stored otherwise
      // Assuming simple structure for now or migration.
      // Let's assume we store full object in 'campos' including description if needed, 
      // OR just load what we can.
      // If 'campos' is an array of fields:
      if (Array.isArray(data.campos)) {
          setFields(data.campos);
      } else if (data.campos?.fields) {
          setFields(data.campos.fields);
          setFormDesc(data.campos.meta?.description || '');
      }
    }
    setLoading(false);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveField = (fieldData) => {
    if (editingIndex !== null) {
      const newFields = [...fields];
      newFields[editingIndex] = { ...newFields[editingIndex], ...fieldData };
      setFields(newFields);
    } else {
      setFields([...fields, { id: uuidv4(), ...fieldData }]);
    }
    setEditingIndex(null);
  };

  const handleEditField = (index) => {
    setEditingIndex(index);
    setEditorOpen(true);
  };

  const handleDeleteField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSaveForm = async () => {
    if (!formName.trim()) {
      toast({ variant: 'destructive', title: 'Nome obrigatório', description: 'O formulário precisa de um nome.' });
      return;
    }
    if (fields.length === 0) {
      toast({ variant: 'destructive', title: 'Campos obrigatórios', description: 'Adicione pelo menos um campo ao formulário.' });
      return;
    }

    setLoading(true);
    
    // Structuring data to save
    // Storing description in metadata inside the JSONB column alongside fields
    const payload = {
      nome_formulario: formName,
      tipo_chamado: formType,
      ativo: true,
      campos: {
        meta: { description: formDesc },
        fields: fields
      }
    };

    let error;
    if (isEditing) {
      const res = await supabase.from('apoio_formularios_execucao').update(payload).eq('id', id);
      error = res.error;
    } else {
      const res = await supabase.from('apoio_formularios_execucao').insert([payload]);
      error = res.error;
    }

    setLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Formulário salvo com sucesso.', className: "bg-green-50 border-green-200" });
      navigate('/admin/apoio/chamados/formularios');
    }
  };

  return (
    <>
      <Helmet><title>{isEditing ? 'Editar' : 'Novo'} Formulário | Admin</title></Helmet>
      <div className="p-6 max-w-5xl mx-auto space-y-6 pb-24">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/admin/apoio/chamados/formularios')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {isEditing ? 'Editar Formulário' : 'Novo Formulário de Execução'}
              </h1>
              <p className="text-sm text-muted-foreground">Defina os campos e regras para o atendimento em campo.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setActiveTab(activeTab === 'build' ? 'preview' : 'build')}>
              {activeTab === 'build' ? <><Eye className="mr-2 h-4 w-4" /> Pré-visualizar</> : <><Settings className="mr-2 h-4 w-4" /> Editar</>}
            </Button>
            <Button onClick={handleSaveForm} disabled={loading} className="bg-[#6B2C2C] hover:bg-[#6B2C2C]/90 text-white">
              <Save className="mr-2 h-4 w-4" /> {loading ? 'Salvando...' : 'Salvar Formulário'}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsContent value="build" className="space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Formulário</Label>
                  <Input id="name" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ex: Checklist de Instalação" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Uso</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Geral</SelectItem>
                      <SelectItem value="entrega">Entrega</SelectItem>
                      <SelectItem value="troca">Troca</SelectItem>
                      <SelectItem value="retirada">Retirada</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="desc">Descrição / Instruções</Label>
                  <Textarea id="desc" value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Instruções para o técnico..." className="resize-y min-h-[80px]" />
                </div>
              </CardContent>
            </Card>

            {/* Builder Area */}
            <Card className="min-h-[400px] flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Construtor de Campos</CardTitle>
                  <CardDescription>Arraste para reordenar os campos.</CardDescription>
                </div>
                <Button onClick={() => { setEditingIndex(null); setEditorOpen(true); }} variant="outline" className="border-dashed border-2 hover:border-primary text-primary hover:bg-primary/5">
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Campo
                </Button>
              </CardHeader>
              <Separator />
              <CardContent className="flex-1 p-6 bg-slate-50/50 dark:bg-slate-900/50">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3 max-w-3xl mx-auto">
                      {fields.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-background/50 text-muted-foreground">
                          <List className="mx-auto h-12 w-12 opacity-20 mb-3" />
                          <p>Seu formulário está vazio.</p>
                          <Button variant="link" onClick={() => setEditorOpen(true)}>Clique para adicionar o primeiro campo</Button>
                        </div>
                      ) : (
                        fields.map((field, index) => (
                          <SortableFieldItem 
                            key={field.id} 
                            field={field} 
                            index={index} 
                            onEdit={handleEditField} 
                            onDelete={handleDeleteField} 
                          />
                        ))
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <FormPreview fields={fields} title={formName} description={formDesc} />
          </TabsContent>
        </Tabs>

        <FieldEditorDialog 
          open={editorOpen} 
          onOpenChange={setEditorOpen} 
          onSave={handleSaveField} 
          initialData={editingIndex !== null ? fields[editingIndex] : null}
        />
      </div>
    </>
  );
};

export default FormularioForm;
