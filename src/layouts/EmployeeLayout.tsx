import { Outlet } from 'react-router-dom';
import { EmployeeSidebar } from '@/components/employee/EmployeeSidebar';
import { EmployeeHeader } from '@/components/employee/EmployeeHeader';

export const EmployeeLayout = () => {
  return (
    <div className="min-h-screen text-amber-900 flex" style={{ background: 'linear-gradient(135deg, #e8e4df 0%, #f5f1ed 100%)' }}>
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col ml-64">
        <EmployeeHeader />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
