'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronDown, ChevronRight, GripVertical, Plus, MoreHorizontal, X, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { TodoSectionWithItems } from '@astor/core';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { sectionColor } from './colors';
import {
  addTodoSectionAction,
  renameTodoSectionAction,
  deleteTodoSectionAction,
  addTodoItemAction,
  toggleTodoItemAction,
  deleteTodoItemAction,
  renameTodoItemAction,
  reorderTodoSectionsAction,
} from '@/app/actions/todos';

type Section = TodoSectionWithItems;

export function SectionedTodos({ sections }: { sections: Section[] }) {
  const [local, setLocal] = useState<Section[]>(sections);
  const [newSection, setNewSection] = useState('');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Sync desde el server sólo cuando cambian los datos (no en cada render),
  // así el estado optimista no se pisa mientras hay una acción en vuelo.
  const sig = useMemo(
    () =>
      JSON.stringify(
        sections.map((s) => [s.id, s.position, s.name, s.items.map((i) => [i.id, i.done, i.label])]),
      ),
    [sections],
  );
  useEffect(() => setLocal(sections), [sig]); // eslint-disable-line react-hooks/exhaustive-deps

  function fire(p: Promise<{ ok: boolean; error?: string }>) {
    p.then((r) => {
      if (!r.ok) toast.error(r.error ?? 'Error');
    }).catch(() => toast.error('Error de red'));
  }

  function toggleItem(sectionId: string, itemId: string, done: boolean) {
    setLocal((cur) =>
      cur.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, done } : i)) }
          : s,
      ),
    );
    fire(toggleTodoItemAction(itemId, done));
  }
  function addItem(sectionId: string, label: string) {
    const temp = { id: crypto.randomUUID(), user_id: '', section_id: sectionId, label, done: false, position: 999, created_at: '', updated_at: '' };
    setLocal((cur) => cur.map((s) => (s.id === sectionId ? { ...s, items: [...s.items, temp] } : s)));
    fire(addTodoItemAction(sectionId, label));
  }
  function deleteItem(sectionId: string, itemId: string) {
    setLocal((cur) => cur.map((s) => (s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s)));
    fire(deleteTodoItemAction(itemId));
  }
  function renameItem(sectionId: string, itemId: string, label: string) {
    setLocal((cur) =>
      cur.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, label } : i)) }
          : s,
      ),
    );
    fire(renameTodoItemAction(itemId, label));
  }
  function renameSection(sectionId: string, name: string) {
    setLocal((cur) => cur.map((s) => (s.id === sectionId ? { ...s, name } : s)));
    fire(renameTodoSectionAction(sectionId, name));
  }
  function deleteSection(sectionId: string) {
    setLocal((cur) => cur.filter((s) => s.id !== sectionId));
    fire(deleteTodoSectionAction(sectionId));
  }
  function addSection(name: string) {
    const temp = { id: crypto.randomUUID(), user_id: '', name, position: 999, created_at: '', updated_at: '', items: [] };
    setLocal((cur) => [...cur, temp]);
    fire(addTodoSectionAction(name));
  }
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setLocal((cur) => {
      const oldIndex = cur.findIndex((s) => s.id === active.id);
      const newIndex = cur.findIndex((s) => s.id === over.id);
      const next = arrayMove(cur, oldIndex, newIndex);
      fire(reorderTodoSectionsAction(next.map((s) => s.id)));
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={local.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {local.map((section, i) => (
            <SectionCard
              key={section.id}
              section={section}
              color={sectionColor(i)}
              onToggle={(itemId, done) => toggleItem(section.id, itemId, done)}
              onAddItem={(label) => addItem(section.id, label)}
              onDeleteItem={(itemId) => deleteItem(section.id, itemId)}
              onRenameItem={(itemId, label) => renameItem(section.id, itemId, label)}
              onRename={(name) => renameSection(section.id, name)}
              onDelete={() => deleteSection(section.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div className="flex items-center gap-2 rounded-lg border border-dashed border-line-default px-4 py-2.5">
        <Plus className="size-4 text-signature" />
        <Input
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newSection.trim()) {
              addSection(newSection.trim());
              setNewSection('');
            }
          }}
          placeholder="Nueva sección…"
          className="h-7 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}

function SectionCard({
  section,
  color,
  onToggle,
  onAddItem,
  onDeleteItem,
  onRenameItem,
  onRename,
  onDelete,
}: {
  section: Section;
  color: string;
  onToggle: (itemId: string, done: boolean) => void;
  onAddItem: (label: string) => void;
  onDeleteItem: (itemId: string) => void;
  onRenameItem: (itemId: string, label: string) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });
  const [open, setOpen] = useState(section.items.length > 0);
  const [renaming, setRenaming] = useState(false);
  const [nameVal, setNameVal] = useState(section.name);
  const [newItem, setNewItem] = useState('');
  const [editItem, setEditItem] = useState<{ id: string; val: string } | null>(null);
  const doneCount = section.items.filter((i) => i.done).length;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'overflow-hidden rounded-lg border border-line-subtle bg-surface-raised',
        isDragging && 'z-10 opacity-80 shadow-overlay',
      )}
    >
      <div className="h-1" style={{ background: color }} />
      <div className="flex items-center gap-1.5 px-3 py-2.5">
        <button
          type="button"
          className="cursor-grab touch-none text-fg-subtlest hover:text-fg-default active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Reordenar"
        >
          <GripVertical className="size-4" />
        </button>
        <button type="button" onClick={() => setOpen((o) => !o)} className="text-fg-subtlest">
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
        {renaming ? (
          <Input
            autoFocus
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && nameVal.trim()) {
                onRename(nameVal.trim());
                setRenaming(false);
              }
              if (e.key === 'Escape') setRenaming(false);
            }}
            onBlur={() => {
              if (nameVal.trim() && nameVal !== section.name) onRename(nameVal.trim());
              setRenaming(false);
            }}
            className="h-7 w-40"
          />
        ) : (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex-1 text-left text-300 font-semibold text-fg-default"
          >
            {section.name}
          </button>
        )}
        <span className="text-100 tabular-nums text-fg-subtlest">
          {section.items.length > 0 && `${doneCount}/${section.items.length}`}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="rounded p-1 text-fg-subtlest hover:bg-surface-overlay hover:text-fg-default">
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setNameVal(section.name);
                setRenaming(true);
              }}
            >
              <Pencil className="size-4" /> Renombrar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
              <Trash2 className="size-4" /> Eliminar sección
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {open && (
        <div className="px-3 pb-3 pl-9">
          {section.items.map((item) => (
            <div key={item.id} className="group flex items-center gap-2.5 py-1.5">
              <Checkbox
                checked={item.done}
                onCheckedChange={(v) => onToggle(item.id, Boolean(v))}
                style={item.done ? { backgroundColor: color, borderColor: color } : undefined}
              />
              {editItem?.id === item.id ? (
                <Input
                  autoFocus
                  value={editItem.val}
                  onChange={(e) => setEditItem({ id: item.id, val: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editItem.val.trim()) {
                      onRenameItem(item.id, editItem.val.trim());
                      setEditItem(null);
                    }
                    if (e.key === 'Escape') setEditItem(null);
                  }}
                  onBlur={() => {
                    if (editItem.val.trim() && editItem.val !== item.label) onRenameItem(item.id, editItem.val.trim());
                    setEditItem(null);
                  }}
                  className="h-7 flex-1"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setEditItem({ id: item.id, val: item.label })}
                  className={cn('flex-1 text-left text-300', item.done ? 'text-fg-subtlest line-through' : 'text-fg-default')}
                >
                  {item.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => onDeleteItem(item.id)}
                className="text-fg-subtlest opacity-0 transition-opacity hover:text-danger-text group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 py-1">
            <Plus className="size-4 text-fg-subtlest" />
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newItem.trim()) {
                  onAddItem(newItem.trim());
                  setNewItem('');
                }
              }}
              placeholder="Agregar…"
              className="h-7 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      )}
    </div>
  );
}
