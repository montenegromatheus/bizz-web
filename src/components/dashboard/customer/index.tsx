"use client";

import {
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import { Box, Stack } from "@mui/system";
import { CustomersTable } from "./customers-table";
import NewCustomerForm from "./new-customer-form";
import { api } from "@/api";
import useAuth from "@/hooks/use-auth";
import { useLoading } from "@/hooks/use-loading";
import { Customer, Employee } from "@/schema";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import { Funnel } from "@phosphor-icons/react";

const CustomersPage = () => {
  const { loadingDispatch } = useLoading();
  const { companyId } = useAuth();
  const [page, setPage] = useState(0);

  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [rows, setRows] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [name, setName] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(
    null,
  );
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const openFilter = Boolean(filterAnchor);
  const [filterActive, setFilterActive] = useState(false);
  const [filterBlocked, setFilterBlocked] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "blocked" | "invalid"
  >("all");
  const [filterInvalid, setFilterInvalid] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    api.axiosWithoutInterceptor
      .get<Employee[]>(`/company/${companyId}/employee`)
      .then((resp) => {
        const first = resp.data[0]?.id ?? null;
        setCurrentEmployeeId(first);
      })
      .catch(console.error);
  }, [companyId]);

  useEffect(() => {
    // só carrega quando tivermos companyId e currentEmployeeId válidos
    if (companyId != null && currentEmployeeId != null) {
      loadData();
    }
  }, [companyId, currentEmployeeId, rowsPerPage, page, name]);

  async function loadData() {
    loadingDispatch({ type: "START_LOADING" });
    try {
      const isPhoneNumber = /^\d+$/.test(name);
      // 2a) Monte seus params com blockedBy
      const params: Record<string, any> = {
        perPage: rowsPerPage,
        page: page + 1,
        query: isPhoneNumber ? `phone*:${name}` : `name*:${name}`,
        blockedBy: currentEmployeeId, // ← aqui
      };
      // 2b) Chame a rota com esses params
      const response = await api.axiosWithoutInterceptor.get(
        `company/${companyId}/customer`,
        { params },
      );
      setRows(response.data as Customer[]);
      setTotalCount(Number(response.headers["x-total-count"]));
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      loadingDispatch({ type: "STOP_LOADING" });
    }
  }

  const handleDebouncedChange = useCallback(
    debounce((event: any, inputValue: string) => {
      setName(inputValue);
    }, 700),
    [],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    loadingDispatch({ type: "START_LOADING" });
    handleDebouncedChange(e, e.target.value);
  };
  const filteredRows = rows.filter((r) => {
    // se nada selecionado, mostra tudo
    if (!filterActive && !filterBlocked && !filterInvalid) {
      return true;
    }
    // clientes ativos = não bloqueados manualmente E não inválidos
    if (filterActive && !r.isBlocked && !r.isInvalid) {
      return true;
    }
    // clientes bloqueados manualmente
    if (filterBlocked && r.isBlocked) {
      return true;
    }
    // clientes inválidos (SYSTEM)
    if (filterInvalid && r.isInvalid) {
      return true;
    }
    return false;
  });

  return (
    <>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
          <Typography variant="h4">Clientes</Typography>
        </Stack>

        <NewCustomerForm
          loadData={loadData}
          open={newCustomerOpen}
          setOpen={setNewCustomerOpen}
        />
      </Stack>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ mb: 2, width: "100%" }}
      >
        {/* 1. O TextField ocupa todo o espaço, menos o do botão */}
        <TextField
          fullWidth
          placeholder="Pesquise por nome do cliente ou pelo telefone"
          onChange={handleChange}
        />

        {/* 2. O ícone fica sempre colado à direita do campo */}
        <IconButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
          <Funnel size={20} />
        </IconButton>
      </Stack>

      <Popover
        open={openFilter}
        anchorEl={filterAnchor}
        onClose={() => setFilterAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        {/* conteúdo aqui */}
        <Popover
          open={openFilter}
          anchorEl={filterAnchor}
          onClose={() => setFilterAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Box sx={{ p: 2, minWidth: 200 }}>
            <Typography variant="subtitle2" gutterBottom>
              Filtrar por status
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterActive}
                    onChange={(_, v) => setFilterActive(v)}
                  />
                }
                label="Ativos"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterBlocked}
                    onChange={(_, v) => setFilterBlocked(v)}
                  />
                }
                label="Bloqueados"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterInvalid}
                    onChange={(_, v) => setFilterInvalid(v)}
                  />
                }
                label="Números inválidos"
              />
            </FormGroup>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}
            >
              <Button
                onClick={() => {
                  setFilterActive(false);
                  setFilterBlocked(false);
                  setFilterInvalid(false);
                }}
              >
                Limpar
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setFilterAnchor(null);
                }}
              >
                Aplicar
              </Button>
            </Box>
          </Box>
        </Popover>
      </Popover>
      <CustomersTable
        //rows={rows}
        rows={filteredRows}
        rowsPerPage={rowsPerPage}
        page={page}
        name={name}
        totalCount={totalCount}
        loadData={loadData}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
      />
    </>
  );
};
export default CustomersPage;
