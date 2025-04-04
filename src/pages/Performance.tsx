
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChartBar, Download } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Mock performance data
const performanceData = [
  {
    id: 1,
    name: "John Doe",
    tasksCompleted: 28,
    tasksReworked: 2,
    codeReviewComments: 15,
    technicalSkill: 85,
    overallScore: 92,
  },
  {
    id: 2,
    name: "Jane Smith",
    tasksCompleted: 32,
    tasksReworked: 3,
    codeReviewComments: 12,
    technicalSkill: 90,
    overallScore: 94,
  },
];

const Performance = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeTab, setActiveTab] = useState("overview");

  const handleDataIngestion = () => {
    toast.success("Performance data ingestion initiated");
  };

  const handleDownloadReport = () => {
    toast.success("Performance report download initiated");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Track and improve your performance metrics
          </p>
        </div>
        <div className="flex space-x-3">
          {isAdmin && (
            <Button variant="outline" onClick={handleDataIngestion}>
              Ingest Data
            </Button>
          )}
          <Button onClick={handleDownloadReport}>
            <Download className="h-4 w-4 mr-2" /> Download Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>
                ML-powered performance prediction based on your work metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-muted/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Overall Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-nutmeg-700">92%</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Top 10% in your department
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Tasks Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-green-600">28</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        This quarter
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Code Quality</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-blue-600">85%</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on code reviews
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Growth Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-amber-600">+12%</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Improvement since last quarter
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Technical Skills</label>
                          <span className="text-sm font-medium">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Delivery Quality</label>
                          <span className="text-sm font-medium">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Collaboration</label>
                          <span className="text-sm font-medium">90%</span>
                        </div>
                        <Progress value={90} className="h-2" />
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Innovation</label>
                          <span className="text-sm font-medium">78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>ML Prediction</CardTitle>
                      <CardDescription>Performance trajectory based on ML analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b">
                          <div>
                            <p className="font-medium">Predicted Growth</p>
                            <p className="text-sm text-muted-foreground">Next quarter</p>
                          </div>
                          <span className="text-green-600 font-bold">+8%</span>
                        </div>
                        
                        <div className="flex items-center justify-between pb-2 border-b">
                          <div>
                            <p className="font-medium">Skill Gap Analysis</p>
                            <p className="text-sm text-muted-foreground">Areas to improve</p>
                          </div>
                          <span className="text-amber-600 font-bold">2 areas</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Leadership Potential</p>
                            <p className="text-sm text-muted-foreground">Based on current metrics</p>
                          </div>
                          <span className="text-blue-600 font-bold">High</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
              <CardDescription>
                In-depth analysis of your performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member Name</TableHead>
                      <TableHead className="text-center">Tasks Completed</TableHead>
                      <TableHead className="text-center">Tasks Reworked</TableHead>
                      <TableHead className="text-center">Code Review Comments</TableHead>
                      <TableHead className="text-center">Technical Skill</TableHead>
                      <TableHead className="text-center">Overall Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-center">{item.tasksCompleted}</TableCell>
                        <TableCell className="text-center">{item.tasksReworked}</TableCell>
                        <TableCell className="text-center">{item.codeReviewComments}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center space-x-2">
                            <Progress value={item.technicalSkill} className="h-2 w-24" />
                            <span>{item.technicalSkill}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={item.overallScore} 
                              className={`h-2 w-24 ${
                                item.overallScore > 90 
                                  ? 'bg-green-100 [&>div]:bg-green-500' 
                                  : item.overallScore > 75 
                                    ? 'bg-amber-100 [&>div]:bg-amber-500' 
                                    : 'bg-red-100 [&>div]:bg-red-500'
                              }`} 
                            />
                            <span>{item.overallScore}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Data is updated weekly based on your project contributions
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Performance;
