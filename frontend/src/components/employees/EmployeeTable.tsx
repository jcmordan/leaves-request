"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DepartmentBadge } from "./DepartmentBadge";
import { MoreHorizontal, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export interface Employee {
  id: string;
  name: string;
  roleKey: string;
  department: string;
  email: string;
  statusKey: string;
  avatarColor: string;
}

const mockEmployees: Employee[] = [
  { id: "REF-001", name: "Juan Pérez", roleKey: "seniorSoftwareEngineer", department: "Engineering", email: "jperez@refidomsa.com", statusKey: "active", avatarColor: "bg-blue-100 text-blue-600" },
  { id: "REF-002", name: "María Rodríguez", roleKey: "hrManager", department: "Human Resources", email: "mrodriguez@refidomsa.com", statusKey: "active", avatarColor: "bg-rose-100 text-rose-600" },
  { id: "REF-003", name: "Carlos Sánchez", roleKey: "legalCounsel", department: "Legal", email: "csanchez@refidomsa.com", statusKey: "onLeave", avatarColor: "bg-indigo-100 text-indigo-600" },
  { id: "REF-004", name: "Ana Martínez", roleKey: "operationsLead", department: "Operations", email: "amartinez@refidomsa.com", statusKey: "away", avatarColor: "bg-emerald-100 text-emerald-600" },
  { id: "REF-005", name: "Luis Gómez", roleKey: "technicalArchitect", department: "Engineering", email: "lgomez@refidomsa.com", statusKey: "active", avatarColor: "bg-blue-100 text-blue-600" },
  { id: "REF-006", name: "Elena Ramos", roleKey: "departmentHead", department: "Management", email: "eramos@refidomsa.com", statusKey: "active", avatarColor: "bg-slate-100 text-slate-600" },
];

export function EmployeeTable({ searchQuery }: { searchQuery: string }) {
  const c = useTranslations("Common");
  const tRoles = useTranslations("Roles");

  const filteredEmployees = mockEmployees.filter(emp => {
    const translatedRole = tRoles(emp.roleKey).toLowerCase();
    return (
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      translatedRole.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="rounded-xl border border-outline-variant/10 bg-white/50 backdrop-blur-md overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-surface-container-highest/30">
          <TableRow className="hover:bg-transparent border-b-border/40">
            <TableHead className="w-[80px] text-[10px] font-black tracking-widest text-muted-foreground/70 pl-6">
              {c("id")}
            </TableHead>
            <TableHead className="text-[10px] font-black tracking-widest text-muted-foreground/70">
              {c("employee")}
            </TableHead>
            <TableHead className="text-[10px] font-black tracking-widest text-muted-foreground/70">
              {c("department")}
            </TableHead>
            <TableHead className="text-[10px] font-black tracking-widest text-muted-foreground/70 text-right pr-6">
              {/* Actions */}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmployees.map((employee) => (
            <TableRow key={employee.id} className="group hover:bg-surface-variant/5 transition-colors border-b-border/40 last:border-0">
              <TableCell className="pl-6 py-3 font-mono text-[11px] font-bold text-muted-foreground/60">
                {employee.id}
              </TableCell>
              <TableCell className="py-3">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-full ${employee.avatarColor} flex items-center justify-center text-xs font-black ring-2 ring-white shadow-sm`}>
                    {employee.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-primary leading-tight group-hover:text-primary/80 transition-colors">
                      {employee.name}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground/70 leading-tight">
                      {tRoles(employee.roleKey)}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-3">
                <DepartmentBadge department={employee.department} />
              </TableCell>
              <TableCell className="py-3 text-right pr-6">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5">
                    <ShieldCheck className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="h-8 w-8 text-muted-foreground hover:bg-muted/50">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
