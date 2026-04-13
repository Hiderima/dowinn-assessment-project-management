import { LayoutDashboard } from 'lucide-react';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { useProjects } from '@/hooks/useProjects';

const Index = () => {
  const { projects, selectedProject, selectedProjectId, setSelectedProjectId, tasks, loading, moveTask, seedDatabase, apiAvailable } = useProjects();

  return (
    <div className="flex h-screen overflow-hidden">
      <ProjectSidebar
        projects={projects}
        selectedId={selectedProjectId}
        onSelect={setSelectedProjectId}
        onSeed={seedDatabase}
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
          {!apiAvailable && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
              Demo Mode
            </span>
          )}
        </header>

        <KanbanBoard tasks={tasks} loading={loading} onMoveTask={moveTask} />
      </div>
    </div>
  );
};

export default Index;
