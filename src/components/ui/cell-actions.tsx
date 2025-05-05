import React from "react";
import { Trash2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface CellActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

const CellActions: React.FC<CellActionsProps> = ({
  onEdit,
  onDelete,
  className,
}) => {
  return (
    <div
      className={cn(
        "absolute right-1 top-1 hidden group-hover:flex gap-1",
        className
      )}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
        aria-label="Edit"
      >
        <Edit className="h-3.5 w-3.5 text-blue-600" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-1 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
        aria-label="Delete"
      >
        <Trash2 className="h-3.5 w-3.5 text-red-600" />
      </button>
    </div>
  );
};

export default CellActions;