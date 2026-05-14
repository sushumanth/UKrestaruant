import { Outlet } from 'react-router-dom';
import { EmployeeSidebar } from '@/components/employee/EmployeeSidebar';
import { EmployeeHeader } from '@/components/employee/EmployeeHeader';

export const EmployeeLayout = () => {
  return (
    <div className="min-h-screen text-amber-900 flex flex-col md:flex-row" style={{ background: 'linear-gradient(135deg, #e8e4df 0%, #f5f1ed 100%)' }}>
      <EmployeeSidebar />
      <div className="flex-1 flex flex-col mt-16 md:mt-0 md:ml-64">
        <EmployeeHeader />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
