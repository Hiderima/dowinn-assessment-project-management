import { FolderKanban, Settings, Database, ChevronRight } from 'lucide-react';
import type { Project } from '@/types/project';
import { cn } from '@/lib/utils';

interface Props {
  projects: Project[];
  selectedId: string;
  onSelect: (id: string) => void;
  onSeed: () => void;
  apiAvailable: boolean;
}

export function ProjectSidebar({ projects, selectedId, onSelect, onSeed, apiAvailable }: Props) {
  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar text-sidebar-foreground flex flex-col h-screen border-r border-sidebar-border">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <FolderKanban className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-accent-foreground tracking-tight">ProjectFlow</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <p className="px-5 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50 mb-2">Projects</p>
        <nav className="space-y-0.5 px-2">
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left',
                selectedId === p.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', selectedId === p.id && 'rotate-90')} />
              <span className="truncate">{p.name}</span>
              <span className="ml-auto text-xs opacity-50">{p.taskCount}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        {!apiAvailable && (
          <p className="px-3 py-1 text-xs text-sidebar-foreground/40">Demo mode — API offline</p>
        )}
        <button
          onClick={onSeed}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
        >
          <Database className="w-4 h-4" />
          Seed Database
        </button>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}
