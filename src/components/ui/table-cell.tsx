import React from "react";
import CellActions from "./cell-actions";

interface TableCellProps {
  session: any; // Replace with your proper session type
  slotIndex: number;
  getActivityColor: (code: string) => string;
  handleRevise: (session: any) => void;
  onDelete: (session: any) => void;
  onEdit: (session: any) => void;
}

const TableCell1: React.FC<TableCellProps> = ({
  session,
  slotIndex,
  getActivityColor,
  handleRevise,
  onDelete,
  onEdit,
}) => {
  return (
    <td
      key={slotIndex}
      className={`relative p-0 h-12 cursor-pointer text-center text-xs font-medium group ${getActivityColor(
        session.activity_code
      )}`}
      onClick={() => handleRevise(session)}
    >
      {session.activity_code}
      <CellActions
        onEdit={() => onEdit(session)}
        onDelete={() => onDelete(session)}
      />
    </td>
  );
};

export default TableCell1;