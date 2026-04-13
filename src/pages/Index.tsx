import { useState } from 'react';
import { LayoutDashboard, BarChart3, Table2, PieChart as PieIcon } from 'lucide-react';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { AddProjectModal } from '@/components/AddProjectModal';
import { ProjectProgressBar } from '@/components/ProjectProgressBar';
import { TaskStatusPieChart } from '@/components/TaskStatusPieChart';
import { Timesheet } from '@/components/Timesheet';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';

type Tab = 'board' | 'timesheet' | 'analytics';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'board', label: 'Board', icon: LayoutDashboard },
  { id: 'timesheet', label: 'Timesheet', icon: Table2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

const Index = () => {
  const { projects, selectedProject, selectedProjectId, setSelectedProjectId, tasks, loading, moveTask, seedDatabase, addProject, apiAvailable } = useProjects();
  const [showAddProject, setShowAddProject] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('board');

  return (
    <div className="flex h-screen overflow-hidden">
      <ProjectSidebar
        projects={projects}
        selectedId={selectedProjectId}
        onSelect={setSelectedProjectId}
        onSeed={seedDatabase}
        onAddProject={() => setShowAddProject(true)}
        apiAvailable={apiAvailable}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-6 border-b bg-card">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <div>
              <h1 className="text-sm font-semibold text-card-foreground">{selectedProject?.name || 'Select a project'}</h1>
              {selectedProject && <p className="text-xs text-muted-foreground">{selectedProject.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
            {!apiAvailable && (
              <span className="ml-3 text-xs bg-accent text-accent-foreground px-2.5 py-1 rounded-full font-medium">
                Demo Mode
              </span>
            )}
          </div>
        </header>

        {activeTab === 'board' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-4">
              <ProjectProgressBar tasks={tasks} />
            </div>
            <KanbanBoard tasks={tasks} loading={loading} onMoveTask={moveTask} />
          </div>
        )}

        {activeTab === 'timesheet' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-card rounded-xl border p-5">
              <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <Table2 className="w-4 h-4 text-primary" />
                Timesheet — {selectedProject?.name}
              </h2>
              <Timesheet tasks={tasks} />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-card rounded-xl border p-5">
                <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-primary" />
                  Task Distribution
                </h2>
                <TaskStatusPieChart tasks={tasks} />
              </div>
              <div className="bg-card rounded-xl border p-5">
                <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Overall Progress
                </h2>
                <ProjectProgressBar tasks={tasks} />
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Todo', count: tasks.filter(t => t.status === 'todo').length, color: 'hsl(var(--column-todo))' },
                    { label: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, color: 'hsl(var(--column-progress))' },
                    { label: 'Done', count: tasks.filter(t => t.status === 'done').length, color: 'hsl(var(--column-done))' },
                  ].map(s => (
                    <div key={s.label} className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-card-foreground">{s.count}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddProjectModal
        open={showAddProject}
        onClose={() => setShowAddProject(false)}
        onAdd={addProject}
      />
    </div>
  );
};

export default Index;
