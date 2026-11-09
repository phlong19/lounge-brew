"use client";
import {Button} from "@/components/ui/button";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter} from "@/components/ui/dialog";
import {AlertMessage} from "@/components/ui/alert";
export function CreationCloseDialog({open,busy,error,onKeepEditing,onSaveDraft,onDiscard}:{open:boolean;busy:boolean;error?:string;onKeepEditing:()=>void;onSaveDraft:()=>void;onDiscard:()=>void}){
 return <Dialog open={open} onOpenChange={value=>{if(!value&&!busy)onKeepEditing();}}><DialogContent closeLabel="Tiếp tục chỉnh sửa" showCloseButton={!busy}><DialogHeader><DialogTitle>Lưu bản nháp trước khi đóng?</DialogTitle><DialogDescription>Bạn có thể lưu để tiếp tục sau hoặc hủy vĩnh viễn nội dung đang tạo. Ảnh tải lên không được sử dụng sẽ được xóa; ảnh dùng chung được giữ lại.</DialogDescription></DialogHeader>{error?<AlertMessage variant="destructive">{error}</AlertMessage>:null}<DialogFooter><Button variant="ghost" disabled={busy} onClick={onKeepEditing}>Tiếp tục sửa</Button><Button variant="destructive" disabled={busy} onClick={onDiscard}>Hủy vĩnh viễn</Button><Button variant="outline" disabled={busy} onClick={onSaveDraft}>{busy?"Đang xử lý…":"Lưu bản nháp"}</Button></DialogFooter></DialogContent></Dialog>;
}
