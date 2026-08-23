'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, Plus, MoreHorizontal, X, Pencil, Trash2 } from 'lucide-react';
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
import {
  addTodoSectionAction,
  renameTodoSectionAction,
  deleteTodoSectionAction,
  addTodoItemAction,
  toggleTodoItemAction,
  deleteTodoItemAction,
} from '@/app/actions/todos';

export function SectionedTodos({ sections }: { sections: TodoSectionWithItems[] }) {
  const router = useRouter();
  const [, start] = useTransition();
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(sections.filter((s) => s.items.length > 0).map((s) => s.id)),
  );
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [newItem, setNewItem] = useState<Record<string, string>>({});
  const [newSection, setNewSection] = useState('');

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    start(async () => {
      const r = await fn();
      if (r.ok) router.refresh();
      else toast.error(r.error ?? 'Error');
    });
  }
  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  return (
    <div className="flex flex-col rounded-lg border border-line-subtle bg-surface-raised">
      <div className="flex items-center justify-between border-b border-line-subtle px-5 py-4">
        <h3 className="text-400 font-semibold text-fg-default">Mi semana</h3>
      </div>

      <div className="divide-y divide-line-subtle">
        {sections.map((section) => {
          const open = expanded.has(section.id);
          const doneCount = section.items.filter((i) => i.done).length;
          return (
            <div key={section.id}>
              <div className="flex items-center gap-2 px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => toggleExpand(section.id)}
                  className="flex flex-1 items-center gap-2 text-left"
                >
                  {open ? (
                    <ChevronDown className="size-4 text-fg-subtlest" />
                  ) : (
                    <ChevronRight className="size-4 text-fg-subtlest" />
                  )}
                  {renamingId === section.id ? (
                    <Input
                      autoFocus
                      value={renameVal}
                      onChange={(e) => setRenameVal(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && renameVal.trim()) {
                          run(() => renameTodoSectionAction(section.id, renameVal.trim()));
                          setRenamingId(null);
                        }
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      onBlur={() => setRenamingId(null)}
                      className="h-7 w-40"
                    />
                  ) : (
                    <span className="text-300 font-medium text-fg-default">{section.name}</span>
                  )}
                  <span className="text-100 tabular-nums text-fg-subtlest">
                    {section.items.length > 0 && `${doneCount}/${section.items.length}`}
                  </span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="rounded p-1 text-fg-subtlest transition-colors hover:bg-surface-overlay hover:text-fg-default"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setRenamingId(section.id);
                        setRenameVal(section.name);
                      }}
                    >
                      <Pencil className="size-4" /> Renombrar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => run(() => deleteTodoSectionAction(section.id))}>
                      <Trash2 className="size-4" /> Eliminar sección
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {open && (
                <div className="px-4 pb-3 pl-10">
                  {section.items.map((item) => (
                    <div key={item.id} className="group flex items-center gap-2.5 py-1.5">
                      <Checkbox
                        checked={item.done}
                        onCheckedChange={(v) => run(() => toggleTodoItemAction(item.id, Boolean(v)))}
                      />
                      <span
                        className={cn(
                          'flex-1 text-300',
                          item.done ? 'text-fg-subtlest line-through' : 'text-fg-default',
                        )}
                      >
                        {item.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => run(() => deleteTodoItemAction(item.id))}
                        className="text-fg-subtlest opacity-0 transition-opacity hover:text-danger-text group-hover:opacity-100"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 py-1">
                    <Plus className="size-4 text-fg-subtlest" />
                    <Input
                      value={newItem[section.id] ?? ''}
                      onChange={(e) =>
                        setNewItem((p) => ({ ...p, [section.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        const val = (newItem[section.id] ?? '').trim();
                        if (e.key === 'Enter' && val) {
                          run(() => addTodoItemAction(section.id, val));
                          setNewItem((p) => ({ ...p, [section.id]: '' }));
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
        })}
      </div>

      <div className="flex items-center gap-2 border-t border-line-subtle px-4 py-2.5">
        <Plus className="size-4 text-signature" />
        <Input
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newSection.trim()) {
              run(() => addTodoSectionAction(newSection.trim()));
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
