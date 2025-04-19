import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SalaryItem {
  name: string;
  amount: number | string;
}

interface SalaryDetailsProps {
  earnings: SalaryItem[];
  deductions: SalaryItem[];
  gross: number | string;
  net: number | string;
}

const formatCurrency = (amount: number | string): string => {
  if (typeof amount === "string") return amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace(/^(\D+)/, "₹");
};

const SalaryDetails: React.FC<SalaryDetailsProps> = ({
  earnings,
  deductions,
  gross,
  net,
}) => {
  return (
    <Card className="mb-6 border-purple-100">
      <CardContent className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earnings Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Earnings
            </h3>
            <div className="space-y-3">
              {earnings.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-medium">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-4 bg-purple-100" />
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Gross Salary</span>
              <span className="font-bold text-purple-700">
                {formatCurrency(gross)}
              </span>
            </div>
          </div>

          {/* Deductions Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Deductions
            </h3>
            <div className="space-y-3">
              {deductions.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-medium">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-4 bg-purple-100" />
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">
                Total Deductions
              </span>
              <span className="font-bold text-red-600">
                {formatCurrency(
                  deductions.reduce((sum, item) => {
                    const amount =
                      typeof item.amount === "string"
                        ? parseFloat(item.amount.replace(/[^\d.-]/g, ""))
                        : item.amount;
                    return sum + amount;
                  }, 0)
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Net Salary Section */}
        <div className="mt-8 bg-purple-50 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-800">
              Net Salary
            </span>
            <span className="text-xl font-bold text-purple-700">
              {formatCurrency(net)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalaryDetails;
