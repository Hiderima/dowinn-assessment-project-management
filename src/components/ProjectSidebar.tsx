import { FolderKanban, Settings, Database, ChevronRight, Plus, LayoutGrid, UserCircle, Building2 } from 'lucide-react';
import type { Project } from '@/types/project';
import { cn } from '@/lib/utils';

/** Props for the project sidebar. */
interface Props {
  projects: Project[];          // All projects to render in the list.
  selectedId: string;           // Currently selected id (or virtual key: 'all' | 'my' | 'dept').
  onSelect: (id: string) => void; // Called when the user picks a project or virtual view.
  onSeed: () => void;           // Seed-database action.
  onAddProject: () => void;     // Open the add-project modal.
  apiAvailable: boolean;        // Whether the legacy REST API is reachable (shows demo-mode notice when false).
}

/** Reusable sidebar nav button */
function SidebarButton({ selected, onClick, icon: Icon, label, badge }: {
  selected: boolean; onClick: () => void; icon: React.ElementType; label: string; badge?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left',
        selected
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="truncate">{label}</span>
      {badge && <span className="ml-auto text-xs opacity-50">{badge}</span>}
    </button>
  );
}

export function ProjectSidebar({ projects, selectedId, onSelect, onSeed, onAddProject, apiAvailable }: Props) {
  const totalTasks = projects.reduce((s, p) => s + p.taskCount, 0);

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar text-sidebar-foreground flex flex-col h-screen border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <FolderKanban className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-semibold text-sidebar-accent-foreground tracking-tight">Dowinn Project Management</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-5 flex items-center justify-between mb-2">
          <p className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">Projects</p>
          <button onClick={onAddProject} className="text-sidebar-foreground/50 hover:text-sidebar-primary transition-colors" title="Add project">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <nav className="space-y-0.5 px-2">
          {/* Virtual views */}
          <SidebarButton selected={selectedId === 'all'} onClick={() => onSelect('all')} icon={LayoutGrid} label="All Projects" badge={totalTasks} />
          <SidebarButton selected={selectedId === 'my'} onClick={() => onSelect('my')} icon={UserCircle} label="My Projects" />
          <SidebarButton selected={selectedId === 'dept'} onClick={() => onSelect('dept')} icon={Building2} label="My Department" />

          {/* Individual projects */}
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

      {/* Footer actions */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {!apiAvailable && (
          <p className="px-3 py-1 text-xs text-sidebar-foreground/40">Demo mode — API offline</p>
        )}
        <button onClick={onSeed} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors">
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
