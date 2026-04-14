import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { format, differenceInDays, addDays, parseISO, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, User, Clock, Pencil, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskWithChangelog } from '@/hooks/useProjects';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

interface ProjectInfo {
  id: string;
  name: string;
}

interface Props {
  tasks: TaskWithChangelog[];
  onUpdateDates: (taskId: string, startDate: string, endDate: string) => void;
  onUpdateTimes?: (taskId: string, startTime: string, endTime: string) => void;
  onEditTask?: (task: TaskWithChangelog) => void;
  projects?: ProjectInfo[];
}

const statusColor: Record<string, string> = {
  todo: 'hsl(var(--column-todo, 220 72% 50%))',
  in_progress: 'hsl(var(--column-progress, 35 92% 50%))',
  done: 'hsl(var(--column-done, 145 63% 42%))',
};

const statusColorRaw: Record<string, string> = {
  todo: 'hsl(220, 72%, 50%)',
  in_progress: 'hsl(35, 92%, 50%)',
  done: 'hsl(145, 63%, 42%)',
};

const statusLabel: Record<string, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
};

const priorityBadge: Record<string, { bg: string; text: string }> = {
  high: { bg: 'bg-red-500/15 text-red-400', text: 'High' },
  medium: { bg: 'bg-yellow-500/15 text-yellow-400', text: 'Med' },
  low: { bg: 'bg-green-500/15 text-green-400', text: 'Low' },
};

const TASK_LIST_WIDTH = 320;
const DAY_WIDTH = 44;
const ROW_HEIGHT = 52;

function formatAssignee(assignee: string) {
  // Strip employee number like "Name (123456)" → "Name"
  return assignee.replace(/\s*\(.*\)$/, '');
}
export function TimelineView({ tasks, onUpdateDates, onUpdateTimes, onEditTask, projects }: Props) {
  const [viewOffset, setViewOffset] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);

  // Sync vertical scroll between task list and timeline
  const handleTimelineScroll = useCallback(() => {
    if (timelineRef.current && taskListRef.current) {
      taskListRef.current.scrollTop = timelineRef.current.scrollTop;
    }
  }, []);

  const handleTaskListScroll = useCallback(() => {
    if (timelineRef.current && taskListRef.current) {
      timelineRef.current.scrollTop = taskListRef.current.scrollTop;
    }
  }, []);

  const { timelineStart, totalDays } = useMemo(() => {
    const pad = 3;
    const minDays = 28;

    if (tasks.length === 0) {
      const start = addDays(startOfDay(new Date()), viewOffset - 7);
      return { timelineStart: start, totalDays: minDays };
    }

    const dates = tasks.flatMap(t => {
      const s = t.start_date ? parseISO(t.start_date) : new Date(t.created_at);
      const e = t.end_date ? parseISO(t.end_date) : addDays(s, 3);
      return [s, e];
    });

    const minDate = addDays(new Date(Math.min(...dates.map(d => d.getTime()))), -pad + viewOffset);
    const maxDate = addDays(new Date(Math.max(...dates.map(d => d.getTime()))), pad + 7 + viewOffset);
    const days = Math.max(minDays, differenceInDays(maxDate, minDate));
    return { timelineStart: startOfDay(minDate), totalDays: days };
  }, [tasks, viewOffset]);

  const dayHeaders = useMemo(() => {
    return Array.from({ length: totalDays }, (_, i) => addDays(timelineStart, i));
  }, [timelineStart, totalDays]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Scroll to today on mount
  useEffect(() => {
    if (timelineRef.current && viewOffset === 0) {
      const todayOffset = differenceInDays(startOfDay(new Date()), timelineStart);
      if (todayOffset > 0) {
        timelineRef.current.scrollLeft = Math.max(0, (todayOffset - 3) * DAY_WIDTH);
      }
    }
  }, [timelineStart, viewOffset]);

  return (
    <div className="flex flex-col">
      {/* Navigation */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setViewOffset(v => v - 7)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-3 h-3" /> Previous
        </button>
        <button
          onClick={() => setViewOffset(0)}
          className="px-2.5 py-1.5 text-xs rounded-md border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-medium"
        >
          Today
        </button>
        <button
          onClick={() => setViewOffset(v => v + 7)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          Next <ChevronRight className="w-3 h-3" />
        </button>
        <span className="text-xs text-muted-foreground ml-2">
          {format(timelineStart, 'MMM d')} — {format(addDays(timelineStart, totalDays - 1), 'MMM d, yyyy')}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
          No tasks — use navigation to browse dates
        </div>
      ) : (
        <div className="flex border rounded-lg overflow-hidden bg-card">
          {/* Left: Task list */}
          <div
            className="flex-shrink-0 border-r"
            style={{ width: TASK_LIST_WIDTH }}
          >
            {/* Header */}
            <div className="h-[52px] flex items-end px-3 pb-2 border-b bg-muted/30">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Tasks</span>
            </div>
            {/* Task rows */}
            <div
              ref={taskListRef}
              className="overflow-y-auto overflow-x-hidden"
              style={{ maxHeight: Math.min(tasks.length * ROW_HEIGHT, 400) }}
              onScroll={handleTaskListScroll}
            >
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 px-3 border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer group"
                  style={{ height: ROW_HEIGHT }}
                  onClick={() => onEditTask?.(task)}
                >
                  {/* Status dot */}
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: statusColorRaw[task.status] }}
                  />
                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-card-foreground truncate">{task.title}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {projects && projects.length > 0 && (() => {
                        const proj = projects.find(p => p.id === task.project_id);
                        return proj ? (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium truncate max-w-[110px]">{proj.name}</span>
                        ) : null;
                      })()}
                      {task.assignee && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground truncate max-w-[100px]">
                          <User className="w-2.5 h-2.5 shrink-0" /> {formatAssignee(task.assignee)}
                        </span>
                      )}
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded font-medium', priorityBadge[task.priority].bg)}>
                        {priorityBadge[task.priority].text}
                      </span>
                    </div>
                  </div>
                  {/* Edit icon on hover */}
                  <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Timeline/Gantt */}
          <div className="flex-1 overflow-hidden">
            <div
              ref={timelineRef}
              className="overflow-auto"
              style={{ maxHeight: Math.min(tasks.length * ROW_HEIGHT, 400) + 52 }}
              onScroll={handleTimelineScroll}
            >
              <div style={{ minWidth: totalDays * DAY_WIDTH }}>
                {/* Day headers */}
                <div className="flex sticky top-0 z-10 bg-muted/30 border-b" style={{ height: 52 }}>
                  {dayHeaders.map((day, i) => {
                    const isToday = format(day, 'yyyy-MM-dd') === todayStr;
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    return (
                      <div
                        key={i}
                        className={cn(
                          'flex flex-col items-center justify-end pb-1 border-l border-border/20 text-[10px]',
                          isWeekend && 'bg-muted/40',
                          isToday && 'bg-primary/10'
                        )}
                        style={{ width: DAY_WIDTH }}
                      >
                        <span className={cn('font-medium', isToday ? 'text-primary' : 'text-muted-foreground')}>
                          {format(day, 'EEE')}
                        </span>
                        <span
                          className={cn(
                            'w-5 h-5 flex items-center justify-center rounded-full text-[11px] font-semibold',
                            isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {format(day, 'd')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Task bar rows */}
                {tasks.map(task => (
                  <TimelineRow
                    key={task.id}
                    task={task}
                    timelineStart={timelineStart}
                    totalDays={totalDays}
                    onUpdateDates={onUpdateDates}
                    onEditTask={onEditTask}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface RowProps {
  task: TaskWithChangelog;
  timelineStart: Date;
  totalDays: number;
  onUpdateDates: (taskId: string, startDate: string, endDate: string) => void;
  onEditTask?: (task: TaskWithChangelog) => void;
}

function TimelineRow({ task, timelineStart, totalDays, onUpdateDates, onEditTask }: RowProps) {
  const taskStart = task.start_date ? parseISO(task.start_date) : new Date(task.created_at);
  const taskEnd = task.end_date ? parseISO(task.end_date) : addDays(taskStart, 3);

  const startOffset = differenceInDays(startOfDay(taskStart), timelineStart);
  const duration = Math.max(1, differenceInDays(startOfDay(taskEnd), startOfDay(taskStart)));

  const [dragging, setDragging] = useState<'move' | 'start' | 'end' | null>(null);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, offset: startOffset, dur: duration });

  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'move' | 'start' | 'end') => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(type);
    setDragOrigin({ x: e.clientX, offset: startOffset, dur: duration });
  }, [startOffset, duration]);

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragOrigin.x;
      const daysDelta = Math.round(dx / DAY_WIDTH);

      if (dragging === 'move') {
        const newOffset = dragOrigin.offset + daysDelta;
        const newStart = addDays(timelineStart, newOffset);
        const newEnd = addDays(newStart, dragOrigin.dur);
        onUpdateDates(task.id, format(newStart, 'yyyy-MM-dd'), format(newEnd, 'yyyy-MM-dd'));
      } else if (dragging === 'end') {
        const newDur = Math.max(1, dragOrigin.dur + daysDelta);
        const start = addDays(timelineStart, dragOrigin.offset);
        const newEnd = addDays(start, newDur);
        onUpdateDates(task.id, format(start, 'yyyy-MM-dd'), format(newEnd, 'yyyy-MM-dd'));
      } else if (dragging === 'start') {
        const newOffset = dragOrigin.offset + daysDelta;
        const newDur = Math.max(1, dragOrigin.dur - daysDelta);
        const newStart = addDays(timelineStart, newOffset);
        const newEnd = addDays(newStart, newDur);
        onUpdateDates(task.id, format(newStart, 'yyyy-MM-dd'), format(newEnd, 'yyyy-MM-dd'));
      }
    };

    const handleMouseUp = () => setDragging(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOrigin, timelineStart, task.id, onUpdateDates]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const barLeft = startOffset * DAY_WIDTH;
  const barWidth = Math.max(DAY_WIDTH * 0.8, duration * DAY_WIDTH - 4);

  return (
    <div
      className="relative border-b border-border/20 hover:bg-muted/10 transition-colors"
      style={{ height: ROW_HEIGHT }}
    >
      {/* Today marker */}
      {(() => {
        const todayOffset = differenceInDays(startOfDay(new Date()), timelineStart);
        if (todayOffset >= 0 && todayOffset < totalDays) {
          return (
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-primary/40 z-[1]"
              style={{ left: todayOffset * DAY_WIDTH + DAY_WIDTH / 2 }}
            />
          );
        }
        return null;
      })()}

      {/* Grid lines */}
      {Array.from({ length: totalDays }, (_, i) => {
        const day = addDays(timelineStart, i);
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        return (
          <div
            key={i}
            className={cn(
              'absolute top-0 bottom-0 border-l border-border/10',
              isWeekend && 'bg-muted/20'
            )}
            style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}
          />
        );
      })}

      {/* Gantt bar */}
      <div
        className={cn(
          'absolute top-2 rounded-md cursor-grab active:cursor-grabbing transition-shadow hover:shadow-lg group/bar flex items-center',
          dragging && 'shadow-lg'
        )}
        style={{
          left: barLeft + 2,
          width: barWidth,
          height: ROW_HEIGHT - 16,
          background: statusColorRaw[task.status],
          opacity: dragging ? 0.9 : 0.8,
          zIndex: dragging ? 20 : 5,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'move')}
        onDoubleClick={() => onEditTask?.(task)}
      >
        {/* Left resize handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize hover:bg-white/30 rounded-l-md"
          onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'start'); }}
        />

        {/* Bar content */}
        <span className="text-[10px] text-white font-medium px-2.5 truncate select-none w-full text-center">
          {task.title.length > 12 ? task.title.slice(0, 12) + '…' : task.title}
        </span>

        {/* Right resize handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-white/30 rounded-r-md"
          onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'end'); }}
        />
      </div>
    </div>
  );
}
