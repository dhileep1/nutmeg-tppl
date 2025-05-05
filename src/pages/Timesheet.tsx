import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import TimeBlockCell from "@/components/ui/table-cell";
import UserSelector from "@/components/ui/user-selector";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  parse,
  parseISO,
  isWithinInterval,
  addHours,
} from "date-fns";
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
import { Activity, CalendarDays, Plus } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const Timesheet = () => {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [emptyTimeSheet, setEmptyTimeSheet] = useState(
    Array.from({ length: 7 }, () => Array.from({ length: 8 }, () => null))
  );
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [formattedTimeSheets, setFormattedTimeSheets] =
    useState(emptyTimeSheet);
  const [selectedTimesheet, setSelectedTimesheet] = useState<any>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  ); // Monday
  const [isNewEntryDialogOpen, setIsNewEntryDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    project_code: "91635109100",
    activity_code: "CODING",
    shift_code: "REGULAR",
    hours: 1,
    date: new Date().toISOString().split("T")[0],
    start_time: "09:00",
    end_time: "10:00",
  });
  const [refresh, setRefresh] = useState(true);
  const [dragStart, setDragStart] = useState<{
    day: Date;
    hour: number;
  } | null>(null);

  // Admin-specific states
  const [allUsers, setAllUsers] = useState<
    { user_id: string; user_name: string }[]
  >([]);

  const [selectedUserId, setSelectedUserId] = useState<string>(
    user?.user_id || ""
  );

  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const isAdmin = user?.role === "admin";

  // Fixed to 1-hour blocks
  const slotCount = 8; // 8 hour blocks for 9AM-5PM
  const slotUnit = 1; // 1 hour per block

  // Generate time slots
  const timeSlots = [];
  for (let i = 0; i < slotCount; i++) {
    const hour = Math.floor(9 + i * slotUnit);
    const minute = ((i * slotUnit) % 1) * 60;
    const formattedHour = hour.toString().padStart(2, "0");
    const formattedMinute = minute.toString().padStart(2, "0");
    timeSlots.push(`${formattedHour}:${formattedMinute}`);
  }

  // Generate week days
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(currentWeekStart, i));
  }

  // Fetch all users for admin selector
  useEffect(() => {
    if (isAdmin) {
      setIsLoadingUsers(true);
      axios
        .get("http://localhost:3000/users")
        .then((response) => {
          console.log("Response", response.data);
          setAllUsers(response.data || []);
          setIsLoadingUsers(false);
        })
        .catch((err) => {
          console.error("Error loading users:", err);
          setIsLoadingUsers(false);
          toast.error("Failed to load users");
        });
    }
  }, [isAdmin]);

  const fetchWeeklyTimesheet = async () => {
    try {
      // If admin has selected a user, get that user's timesheet
      const userId = isAdmin && selectedUserId ? selectedUserId : user.user_id;
      const start_date = format(currentWeekStart, "yyyy-MM-dd");
      const res = await fetch(
        `http://localhost:3000/timesheet/${userId}/${start_date}`
      );
      const json = await res.json();
      setTimesheets(json.data || []);
    } catch (error) {
      console.error("Error fetching timesheet:", error);
      toast.error("Failed to fetch timesheet data");
    }
  };

  useEffect(() => {
    fetchWeeklyTimesheet();
  }, [currentWeekStart, refresh, selectedUserId]);

  // Mapping timesheets to formatted grid structure
  useEffect(() => {
    const start_hour = 9;
    const table: (null | {
      id: string;
      project_code: string;
      activity_code: string;
      shift_code: string;
    })[][] = [];

    for (let i = 0, index = 0; i < 7; i++) {
      let row = [];
      for (let j = 0; j < 8; j++) {
        if (index < timesheets.length) {
          let time_str = timesheets[index].start_time;
          let hour_only = parseInt(time_str.split(":")[0]);
          if (hour_only === start_hour + j) {
            row.push({
              id: timesheets[index].id,
              project_code: timesheets[index].project_code,
              activity_code: timesheets[index].activity_code,
              shift_code: timesheets[index].shift_code,
            });
            index++;
          } else {
            row.push(null);
          }
        } else {
          row.push(null);
        }
      }
      table.push(row);
    }

    setFormattedTimeSheets(table.length ? table : emptyTimeSheet);
  }, [timesheets]);

  const handleApprove = () => {
    axios
      .patch(
        `http://127.0.0.1:3000/timesheet/approve/${selectedUserId}/${format(
          currentWeekStart,
          "yyyy-MM-dd"
        )}`
      )
      .then((response) => {
        console.log(response.data);
        toast.success("Timesheet approved successfully");
      })
      .catch((error) => console.log(error));
    toast.info("Approved Weekly Report");
  };

  const handleReject = (id: number) => {
    axios
      .patch(`http://127.0.0.1:3000/timesheet/update/${id}/Rejected`)
      .then((response) => {
        console.log(response.data);
        toast.success("Timesheet rejected");
      })
      .catch((error) => console.log(error));
  };

  const handleRevise = (timesheet: any) => {
    // Convert database time format to HH:MM
    const date = timesheet.date;

    // Extract hours from the hours field to calculate end time
    const hours = parseInt(timesheet.hours);
    // Assuming start_time is stored in the database as HH:MM:SS or similar
    const startTime = timesheet.start_time
      ? timesheet.start_time.substring(0, 5)
      : "09:00";

    // Calculate end time based on start time and duration
    const start = parseISO(`${date}T${startTime}`);
    const end = addHours(start, hours);
    const endTime = format(end, "HH:mm");

    setSelectedTimesheet({
      ...timesheet,
      status: null,
      start_time: startTime,
      end_time: endTime,
    });
  };

  const handleEdit = (id: any, day: Date, startHour: number) => {
    setIsEditDialogOpen(true);
    let session;
    for (let i = 0; i < timesheets.length; i++) {
      if (timesheets[i].id === id) {
        session = timesheets[i];
      }
    }
    setSelectedTimesheet({
      ...session,
      date: format(session.date, "yyyy-MM-dd"),
      status: null,
      start_time: session.start_time,
      end_time: session.end_time,
    });
    toast.info(`Editing session ${session.id}`);
  };

  const handleDelete = (id: any) => {
    axios
      .delete(`http://localhost:3000/timesheet/delete/${id}`)
      .then((response) => {
        console.log(response.data);
        toast.warning(`Deleting session ${id}`);
      })
      .catch((error) => console.log("Error while deleting", error));
    setTimesheets((prevState) => prevState.filter((elem) => elem.id !== id));
  };

  const handleSubmitRevision = () => {
    // Calculate hours based on start and end time
    const startTime = parse(selectedTimesheet.start_time, "HH:mm", new Date());
    const endTime = parse(selectedTimesheet.end_time, "HH:mm", new Date());
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    axios
      .put(`http://127.0.0.1:3000/timesheet/revise/${selectedTimesheet.id}`, {
        hours: hours,
        date: selectedTimesheet.date,
        activity_code: selectedTimesheet.activity_code,
        shift_code: selectedTimesheet.shift_code,
        start_time: selectedTimesheet.start_time,
        end_time: selectedTimesheet.end_time,
      })
      .then((response) => {
        console.log(response.data);
        fetchWeeklyTimesheet();
        toast.success("Timesheet submitted for review");
        setIsEditDialogOpen(false);
      })
      .catch((error) => console.log("Error while revising timesheet", error));
  };

  const handleNewEntryChange = (field: string, value: string) => {
    setNewEntry({
      ...newEntry,
      [field]: field === "hours" ? parseInt(value) || 0 : value,
    });
  };

  const handleAddNewEntry = async () => {
    // Calculate hours from start_time and end_time
    const startTime = parse(newEntry.start_time, "HH:mm", new Date());
    const endTime = parse(newEntry.end_time, "HH:mm", new Date());
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    // Validate time range
    if (startTime >= endTime) {
      toast.error("End time must be after start time");
      return;
    }

    // Check if the new entry would overlap with existing entries
    const entriesOnSameDay = timesheets.filter(
      (entry: any) => entry.date === newEntry.date
    );

    // Check for overlap
    const hasOverlap = entriesOnSameDay.some((entry: any) => {
      const entryStart = parse(
        entry.start_time.substring(0, 5),
        "HH:mm",
        new Date()
      );
      const entryHours = parseFloat(entry.hours);
      const entryEnd = new Date(
        entryStart.getTime() + entryHours * 60 * 60 * 1000
      );

      return (
        isWithinInterval(startTime, { start: entryStart, end: entryEnd }) ||
        isWithinInterval(endTime, { start: entryStart, end: entryEnd }) ||
        (startTime <= entryStart && endTime >= entryEnd)
      );
    });

    if (hasOverlap) {
      toast.error("This time slot overlaps with an existing entry");
      return;
    }

    // Check if adding this entry would exceed 8 hours for the day
    const totalHoursForDay = entriesOnSameDay.reduce(
      (sum: number, entry: any) => sum + parseFloat(entry.hours),
      0
    );

    if (totalHoursForDay + hours > 8) {
      toast.error("Adding this entry would exceed the 8-hour daily limit");
      return;
    }

    // Use the current user ID or the selected user ID if admin
    const userId = isAdmin && selectedUserId ? selectedUserId : user.user_id;

    const newTimesheet = {
      user_id: userId,
      business_unit_code: "DEV01",
      global_business_unit_code: "GDEV01",
      project_code: newEntry.project_code,
      activity_code: newEntry.activity_code,
      shift_code: newEntry.shift_code,
      hours: hours,
      date: newEntry.date,
      leave: 0,
      comp_off: 0,
      status: null,
      start_time: newEntry.start_time,
      end_time: newEntry.end_time,
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
      await fetchWeeklyTimesheet();
      setIsNewEntryDialogOpen(false);
      toast.success("New timesheet entry added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add new entry");
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const handleCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const handleSubmitAll = () => {
    const start_date = format(currentWeekStart, "yyyy-MM-dd");
    const userId = isAdmin && selectedUserId ? selectedUserId : user.user_id;

    axios
      .patch(
        `http://localhost:3000/timesheet/update_week/${userId}/${start_date}`
      )
      .then((response) => {
        console.log("Response", response);
        toast.success("All pending timesheets submitted successfully");
        setRefresh((prevState) => !prevState);
      })
      .catch((error) => {
        console.log("Error", error);
        toast.error("Failed to submit timesheets");
      });
  };

  // Handle clicking on a time cell to open new entry dialog
  const handleTimeSlotClick = (day: Date, startHour: number) => {
    // Format the date and time values
    const formattedDate = format(day, "yyyy-MM-dd");
    const formattedStartHour = Math.floor(startHour)
      .toString()
      .padStart(2, "0");
    const formattedStartMinute = ((startHour % 1) * 60)
      .toString()
      .padStart(2, "0");
    const startTime = `${formattedStartHour}:${formattedStartMinute}`;

    // Calculate end time (1 hour later)
    let endHour = startHour + slotUnit;
    if (endHour > 17) endHour = 17;

    const formattedEndHour = Math.floor(endHour).toString().padStart(2, "0");
    const formattedEndMinute = ((endHour % 1) * 60).toString().padStart(2, "0");
    const endTime = `${formattedEndHour}:${formattedEndMinute}`;

    // Update new entry state with pre-filled time values based on clicked time slot
    setNewEntry({
      project_code: "91635109100",
      activity_code: "CODING",
      shift_code: "REGULAR",
      hours: slotUnit,
      date: formattedDate,
      start_time: startTime,
      end_time: endTime,
    });

    setIsNewEntryDialogOpen(true);
  };

  // Function to get the abbreviated activity name for display
  const getActivityAbbreviation = (activityCode: string) => {
    switch (activityCode) {
      case "CODING":
        return "Cod";
      case "DESIGN":
        return "Des";
      case "TESTING":
        return "Tst";
      case "MEETING":
        return "Meet";
      case "OTHER":
        return "Oth";
      default:
        return activityCode.substring(0, 3);
    }
  };

  // Function to get activity color for display
  const getActivityColor = (activityCode: string) => {
    switch (activityCode) {
      case "CODING":
        return "bg-blue-300 text-blue-900"; // Calm and focused
      case "DESIGN":
        return "bg-pink-200 text-pink-900"; // Creative and gentle
      case "TESTING":
        return "bg-green-300 text-green-900"; // Clarity and verification
      case "MEETING":
        return "bg-yellow-200 text-yellow-900"; // Attention-grabbing, soft
      case "OTHER":
        return "bg-gray-300 text-gray-900"; // Neutral fallback
      default:
        return "bg-slate-200 text-slate-900"; // Light fallback for undefined
    }
  };

  // Function to calculate daily total hours
  const getDailyTotalHours = (day: Date) => {
    const dayString = format(day, "yyyy-MM-dd");
    return timesheets
      .filter((entry: any) => entry.date === dayString)
      .reduce(
        (sum: number, entry: any) => sum + parseFloat(entry.hours || 0),
        0
      );
  };

  // Function to determine if adding a session for this day is disabled
  const isAddSessionDisabled = (day: Date) => {
    return getDailyTotalHours(day) >= 8;
  };

  // Function to check if the day is today
  const isToday = (day: Date) => {
    return isSameDay(day, new Date());
  };

  // Handle user selection (for admin only)
  const handleUserSelection = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleViewSheet = (id: any) => {
    let record;
    for (let i = 0; i < timesheets.length; i++) {
      if (timesheets[i].id === id) {
        record = timesheets[i];
      }
    }
    setSelectedTimesheet(record);
    console.log(record);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Timesheet Management</h1>
          <p className="text-muted-foreground mt-1">
            Track your work hours from 9:00 AM to 5:00 PM
          </p>
        </div>
        <div className="flex space-x-3">
          {isAdmin ? (
            <Button onClick={handleApprove}>Approve Week</Button>
          ) : (
            <Button onClick={handleSubmitAll}>Submit Week</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Weekly Timesheet</CardTitle>
            <CardDescription>
              Week of {format(currentWeekStart, "MMMM d, yyyy")}
            </CardDescription>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
            {isAdmin && (
              <UserSelector
                users={allUsers}
                selectedUserId={selectedUserId}
                onSelectUser={handleUserSelection}
              />
            )}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                Previous Week
              </Button>
              <Button variant="outline" size="sm" onClick={handleCurrentWeek}>
                Current Week
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextWeek}>
                Next Week
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Day</TableHead>
                  {timeSlots.map((timeSlot, index) => (
                    <TableHead key={index} className="text-center min-w-[80px]">
                      {timeSlot}
                    </TableHead>
                  ))}
                  <TableHead className="text-center w-28">
                    Daily Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weekDays.map((day, dayIndex) => {
                  let totalHours = 0;
                  if (formattedTimeSheets.length > 0) {
                    return (
                      <TableRow
                        key={dayIndex}
                        className={isToday(day) ? "bg-blue-50" : ""}
                      >
                        <TableCell className="font-medium">
                          {format(day, "EEE, MMM d")}
                        </TableCell>
                        {formattedTimeSheets[dayIndex]
                          .map((session, slotIndex) => {
                            const hour = 9 + slotIndex * slotUnit;
                            if (session) {
                              totalHours += 1;
                              return (
                                <TimeBlockCell
                                  key={slotIndex}
                                  session={session}
                                  slotIndex={slotIndex}
                                  getActivityColor={getActivityColor}
                                  onEdit={() =>
                                    handleEdit(session.id, day, hour)
                                  }
                                  onDelete={() => handleDelete(session.id)}
                                  isAdmin={isAdmin}
                                  toView={() => handleViewSheet(session.id)}
                                />
                              );
                            } else {
                              // Empty cell that can be clicked to add a session
                              return (
                                <TableCell
                                  key={slotIndex}
                                  className="p-0 m-0 h-12 border cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleTimeSlotClick(day, hour)}
                                ></TableCell>
                              );
                            }
                          })
                          .filter(Boolean)}
                        <TableCell className="text-center">
                          <Badge
                            variant={totalHours >= 8 ? "default" : "outline"}
                          >
                            {totalHours} / 8 hrs
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  }
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Note: Submit your timesheet by end of the week
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

      {/* Session View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>View Session Details</DialogTitle>
          </DialogHeader>
          {selectedTimesheet && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex-col">
                  <p className="text-sm font-medium mb-1">Date</p>
                  <p>{format(selectedTimesheet.date, "yyyy-MM-dd")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Project</p>
                  <p>{selectedTimesheet.project_code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium mb-1">Start Time</p>
                  <p className="font-medium">{selectedTimesheet.start_time}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">End Time</p>
                  <p className="font-medium">{selectedTimesheet.end_time}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm font-medium mb-1">Activity</p>
                  <p>{selectedTimesheet.activity_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Shift</p>
                  <p>{selectedTimesheet.shift_code}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Session Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Timesheet Session</DialogTitle>
            <DialogDescription>
              Update your work session details
            </DialogDescription>
          </DialogHeader>

          {selectedTimesheet && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex-col">
                  <p className="text-sm font-medium mb-1">Date</p>
                  <p>{selectedTimesheet.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Project</p>
                  <Select
                    value={selectedTimesheet.project_code}
                    onValueChange={(value) =>
                      setSelectedTimesheet({
                        ...selectedTimesheet,
                        project_code: value,
                      })
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
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium mb-1">Start Time</p>
                  <p className="font-medium">{selectedTimesheet.start_time}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">End Time</p>
                  <p className="font-medium">{selectedTimesheet.end_time}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm font-medium mb-1">Activity</p>
                  <Select
                    value={selectedTimesheet.activity_code}
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
                    value={selectedTimesheet.shift_code}
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

          <DialogFooter className="flex justify-between">
            <div>
              {isAdmin &&
                selectedTimesheet &&
                selectedTimesheet.status === "Pending" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 mr-2"
                      onClick={() => {
                        handleApprove();
                        setSelectedTimesheet(null);
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      onClick={() => {
                        handleReject(selectedTimesheet.id);
                        setSelectedTimesheet(null);
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}
            </div>
            <div>
              <Button
                variant="outline"
                className="mr-2"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitRevision}>Save Changes</Button>
            </div>
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
            <DialogTitle>Add New Timesheet Session</DialogTitle>
            <DialogDescription>
              Create a new timesheet session for{" "}
              {newEntry.date
                ? format(parseISO(newEntry.date), "EEEE, MMMM d, yyyy")
                : "today"}{" "}
              from {newEntry.start_time} to {newEntry.end_time}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Project Code</p>
                <Select
                  defaultValue={newEntry.project_code}
                  onValueChange={(value) =>
                    handleNewEntryChange("project_code", value)
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
                <p className="text-sm font-medium">
                  {newEntry.date
                    ? format(parseISO(newEntry.date), "MMMM d, yyyy")
                    : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Time Slot</p>
                <p className="text-sm font-medium">
                  {newEntry.start_time} - {newEntry.end_time}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Duration</p>
                <p className="text-sm font-medium">
                  {(() => {
                    const startTime = parse(
                      newEntry.start_time,
                      "HH:mm",
                      new Date()
                    );
                    const endTime = parse(
                      newEntry.end_time,
                      "HH:mm",
                      new Date()
                    );
                    const hours =
                      (endTime.getTime() - startTime.getTime()) /
                      (1000 * 60 * 60);
                    return `${hours} hour${hours !== 1 ? "s" : ""}`;
                  })()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Activity</p>
                <Select
                  defaultValue={newEntry.activity_code}
                  onValueChange={(value) =>
                    handleNewEntryChange("activity_code", value)
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
                    handleNewEntryChange("shift_code", value)
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
