import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { format, differenceInDays, addDays, parseISO, startOfDay, subDays } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { TaskWithChangelog } from '@/hooks/useProjects';

interface Props {
  tasks: TaskWithChangelog[];
  onUpdateDates: (taskId: string, startDate: string, endDate: string) => void;
}

const statusColor: Record<string, string> = {
  todo: 'hsl(220, 72%, 50%)',
  in_progress: 'hsl(35, 92%, 50%)',
  done: 'hsl(145, 63%, 42%)',
};

export function GanttChart({ tasks, onUpdateDates }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute timeline range
  const { timelineStart, totalDays, dayWidth } = useMemo(() => {
    if (tasks.length === 0) return { timelineStart: new Date(), totalDays: 14, dayWidth: 40 };

    const dates = tasks.flatMap(t => {
      const s = t.start_date ? parseISO(t.start_date) : new Date(t.created_at);
      const e = t.end_date ? parseISO(t.end_date) : addDays(s, 3);
      return [s, e];
    });

    const minDate = addDays(new Date(Math.min(...dates.map(d => d.getTime()))), -2);
    const maxDate = addDays(new Date(Math.max(...dates.map(d => d.getTime()))), 5);
    const days = Math.max(14, differenceInDays(maxDate, minDate));
    return { timelineStart: startOfDay(minDate), totalDays: days, dayWidth: 40 };
  }, [tasks]);

  // Generate day headers
  const dayHeaders = useMemo(() => {
    return Array.from({ length: totalDays }, (_, i) => addDays(timelineStart, i));
  }, [timelineStart, totalDays]);

  if (tasks.length === 0) return <div className="text-sm text-muted-foreground text-center py-8">No tasks</div>;

  return (
    <div className="overflow-x-auto" ref={containerRef}>
      <div style={{ minWidth: totalDays * dayWidth + 200 }}>
        {/* Day headers */}
        <div className="flex border-b sticky top-0 bg-card z-10">
          <div className="w-[200px] flex-shrink-0" />
          <div className="flex">
            {dayHeaders.map((day, i) => (
              <div
                key={i}
                className={cn(
                  'text-center text-[10px] text-muted-foreground py-1 border-l border-border/30',
                  day.getDay() === 0 || day.getDay() === 6 ? 'bg-muted/20' : ''
                )}
                style={{ width: dayWidth }}
              >
                <div className="font-medium">{format(day, 'dd')}</div>
                <div>{format(day, 'MMM')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Task rows */}
        {tasks.map(task => (
          <GanttRow
            key={task.id}
            task={task}
            timelineStart={timelineStart}
            totalDays={totalDays}
            dayWidth={dayWidth}
            onUpdateDates={onUpdateDates}
          />
        ))}
      </div>
    </div>
  );
}

interface RowProps {
  task: TaskWithChangelog;
  timelineStart: Date;
  totalDays: number;
  dayWidth: number;
  onUpdateDates: (taskId: string, startDate: string, endDate: string) => void;
}

function GanttRow({ task, timelineStart, totalDays, dayWidth, onUpdateDates }: RowProps) {
  const taskStart = task.start_date ? parseISO(task.start_date) : new Date(task.created_at);
  const taskEnd = task.end_date ? parseISO(task.end_date) : addDays(taskStart, 3);

  const startOffset = Math.max(0, differenceInDays(startOfDay(taskStart), timelineStart));
  const duration = Math.max(1, differenceInDays(startOfDay(taskEnd), startOfDay(taskStart)));

  const [dragging, setDragging] = useState<'move' | 'end' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, offset: startOffset, dur: duration });

  const barRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'move' | 'end') => {
    e.preventDefault();
    setDragging(type);
    setDragStart({ x: e.clientX, offset: startOffset, dur: duration });
  }, [startOffset, duration]);

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.x;
      const daysDelta = Math.round(dx / dayWidth);

      if (dragging === 'move') {
        const newOffset = Math.max(0, Math.min(totalDays - dragStart.dur, dragStart.offset + daysDelta));
        const newStart = addDays(timelineStart, newOffset);
        const newEnd = addDays(newStart, dragStart.dur);
        onUpdateDates(task.id, format(newStart, 'yyyy-MM-dd'), format(newEnd, 'yyyy-MM-dd'));
      } else if (dragging === 'end') {
        const newDur = Math.max(1, dragStart.dur + daysDelta);
        const newEnd = addDays(timelineStart, dragStart.offset + newDur);
        onUpdateDates(task.id, format(addDays(timelineStart, dragStart.offset), 'yyyy-MM-dd'), format(newEnd, 'yyyy-MM-dd'));
      }
    };

    const handleMouseUp = () => setDragging(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragStart, dayWidth, totalDays, timelineStart, task.id, onUpdateDates]);

  return (
    <div className="flex items-center border-b border-border/20 hover:bg-muted/20 transition-colors group">
      {/* Task name + date pickers */}
      <div className="w-[200px] flex-shrink-0 px-3 py-2 space-y-0.5">
        <div className="text-xs font-medium text-card-foreground truncate">{task.title}</div>
        <div className="flex items-center gap-1">
          <DatePicker
            value={taskStart}
            onChange={(d) => onUpdateDates(task.id, format(d, 'yyyy-MM-dd'), format(taskEnd, 'yyyy-MM-dd'))}
          />
          <span className="text-[10px] text-muted-foreground">→</span>
          <DatePicker
            value={taskEnd}
            onChange={(d) => onUpdateDates(task.id, format(taskStart, 'yyyy-MM-dd'), format(d, 'yyyy-MM-dd'))}
          />
        </div>
      </div>

      {/* Gantt bar area */}
      <div className="relative flex-1" style={{ height: 36 }}>
        {/* Grid lines */}
        {Array.from({ length: totalDays }, (_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-l border-border/15"
            style={{ left: i * dayWidth }}
          />
        ))}

        {/* The bar */}
        <div
          ref={barRef}
          className="absolute top-1.5 h-5 rounded cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md flex items-center"
          style={{
            left: startOffset * dayWidth + 2,
            width: Math.max(dayWidth, duration * dayWidth - 4),
            background: statusColor[task.status],
            opacity: 0.85,
          }}
          onMouseDown={(e) => handleMouseDown(e, 'move')}
        >
          <span className="text-[9px] text-white font-medium px-1.5 truncate">
            {duration}d
          </span>

          {/* Right resize handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-white/30 rounded-r"
            onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'end'); }}
          />
        </div>
      </div>
    </div>
  );
}

function DatePicker({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors">
          <CalendarIcon className="w-2.5 h-2.5" />
          {format(value, 'MM/dd')}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => d && onChange(d)}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
