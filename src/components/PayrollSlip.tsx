import React from "react";
import PayrollHeader from "./PayrollHeader";
import EmployeeInfo from "./EmployeeInfo";
import SalaryDetails from "./SalaryDetails";
import PayrollFooter from "./PayrollFooter";

interface PayrollSlipProps {
  companyName: string;
  payPeriod?: string;
  employee: {
    name: string;
    pan: string;
    id: string;
    designation: string;
    joiningDate: string;
    workingDays?: number;
  };
  salaryData: {
    earnings: Array<{ name: string; amount: number | string }>;
    deductions: Array<{ name: string; amount: number | string }>;
    gross: number | string;
    net: number | string;
  };
}

const PayrollSlip: React.FC<PayrollSlipProps> = ({
  companyName,
  payPeriod,
  employee,
  salaryData,
}) => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white rounded-lg shadow-lg">
      <PayrollHeader companyName={companyName} payPeriod={payPeriod} />
      <EmployeeInfo employee={employee} />
      <SalaryDetails
        earnings={salaryData.earnings}
        deductions={salaryData.deductions}
        gross={salaryData.gross}
        net={salaryData.net}
      />
      <PayrollFooter companyName={companyName} />
    </div>
  );
};

export default PayrollSlip;
