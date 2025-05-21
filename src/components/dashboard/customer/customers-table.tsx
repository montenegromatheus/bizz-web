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
import { Customer, Employee } from "@/schema";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from "@mui/material";
import {
  DotsThree,
  Pencil,
  Trash,
  LockSimple,
  LockOpen,
} from "@phosphor-icons/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import EditCustomerForm from "./edit-customer-form";
import useSnackbar from "@/hooks/use-snackbar";
import { parsePhoneNumber } from "libphonenumber-js";

export function CustomersTable({
  rows,
  rowsPerPage,
  page,
  totalCount,
  loadData,
  setPage,
  setRowsPerPage,
  name,
}: {
  rows: Customer[];
  page: number;
  totalCount: number;
  rowsPerPage: number;
  loadData: () => Promise<void>;
  setPage: Dispatch<SetStateAction<number>>;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  name: string;
}): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { companyId } = useAuth();
  const { loadingDispatch } = useLoading();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const { showSnackbar } = useSnackbar();

  const [selectedRow, setSelectedRow] = useState<Customer | null>(null);
  const open = Boolean(anchorEl);

  const [openBlockDialog, setOpenBlockDialog] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockTargetPhone, setBlockTargetPhone] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(
    null,
  );

  // useEffect(() => {
  //   if (companyId) {
  //     loadData();
  //   } else {
  //     console.error("companyId está indefinido ou nulo.");
  //   }
  // }, [companyId, rowsPerPage, page, name]);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    row: Customer,
  ) => {
    setSelectedRow(row);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    loadingDispatch({ type: "START_LOADING" });
    try {
      await api.company.unlinkCustomer(companyId!, selectedRow?.id!);
      showSnackbar("Cliente deletado com sucesso", "success");
    } catch (error) {
      showSnackbar("Erro ao deletar cliente", "error");
    } finally {
      loadingDispatch({ type: "STOP_LOADING" });
      handleClose();
      loadData();
    }
  };

  const handleEdit = () => {
    setSelectedCustomer(selectedRow);
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

  function handleOpenBlock(phone: string) {
    setBlockTargetPhone(phone);
    setOpenBlockDialog(true);

    // 1) Busca funcionários da company
    loadingDispatch({ type: "START_LOADING" });
    api.axiosWithoutInterceptor
      .get<Employee[]>(`/company/${companyId}/employee`)
      .then((resp) => {
        setEmployees(resp.data);
        // pré-seleciona o primeiro:
        setSelectedEmployee(resp.data[0]?.id || null);
      })
      .catch(console.error)
      .finally(() => loadingDispatch({ type: "STOP_LOADING" }));
  }

  async function handleConfirmBlock() {
    if (!blockTargetPhone || !blockReason || !selectedEmployee) return;

    loadingDispatch({ type: "START_LOADING" });
    try {
      // 1) dispara o bloqueio no back
      await api.axiosWithoutInterceptor.post(`/invalid-block-numbers`, {
        phoneNumber: blockTargetPhone,
        blockReason,
        blockSource: "MANUAL",
        blockedBy: selectedEmployee,
      });
      // 2) agora este funcionário é o atual para listagem
      setCurrentEmployeeId(selectedEmployee);
      await loadData();

      // 3) fecha o menu e o diálogo
      handleClose();
      setOpenBlockDialog(false);
      // 3) feedback visual
      showSnackbar("Cliente bloqueado com sucesso", "success");
    } catch {
      showSnackbar("Erro ao bloquear cliente", "error");
    } finally {
      loadingDispatch({ type: "STOP_LOADING" });
      setOpenBlockDialog(false);
      setBlockReason("");
    }
  }

  async function handleUnblock(phone: string) {
    if (!currentEmployeeId) return;

    loadingDispatch({ type: "START_LOADING" });
    try {
      // 1) remove o bloqueio para o funcionário atual
      await api.axiosWithoutInterceptor.delete(
        `/invalid-block-numbers/${phone}`,
        { data: { blockedBy: currentEmployeeId } },
      );

      // 3) feedback ao usuário
      showSnackbar("Cliente desbloqueado com sucesso", "success");
      // 2) recarrega a tabela com isBlocked atualizado
      await loadData();
    } catch {
      showSnackbar("Erro ao desbloquear cliente", "error");
    } finally {
      loadingDispatch({ type: "STOP_LOADING" });
      handleClose();
    }
  }

  const formatPhoneNumber = (phoneNumber: string): string => {
    try {
      const parsedNumber = parsePhoneNumber(`+${phoneNumber}`);
      if (parsedNumber && parsedNumber.country === "BR") {
        return `+${parsedNumber.countryCallingCode} (${parsedNumber.nationalNumber.slice(0, 2)}) ${parsedNumber.nationalNumber.slice(2, 7)}-${parsedNumber.nationalNumber.slice(7)}`;
      } else {
        return `+${parsedNumber.countryCallingCode} ${parsedNumber.nationalNumber}`;
      }
    } catch (error) {
      console.error("Número inválido ou erro de formatação:", error);
    }

    return phoneNumber;
  };

  return (
    <Card>
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ px: 2 }}>
          <TableHead
            sx={{
              backgroundColor: (theme) => theme.palette.background.paper,
            }}
          >
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Contato</TableCell>
              <TableCell>Status</TableCell>
              <TableCell padding="checkbox"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.length > 0 &&
              rows.map((row, rowIndex) => {
                return (
                  <TableRow sx={{ px: 2 }} hover key={row.id}>
                    <TableCell>
                      <Stack
                        sx={{ alignItems: "center" }}
                        direction="row"
                        spacing={2}
                      >
                        <Typography variant="subtitle2">{row.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{formatPhoneNumber(row.phone)}</TableCell>
                    <TableCell>
                      {row.isInvalid ? (
                        <Chip
                          label="Número Inválido"
                          size="small"
                          color="warning"
                        />
                      ) : row.isBlocked ? (
                        <Chip label="Bloqueado" size="small" color="error" />
                      ) : (
                        <Chip label="Ativo" size="small" color="success" />
                      )}
                    </TableCell>
                    <TableCell padding="checkbox">
                      <IconButton onClick={(e) => handleClick(e, row)}>
                        <DotsThree size={24} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={handleEdit}>
            <Pencil size={20} />
            Editar
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <Trash size={20} />
            Excluir
          </MenuItem>
          {selectedRow?.isBlocked ? (
            <MenuItem onClick={() => handleUnblock(selectedRow?.phone)}>
              <LockOpen size={20} />
              Desbloquear
            </MenuItem>
          ) : (
            <MenuItem onClick={() => handleOpenBlock(selectedRow?.phone || "")}>
              <LockSimple size={20} weight="bold" />
              Bloquear
            </MenuItem>
          )}
        </Menu>

        {/* Modal de Bloqueio */}
        <Dialog
          open={openBlockDialog}
          onClose={() => setOpenBlockDialog(false)}
        >
          <DialogTitle>Bloquear Cliente</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Razão do bloqueio"
              fullWidth
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="employee-select-label">Profissional</InputLabel>
              <Select
                labelId="employee-select-label"
                value={selectedEmployee || ""}
                label="Profissional"
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBlockDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleConfirmBlock}
              disabled={!blockReason || !selectedEmployee}
            >
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        {selectedCustomer && (
          <EditCustomerForm
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
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
