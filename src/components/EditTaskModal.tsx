import { useState, useEffect } from 'react';
import { X, Pencil, Trash2 } from 'lucide-react';
import type { TaskWithChangelog } from '@/hooks/useProjects';

interface Props {
  open: boolean;
  task: TaskWithChangelog | null;
  onClose: () => void;
  onUpdate: (taskId: string, updates: { title: string; description: string; priority: 'low' | 'medium' | 'high'; assignee: string; status: 'todo' | 'in_progress' | 'done' }) => void;
  onDelete: (taskId: string) => void;
}

export function EditTaskModal({ open, task, onClose, onUpdate, onDelete }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');
  const [assignee, setAssignee] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setAssignee(task.assignee || '');
      setConfirmDelete(false);
    }
  }, [task]);

  if (!open || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onUpdate(task.id, { title: title.trim(), description: description.trim(), priority, assignee: assignee.trim() });
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card rounded-xl border shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-card-foreground">Edit Task</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-card-foreground mb-1 block">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
          </div>
          <div>
            <label className="text-sm font-medium text-card-foreground mb-1 block">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" rows={3} />
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
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleDelete}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors ${confirmDelete ? 'bg-destructive text-destructive-foreground' : 'text-destructive hover:bg-destructive/10'}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {confirmDelete ? 'Confirm Delete' : 'Delete'}
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button type="submit" disabled={!title.trim()} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-40">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
