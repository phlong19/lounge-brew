"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Grid, Inline, Stack, Surface } from "@/components/ui/layout";
import { FileImage } from "@/components/ui/image-dropzone";
import { Media } from "@/components/ui/media";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import { filterEvents, paginationPages, venueDateParts, type EditableEvent } from "@/lib/admin/event-list";
import { adminStyles as s } from "@/lib/ui/admin-styles";

const pageSize = 6;
function ReadOnlyStatus({ enabled, label }: { enabled: boolean; label: string }) {
  return <Inline gap="xs" className={enabled ? "text-[#205B3B]" : "text-stone-500"} aria-label={`${label}: ${enabled ? "Có" : "Không"}`}><Icon name={enabled ? "check" : "minus"} className="size-4" /><Typography as="span" variant="small">{enabled ? "Có" : "Không"}</Typography></Inline>;
}
export function AdminEvents({ items, onEdit, onAdd }: { items: EditableEvent[]; onEdit: (item: EditableEvent, trigger: HTMLButtonElement) => void; onAdd: (trigger: HTMLButtonElement) => void }) {
  const [now,setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()),60000); return () => clearInterval(timer); }, []);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState("all");
  const [month, setMonth] = useState("all");
  const [year, setYear] = useState("all");
  const [page, setPage] = useState(1);
  const matched = filterEvents(items, { search, scope, month, year });
  const totalPages = Math.max(1, Math.ceil(matched.length / pageSize));
  const current = Math.min(page, totalPages);
  const shown = matched.slice((current - 1) * pageSize, current * pageSize);
  const years = [...new Set(items.map(item => venueDateParts(item.event_date)?.year).filter((value): value is string => !!value))].sort();
  function reset() { setSearch(""); setScope("all"); setMonth("all"); setYear("all"); setPage(1); }
  return <Surface className={s.panel} data-admin-events>
    <Stack className="p-4 md:p-5" gap="lg">
      <Grid className="items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_170px_170px_150px_auto]">
        <Field><Label htmlFor="event-search">Tìm chương trình</Label><Surface className="relative"><Icon name="search" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-500" /><Input id="event-search" type="search" className="pl-10" placeholder="Nhập tên chương trình hoặc nghệ sĩ…" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></Surface></Field>
        <Field><Label htmlFor="event-scope">Hiển thị</Label><Select value={scope} onValueChange={value => { setScope(value); setPage(1); }}><SelectTrigger className="whitespace-nowrap [&>span]:truncate" id="event-scope"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả</SelectItem><SelectItem value="visible">Đang hiển thị</SelectItem><SelectItem value="hidden">Đã ẩn</SelectItem></SelectContent></Select></Field>
        <Field><Label htmlFor="event-month">Tháng</Label><Select value={month} onValueChange={value => { setMonth(value); setPage(1); }}><SelectTrigger className="whitespace-nowrap [&>span]:truncate" id="event-month"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả tháng</SelectItem>{Array.from({ length: 12 }, (_, index) => <SelectItem key={index} value={String(index + 1).padStart(2, "0")}>Tháng {index + 1}</SelectItem>)}</SelectContent></Select></Field>
        <Field><Label htmlFor="event-year">Năm</Label><Select value={year} onValueChange={value => { setYear(value); setPage(1); }}><SelectTrigger className="whitespace-nowrap [&>span]:truncate" id="event-year"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả năm</SelectItem>{years.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></Field>
        <Button className={s.primary} onClick={event => onAdd(event.currentTarget)}><Icon name="plus" />Thêm sự kiện</Button>
      </Grid>
      {search || scope !== "all" || month !== "all" || year !== "all" ? <Button variant="ghost" size="sm" className="w-fit" onClick={reset}><Icon name="reset" className="size-4" />Xóa bộ lọc</Button> : null}
    </Stack>
    <Table className="min-w-[760px]" aria-label="Danh sách sự kiện">
      <TableHeader><TableRow><TableHead>Chương trình</TableHead><TableHead className="w-48">Ngày diễn</TableHead><TableHead className="w-40">Phụ thu</TableHead><TableHead className="w-36">Hiển thị</TableHead><TableHead className="w-24"><Typography as="span" className="sr-only">Thao tác</Typography></TableHead></TableRow></TableHeader>
      <TableBody>{shown.map(item => <TableRow key={item.id} data-event-row={item.id}>
        <TableCell><Inline gap="sm" className="flex-nowrap"><Surface className={s.poster}>{item.cover_file ? <FileImage file={item.cover_file} alt="" className="h-full w-full object-cover" /> : item.cover_image_url ? <Media src={item.cover_image_url} alt="" fill sizes="48px" /> : null}</Surface><Stack gap="xs"><Typography className="font-semibold">{item.title_vi}</Typography><Typography as="span" variant="caption" className={Date.parse(item.event_date) > now ? s.upcomingBadge : s.pastBadge}>{Date.parse(item.event_date) > now ? "Sắp tới" : "Đã qua"}</Typography></Stack></Inline></TableCell>
        <TableCell><Typography variant="small" className="whitespace-nowrap tabular-nums">{new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(item.event_date))}<Typography as="span" variant="inline" className="ml-3 inline-flex items-center gap-1.5 text-stone-600"><Icon name="clock" className="size-3.5" />{new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(item.event_date))}</Typography></Typography></TableCell>
        <TableCell><Typography variant="small" className="whitespace-nowrap tabular-nums">{item.additionalFee != null ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.additionalFee) : "—"}</Typography></TableCell><TableCell><ReadOnlyStatus enabled={item.is_active} label="Hiển thị" /></TableCell>
        <TableCell><Button variant="ghost" size="sm" aria-label={`Sửa ${item.title_vi}`} onClick={event => onEdit({ ...item }, event.currentTarget)}><Icon name="pencil" className="size-4" />Sửa</Button></TableCell>
      </TableRow>)}</TableBody>
    </Table>
    {!matched.length ? <Stack className="items-center py-12 text-center"><Icon name="search" /><Typography>Không tìm thấy chương trình phù hợp.</Typography><Button variant="ghost" onClick={reset}>Xóa bộ lọc</Button></Stack> : <Inline className="justify-between gap-3 border-t border-[#EDF0E9] px-4 py-4"><Typography variant="small" tone="muted" role="status">Tổng: {matched.length} sự kiện</Typography><Pagination className="ml-auto justify-end"><PaginationContent><PaginationItem><PaginationPrevious disabled={current === 1} onClick={() => setPage(current - 1)} /></PaginationItem>{paginationPages(current, totalPages).map(value => <PaginationItem key={value}>{typeof value === "number" ? <PaginationLink isActive={value === current} aria-label={`Trang ${value}`} onClick={() => setPage(value)}>{value}</PaginationLink> : <PaginationEllipsis />}</PaginationItem>)}<PaginationItem><PaginationNext disabled={current === totalPages} onClick={() => setPage(current + 1)} /></PaginationItem></PaginationContent></Pagination></Inline>}
  </Surface>;
}
