import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Plus } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, differenceInDays, addDays } from "date-fns";
import { toast } from "sonner";
import axios from "axios";

// Mock leave data
// const leaveData = [
//   {
// id: 1,
// leave_type: "Annual Leave",
// startDate: "2025-04-10",
// end_date: "2025-04-11",
// days: 2,
// reason: "Personal",
// status: "Approved",
//   },
//   {
//     id: 2,
// leave_type: "Sick Leave",
// startDate: "2025-02-15",
// end_date: "2025-02-15",
// days: 1,
// reason: "Health issues",
// status: "Approved",
//   },
//   {
//     id: 3,
//     leave_type: "Annual Leave",
//     startDate: "2025-05-20",
//     end_date: "2025-05-22",
//     days: 3,
//     reason: "Family function",
//     status: "Pending",
//   },
// ];

// Function to get the dates where team members are on leave

const Leave = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [teamLeaveDates, setTeamLeaveDates] = useState<Map<string, number>>(
    new Map()
  );
  const [leaveRequestData, setLeaveRequestData] = useState({
    leave_type: "Annual Leave",
    start_date: new Date(),
    end_date: new Date(),
    reason: "",
  });
  const [refresh, setRefresh] = useState(true);
  const [leaveData, setLeaveData] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([
    { leave_type: "Annual Leave", total: 20, used: 0, balance: 20 },
    { leave_type: "Sick Leave", total: 20, used: 0, balance: 20 },
    { leave_type: "Casual Leave", total: 20, used: 0, balance: 20 },
    { leave_type: "Compensatory Off", total: 20, used: 0, balance: 20 },
  ]);
  const user_id = "U001";

  // Get team leave dates for highlighting on calendar
  const fetchLeaveData = async () => {
    const response = await axios.get("http://127.0.0.1:3000/leave");
    setLeaveData((prevState) => response.data.data);
  };

  useEffect(() => {
    fetchLeaveData();
    axios
      .get(`http://127.0.0.1:3000/leave_balance/${user_id}`)
      .then((response) => {
        const leave_bal_data = response.data.data[0].bal_json;
        setLeaveBalance((prevState) => {
          prevState[0].balance = leave_bal_data.annual;
          prevState[1].balance = leave_bal_data.sick;
          prevState[2].balance = leave_bal_data.casual;
          prevState[3].balance = leave_bal_data.compensatory;

          for (var i = 0; i < prevState.length; i++) {
            prevState[i].used = prevState[i].total - prevState[i].balance;
          }
          return prevState;
        });
      })
      .catch((error) => console.log(error));
  }, [refresh]);

  useEffect(() => {}, [refresh]);

  const getTeamLeaveHighlights = () => {
    // Map dates to highlight on calendar
    const dateMap = new Map();

    leaveData.forEach((leave) => {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);

      // For each day in the leave period
      for (let day = start; day <= end; day = addDays(day, 1)) {
        const dateStr = format(day, "yyyy-MM-dd");
        const count = dateMap.get(dateStr) || 0;
        dateMap.set(dateStr, count + 1);
      }
    });

    return dateMap;
  };

  // Calculate number of days between start and end date
  const calculateDays = () => {
    if (!leaveRequestData.start_date || !leaveRequestData.end_date) return 0;
    return (
      differenceInDays(
        new Date(leaveRequestData.end_date),
        new Date(leaveRequestData.start_date)
      ) + 1
    );
  };

  const handleDataIngestion = () => {
    toast.success("Leave data ingestion initiated");
  };

  const handleRequestSubmit = async () => {
    // Calculate days before submitting
    const days = calculateDays();

    // Add to leaveData (in a real app, this would be saved to the database)
    const newLeave = {
      user_id,
      leave_type: leaveRequestData.leave_type,
      start_date: format(leaveRequestData.start_date, "yyyy-MM-dd"),
      end_date: format(leaveRequestData.end_date, "yyyy-MM-dd"),
      days,
      reason: leaveRequestData.reason,
    };

    const response = await axios.post(
      "http://127.0.0.1:3000/newleave",
      newLeave
    );
    console.log("Response on Leave Request Post", response);

    // Update the team leave dates for the calendar
    const updatedTeamLeaves = new Map(teamLeaveDates);
    for (
      let day = leaveRequestData.start_date;
      day <= leaveRequestData.end_date;
      day = addDays(day, 1)
    ) {
      const dateStr = format(day, "yyyy-MM-dd");
      const count = updatedTeamLeaves.get(dateStr) || 0;
      updatedTeamLeaves.set(dateStr, count + 1);
    }
    setTeamLeaveDates(updatedTeamLeaves);

    toast.success("Leave request submitted successfully");
    setIsDialogOpen(false);
    setRefresh((prevState) => !prevState);
  };

  const handleApprove = (id: number) => {
    console.log("Request Id", id);
    axios
      .patch(`http://127.0.0.1:3000/leave/approve/${id}`)
      .then((response) => {
        console.log("Response", response);
      })
      .catch((error) => console.log(error));
    fetchLeaveData();
    setRefresh((prevState) => !prevState);
    toast.success(`Leave request #${id} approved`);
  };

  const handleReject = (id: number) => {
    toast.success(`Leave request #${id} rejected`);
    fetchLeaveData();
    setRefresh((prevState) => !prevState);
  };

  // Calendar day rendering to highlight team leave days
  const renderCalendarDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const count = teamLeaveDates.get(dateStr) || 0;

    return (
      <div className="relative flex items-center justify-center w-full h-full">
        <span>{day.getDate()}</span>
        {count > 0 && (
          <div className="absolute bottom-0 w-4 h-1 rounded-full bg-red-500" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground mt-1">
            Request and track your leave applications
          </p>
        </div>
        <div className="flex space-x-3">
          {isAdmin && (
            <Button variant="outline" onClick={handleDataIngestion}>
              Ingest Data
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>New Leave Request</DialogTitle>
                <DialogDescription>
                  Fill out the form to request time off
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Leave Type</Label>
                  <Select
                    defaultValue={leaveRequestData.leave_type}
                    onValueChange={(value) =>
                      setLeaveRequestData({
                        ...leaveRequestData,
                        leave_type: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave leave_type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                      <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                      <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                      <SelectItem value="Compensatory Off">
                        Compensatory Off
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <div className="mt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            {leaveRequestData.start_date ? (
                              format(leaveRequestData.start_date, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={leaveRequestData.start_date}
                            onSelect={(date) =>
                              date &&
                              setLeaveRequestData({
                                ...leaveRequestData,
                                start_date: date,
                              })
                            }
                            initialFocus
                            className="rounded-md"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <div className="mt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            {leaveRequestData.end_date ? (
                              format(leaveRequestData.end_date, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={leaveRequestData.end_date}
                            onSelect={(date) =>
                              date &&
                              setLeaveRequestData({
                                ...leaveRequestData,
                                end_date: date,
                              })
                            }
                            initialFocus
                            className="rounded-md"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label>Reason for Leave</Label>
                    <span className="text-sm text-muted-foreground">
                      Days: {calculateDays()}
                    </span>
                  </div>
                  <Textarea
                    value={leaveRequestData.reason}
                    onChange={(e) =>
                      setLeaveRequestData({
                        ...leaveRequestData,
                        reason: e.target.value,
                      })
                    }
                    placeholder="Brief explanation for your leave request"
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleRequestSubmit}>Submit Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="requests">
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="balance">Leave Balance</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>Review your leave applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-3 px-4 font-medium">Type</th>
                      <th className="py-3 px-4 font-medium">Start Date</th>
                      <th className="py-3 px-4 font-medium">End Date</th>
                      <th className="py-3 px-4 font-medium text-center">
                        Days
                      </th>
                      <th className="py-3 px-4 font-medium">Reason</th>
                      <th className="py-3 px-4 font-medium text-center">
                        Status
                      </th>
                      {isAdmin && (
                        <th className="py-3 px-4 font-medium text-right">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {leaveData &&
                      leaveData.map((leave) => (
                        <tr key={leave.id} className="border-b">
                          <td className="py-3 px-4">{leave.leave_type}</td>
                          <td className="py-3 px-4">
                            {new Date(leave.start_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {new Date(leave.end_date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {leave.days}
                          </td>
                          <td className="py-3 px-4">{leave.reason}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              className={
                                leave.status === "Approved"
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : leave.status === "Rejected"
                                  ? "bg-red-100 text-red-800 hover:bg-red-200"
                                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              }
                            >
                              {leave.status}
                            </Badge>
                          </td>
                          {isAdmin && leave.status === "Pending" && (
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                  onClick={() => handleApprove(leave.id)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                  onClick={() => handleReject(leave.id)}
                                >
                                  Reject
                                </Button>
                              </div>
                            </td>
                          )}
                          {isAdmin && leave.status !== "Pending" && <td></td>}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle>Leave Balance</CardTitle>
              <CardDescription>
                Track your available leave balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-3 px-4 font-medium">Leave Type</th>
                      <th className="py-3 px-4 font-medium text-center">
                        Total
                      </th>
                      <th className="py-3 px-4 font-medium text-center">
                        Used
                      </th>
                      <th className="py-3 px-4 font-medium text-center">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveBalance.map((balance, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 px-4 font-medium">
                          {balance.leave_type}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {balance.total}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {balance.used}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold">
                          {balance.balance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-muted/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      Annual Leave Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="list-disc pl-4 space-y-1">
                      <li>20 days per calendar year</li>
                      <li>Maximum 5 consecutive days allowed</li>
                      <li>
                        Request must be submitted at least 7 days in advance
                      </li>
                      <li>Unused leave can carry forward up to 5 days</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-muted/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Sick Leave Policy</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="list-disc pl-4 space-y-1">
                      <li>12 days per calendar year</li>
                      <li>
                        Medical certificate required for more than 2 consecutive
                        days
                      </li>
                      <li>Notify manager as soon as possible</li>
                      <li>Cannot be carried forward to next year</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Leave Calendar</CardTitle>
              <CardDescription>View team leave schedule</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                components={{
                  DayContent: ({ date }) => renderCalendarDay(date),
                }}
              />
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  View team member availability at a glance
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">Team member on leave</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leave;
