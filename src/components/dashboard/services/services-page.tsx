"use client";

import { api } from "@/api";
import useAuth from "@/hooks/use-auth";
import { useLoading } from "@/hooks/use-loading";
import { Service } from "@/schema";
import { TextField, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useCallback, useState } from "react";
import NewServiceForm from "./new-service-form";
import { ServicesTable } from "./services-table";
import { debounce } from "lodash";

const ServicesPage = () => {
  const { companyId } = useAuth();
  const [rows, setRows] = useState<Service[]>([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { loadingDispatch } = useLoading();
  const [newServiceOpen, setNewServiceOpen] = useState(false);
  const [name, setName] = useState("");

  const loadData = async () => {
    loadingDispatch({ type: "START_LOADING" });

    try {
      const response = await api.axiosWithoutInterceptor.get(
        `company/${companyId}/service`,
        {
          params: {
            perPage: rowsPerPage,
            page: page + 1,
            query: `name*:${name}`,
          },
        },
      );
      setRows(response.data);
      setTotalCount(Number(response.headers["x-total-count"]));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      loadingDispatch({ type: "STOP_LOADING" });
    }
  };

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

  return (
    <>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: "1 1 auto" }}>
          <Typography variant="h4">Serviços</Typography>
        </Stack>
        <NewServiceForm
          loadData={loadData}
          open={newServiceOpen}
          setOpen={setNewServiceOpen}
        />
      </Stack>
      <Stack>
        <TextField
          placeholder="Pesquise por nome do serviço"
          onChange={handleChange}
        />
      </Stack>
      <ServicesTable
        rows={rows}
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
export default ServicesPage;
