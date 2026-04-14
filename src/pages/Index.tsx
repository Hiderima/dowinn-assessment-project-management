import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Table2, PieChart as PieIcon, Plus, LogOut, Menu, X, Moon, Sun, Settings, Shield, Building2 } from 'lucide-react';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { AddProjectModal } from '@/components/AddProjectModal';
import { AddTaskModal } from '@/components/AddTaskModal';
import { EditTaskModal } from '@/components/EditTaskModal';
import { EditProjectModal } from '@/components/EditProjectModal';
import { ProjectProgressBar } from '@/components/ProjectProgressBar';
import { TaskStatusPieChart } from '@/components/TaskStatusPieChart';
import { TimelineView } from '@/components/TimelineView';
import { DepartmentProgressBars } from '@/components/DepartmentProgressBars';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/useTheme';
import { useAdmin } from '@/hooks/useAdmin';
import type { TaskWithChangelog } from '@/hooks/useProjects';

const Index = () => {
  const { user, signOut } = useAuth();
  const { projects, selectedProject, selectedProjectId, setSelectedProjectId, tasks, loading, moveTask, addProject, updateProject, deleteProject, addTask, updateTask, deleteTask, updateTaskDates, updateTaskTimes, seedDatabase } = useProjects();
  const [showAddProject, setShowAddProject] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithChangelog | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kanbanOpen, setKanbanOpen] = useState(false);
  const isMobile = useIsMobile();
  const { theme, toggle: toggleTheme } = useTheme();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [userDepartment, setUserDepartment] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('display_name, department').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      setDisplayName(data?.display_name || null);
      setUserDepartment(data?.department || null);
    });
  }, [user]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={
        isMobile
          ? `fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
          : ''
      }>
        <ProjectSidebar
          projects={projects}
          selectedId={selectedProjectId}
          onSelect={(id) => { setSelectedProjectId(id); if (isMobile) setSidebarOpen(false); }}
          onSeed={seedDatabase}
          onAddProject={() => setShowAddProject(true)}
          apiAvailable={true}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b bg-card">
          <div className="flex items-center gap-2 md:gap-3">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <LayoutDashboard className="w-5 h-5 text-primary hidden md:block" />
            <div>
              <h1 className="text-sm font-semibold text-card-foreground">
                {selectedProjectId === 'all' ? 'All Projects' : selectedProjectId === 'my' ? 'My Projects' : selectedProjectId === 'dept' ? `My Department — ${userDepartment || ''}` : selectedProject?.name || 'Select a project'}
              </h1>
              {selectedProjectId !== 'all' && selectedProjectId !== 'my' && selectedProjectId !== 'dept' && selectedProject && <p className="text-xs text-muted-foreground hidden md:block">{selectedProject.description}</p>}
              {selectedProjectId === 'all' && <p className="text-xs text-muted-foreground hidden md:block">Overview of all projects</p>}
              {selectedProjectId === 'my' && <p className="text-xs text-muted-foreground hidden md:block">Projects where you are assigned</p>}
              {selectedProjectId === 'dept' && <p className="text-xs text-muted-foreground hidden md:block">All tasks in your department</p>}
            </div>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Kanban burger toggle (mobile/tablet only) */}
            {isMobile && !['all', 'my', 'dept'].includes(selectedProjectId) && (
              <button
                onClick={() => setKanbanOpen(v => !v)}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                title={kanbanOpen ? 'Hide Kanban' : 'Show Kanban'}
              >
                {kanbanOpen ? <X className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
              </button>
            )}
            {selectedProject && !['all', 'my', 'dept'].includes(selectedProjectId) && (
              <>
                <button
                  onClick={() => setShowEditProject(true)}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Edit project"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Add Task</span>
                </button>
              </>
            )}
            {/* Dark mode toggle */}
            {isAdmin && (
              <button onClick={() => navigate('/admin')} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Admin Panel">
                <Shield className="w-4 h-4" />
              </button>
            )}
            <button onClick={toggleTheme} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Toggle dark mode">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <span className="text-xs text-muted-foreground hidden md:inline">{displayName || user?.user_metadata?.full_name || 'User'}</span>
            <button onClick={signOut} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {/* Individual project view */}
          {!['all', 'my', 'dept'].includes(selectedProjectId) && (
            <div className="px-4 md:px-6 pt-4 pb-2">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5 items-start">
                <div className="space-y-4">
                  {tasks.length > 0 && <ProjectProgressBar tasks={tasks} />}
                  {(!isMobile || kanbanOpen) && (
                    <KanbanBoard tasks={tasks} loading={loading} onMoveTask={moveTask} onEditTask={setEditingTask} />
                  )}
                </div>

                {tasks.length > 0 && (
                  <div className="bg-card rounded-xl border p-4 lg:w-[280px]">
                    <h2 className="text-xs font-semibold text-card-foreground mb-3 flex items-center gap-1.5">
                      <PieIcon className="w-3.5 h-3.5 text-primary" />
                      Task Distribution
                    </h2>
                    <TaskStatusPieChart tasks={tasks} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Per-project Timeline */}
          {!['all', 'my', 'dept'].includes(selectedProjectId) && tasks.length > 0 && (
            <div className="px-4 md:px-6 pb-6">
              <div className="bg-card rounded-xl border p-4 md:p-5">
                <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <Table2 className="w-4 h-4 text-primary" />
                  Timeline
                </h2>
                <TimelineView tasks={tasks} onUpdateDates={updateTaskDates} onUpdateTimes={updateTaskTimes} onEditTask={setEditingTask} />
              </div>
            </div>
          )}

          {/* All/My Projects overview */}
          {(selectedProjectId === 'all' || selectedProjectId === 'my') && (
            <div className="px-4 md:px-6 py-6 space-y-5">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : tasks.length > 0 ? (
                <>
                  <div className="bg-card rounded-xl border p-4 md:p-5">
                    <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <PieIcon className="w-4 h-4 text-primary" />
                      {selectedProjectId === 'my' ? 'My Task Distribution' : 'Overall Task Distribution'}
                    </h2>
                    <TaskStatusPieChart tasks={tasks} projects={projects} />
                  </div>
                  {selectedProjectId === 'all' && (
                    <div className="bg-card rounded-xl border p-4 md:p-5">
                      <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                        <PieIcon className="w-4 h-4 text-primary" />
                        Department Progress
                      </h2>
                      <DepartmentProgressBars />
                    </div>
                  )}
                  <div className="bg-card rounded-xl border p-4 md:p-5">
                    <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <Table2 className="w-4 h-4 text-primary" />
                      {selectedProjectId === 'my' ? 'Timeline — My Projects' : 'Timeline — All Projects'}
                    </h2>
                    <TimelineView tasks={tasks} onUpdateDates={updateTaskDates} onUpdateTimes={updateTaskTimes} onEditTask={setEditingTask} projects={projects} />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  {selectedProjectId === 'my' ? 'No tasks assigned to you' : 'No tasks across any project'}
                </div>
              )}
            </div>
          )}

          {/* My Department view */}
          {selectedProjectId === 'dept' && (
            <div className="px-4 md:px-6 py-6 space-y-5">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : tasks.length > 0 ? (
                <>
                  <div className="bg-card rounded-xl border p-4 md:p-5">
                    <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      {userDepartment} — Progress
                    </h2>
                    <DepartmentProgressBars filterDepartment={userDepartment || undefined} />
                  </div>
                  <div className="bg-card rounded-xl border p-4 md:p-5">
                    <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <PieIcon className="w-4 h-4 text-primary" />
                      Task Distribution — Per Project
                    </h2>
                    <TaskStatusPieChart tasks={tasks} projects={projects} />
                  </div>
                  <KanbanBoard tasks={tasks} loading={loading} onMoveTask={moveTask} onEditTask={setEditingTask} />
                  <div className="bg-card rounded-xl border p-4 md:p-5">
                    <h2 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <Table2 className="w-4 h-4 text-primary" />
                      Timeline — {userDepartment}
                    </h2>
                    <TimelineView tasks={tasks} onUpdateDates={updateTaskDates} onUpdateTimes={updateTaskTimes} onEditTask={setEditingTask} />
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                  {userDepartment ? 'No tasks in your department' : 'No department assigned to your profile'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddProjectModal open={showAddProject} onClose={() => setShowAddProject(false)} onAdd={addProject} />
      <AddTaskModal open={showAddTask} onClose={() => setShowAddTask(false)} onAdd={addTask} />
      <EditProjectModal
        open={showEditProject}
        project={selectedProject ? { id: selectedProject.id, name: selectedProject.name, description: selectedProject.description } : null}
        onClose={() => setShowEditProject(false)}
        onUpdate={updateProject}
        onDelete={deleteProject}
      />
      <EditTaskModal
        open={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onUpdate={updateTask}
        onDelete={deleteTask}
        onStatusChange={moveTask}
      />
    </div>
  );
};

export default Index;
