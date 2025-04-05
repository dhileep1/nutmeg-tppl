import React from 'react';
import { Separator } from "@/components/ui/separator";

interface PayrollHeaderProps {
  companyName: string;
  payPeriod?: string;
}

const PayrollHeader: React.FC<PayrollHeaderProps> = ({ companyName, payPeriod }) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-purple-600">{companyName}</h1>
          <p className="text-gray-500">Payroll Statement</p>
        </div>
        {payPeriod && (
          <div className="bg-purple-50 px-4 py-2 rounded-md">
            <p className="text-sm font-medium text-purple-700">Pay Period</p>
            <p className="text-lg font-semibold">{payPeriod}</p>
          </div>
        )}
      </div>
      <Separator className="mt-6 bg-purple-100" />
    </div>
  );
};

export default PayrollHeader;