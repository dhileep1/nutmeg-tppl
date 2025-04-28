import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import axios from "axios";

// const payrollData = [
//   {
//     id: 1,
//     user_name: "John Doe",
//     pan_card: "ABCDE1234F",
//     user_id: "EMP001",
//     designation: "Senior Developer",
//     join_date: "2023-01-15",
//     workingDays: 22,
//     salary: {
//       basic: 50000,
//       hra: 20000,
//       allowance: 15000,
//       pfContribution: 6000,
//       tax: 8500,
//       gross: 85000,
//       net: 70500,
//     },
//     month: "March 2025",
//   },
//   {
//     id: 2,
//     user_name: "Jane Smith",
//     pan_card: "XYZAB5678G",
//     user_id: "EMP002",
//     designation: "UI Designer",
//     join_date: "2023-03-10",
//     workingDays: 20,
//     salary: {
//       basic: 45000,
//       hra: 18000,
//       allowance: 12000,
//       pfContribution: 5400,
//       tax: 7200,
//       gross: 75000,
//       net: 62400,
//     },
//     month: "March 2025",
//   },
// ];

const Payroll = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [payrollData, setPayRollData] = useState([]);
  const [userPayRollHis, setUserPayRollHis] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get("http://127.0.0.1:3000/payroll")
      .then((response) => {
        setPayRollData(response.data);
        console.log("Response data", response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:3000/payroll/${user.user_id}`)
      .then((response) => {
        setUserPayRollHis(response.data),
          console.log("Payroll history", response.data);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleDownloadPayslip = (elem) => {
    navigate("/view-payroll", { state: elem });
    toast.success("Payslip download initiated");
  };

  const handleGeneratePayslip = () => {
    toast.success("New payslips have been generated successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground mt-1">
            Access your salary information and payslips
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleGeneratePayslip}>Generate Payslips</Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Salary Information</CardTitle>
          <CardDescription>March 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>PAN Card</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead className="text-center">Working Days</TableHead>
                  <TableHead className="text-right">Basic</TableHead>
                  <TableHead className="text-right">HRA</TableHead>
                  <TableHead className="text-right">
                    Special Allowance
                  </TableHead>
                  <TableHead className="text-right">PF Contribution</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.user_name}
                    </TableCell>
                    <TableCell>{item.pan_card}</TableCell>
                    <TableCell>{item.user_id}</TableCell>
                    <TableCell>{item.designation}</TableCell>
                    <TableCell>
                      {new Date(item.join_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.workingDays}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{item.basic.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{item.hra.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{item.allowance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{item.pf_cont.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{item.tax.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{item.gross.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{(item.gross - item.tax).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPayslip(item)}
                      >
                        <FileText className="h-4 w-4 mr-1" /> Payslip
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <p className="text-sm text-muted-foreground">
            Payslips are generated on the last day of each month
          </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payslip History</CardTitle>
          <CardDescription>Access your previous payslips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4 border-b pb-3">
              <div className="col-span-2 font-medium">Month</div>
              <div className="col-span-1 text-right font-medium">Gross</div>
              <div className="col-span-1 text-right font-medium">Net</div>
              <div className="col-span-1 text-center font-medium">Status</div>
              <div className="col-span-1 text-right font-medium">Action</div>
            </div>
            {userPayRollHis.map((elem) => (
              <div className="grid grid-cols-6 gap-4 py-2">
                <div className="col-span-2">
                  {format(new Date(elem.created_on), "MMMM yyyy")}
                </div>
                <div className="col-span-1 text-right">₹{elem.gross}</div>
                <div className="col-span-1 text-right">
                  ₹{elem.gross - elem.tax}
                </div>
                <div className="col-span-1 text-center">
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Processed
                  </Badge>
                </div>
                <div className="col-span-1 text-right">
                  <Button
                    onClick={() => handleDownloadPayslip(elem)}
                    variant="outline"
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payroll;
