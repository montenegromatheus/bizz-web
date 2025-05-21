import { TablePagination, TablePaginationOwnProps } from "@mui/material";
import React from "react";

const CustomTablePagination: React.FC<TablePaginationOwnProps> = ({
  count,
  rowsPerPage,
  page,
  onPageChange,
  onRowsPerPageChange,
}) => {
  return (
    <TablePagination
      rowsPerPageOptions={[5, 10, 25]}
      component="div"
      count={count}
      labelRowsPerPage="Linhas por página"
      labelDisplayedRows={({ from, to, count: total }) =>
        `${from}-${to} de ${total}`
      }
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
    />
  );
};
export default CustomTablePagination;
