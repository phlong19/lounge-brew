"use client";
import {AlertMessage} from "@/components/ui/alert";
import {useToast} from "@/components/ui/toast";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {useMutation,useQueryClient} from "@tanstack/react-query";
import {adminRequest} from "@/lib/admin/client";
import {adminKeys} from "@/lib/admin/query";
import {isStrongStaffPassword,staffPasswordHint} from "@/lib/admin/staff-validation";
import {Button} from "@/components/ui/button";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from "@/components/ui/dialog";
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuSeparator,DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Field,Form,Input,Label} from "@/components/ui/form";
import {Icon} from "@/components/ui/icon";
import {Inline,Stack} from "@/components/ui/layout";
import {Typography} from "@/components/ui/typography";

export function StaffActions({staff,onWarning,onDeleted}:{staff:{user_id:string;display_name:string;is_active:boolean};onWarning:(notice:string)=>void;onDeleted:()=>void}){
 const client=useQueryClient(),toast=useToast(),[open,setOpen]=useState(false);
 const [deleteOpen, setDeleteOpen] = useState(false);
 const form=useForm<{password:string;confirmation:string}>({defaultValues:{password:"",confirmation:""}});
 const access=useMutation({mutationFn:()=>adminRequest("/api/admin/staff/"+staff.user_id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"access",isActive:!staff.is_active,expectedActive:staff.is_active})}),onSuccess:result=>{onWarning(result.warning||"");if(!result.warning)toast(staff.is_active?"Đã khóa quyền truy cập và kết thúc các phiên đăng nhập.":"Đã mở lại quyền truy cập. Nhân viên cần đăng nhập lại.");},onSettled:()=>client.invalidateQueries({queryKey:adminKeys.staff})});
 const password=useMutation({gcTime:0,mutationFn:(value:string)=>adminRequest("/api/admin/staff/"+staff.user_id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"password",password:value})}),onSuccess:()=>{form.reset();setOpen(false);toast("Đã đổi mật khẩu và kết thúc các phiên đăng nhập của "+staff.display_name+".");queueMicrotask(()=>password.reset());},onSettled:()=>client.invalidateQueries({queryKey:adminKeys.staff})});
 const remove = useMutation({
  mutationFn: () => adminRequest(`/api/admin/staff/${staff.user_id}`, { method: "DELETE" }),
  onSuccess: async () => {
   setDeleteOpen(false);
   onWarning("");
   onDeleted();
   toast("Đã xóa tài khoản của " + staff.display_name + ".");
   await client.invalidateQueries({ queryKey: adminKeys.staff });
  },
 });
 function closeDelete() {
  if (remove.isPending) return;
  setDeleteOpen(false);
  remove.reset();
 }
 function close(value:boolean){if(password.isPending)return;setOpen(value);form.reset();password.reset();}
 return <Stack gap="xs"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" disabled={access.isPending||password.isPending||remove.isPending} aria-label={"Thao tác với "+staff.display_name}><Icon name="more" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>access.mutate()}><Icon name={staff.is_active?"lock":"unlock"} />{staff.is_active?"Khóa quyền truy cập":"Mở lại quyền truy cập"}</DropdownMenuItem><DropdownMenuItem onSelect={()=>{form.reset();password.reset();setOpen(true);}}><Icon name="key" />Đổi mật khẩu</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem destructive onSelect={() => { remove.reset(); setDeleteOpen(true); }}><Icon name="trash" />Xóa nhân viên</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
 {access.error?<AlertMessage variant="destructive">{access.error.message}</AlertMessage>:null}
 <Dialog open={open} onOpenChange={close}><DialogContent closeLabel="Đóng"><DialogHeader><DialogTitle>Đổi mật khẩu</DialogTitle><DialogDescription>{staff.display_name} sẽ cần đăng nhập lại trên mọi thiết bị.</DialogDescription></DialogHeader><Form noValidate onSubmit={form.handleSubmit(values=>password.mutate(values.password))}>
 <Field><Label htmlFor={staff.user_id+"-password"} required>Mật khẩu mới</Label><Input id={staff.user_id+"-password"} type="password" autoComplete="new-password" minLength={8} maxLength={22} disabled={password.isPending} aria-describedby={staff.user_id+"-password-help"} aria-invalid={!!form.formState.errors.password} {...form.register("password",{validate:value=>isStrongStaffPassword(value)||staffPasswordHint})} /><Typography id={staff.user_id+"-password-help"} variant="small" tone="muted">{staffPasswordHint}</Typography>{form.formState.errors.password?<Typography role="alert" tone="danger" variant="small">{form.formState.errors.password.message}</Typography>:null}</Field>
 <Field><Label htmlFor={staff.user_id+"-confirmation"} required>Nhập lại mật khẩu</Label><Input id={staff.user_id+"-confirmation"} type="password" autoComplete="new-password" maxLength={22} disabled={password.isPending} aria-invalid={!!form.formState.errors.confirmation} {...form.register("confirmation",{validate:value=>value===form.getValues("password")||"Mật khẩu nhập lại chưa khớp."})} />{form.formState.errors.confirmation?<Typography role="alert" tone="danger" variant="small">{form.formState.errors.confirmation.message}</Typography>:null}</Field>
 {password.error?<AlertMessage variant="destructive">{password.error.message}</AlertMessage>:null}
 <Inline className="justify-end"><Button variant="outline" disabled={password.isPending} onClick={()=>close(false)}>Hủy</Button><Button type="submit" disabled={password.isPending}>{password.isPending?"Đang lưu…":"Lưu mật khẩu"}</Button></Inline></Form></DialogContent></Dialog>
 <Dialog open={deleteOpen} onOpenChange={value => { if (!value) closeDelete(); }}>
   <DialogContent closeLabel="Đóng" showCloseButton={!remove.isPending}>
     <DialogHeader>
       <DialogTitle>Xóa nhân viên?</DialogTitle>
       <DialogDescription>Tài khoản của {staff.display_name} sẽ bị xóa vĩnh viễn và không thể đăng nhập lại. Không thể hoàn tác.</DialogDescription>
     </DialogHeader>
     {remove.error ? <AlertMessage variant="destructive">{remove.error.message}</AlertMessage> : null}
     <Inline className="justify-end">
       <Button variant="outline" disabled={remove.isPending} onClick={closeDelete}>Hủy</Button>
       <Button variant="destructive" disabled={remove.isPending} onClick={() => remove.mutate()}>
         {remove.isPending ? "Đang xóa…" : "Xóa nhân viên"}
       </Button>
     </Inline>
   </DialogContent>
 </Dialog></Stack>;
}
