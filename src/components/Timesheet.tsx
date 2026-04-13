import { Clock, User, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import type { TaskWithChangelog } from '@/hooks/useProjects';

interface Props {
  tasks: TaskWithChangelog[];
  onUpdateDates?: (taskId: string, startDate: string, endDate: string) => void;
  onUpdateTimes?: (taskId: string, startTime: string, endTime: string) => void;
}

const statusLabel: Record<string, string> = { todo: 'Todo', in_progress: 'In Progress', done: 'Done' };
const statusDot: Record<string, string> = { todo: 'hsl(220, 72%, 50%)', in_progress: 'hsl(35, 92%, 50%)', done: 'hsl(145, 63%, 42%)' };

function getDaysSince(dateStr: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)));
}

function InlineDatePicker({ value, onChange, label }: { value: string | null; onChange: (d: string) => void; label: string }) {
  const dateVal = value ? new Date(value) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors whitespace-nowrap">
          <CalendarIcon className="w-2.5 h-2.5" />
          {dateVal ? format(dateVal, 'MM/dd') : label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateVal}
          onSelect={(d) => d && onChange(format(d, 'yyyy-MM-dd'))}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}

function InlineTimePicker({ value, onChange, label }: { value: string | null; onChange: (t: string) => void; label: string }) {
  return (
    <input
      type="time"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="text-[10px] text-muted-foreground hover:text-foreground bg-transparent border-none outline-none cursor-pointer w-[70px]"
      title={label}
    />
  );
}

export function Timesheet({ tasks, onUpdateDates, onUpdateTimes }: Props) {
  if (tasks.length === 0) return <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No tasks to display</div>;

  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium text-muted-foreground text-xs">Task</th>
            <th className="pb-2 font-medium text-muted-foreground text-xs">Assignee</th>
            <th className="pb-2 font-medium text-muted-foreground text-xs">Status</th>
            <th className="pb-2 font-medium text-muted-foreground text-xs">Start</th>
            <th className="pb-2 font-medium text-muted-foreground text-xs">End</th>
            <th className="pb-2 font-medium text-muted-foreground text-xs">Time</th>
            <th className="pb-2 font-medium text-muted-foreground text-xs text-right">Days</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {tasks.map(task => (
            <tr key={task.id} className="hover:bg-muted/30 transition-colors">
              <td className="py-2.5 pr-3"><span className="font-medium text-card-foreground text-xs">{task.title}</span></td>
              <td className="py-2.5 pr-3">
                {task.assignee ? <span className="flex items-center gap-1 text-muted-foreground text-xs"><User className="w-3 h-3" /> {task.assignee}</span> : <span className="text-xs text-muted-foreground/50">—</span>}
              </td>
              <td className="py-2.5 pr-3">
                <span className="flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full" style={{ background: statusDot[task.status] }} />{statusLabel[task.status]}</span>
              </td>
              <td className="py-2.5 pr-3">
                {onUpdateDates ? (
                  <InlineDatePicker value={task.start_date} onChange={(d) => onUpdateDates(task.id, d, task.end_date || d)} label="Set" />
                ) : (
                  <span className="text-xs text-muted-foreground">{task.start_date ? new Date(task.start_date).toLocaleDateString() : '—'}</span>
                )}
              </td>
              <td className="py-2.5 pr-3">
                {onUpdateDates ? (
                  <InlineDatePicker value={task.end_date} onChange={(d) => onUpdateDates(task.id, task.start_date || d, d)} label="Set" />
                ) : (
                  <span className="text-xs text-muted-foreground">{task.end_date ? new Date(task.end_date).toLocaleDateString() : '—'}</span>
                )}
              </td>
              <td className="py-2.5 pr-3">
                {onUpdateTimes ? (
                  <div className="flex items-center gap-0.5">
                    <InlineTimePicker
                      value={(task as any).start_time}
                      onChange={(t) => onUpdateTimes(task.id, t, (task as any).end_time || '')}
                      label="Start time"
                    />
                    <span className="text-[9px] text-muted-foreground">→</span>
                    <InlineTimePicker
                      value={(task as any).end_time}
                      onChange={(t) => onUpdateTimes(task.id, (task as any).start_time || '', t)}
                      label="End time"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {(task as any).start_time && (task as any).end_time
                      ? `${(task as any).start_time} - ${(task as any).end_time}`
                      : '—'}
                  </span>
                )}
              </td>
              <td className="py-2.5 text-right"><span className="flex items-center justify-end gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{getDaysSince(task.created_at)}d</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
