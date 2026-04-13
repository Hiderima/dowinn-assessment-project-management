import { useState } from 'react';
import { LayoutDashboard, Table2, PieChart as PieIcon, Plus, LogOut } from 'lucide-react';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { AddProjectModal } from '@/components/AddProjectModal';
import { AddTaskModal } from '@/components/AddTaskModal';
import { ProjectProgressBar } from '@/components/ProjectProgressBar';
import { TaskStatusPieChart } from '@/components/TaskStatusPieChart';
import { Timesheet } from '@/components/Timesheet';
import { GanttChart } from '@/components/GanttChart';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, signOut } = useAuth();
  const { projects, selectedProject, selectedProjectId, setSelectedProjectId, tasks, loading, moveTask, addProject, addTask, updateTaskDates, seedDatabase } = useProjects();
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <ProjectSidebar
        projects={projects}
        selectedId={selectedProjectId}
        onSelect={setSelectedProjectId}
        onSeed={seedDatabase}
        onAddProject={() => setShowAddProject(true)}
        apiAvailable={true}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-6 border-b bg-card">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <div>
              <h1 className="text-sm font-semibold text-card-foreground">
                {selectedProjectId === 'all' ? 'All Projects' : selectedProject?.name || 'Select a project'}
              </h1>
              {selectedProjectId !== 'all' && selectedProject && <p className="text-xs text-muted-foreground">{selectedProject.description}</p>}
              {selectedProjectId === 'all' && <p className="text-xs text-muted-foreground">Overview of all projects</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedProject && selectedProjectId !== 'all' && (
              <button
                onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </button>
            )}
            <span className="text-xs text-muted-foreground">{user?.email}</span>
            <button onClick={signOut} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {/* Pie Chart (left) + Progress Bar (right) for individual projects */}
          {selectedProjectId !== 'all' && tasks.length > 0 && (
            <div className="px-6 pt-4 grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-5 items-start">
              <div className="bg-card rounded-xl border p-4">
                <h2 className="text-xs font-semibold text-card-foreground mb-3 flex items-center gap-1.5">
                  <PieIcon className="w-3.5 h-3.5 text-primary" />
                  Task Distribution
                </h2>
                <TaskStatusPieChart tasks={tasks} />
              </div>
              <ProjectProgressBar tasks={tasks} />
            </div>
          )}

          {/* Kanban Board - only for individual projects */}
          {selectedProjectId !== 'all' && (
            <KanbanBoard tasks={tasks} loading={loading} onMoveTask={moveTask} />
          )}

          {/* Per-project Timesheet + Gantt */}
          {selectedProjectId !== 'all' && tasks.length > 0 && (
            <div className="px-6 pb-6">
              <div className="bg-card rounded-xl border p-5">
                <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <Table2 className="w-4 h-4 text-primary" />
                  Timesheet & Gantt Chart
                </h2>
                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-5">
                  <Timesheet tasks={tasks} onUpdateDates={updateTaskDates} />
                  <div className="border-l pl-5">
                    <GanttChart tasks={tasks} onUpdateDates={updateTaskDates} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Projects view: Pie Chart + Timesheet + Gantt */}
          {selectedProjectId === 'all' && (
            <div className="px-6 py-6 space-y-5">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : tasks.length > 0 ? (
                <>
                  <div className="bg-card rounded-xl border p-5">
                    <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <PieIcon className="w-4 h-4 text-primary" />
                      Overall Task Distribution
                    </h2>
                    <TaskStatusPieChart tasks={tasks} projects={projects} />
                  </div>
                  <div className="bg-card rounded-xl border p-5">
                    <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <Table2 className="w-4 h-4 text-primary" />
                      Timesheet & Gantt Chart — All Projects
                    </h2>
                    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-5">
                      <Timesheet tasks={tasks} onUpdateDates={updateTaskDates} />
                      <div className="border-l pl-5">
                        <GanttChart tasks={tasks} onUpdateDates={updateTaskDates} />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">No tasks across any project</div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddProjectModal open={showAddProject} onClose={() => setShowAddProject(false)} onAdd={addProject} />
      <AddTaskModal open={showAddTask} onClose={() => setShowAddTask(false)} onAdd={addTask} />
    </div>
  );
};

export default Index;
