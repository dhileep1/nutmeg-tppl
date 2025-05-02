import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { format } from "date-fns";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Activity, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

// Mock data for the timesheet
// const timesheetDataInitial = [
//   {
//     id: 1,
//     member_name: "John Doe",
//     department: "Development",
//     business_unit_code: "DEV01",
//     global_business_unit_code: "GDEV01",
//     project_code: "91635109100",
//     activity_code: "CODING",
//     shift_code: "REGULAR",
//     hours: 8,
//     date: new Date().toISOString().split("T")[0],
//     leave: 0,
//     comp_off: 0,
//     status: "Pending",
//   },
// ];

const Timesheet = () => {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [selectedTimesheet, setSelectedTimesheet] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewEntryDialogOpen, setIsNewEntryDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    project_code: "91635109100",
    activity_code: "CODING",
    shift_code: "REGULAR",
    hours: 8,
    date: new Date().toISOString().split("T")[0],
  });

  const isAdmin = user?.role === "admin";

  const fetchDailyTimesheet = async () => {
    const currentDate = format(selectedDate, "yyyy-MM-dd");
    const res = await fetch(`http://localhost:3000/timesheet/${user.user_id}`);
    const json = await res.json();
    setTimesheets(json.data);
  };

  useEffect(() => {
    fetchDailyTimesheet();
  }, [selectedDate]);

  const handleApprove = (id: number) => {
    axios
      .patch(`http://127.0.0.1:3000/timesheet/update/${id}/Approved`)
      .then((response) => console.log(response.data))
      .catch((error) => console.log(error));
    setTimesheets(
      timesheets.map((sheet) =>
        sheet.id === id ? { ...sheet, status: "Approved" } : sheet
      )
    );
    toast.success("Timesheet approved successfully");
  };

  const handleReject = (id: number) => {
    axios
      .patch(`http://127.0.0.1:3000/timesheet/update/${id}/Rejected`)
      .then((response) => console.log(response.data))
      .catch((error) => console.log(error));
    setTimesheets(
      timesheets.map((sheet) =>
        sheet.id === id ? { ...sheet, status: "Rejected" } : sheet
      )
    );
    toast.success("Timesheet rejected");
  };

  const handleRevise = (timesheet: any) => {
    setSelectedTimesheet({ ...timesheet, status: "Pending" });
  };

  const handleSubmitRevision = () => {
    axios
      .put(`http://127.0.0.1:3000/timesheet/revise/${selectedTimesheet.id}`, {
        hours: selectedTimesheet.hours,
        date: selectedTimesheet.date,
        activity_code: selectedTimesheet.activity_code,
        shift_code: selectedTimesheet.shift_code,
      })
      .then((response) => console.log(response.data))
      .catch((error) => console.log("Error while revising timesheet", error));
    setTimesheets((prevState) => {
      return prevState.map((sheet) =>
        sheet.id === selectedTimesheet.id ? selectedTimesheet : sheet
      );
    });
    setSelectedTimesheet(null);
    toast.success("Timesheet submitted for review");
  };

  const handleHourChange = (value: string) => {
    setSelectedTimesheet({
      ...selectedTimesheet,
      hours: parseInt(value) || 0,
    });
  };

  const handleNewEntryChange = (field: string, value: string) => {
    setNewEntry({
      ...newEntry,
      [field]: field === "hours" ? parseInt(value) || 0 : value,
    });
  };

  const handleAddNewEntry = async () => {
    const newTimesheet = {
      user_id: user.user_id,
      business_unit_code: "DEV01",
      global_business_unit_code: "GDEV01",
      ...newEntry,
      leave: 0,
      comp_off: 0,
      status: "Pending",
    };
    console.log("Add Entry", newTimesheet);
    try {
      const res = await fetch("http://localhost:3000/addsheet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTimesheet),
      });

      if (!res.ok) {
        throw new Error("Failed to add timesheet");
      }

      const saved = await res.json();
      setTimesheets((prev) => [...prev, saved]);
      setIsNewEntryDialogOpen(false);
      toast.success("New timesheet entry added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add new entry");
    }
  };

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
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
            Track and submit your daily work hours
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
          <Button onClick={() => setIsNewEntryDialogOpen(true)}>
            Add New Entry
          </Button>
          <Button onClick={handleSubmitAll}>Submit All</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daily Timesheet</CardTitle>
            <CardDescription>
              {format(selectedDate, "EEEE, MMMM do, yyyy")}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleDateChange(new Date(selectedDate.getTime() - 86400000))
              }
            >
              Previous Day
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateChange(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleDateChange(new Date(selectedDate.getTime() + 86400000))
              }
            >
              Next Day
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Name</TableHead>
                  <TableHead>BU Code</TableHead>
                  <TableHead>Global BU</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead className="text-center">Hours</TableHead>
                  <TableHead className="text-center">Leave</TableHead>
                  <TableHead className="text-center">Comp-Off</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timesheets.length > 0 ? (
                  timesheets.map((sheet) => (
                    <TableRow key={sheet.id}>
                      <TableCell>{sheet.user_name}</TableCell>
                      <TableCell>{sheet.business_unit_code}</TableCell>
                      <TableCell>{sheet.global_business_unit_code}</TableCell>
                      <TableCell>
                        <input
                          type="text"
                          value={sheet.project_code}
                          style={{ width: "5.75rem" }}
                        />
                      </TableCell>
                      <TableCell>{sheet.activity_code}</TableCell>
                      <TableCell>{sheet.shift_code}</TableCell>
                      <TableCell>{sheet.hours}</TableCell>
                      <TableCell>{sheet.leave}</TableCell>
                      <TableCell>{sheet.comp_off}</TableCell>
                      <TableCell>{sheet.status}</TableCell>
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-6">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CalendarDays className="h-10 w-10 text-muted" />
                        <p className="text-lg font-medium">
                          No entries for this date
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Click "Add New Entry" to create a timesheet for today
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Note: Submit your timesheet by EOD
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
              <Button variant="outline" size="sm">
                Delegate Authority
              </Button>
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
              Update your work hours for the selected day
            </DialogDescription>
          </DialogHeader>

          {selectedTimesheet && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Member</p>
                  <p>{selectedTimesheet.user_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Project</p>
                  <p>{selectedTimesheet.project_code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium mb-1">Hours</p>
                  <Input
                    type="number"
                    min="0"
                    max="24"
                    value={selectedTimesheet.hours}
                    onChange={(e) => handleHourChange(e.target.value)}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Date</p>
                  <Input
                    type="date"
                    value={selectedTimesheet.date}
                    onChange={(e) =>
                      setSelectedTimesheet({
                        ...selectedTimesheet,
                        date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm font-medium mb-1">Activity</p>
                  <Select
                    defaultValue={selectedTimesheet.activity_code}
                    onValueChange={(value) =>
                      setSelectedTimesheet({
                        ...selectedTimesheet,
                        activity_code: value,
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
                        shift_code: value,
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
            <Button
              variant="outline"
              onClick={() => setSelectedTimesheet(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitRevision}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Entry Dialog */}
      <Dialog
        open={isNewEntryDialogOpen}
        onOpenChange={setIsNewEntryDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Timesheet Entry</DialogTitle>
            <DialogDescription>
              Create a new timesheet entry for today
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Project Code</p>
                <Select
                  defaultValue={newEntry.project_code}
                  onValueChange={(value) =>
                    handleNewEntryChange("projectCode", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="91635109100">
                      91635109100 - Main Project
                    </SelectItem>
                    <SelectItem value="91635109101">
                      91635109101 - Secondary Project
                    </SelectItem>
                    <SelectItem value="91635109102">
                      91635109102 - Support
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Date</p>
                <Input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => handleNewEntryChange("date", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Activity</p>
                <Select
                  defaultValue={newEntry.activity_code}
                  onValueChange={(value) =>
                    handleNewEntryChange("activityCode", value)
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
                  defaultValue={newEntry.shift_code}
                  onValueChange={(value) =>
                    handleNewEntryChange("shiftCode", value)
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

            <div>
              <p className="text-sm font-medium mb-1">Hours</p>
              <Input
                type="number"
                min="0"
                max="24"
                value={newEntry.hours}
                onChange={(e) => handleNewEntryChange("hours", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewEntryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddNewEntry}>Add Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timesheet;
