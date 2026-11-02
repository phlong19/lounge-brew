"use client";
import {AlertMessage} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
export function DeleteEventDialog({name,busy,error,onClose,onConfirm}:{name:string|null;busy:boolean;error:string;onClose:()=>void;onConfirm:()=>void}) {
  return <Dialog open={name !== null} onOpenChange={open=>{if(!open&&!busy)onClose();}}><DialogContent closeLabel="Đóng" showCloseButton={!busy}>
    <DialogHeader><DialogTitle>Xóa sự kiện?</DialogTitle><DialogDescription>{name} sẽ bị ẩn khỏi website và danh sách quản lý. Dữ liệu và ảnh được giữ lại.</DialogDescription></DialogHeader>
    {error ? <AlertMessage variant="destructive">{error}</AlertMessage> : null}
    <DialogFooter><Button variant="outline" disabled={busy} onClick={onClose}>Hủy</Button><Button variant="destructive" disabled={busy} onClick={onConfirm}>{busy ? "Đang xóa…" : "Xóa sự kiện"}</Button></DialogFooter>
  </DialogContent></Dialog>;
}
