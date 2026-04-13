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
  onUpdateTimes?: (taskId: string, startTime: string, endTime: string) => void;
}

const statusColor: Record<string, string> = {
  todo: 'hsl(220, 72%, 50%)',
  in_progress: 'hsl(35, 92%, 50%)',
  done: 'hsl(145, 63%, 42%)',
};

export function GanttChart({ tasks, onUpdateDates, onUpdateTimes }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewOffset, setViewOffset] = useState(0); // days offset for navigation

  // Compute timeline range
  const { timelineStart, totalDays, dayWidth } = useMemo(() => {
    const basePadBefore = 2;
    const basePadAfter = 5;
    const minDays = 21;

    if (tasks.length === 0) {
      const start = addDays(startOfDay(new Date()), viewOffset - 7);
      return { timelineStart: start, totalDays: minDays, dayWidth: 40 };
    }

    const dates = tasks.flatMap(t => {
      const s = t.start_date ? parseISO(t.start_date) : new Date(t.created_at);
      const e = t.end_date ? parseISO(t.end_date) : addDays(s, 3);
      return [s, e];
    });

    const minDate = addDays(new Date(Math.min(...dates.map(d => d.getTime()))), -basePadBefore + viewOffset);
    const maxDate = addDays(new Date(Math.max(...dates.map(d => d.getTime()))), basePadAfter + viewOffset);
    const days = Math.max(minDays, differenceInDays(maxDate, minDate));
    return { timelineStart: startOfDay(minDate), totalDays: days, dayWidth: 40 };
  }, [tasks, viewOffset]);

  // Generate day headers
  const dayHeaders = useMemo(() => {
    return Array.from({ length: totalDays }, (_, i) => addDays(timelineStart, i));
  }, [timelineStart, totalDays]);

  return (
    <div>
      {/* Navigation buttons */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setViewOffset(v => v - 7)}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Previous
        </button>
        <button
          onClick={() => setViewOffset(0)}
          className="px-2 py-1 text-xs rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => setViewOffset(v => v + 7)}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto" ref={containerRef}>
        <div style={{ minWidth: totalDays * dayWidth + 200 }}>
          {/* Day headers */}
          <div className="flex border-b sticky top-0 bg-card z-10">
            <div className="w-[200px] flex-shrink-0" />
            <div className="flex">
              {dayHeaders.map((day, i) => {
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                return (
                  <div
                    key={i}
                    className={cn(
                      'text-center text-[10px] text-muted-foreground py-1 border-l border-border/30',
                      day.getDay() === 0 || day.getDay() === 6 ? 'bg-muted/20' : '',
                      isToday ? 'bg-primary/10 font-bold text-primary' : ''
                    )}
                    style={{ width: dayWidth }}
                  >
                    <div className="font-medium">{format(day, 'dd')}</div>
                    <div>{format(day, 'MMM')}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task rows */}
          {tasks.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">No tasks — use navigation to browse dates</div>
          ) : (
            tasks.map(task => (
              <GanttRow
                key={task.id}
                task={task}
                timelineStart={timelineStart}
                totalDays={totalDays}
                dayWidth={dayWidth}
                onUpdateDates={onUpdateDates}
                onUpdateTimes={onUpdateTimes}
              />
            ))
          )}
        </div>
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
  onUpdateTimes?: (taskId: string, startTime: string, endTime: string) => void;
}

function GanttRow({ task, timelineStart, totalDays, dayWidth, onUpdateDates, onUpdateTimes }: RowProps) {
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
      {/* Task name + date/time pickers */}
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
        {onUpdateTimes && (
          <div className="flex items-center gap-1">
            <input
              type="time"
              value={(task as any).start_time || ''}
              onChange={(e) => onUpdateTimes(task.id, e.target.value, (task as any).end_time || '')}
              className="text-[9px] text-muted-foreground bg-transparent border-none outline-none cursor-pointer w-[58px]"
              title="Start time"
            />
            <span className="text-[9px] text-muted-foreground">→</span>
            <input
              type="time"
              value={(task as any).end_time || ''}
              onChange={(e) => onUpdateTimes(task.id, (task as any).start_time || '', e.target.value)}
              className="text-[9px] text-muted-foreground bg-transparent border-none outline-none cursor-pointer w-[58px]"
              title="End time"
            />
          </div>
        )}
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
