import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface EmployeeInfoProps {
  employee: {
    name: string;
    pan: string;
    id: string;
    designation: string;
    joiningDate: string;
    workingDays?: number;
  };
}

const EmployeeInfo: React.FC<EmployeeInfoProps> = ({ employee }) => {
  return (
    <Card className="mb-6 border-purple-100">
      <CardContent className="p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Employee Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Employee Name</p>
            <p className="font-medium">{employee.name}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">PAN Card</p>
            <p className="font-medium">{employee.pan}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Employee ID</p>
            <p className="font-medium">{employee.id}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Designation</p>
            <p className="font-medium">{employee.designation}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Joining Date</p>
            <p className="font-medium">{employee.joiningDate}</p>
          </div>
          
          {employee.workingDays !== undefined && (
            <div>
              <p className="text-sm text-gray-500">Working Days</p>
              <p className="font-medium">{employee.workingDays}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeInfo;