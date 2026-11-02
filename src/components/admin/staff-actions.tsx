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

export function StaffActions({staff,onWarning}:{staff:{user_id:string;display_name:string;is_active:boolean};onWarning:(notice:string)=>void}){
 const client=useQueryClient(),toast=useToast(),[open,setOpen]=useState(false);
 const form=useForm<{password:string;confirmation:string}>({defaultValues:{password:"",confirmation:""}});
 const access=useMutation({mutationFn:()=>adminRequest("/api/admin/staff/"+staff.user_id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"access",isActive:!staff.is_active,expectedActive:staff.is_active})}),onSuccess:result=>{onWarning(result.warning||"");if(!result.warning)toast(staff.is_active?"Đã khóa quyền truy cập và kết thúc các phiên đăng nhập.":"Đã mở lại quyền truy cập. Nhân viên cần đăng nhập lại.");},onSettled:()=>client.invalidateQueries({queryKey:adminKeys.staff})});
 const password=useMutation({gcTime:0,mutationFn:(value:string)=>adminRequest("/api/admin/staff/"+staff.user_id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"password",password:value})}),onSuccess:()=>{form.reset();setOpen(false);toast("Đã đổi mật khẩu và kết thúc các phiên đăng nhập của "+staff.display_name+".");queueMicrotask(()=>password.reset());},onSettled:()=>client.invalidateQueries({queryKey:adminKeys.staff})});
 function close(value:boolean){if(password.isPending)return;setOpen(value);form.reset();password.reset();}
 return <Stack gap="xs"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" disabled={access.isPending||password.isPending} aria-label={"Thao tác với "+staff.display_name}><Icon name="more" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>access.mutate()}><Icon name={staff.is_active?"lock":"unlock"} />{staff.is_active?"Khóa quyền truy cập":"Mở lại quyền truy cập"}</DropdownMenuItem><DropdownMenuItem onSelect={()=>{form.reset();password.reset();setOpen(true);}}><Icon name="key" />Đổi mật khẩu</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem destructive disabled><Icon name="trash" />Xóa nhân viên (sắp có)</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
 {access.error?<AlertMessage variant="destructive">{access.error.message}</AlertMessage>:null}
 <Dialog open={open} onOpenChange={close}><DialogContent closeLabel="Đóng"><DialogHeader><DialogTitle>Đổi mật khẩu</DialogTitle><DialogDescription>{staff.display_name} sẽ cần đăng nhập lại trên mọi thiết bị.</DialogDescription></DialogHeader><Form noValidate onSubmit={form.handleSubmit(values=>password.mutate(values.password))}>
 <Field><Label htmlFor={staff.user_id+"-password"} required>Mật khẩu mới</Label><Input id={staff.user_id+"-password"} type="password" autoComplete="new-password" minLength={8} maxLength={22} disabled={password.isPending} aria-describedby={staff.user_id+"-password-help"} aria-invalid={!!form.formState.errors.password} {...form.register("password",{validate:value=>isStrongStaffPassword(value)||staffPasswordHint})} /><Typography id={staff.user_id+"-password-help"} variant="small" tone="muted">{staffPasswordHint}</Typography>{form.formState.errors.password?<Typography role="alert" tone="danger" variant="small">{form.formState.errors.password.message}</Typography>:null}</Field>
 <Field><Label htmlFor={staff.user_id+"-confirmation"} required>Nhập lại mật khẩu</Label><Input id={staff.user_id+"-confirmation"} type="password" autoComplete="new-password" maxLength={22} disabled={password.isPending} aria-invalid={!!form.formState.errors.confirmation} {...form.register("confirmation",{validate:value=>value===form.getValues("password")||"Mật khẩu nhập lại chưa khớp."})} />{form.formState.errors.confirmation?<Typography role="alert" tone="danger" variant="small">{form.formState.errors.confirmation.message}</Typography>:null}</Field>
 {password.error?<AlertMessage variant="destructive">{password.error.message}</AlertMessage>:null}
 <Inline className="justify-end"><Button variant="outline" disabled={password.isPending} onClick={()=>close(false)}>Hủy</Button><Button type="submit" disabled={password.isPending}>{password.isPending?"Đang lưu…":"Lưu mật khẩu"}</Button></Inline></Form></DialogContent></Dialog></Stack>;
}
