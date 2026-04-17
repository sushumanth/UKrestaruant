import { Outlet } from 'react-router-dom';
import { EmployeeSidebar } from '@/components/employee/EmployeeSidebar';
import { EmployeeHeader } from '@/components/employee/EmployeeHeader';

export const EmployeeLayout = () => {
  return (
    <div className="min-h-screen bg-[#0B0C0F] text-[#F4F6FA] flex">
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
