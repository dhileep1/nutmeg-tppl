import PayrollSlip from "@/components/PayrollSlip";
import { useLocation } from "react-router-dom";
import { format } from "date-fns";

const Index = () => {
  const location = useLocation();
  const payroll_record = location.state;
  console.log("Payroll Record", payroll_record);

  const companyName = "Nutmeg Solutions";
  const payPeriod = format(new Date(payroll_record.created_on), "MMMM yyyy");

  const employeeData = {
    name: payroll_record.user_name,
    pan: payroll_record.pan_card,
    id: payroll_record.user_id,
    designation: payroll_record.designation,
    joiningDate: format(new Date(payroll_record.join_date), "yyyy-MM-dd"),
    workingDays: 22,
  };

  const salaryData = {
    earnings: [
      { name: "Basic Salary", amount: payroll_record.basic },
      { name: "HRA", amount: payroll_record.hra },
      { name: "Special Allowance", amount: payroll_record.allowance },
    ],
    deductions: [
      { name: "PF Contribution", amount: payroll_record.pf_cont },
      { name: "Tax", amount: payroll_record.tax },
    ],
    gross: payroll_record.gross,
    net: payroll_record.gross - payroll_record.tax,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <PayrollSlip
        companyName={companyName}
        payPeriod={payPeriod}
        employee={employeeData}
        salaryData={salaryData}
      />
    </div>
  );
};

export default Index;
