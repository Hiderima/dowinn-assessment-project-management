import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Pencil, Trash2, Key, RefreshCw, Users, Shield } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  employee_number: string | null;
  department: string | null;
  position: string | null;
}

async function adminAction(action: string, body: Record<string, any>) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await supabase.functions.invoke('admin-users', {
    body: { action, ...body },
  });
  if (res.error) throw new Error(res.error.message);
  if (res.data?.error) throw new Error(res.data.error);
  return res.data;
}

export default function AdminPanel() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [passwordUser, setPasswordUser] = useState<Profile | null>(null);
  const [deleteUser, setDeleteUser] = useState<Profile | null>(null);
  const [turnoverTo, setTurnoverTo] = useState<string>('');

  // Form states
  const [form, setForm] = useState({ employee_number: '', password: '', display_name: '', department: '', position: '' });
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAction('list', {});
      setProfiles(data.profiles || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async () => {
    if (!form.employee_number || !form.password) { toast.error('Employee number and password required'); return; }
    setBusy(true);
    try {
      await adminAction('create', form);
      toast.success('User created');
      setShowCreate(false);
      setForm({ employee_number: '', password: '', display_name: '', department: '', position: '' });
      fetchUsers();
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const handleEdit = async () => {
    if (!editUser) return;
    setBusy(true);
    try {
      await adminAction('update_profile', {
        user_id: editUser.user_id,
        display_name: editUser.display_name,
        department: editUser.department,
        position: editUser.position,
        employee_number: editUser.employee_number,
      });
      toast.success('Profile updated');
      setEditUser(null);
      fetchUsers();
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const handlePassword = async () => {
    if (!passwordUser || newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setBusy(true);
    try {
      await adminAction('update_password', { user_id: passwordUser.user_id, password: newPassword });
      toast.success('Password updated');
      setPasswordUser(null);
      setNewPassword('');
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setBusy(true);
    try {
      await adminAction('delete', {
        user_id: deleteUser.user_id,
        turnover_to: turnoverTo || undefined,
      });
      toast.success('User deleted');
      setDeleteUser(null);
      setTurnoverTo('');
      fetchUsers();
    } catch (err: any) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const otherUsers = profiles.filter(p => p.user_id !== deleteUser?.user_id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button size="sm" onClick={() => { setForm({ employee_number: '', password: '', display_name: '', department: '', position: '' }); setShowCreate(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add User
            </Button>
          </div>
        </div>
      </div>

      {/* User list */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-2">Employee #</div>
              <div className="col-span-3">Name</div>
              <div className="col-span-2">Department</div>
              <div className="col-span-2">Position</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
          </div>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : profiles.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No users found</div>
          ) : (
            profiles.map(p => (
              <div key={p.id} className="px-4 py-3 border-b last:border-0 hover:bg-muted/20 transition-colors">
                <div className="grid grid-cols-12 gap-2 items-center text-sm">
                  <div className="col-span-2 font-mono text-foreground">{p.employee_number || '—'}</div>
                  <div className="col-span-3 text-foreground font-medium">{p.display_name || '—'}</div>
                  <div className="col-span-2 text-muted-foreground">{p.department || '—'}</div>
                  <div className="col-span-2 text-muted-foreground">{p.position || '—'}</div>
                  <div className="col-span-3 flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditUser({ ...p })}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setPasswordUser(p); setNewPassword(''); }}>
                      <Key className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => { setDeleteUser(p); setTurnoverTo(''); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Employee Number *</Label><Input value={form.employee_number} onChange={e => setForm(f => ({ ...f, employee_number: e.target.value }))} /></div>
            <div><Label>Password *</Label><Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} minLength={6} /></div>
            <div><Label>Display Name</Label><Input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} /></div>
            <div><Label>Department</Label><Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
            <div><Label>Position</Label><Input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={busy}>{busy ? 'Creating...' : 'Create User'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={open => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
          {editUser && (
            <div className="space-y-3">
              <div><Label>Employee Number</Label><Input value={editUser.employee_number || ''} onChange={e => setEditUser({ ...editUser, employee_number: e.target.value })} /></div>
              <div><Label>Display Name</Label><Input value={editUser.display_name || ''} onChange={e => setEditUser({ ...editUser, display_name: e.target.value })} /></div>
              <div><Label>Department</Label><Input value={editUser.department || ''} onChange={e => setEditUser({ ...editUser, department: e.target.value })} /></div>
              <div><Label>Position</Label><Input value={editUser.position || ''} onChange={e => setEditUser({ ...editUser, position: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={busy}>{busy ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={!!passwordUser} onOpenChange={open => !open && setPasswordUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Password for {passwordUser?.display_name || passwordUser?.employee_number}</DialogTitle></DialogHeader>
          <div><Label>New Password</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} placeholder="Min 6 characters" /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordUser(null)}>Cancel</Button>
            <Button onClick={handlePassword} disabled={busy}>{busy ? 'Updating...' : 'Update Password'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User AlertDialog */}
      <AlertDialog open={!!deleteUser} onOpenChange={open => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User: {deleteUser?.display_name || deleteUser?.employee_number}</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this user account and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-2">
            <Label className="text-sm font-medium">Transfer projects to another user (optional)</Label>
            <p className="text-xs text-muted-foreground">If this user owns any projects, you can reassign them to another user before deletion. Otherwise, their projects will be deleted.</p>
            <Select value={turnoverTo} onValueChange={setTurnoverTo}>
              <SelectTrigger><SelectValue placeholder="Don't transfer (delete projects)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Don't transfer (delete projects)</SelectItem>
                {otherUsers.map(u => (
                  <SelectItem key={u.user_id} value={u.user_id}>
                    {u.display_name || u.employee_number || u.user_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busy ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
