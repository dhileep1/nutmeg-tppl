import React from "react";
import CellActions from "./cell-actions";

interface TableCellProps {
  session: any; // Replace with your proper session type
  slotIndex: number;
  getActivityColor: (code: string) => string;
  onDelete: (id: any) => void;
  onEdit: (session: any) => void;
}

const TableCell1: React.FC<TableCellProps> = ({
  session,
  slotIndex,
  getActivityColor,
  onDelete,
  onEdit,
}) => {
  return (
    <td
      key={slotIndex}
      className={`relative p-0 h-12 cursor-pointer text-center text-xs font-medium group ${getActivityColor(
        session.activity_code
      )}`}
    >
      {session.activity_code}
      <CellActions
        onEdit={() => onEdit(session)}
        onDelete={() => onDelete(session.id)}
      />
    </td>
  );
};

export default TableCell1;
