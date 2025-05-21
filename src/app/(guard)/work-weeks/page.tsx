"use client";

import { api } from "@/api";
import useAuth from "@/hooks/use-auth";
import { Employee } from "@/schema";
import { MenuItem, Select, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import EmployeeCard from "./Employee";

const minutes: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 15) {
    const hour = h.toString().padStart(2, "0");
    const minute = m.toString().padStart(2, "0");
    minutes.push(`${hour}:${minute}`);
  }
}

const Page = () => {
  const { companyId } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee>();

  const getEmployees = async () => {
    try {
      const employees = await api.company.companyEmployees(companyId!);
      setEmployees(employees);
      setSelectedEmployee(employees[0]);
    } catch (error) {}
  };

  useEffect(() => {
    getEmployees();
  }, [companyId]);

  return (
    <Stack>
      <Stack sx={{ mb: 2 }}>
        <Typography variant="h5">Horário de atendimento</Typography>
        <Typography variant="caption">
          Defina seus horários de atendimento e dias da semana. O horário fim
          entende-se como o horário que você finaliza os atendimentos.
        </Typography>
      </Stack>
      <Stack>
        {selectedEmployee && (
          <>
            <Stack
              direction={"row"}
              alignItems={"center"}
              sx={{ mb: 2 }}
              spacing={2}
            >
              <Typography>Profissional:</Typography>
              <Select
                fullWidth
                size="small"
                value={selectedEmployee?.id}
                onChange={(e) =>
                  setSelectedEmployee(
                    employees.find(
                      (employee) => employee.id === e.target.value,
                    )!,
                  )
                }
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
            <EmployeeCard
              employee={selectedEmployee}
              setSelectedEmployee={setSelectedEmployee}
            />
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default Page;
