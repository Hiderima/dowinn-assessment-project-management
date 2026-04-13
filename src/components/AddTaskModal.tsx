import { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, description: string, priority: 'low' | 'medium' | 'high', assignee: string) => void;
}

export function AddTaskModal({ open, onClose, onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [assignee, setAssignee] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), description.trim(), priority, assignee.trim());
    setTitle('');
    setDescription('');
    setPriority('medium');
    setAssignee('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-xl border shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-card-foreground">New Task</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-card-foreground mb-1 block">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Task title" autoFocus required />
          </div>
          <div>
            <label className="text-sm font-medium text-card-foreground mb-1 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" rows={3} placeholder="Task description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-card-foreground mb-1 block">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as any)} className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-card-foreground mb-1 block">Assignee</label>
              <input value={assignee} onChange={e => setAssignee(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Optional" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={!title.trim()} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40">Create Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}
