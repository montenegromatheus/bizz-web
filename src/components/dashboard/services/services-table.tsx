"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { api } from "@/api";
import CustomTablePagination from "@/components/core/custom-table-pagination";
import useAuth from "@/hooks/use-auth";
import { useLoading } from "@/hooks/use-loading";
import { Service } from "@/schema";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { DotsThreeVertical, Pencil, Trash } from "@phosphor-icons/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import EditServiceForm from "./edit-service-form";
import useSnackbar from "@/hooks/use-snackbar";

function formatPrice(value: string | number): string {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return "R$ 0,00";
  }

  const formattedValue = numericValue.toFixed(2);
  const [reais, cents] = formattedValue.split(".");
  const formattedReais = reais.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `R$ ${formattedReais},${cents}`;
}

export function ServicesTable({
  rows,
  rowsPerPage,
  page,
  totalCount,
  loadData,
  setPage,
  setRowsPerPage,
  name,
}: {
  rows: Service[];
  page: number;
  totalCount: number;
  rowsPerPage: number;
  loadData: () => Promise<void>;
  setPage: Dispatch<SetStateAction<number>>;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  name: string;
}): JSX.Element {
  const { companyId } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { loadingDispatch } = useLoading();

  useEffect(() => {
    if (companyId) {
      loadData();
    } else {
      console.error("companyId está indefinido ou nulo.");
    }
  }, [companyId, rowsPerPage, page, name]);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedRow, setSelectedRow] = useState<Service | null>(null);
  const { showSnackbar } = useSnackbar();

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    row: Service,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const renderDuration = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const remainingMinutes = duration % 60;
    if (hours === 0) {
      return `${remainingMinutes}min`;
    }

    return `${hours}h ${remainingMinutes}min`;
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleDelete = async () => {
    loadingDispatch({ type: "START_LOADING" });
    try {
      await api.service.deleteService(selectedRow?.id!);
      showSnackbar("Serviço deletado com sucesso", "success");
    } catch (error) {
      showSnackbar("Erro ao deletar serviço", "error");
    } finally {
      loadingDispatch({ type: "STOP_LOADING" });
      handleClose();
      loadData();
    }
  };

  const handleEdit = () => {
    setSelectedService(selectedRow);
    handleClose();
  };

  return (
    <Card>
      <Box sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Duração</TableCell>
              <TableCell padding="checkbox"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.length > 0 &&
              rows.map((row) => {
                return (
                  <TableRow hover key={row.id}>
                    <TableCell>
                      <Stack
                        sx={{ alignItems: "center" }}
                        direction="row"
                        spacing={2}
                      >
                        <Typography variant="subtitle2">{row.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{formatPrice(String(row.price))}</TableCell>
                    <TableCell>{renderDuration(row.duration)}</TableCell>
                    <TableCell padding="checkbox">
                      <IconButton onClick={(e) => handleClick(e, row)}>
                        <DotsThreeVertical size={24} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem onClick={handleEdit}>
            <Pencil size={20} />
            Editar
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <Trash size={20} />
            Excluir
          </MenuItem>
        </Menu>
        {selectedService && (
          <EditServiceForm
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            loadData={loadData}
          />
        )}
      </Box>
      <Divider />
      <CustomTablePagination
        rowsPerPageOptions={[5, 10, 25]}
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Card>
  );
}
