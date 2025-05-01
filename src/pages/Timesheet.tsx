
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { format, startOfWeek, addDays, isSameDay, parse, parseISO, isWithinInterval, addHours } from "date-fns";
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
  const [selectedTimesheet, setSelectedTimesheet] = useState<any>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 })); // Monday
  const [isNewEntryDialogOpen, setIsNewEntryDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    project_code: "91635109100",
    activity_code: "CODING",
    shift_code: "REGULAR",
    hours: 1,
    date: new Date().toISOString().split("T")[0],
    start_time: "09:00",
    end_time: "10:00"
  });
  const [timeBlockUnit, setTimeBlockUnit] = useState<"30min" | "1hour">("1hour");
  const [dragStart, setDragStart] = useState<{day: Date, hour: number} | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{start: number, end: number} | null>(null);

  const isAdmin = user?.role === "admin";
  
  // Generate time slots based on the selected unit
  const timeSlots = [];
  const slotCount = timeBlockUnit === "30min" ? 16 : 8; // 16 half-hour blocks or 8 hour blocks
  const slotUnit = timeBlockUnit === "30min" ? 0.5 : 1;
  
  for (let i = 0; i < slotCount; i++) {
    const hour = Math.floor(9 + (i * slotUnit));
    const minute = ((i * slotUnit) % 1) * 60;
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    timeSlots.push(`${formattedHour}:${formattedMinute}`);
  }

  // Generate week days
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(currentWeekStart, i));
  }

  const fetchWeeklyTimesheet = async () => {
    try {
      const res = await fetch(`http://localhost:3000/timesheet/${user.user_id}`);
      const json = await res.json();
      setTimesheets(json.data || []);
    } catch (error) {
      console.error("Error fetching timesheet:", error);
      toast.error("Failed to fetch timesheet data");
    }
  };

  useEffect(() => {
    fetchWeeklyTimesheet();
  }, [currentWeekStart]);

  const handleApprove = (id: number) => {
    axios
      .patch(`http://127.0.0.1:3000/timesheet/update/${id}/Approved`)
      .then((response) => {
        console.log(response.data);
        fetchWeeklyTimesheet();
        toast.success("Timesheet approved successfully");
      })
      .catch((error) => console.log(error));
  };

  const handleReject = (id: number) => {
    axios
      .patch(`http://127.0.0.1:3000/timesheet/update/${id}/Rejected`)
      .then((response) => {
        console.log(response.data);
        fetchWeeklyTimesheet();
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
    const startTime = timesheet.start_time ? timesheet.start_time.substring(0, 5) : "09:00";
    
    // Calculate end time based on start time and duration
    const start = parseISO(`${date}T${startTime}`);
    const end = addHours(start, hours);
    const endTime = format(end, "HH:mm");
    
    setSelectedTimesheet({ 
      ...timesheet, 
      status: "Pending",
      start_time: startTime,
      end_time: endTime
    });
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
        end_time: selectedTimesheet.end_time
      })
      .then((response) => {
        console.log(response.data);
        fetchWeeklyTimesheet();
        toast.success("Timesheet submitted for review");
        setSelectedTimesheet(null);
      })
      .catch((error) => console.log("Error while revising timesheet", error));
  };

  const handleNewEntryChange = (field: string, value: string) => {
    if (field === "start_time") {
      // When start_time changes, update end_time to be 1 hour later
      const startHour = parseInt(value.split(":")[0]);
      const startMinute = parseInt(value.split(":")[1]);
      let endHour = startHour + 1;
      
      // Make sure end time doesn't exceed 5 PM
      if (endHour > 17) endHour = 17;
      
      const endTime = `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
      
      setNewEntry({
        ...newEntry,
        [field]: value,
        end_time: endTime
      });
    } else if (field === "end_time") {
      // When end_time changes, calculate hours
      const startTime = parse(newEntry.start_time, "HH:mm", new Date());
      const endTime = parse(value, "HH:mm", new Date());
      const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      setNewEntry({
        ...newEntry,
        [field]: value,
        hours: hours
      });
    } else {
      setNewEntry({
        ...newEntry,
        [field]: field === "hours" ? parseInt(value) || 0 : value,
      });
    }
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
    const entriesOnSameDay = timesheets.filter((entry: any) => 
      entry.date === newEntry.date
    );
    
    // Check for overlap
    const hasOverlap = entriesOnSameDay.some((entry: any) => {
      const entryStart = parse(entry.start_time.substring(0, 5), "HH:mm", new Date());
      const entryHours = parseFloat(entry.hours);
      const entryEnd = new Date(entryStart.getTime() + entryHours * 60 * 60 * 1000);
      
      return isWithinInterval(startTime, {start: entryStart, end: entryEnd}) || 
             isWithinInterval(endTime, {start: entryStart, end: entryEnd}) ||
             (startTime <= entryStart && endTime >= entryEnd);
    });
    
    if (hasOverlap) {
      toast.error("This time slot overlaps with an existing entry");
      return;
    }
    
    // Check if adding this entry would exceed 8 hours for the day
    const totalHoursForDay = entriesOnSameDay.reduce((sum: number, entry: any) => 
      sum + parseFloat(entry.hours), 0
    );
    
    if (totalHoursForDay + hours > 8) {
      toast.error("Adding this entry would exceed the 8-hour daily limit");
      return;
    }

    const newTimesheet = {
      user_id: user.user_id,
      business_unit_code: "DEV01",
      global_business_unit_code: "GDEV01",
      project_code: newEntry.project_code,
      activity_code: newEntry.activity_code,
      shift_code: newEntry.shift_code,
      hours: hours,
      date: newEntry.date,
      leave: 0,
      comp_off: 0,
      status: "Pending",
      start_time: newEntry.start_time,
      end_time: newEntry.end_time
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

  const handleSubmitAll = () => {
    toast.success("All pending timesheets submitted successfully");
  };

  // Function to get timesheet entries for a specific day
  const getEntriesForDay = (day: Date) => {
    const dayString = format(day, "yyyy-MM-dd");
    return timesheets.filter((entry: any) => entry.date === dayString);
  };

  // Handle clicking on a time cell to open new entry dialog
  const handleTimeSlotClick = (day: Date, startHour: number) => {
    // Format the date and time values
    const formattedDate = format(day, "yyyy-MM-dd");
    const formattedStartHour = Math.floor(startHour).toString().padStart(2, '0');
    const formattedStartMinute = ((startHour % 1) * 60).toString().padStart(2, '0');
    const startTime = `${formattedStartHour}:${formattedStartMinute}`;
    
    // Calculate end time (1 hour later or until 5 PM)
    let endHour = startHour + 1;
    if (endHour > 17) endHour = 17;
    
    const formattedEndHour = Math.floor(endHour).toString().padStart(2, '0');
    const formattedEndMinute = ((endHour % 1) * 60).toString().padStart(2, '0');
    const endTime = `${formattedEndHour}:${formattedEndMinute}`;
    
    // Update new entry state
    setNewEntry({
      ...newEntry,
      date: formattedDate,
      start_time: startTime,
      end_time: endTime,
      hours: endHour - startHour
    });
    
    setIsNewEntryDialogOpen(true);
  };

  // Function to check if a time slot is occupied
  const isTimeSlotOccupied = (day: Date, hour: number) => {
    const dayString = format(day, "yyyy-MM-dd");
    const hourDecimal = hour;
    
    return timesheets.some((entry: any) => {
      if (entry.date !== dayString) return false;
      
      const entryStartTime = entry.start_time ? 
        parseFloat(entry.start_time.substring(0, 2)) + (parseFloat(entry.start_time.substring(3, 5)) / 60) : 
        9;
      
      const entryHours = parseFloat(entry.hours || 1);
      const entryEndTime = entryStartTime + entryHours;
      
      return (hourDecimal >= entryStartTime && hourDecimal < entryEndTime);
    });
  };

  // Function to get the session at a specific time slot
  const getSessionAtTimeSlot = (day: Date, hour: number) => {
    const dayString = format(day, "yyyy-MM-dd");
    const hourDecimal = hour;
    
    return timesheets.find((entry: any) => {
      if (entry.date !== dayString) return false;
      
      const entryStartTime = entry.start_time ? 
        parseFloat(entry.start_time.substring(0, 2)) + (parseFloat(entry.start_time.substring(3, 5)) / 60) : 
        9;
      
      const entryHours = parseFloat(entry.hours || 1);
      const entryEndTime = entryStartTime + entryHours;
      
      return (hourDecimal >= entryStartTime && hourDecimal < entryEndTime);
    });
  };

  // Function to calculate session width in columns
  const getSessionColSpan = (entry: any) => {
    const startTime = entry.start_time ? 
      parseFloat(entry.start_time.substring(0, 2)) + (parseFloat(entry.start_time.substring(3, 5)) / 60) : 
      9;
      
    const hours = parseFloat(entry.hours || 1);
    const endTime = startTime + hours;
    
    // Calculate how many time slots this spans
    if (timeBlockUnit === "30min") {
      return Math.ceil(hours * 2); // 2 slots per hour for 30-min blocks
    } else {
      return Math.ceil(hours); // 1 slot per hour for 1-hour blocks
    }
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
        return "bg-blue-500 text-white";
      case "DESIGN":
        return "bg-purple-500 text-white";
      case "TESTING":
        return "bg-green-500 text-white";
      case "MEETING":
        return "bg-amber-500 text-white";
      case "OTHER":
        return "bg-gray-500 text-white";
      default:
        return "bg-cyan-500 text-white";
    }
  };

  // Function to check if any time slot in a day is occupied by the session
  const isStartOfSession = (day: Date, hour: number) => {
    const dayString = format(day, "yyyy-MM-dd");
    const hourDecimal = hour;
    
    return timesheets.some((entry: any) => {
      if (entry.date !== dayString) return false;
      
      const entryStartTime = entry.start_time ? 
        parseFloat(entry.start_time.substring(0, 2)) + (parseFloat(entry.start_time.substring(3, 5)) / 60) : 
        9;
      
      // Check if this is the start of the session
      return Math.abs(hourDecimal - entryStartTime) < 0.01; // Small threshold to handle floating point comparison
    });
  };

  // Function to calculate daily total hours
  const getDailyTotalHours = (day: Date) => {
    const dayString = format(day, "yyyy-MM-dd");
    return timesheets
      .filter((entry: any) => entry.date === dayString)
      .reduce((sum: number, entry: any) => sum + parseFloat(entry.hours || 0), 0);
  };

  // Function to determine if adding a session for this day is disabled
  const isAddSessionDisabled = (day: Date) => {
    return getDailyTotalHours(day) >= 8;
  };

  // Function to check if the day is today
  const isToday = (day: Date) => {
    return isSameDay(day, new Date());
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
          <Select 
            value={timeBlockUnit} 
            onValueChange={(value: "30min" | "1hour") => setTimeBlockUnit(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Block Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30min">30 Minutes</SelectItem>
              <SelectItem value="1hour">1 Hour</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSubmitAll}>Submit Week</Button>
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
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousWeek}
            >
              Previous Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCurrentWeek}
            >
              Current Week
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Day</TableHead>
                  {timeSlots.map((timeSlot, index) => (
                    <TableHead 
                      key={index} 
                      className="text-center min-w-[80px]"
                    >
                      {timeSlot}
                    </TableHead>
                  ))}
                  <TableHead className="text-center w-28">Daily Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weekDays.map((day, dayIndex) => {
                  const totalHours = getDailyTotalHours(day);
                  const isAddDisabled = totalHours >= 8;
                  
                  return (
                    <TableRow key={dayIndex} className={isToday(day) ? "bg-blue-50" : ""}>
                      <TableCell className="font-medium">
                        {format(day, "EEE, MMM d")}
                      </TableCell>
                      
                      {/* Time slot cells */}
                      {Array.from({ length: slotCount }).map((_, slotIndex) => {
                        const hour = 9 + (slotIndex * slotUnit);
                        const isOccupied = isTimeSlotOccupied(day, hour);
                        const isSessionStart = isStartOfSession(day, hour);
                        const session = isSessionStart ? getSessionAtTimeSlot(day, hour) : null;
                        const colSpan = session ? getSessionColSpan(session) : 1;
                        
                        if (isSessionStart) {
                          return (
                            <TableCell 
                              key={slotIndex} 
                              colSpan={colSpan}
                              className={`relative p-0 m-0 h-12 ${getActivityColor(session.activity_code)}`}
                              onClick={() => handleRevise(session)}
                            >
                              <div className="flex items-center justify-between px-2 h-full cursor-pointer">
                                <span className="font-bold">{getActivityAbbreviation(session.activity_code)}</span>
                                <span className="text-xs whitespace-nowrap">
                                  {session.start_time?.substring(0, 5)}-{
                                    format(
                                      addHours(
                                        parse(session.start_time.substring(0, 5), "HH:mm", new Date()),
                                        parseFloat(session.hours)
                                      ),
                                      "HH:mm"
                                    )
                                  }
                                </span>
                              </div>
                            </TableCell>
                          );
                        } else if (!isOccupied) {
                          // Empty cell that can be clicked to add a session
                          return (
                            <TableCell 
                              key={slotIndex} 
                              className="p-0 m-0 h-12 border cursor-pointer hover:bg-gray-100"
                              onClick={() => !isAddDisabled && handleTimeSlotClick(day, hour)}
                            >
                              {isAddDisabled && <div className="w-full h-full bg-gray-100 opacity-50"></div>}
                            </TableCell>
                          );
                        } else {
                          // Skip cells that are covered by a session's colspan
                          return null;
                        }
                      }).filter(Boolean)}
                      
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <Badge variant={totalHours >= 8 ? "default" : "outline"}>
                            {totalHours.toFixed(1)} / 8 hrs
                          </Badge>
                          {!isAddDisabled && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-1"
                              onClick={() => {
                                setNewEntry({
                                  ...newEntry,
                                  date: format(day, "yyyy-MM-dd"),
                                  start_time: "09:00",
                                  end_time: "10:00",
                                  hours: 1
                                });
                                setIsNewEntryDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" /> Add
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
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

      {/* Session Edit Dialog */}
      <Dialog
        open={!!selectedTimesheet}
        onOpenChange={(open) => {
          if (!open) setSelectedTimesheet(null);
        }}
      >
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
                <div>
                  <p className="text-sm font-medium mb-1">Date</p>
                  <p>{format(parseISO(selectedTimesheet.date), "EEEE, MMMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Project</p>
                  <p>{selectedTimesheet.project_code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium mb-1">Start Time</p>
                  <Select
                    value={selectedTimesheet.start_time}
                    onValueChange={(value) => {
                      // When start time changes, ensure end time is valid
                      const currentEndTime = selectedTimesheet.end_time;
                      if (value >= currentEndTime) {
                        // If start time is >= end time, set end time to start time + 30 min
                        const newStartHour = parseInt(value.split(":")[0]);
                        const newStartMinute = parseInt(value.split(":")[1]);
                        let newEndHour = newStartHour;
                        let newEndMinute = newStartMinute + 30;
                        
                        if (newEndMinute >= 60) {
                          newEndHour += 1;
                          newEndMinute -= 60;
                        }
                        
                        if (newEndHour > 17 || (newEndHour === 17 && newEndMinute > 0)) {
                          newEndHour = 17;
                          newEndMinute = 0;
                        }
                        
                        const newEndTime = `${newEndHour.toString().padStart(2, '0')}:${newEndMinute.toString().padStart(2, '0')}`;
                        
                        setSelectedTimesheet({
                          ...selectedTimesheet,
                          start_time: value,
                          end_time: newEndTime
                        });
                      } else {
                        setSelectedTimesheet({
                          ...selectedTimesheet,
                          start_time: value
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:00">09:00 AM</SelectItem>
                      <SelectItem value="09:30">09:30 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="10:30">10:30 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="11:30">11:30 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="12:30">12:30 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="13:30">1:30 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="14:30">2:30 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="15:30">3:30 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                      <SelectItem value="16:30">4:30 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">End Time</p>
                  <Select
                    value={selectedTimesheet.end_time}
                    onValueChange={(value) => {
                      // Validate that end time is after start time
                      if (value <= selectedTimesheet.start_time) {
                        toast.error("End time must be after start time");
                        return;
                      }
                      
                      setSelectedTimesheet({
                        ...selectedTimesheet,
                        end_time: value
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09:30">09:30 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="10:30">10:30 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="11:30">11:30 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="12:30">12:30 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="13:30">1:30 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="14:30">2:30 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="15:30">3:30 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                      <SelectItem value="16:30">4:30 PM</SelectItem>
                      <SelectItem value="17:00">5:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
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
              {isAdmin && selectedTimesheet && selectedTimesheet.status === "Pending" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 mr-2"
                    onClick={() => {
                      handleApprove(selectedTimesheet.id);
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
                onClick={() => setSelectedTimesheet(null)}
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
              Create a new timesheet session for {newEntry.date ? format(parseISO(newEntry.date), "EEEE, MMMM d, yyyy") : "today"}
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
                <Input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => handleNewEntryChange("date", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Start Time</p>
                <Select
                  value={newEntry.start_time}
                  onValueChange={(value) => handleNewEntryChange("start_time", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">09:00 AM</SelectItem>
                    <SelectItem value="09:30">09:30 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="10:30">10:30 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="11:30">11:30 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="12:30">12:30 PM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="13:30">1:30 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="14:30">2:30 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="15:30">3:30 PM</SelectItem>
                    <SelectItem value="16:00">4:00 PM</SelectItem>
                    <SelectItem value="16:30">4:30 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">End Time</p>
                <Select
                  value={newEntry.end_time}
                  onValueChange={(value) => handleNewEntryChange("end_time", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:30">09:30 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="10:30">10:30 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="11:30">11:30 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="12:30">12:30 PM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="13:30">1:30 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="14:30">2:30 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="15:30">3:30 PM</SelectItem>
                    <SelectItem value="16:00">4:00 PM</SelectItem>
                    <SelectItem value="16:30">4:30 PM</SelectItem>
                    <SelectItem value="17:00">5:00 PM</SelectItem>
                  </SelectContent>
                </Select>
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
