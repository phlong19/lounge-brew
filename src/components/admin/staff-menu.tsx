"use client";
import {AlertMessage} from "@/components/ui/alert";

import type {StaffRole} from "@/lib/admin/roles";
import {useMutation,useQueryClient} from "@tanstack/react-query";
import { adminRequest } from "@/lib/admin/client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Stack } from "@/components/ui/layout";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Typography } from "@/components/ui/typography";

export type StaffInfo = { email: string; name: string; role: StaffRole };
export function StaffMenu({ staff }: { staff?: StaffInfo }) {
  const client=useQueryClient();
  const logout=useMutation({mutationFn:()=>adminRequest("/api/admin/session",{method:"DELETE"}),onSuccess:()=>{client.clear();window.location.assign("/admin");}});
  const busy=logout.isPending;
  const error=logout.error?"Không thể đăng xuất. Vui lòng thử lại.":"";
  const role = staff?.role === "admin" ? "Quản trị viên" : "Biên tập viên";
  return <Popover><PopoverTrigger asChild><Button variant="ghost" className="w-full justify-between" aria-label="Tài khoản nhân viên"><Typography as="span" variant="small" className="truncate">{staff?.name || staff?.email || "Nhân viên"}</Typography><Icon name="chevronUp" /></Button></PopoverTrigger>
    <PopoverContent side="right" align="end"><Stack gap="md"><Stack gap="xs"><Typography variant="body" className="font-semibold">{staff?.name}</Typography><Typography variant="small" tone="muted">{role}</Typography><Typography variant="small" tone="muted" className="break-all">{staff?.email}</Typography></Stack>
      <Button variant="destructive" disabled={busy} onClick={() => logout.mutate()}>{busy ? "Đang đăng xuất…" : "Đăng xuất"}</Button>
      {error ? <AlertMessage variant="destructive">{error}</AlertMessage> : null}
    </Stack></PopoverContent></Popover>;
}
