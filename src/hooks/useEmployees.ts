import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/** Employee profile row used throughout the assignee/department selectors. */
export interface Employee {
  id: string;                       // Profile row id.
  user_id: string;                  // Linked auth user id.
  display_name: string | null;      // Human-readable name shown in dropdowns.
  employee_number: string | null;   // Employee code, also used as the login local-part.
  department: string | null;        // Department the employee belongs to.
  position: string | null;          // Job title.
}

/** Fetches employee profiles and provides department-based helpers */
export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, employee_number, department, position')
        .not('employee_number', 'is', null)
        .order('department')
        .order('display_name');
      setEmployees((data as Employee[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  // Unique departments excluding Administration
  const departments = [...new Set(employees.map(e => e.department).filter(Boolean).filter(d => d !== 'Administration'))] as string[];

  // Filter employees by department
  const getByDepartment = (dept: string) => employees.filter(e => e.department === dept);

  return { employees, departments, getByDepartment, loading };
}
