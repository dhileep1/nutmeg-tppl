import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import html2pdf from "html2pdf.js";

interface PayrollFooterProps {
  companyName: string;
}

const PayrollFooter: React.FC<PayrollFooterProps> = ({ companyName }) => {
  const handleDownloadPDF = () => {
    const element = document.querySelector(".max-w-4xl");

    if (!element) {
      console.error("Could not find payroll slip element");
      return;
    }

    const options = {
      margin: 10,
      filename: `${companyName.replace(
        /\s+/g,
        "-"
      )}-Payroll-Slip-${new Date().toLocaleDateString()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf().from(element).set(options).save();
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="text-center text-sm text-gray-500">
        <p>
          This is a computer-generated payslip and does not require a signature.
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} {companyName}. All rights reserved.
        </p>
      </div>

      <div className="flex justify-center mt-4">
        <Button
          onClick={handleDownloadPDF}
          variant="outline"
          className="text-sm flex items-center gap-2"
        >
          <Download size={16} />
          Download PDF
        </Button>
      </div>
    </div>
  );
};

export default PayrollFooter;
