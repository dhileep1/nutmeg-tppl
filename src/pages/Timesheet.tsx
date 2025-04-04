
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Mock data for the timesheet
const timesheetData = [
  {
    id: 1,
    memberName: "John Doe",
    department: "Development",
    businessUnitCode: "DEV01",
    globalBusinessUnitCode: "GDEV01",
    projectCode: "91635109100",
    activityCode: "CODING",
    shiftCode: "REGULAR",
    hours: [8, 8, 8, 8, 8, 0, 0], // Monday to Sunday
    leave: 0,
    compOff: 0,
    status: "Pending",
  },
  {
    id: 2,
    memberName: "Jane Smith",
    department: "Design",
    businessUnitCode: "DES01",
    globalBusinessUnitCode: "GDES01",
    projectCode: "91635109101",
    activityCode: "DESIGN",
    shiftCode: "REGULAR",
    hours: [8, 8, 6, 8, 4, 0, 0], // Monday to Sunday
    leave: 4,
    compOff: 2,
    status: "Approved",
  },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Timesheet = () => {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState(timesheetData);
  const [selectedTimesheet, setSelectedTimesheet] = useState<any>(null);
  const isAdmin = user?.role === "admin";

  const handleApprove = (id: number) => {
    setTimesheets(
      timesheets.map((sheet) =>
        sheet.id === id ? { ...sheet, status: "Approved" } : sheet
      )
    );
    toast.success("Timesheet approved successfully");
  };

  const handleReject = (id: number) => {
    setTimesheets(
      timesheets.map((sheet) =>
        sheet.id === id ? { ...sheet, status: "Rejected" } : sheet
      )
    );
    toast.success("Timesheet rejected");
  };

  const handleRevise = (timesheet: any) => {
    setSelectedTimesheet(timesheet);
  };

  const handleSubmitRevision = () => {
    setTimesheets(
      timesheets.map((sheet) =>
        sheet.id === selectedTimesheet.id
          ? { ...selectedTimesheet, status: "Pending" }
          : sheet
      )
    );
    setSelectedTimesheet(null);
    toast.success("Timesheet submitted for review");
  };

  const handleHourChange = (dayIndex: number, value: string) => {
    const newHours = [...selectedTimesheet.hours];
    newHours[dayIndex] = parseInt(value) || 0;
    setSelectedTimesheet({ ...selectedTimesheet, hours: newHours });
  };

  const getTotalHours = (hours: number[]) => {
    return hours.reduce((sum, current) => sum + current, 0);
  };

  const handleSubmitAll = () => {
    toast.success("All pending timesheets submitted successfully");
  };

  // Only show the timesheet generation option to admins
  const handleGenerateProjectCode = () => {
    const countryCode = "91";
    const cityCode = "635109";
    const projectSequence = Math.floor(100 + Math.random() * 900); // Random 3-digit number
    const newProjectCode = `${countryCode}${cityCode}${projectSequence}`;
    toast.success(`New project code generated: ${newProjectCode}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Timesheet Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and submit your work hours
          </p>
        </div>
        <div className="flex space-x-3">
          {isAdmin && (
            <Button 
              variant="outline"
              onClick={handleGenerateProjectCode}
              className="bg-nutmeg-50 text-nutmeg-700 border-nutmeg-200 hover:bg-nutmeg-100"
            >
              Generate Project Code
            </Button>
          )}
          <Button onClick={handleSubmitAll}>Submit All</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Timesheet</CardTitle>
          <CardDescription>Week 14, 2025 (Apr 01 - Apr 07)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Name</TableHead>
                  <TableHead>Dept</TableHead>
                  <TableHead>BU Code</TableHead>
                  <TableHead>Global BU</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Shift</TableHead>
                  {days.map((day) => (
                    <TableHead key={day} className="text-center">
                      {day}
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Leave</TableHead>
                  <TableHead className="text-center">Comp-Off</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timesheets.map((sheet) => (
                  <TableRow key={sheet.id}>
                    <TableCell className="font-medium">{sheet.memberName}</TableCell>
                    <TableCell>{sheet.department}</TableCell>
                    <TableCell>{sheet.businessUnitCode}</TableCell>
                    <TableCell>{sheet.globalBusinessUnitCode}</TableCell>
                    <TableCell>{sheet.projectCode}</TableCell>
                    <TableCell>{sheet.activityCode}</TableCell>
                    <TableCell>{sheet.shiftCode}</TableCell>
                    {sheet.hours.map((hours, index) => (
                      <TableCell key={index} className="text-center">
                        {hours}
                      </TableCell>
                    ))}
                    <TableCell className="text-center">{sheet.leave}</TableCell>
                    <TableCell className="text-center">{sheet.compOff}</TableCell>
                    <TableCell className="text-center font-medium">
                      {getTotalHours(sheet.hours) + sheet.leave + sheet.compOff}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={
                          sheet.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : sheet.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {sheet.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevise(sheet)}
                        >
                          Revise
                        </Button>
                        {isAdmin && sheet.status === "Pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              onClick={() => handleApprove(sheet.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              onClick={() => handleReject(sheet.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Note: Submit your timesheet by Friday EOD
            </p>
          </div>
          {isAdmin && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              >
                Download Report
              </Button>
              <Button variant="outline" size="sm">Delegate Authority</Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Timesheet Revision Dialog */}
      <Dialog
        open={!!selectedTimesheet}
        onOpenChange={(open) => {
          if (!open) setSelectedTimesheet(null);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Revise Timesheet</DialogTitle>
            <DialogDescription>
              Update your work hours for the selected week
            </DialogDescription>
          </DialogHeader>

          {selectedTimesheet && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Member</p>
                  <p>{selectedTimesheet.memberName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Project</p>
                  <p>{selectedTimesheet.projectCode}</p>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mt-4">
                {days.map((day, index) => (
                  <div key={day}>
                    <p className="text-sm font-medium mb-1">{day}</p>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      value={selectedTimesheet.hours[index]}
                      onChange={(e) => handleHourChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm font-medium mb-1">Activity</p>
                  <Select
                    defaultValue={selectedTimesheet.activityCode}
                    onValueChange={(value) =>
                      setSelectedTimesheet({
                        ...selectedTimesheet,
                        activityCode: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CODING">CODING</SelectItem>
                      <SelectItem value="DESIGN">DESIGN</SelectItem>
                      <SelectItem value="TESTING">TESTING</SelectItem>
                      <SelectItem value="MEETING">MEETING</SelectItem>
                      <SelectItem value="OTHER">OTHER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Shift</p>
                  <Select
                    defaultValue={selectedTimesheet.shiftCode}
                    onValueChange={(value) =>
                      setSelectedTimesheet({
                        ...selectedTimesheet,
                        shiftCode: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REGULAR">REGULAR</SelectItem>
                      <SelectItem value="NIGHT">NIGHT</SelectItem>
                      <SelectItem value="WEEKEND">WEEKEND</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTimesheet(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRevision}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timesheet;
