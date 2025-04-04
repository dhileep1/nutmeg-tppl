
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, FileText, ChartBar, CalendarDays } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();

  const modules = [
    {
      title: "Timesheet",
      description: "Manage and submit your weekly timesheet",
      icon: <Clock className="h-10 w-10 text-nutmeg-600" />,
      link: "/timesheet",
      color: "bg-nutmeg-50",
    },
    {
      title: "Payroll",
      description: "Access your salary information and payslips",
      icon: <FileText className="h-10 w-10 text-blue-600" />,
      link: "/payroll",
      color: "bg-blue-50",
    },
    {
      title: "Performance",
      description: "View your performance metrics and feedback",
      icon: <ChartBar className="h-10 w-10 text-green-600" />,
      link: "/performance",
      color: "bg-green-50",
    },
    {
      title: "Leave",
      description: "Request and manage your leave applications",
      icon: <CalendarDays className="h-10 w-10 text-amber-600" />,
      link: "/leave",
      color: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground mt-1">
          Manage your work, time and performance through this portal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module) => (
          <Link to={module.link} key={module.title}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className={`${module.color} rounded-t-lg p-4`}>
                {module.icon}
              </CardHeader>
              <CardContent className="pt-4">
                <CardTitle className="text-lg">{module.title}</CardTitle>
                <CardDescription className="mt-2">
                  {module.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your recent system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Timesheet Submitted</p>
                  <p className="text-sm text-muted-foreground">Week 14, 2025</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  Yesterday
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">Leave Request Approved</p>
                  <p className="text-sm text-muted-foreground">Annual Leave - 2 days</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  Mar 28, 2025
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payslip Generated</p>
                  <p className="text-sm text-muted-foreground">March 2025</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  Mar 25, 2025
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Summary of your key metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-sm font-medium">Available Leave</h3>
                <p className="text-2xl font-bold mt-1">12 days</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-sm font-medium">Billable Hours</h3>
                <p className="text-2xl font-bold mt-1">32h / 40h</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-sm font-medium">Performance</h3>
                <p className="text-2xl font-bold mt-1">92%</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-sm font-medium">Projects</h3>
                <p className="text-2xl font-bold mt-1">2 active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
