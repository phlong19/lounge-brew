"use client";
import {useState} from "react";
import {Controller,useForm} from "react-hook-form";
import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {adminRequest} from "@/lib/admin/client";
import {adminKeys} from "@/lib/admin/query";
import {staffInput,staffPasswordHint,isStrongStaffPassword,type NewStaff} from "@/lib/admin/staff-validation";
import {Button} from "@/components/ui/button";
import {Field,Form,Input,Label} from "@/components/ui/form";
import {Grid,Inline,Stack,Surface} from "@/components/ui/layout";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from "@/components/ui/table";
import {Pagination,PaginationContent,PaginationItem,PaginationNext,PaginationPrevious} from "@/components/ui/pagination";
import {Typography} from "@/components/ui/typography";
import {Icon} from "@/components/ui/icon";
import type {StaffRole} from "@/lib/admin/roles";
import {adminStyles as s} from "@/lib/ui/admin-styles";

type StaffRow={user_id:string;display_name:string;role:StaffRole;is_active:boolean;created_at:string};
type StaffList={items:StaffRow[];total:number;page:number;limit:number};
export function AdminStaff(){
 const client=useQueryClient();
 const [page,setPage]=useState(1);
 const [notice,setNotice]=useState("");
 const {register,control,handleSubmit,reset,formState:{errors}}=useForm<NewStaff>({defaultValues:{display_name:"",email:"",password:"",role:"editor"},mode:"onSubmit"});
 const list=useQuery({queryKey:[...adminKeys.staff,page],queryFn:({signal})=>adminRequest("/api/admin/staff?page="+page,{signal}) as Promise<StaffList>});
 const create=useMutation({
  mutationFn:async(values:NewStaff)=>{
   const input=staffInput(values);
   return adminRequest("/api/admin/staff",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)}) as Promise<{item:StaffRow}>;
  },
  onSuccess:async result=>{
   reset();setPage(1);setNotice("Đã tạo tài khoản cho "+result.item.display_name+".");
   await client.invalidateQueries({queryKey:adminKeys.staff});
  },
 });
 const busy=create.isPending,items=list.data?.items??[],total=list.data?.total??0;
 return <Grid className="items-start gap-6 xl:grid-cols-[minmax(300px,400px)_minmax(0,1fr)]" data-admin-staff>
  <Surface className={s.panel+" p-5"}><Stack gap="lg"><Typography as="h2" variant="subheading">Thêm nhân viên</Typography>
   <Form noValidate onSubmit={handleSubmit(values=>{setNotice("");create.mutate(values);})}>
    <Field><Label htmlFor="staff-name" required>Tên nhân viên</Label><Input id="staff-name" placeholder="Nhập tên nhân viên" autoComplete="name" disabled={busy} maxLength={120} aria-invalid={!!errors.display_name} aria-describedby={errors.display_name?"staff-name-error":undefined} {...register("display_name",{validate:value=>!!value.trim()&&value.trim().length<=120||"Nhập tên nhân viên từ 1 đến 120 ký tự."})} />{errors.display_name?<Typography id="staff-name-error" variant="small" tone="danger" role="alert">{errors.display_name.message}</Typography>:null}</Field>
    <Field><Label htmlFor="staff-email" required>Email</Label><Input id="staff-email" type="email" placeholder="nhanvien@example.com" maxLength={254} autoComplete="email" disabled={busy} aria-invalid={!!errors.email} aria-describedby={errors.email?"staff-email-error":undefined} {...register("email",{required:"Vui lòng nhập email.",validate:value=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())&&value.trim().length<=254||"Email không hợp lệ."})} />{errors.email?<Typography id="staff-email-error" variant="small" tone="danger" role="alert">{errors.email.message}</Typography>:null}</Field>
    <Field><Label htmlFor="staff-password" required>Mật khẩu ban đầu</Label><Input id="staff-password" type="password" placeholder="Nhập mật khẩu 8–22 ký tự" minLength={8} maxLength={22} autoComplete="new-password" disabled={busy} aria-invalid={!!errors.password} aria-describedby={errors.password?"staff-password-help staff-password-error":"staff-password-help"} {...register("password",{validate:value=>isStrongStaffPassword(value)||staffPasswordHint})} /><Typography id="staff-password-help" variant="small" tone="muted">{staffPasswordHint}</Typography>{errors.password?<Typography id="staff-password-error" variant="small" tone="danger" role="alert">{errors.password.message}</Typography>:null}</Field>
    <Field><Label htmlFor="staff-role">Vai trò</Label><Controller control={control} name="role" render={({field})=><Select value={field.value} disabled={busy} onValueChange={field.onChange}><SelectTrigger id="staff-role" ref={field.ref} onBlur={field.onBlur}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="editor">Biên tập viên</SelectItem><SelectItem value="admin">Quản trị viên</SelectItem></SelectContent></Select>} /></Field>
    <Button type="submit" disabled={busy}><Icon name="plus" />{busy?"Đang tạo…":"Tạo tài khoản"}</Button>
   </Form>
   {create.error?<Typography tone="danger" variant="small" role="alert">{create.error.message}</Typography>:null}
   {notice?<Typography variant="small" role="status">{notice}</Typography>:null}
  </Stack></Surface>
  <Surface className={s.panel+" overflow-hidden"}>
   <Inline className="justify-between p-5"><Typography as="h2" variant="subheading">Danh sách nhân viên</Typography><Typography variant="small" tone="muted">Tổng: {total}</Typography></Inline>
   {list.isPending?<Typography className="p-5" role="status">Đang tải nhân viên…</Typography>:list.isError?<Stack className="p-5"><Typography role="alert" tone="danger">{list.error.message}</Typography><Button variant="outline" onClick={()=>void list.refetch()}>Thử lại</Button></Stack>:<Table aria-label="Danh sách nhân viên"><TableHeader><TableRow><TableHead>Họ tên</TableHead><TableHead>Vai trò</TableHead><TableHead>Trạng thái</TableHead></TableRow></TableHeader><TableBody>{!items.length?<TableRow><TableCell colSpan={3}><Typography variant="small" tone="muted" className="py-6 text-center">Chưa có nhân viên.</Typography></TableCell></TableRow>:null}{items.map(staff=><TableRow key={staff.user_id}><TableCell><Typography className="font-semibold">{staff.display_name}</Typography></TableCell><TableCell>{staff.role==="admin"?"Quản trị viên":"Biên tập viên"}</TableCell><TableCell>{staff.is_active?"Được truy cập":"Đã khóa"}</TableCell></TableRow>)}</TableBody></Table>}
   {total>20?<Pagination className="justify-end border-t border-stone-200 p-4"><PaginationContent><PaginationItem><PaginationPrevious disabled={page===1||list.isFetching} onClick={()=>setPage(page-1)} /></PaginationItem><PaginationItem><Typography variant="small">{page} / {Math.ceil(total/20)}</Typography></PaginationItem><PaginationItem><PaginationNext disabled={page>=Math.ceil(total/20)||list.isFetching} onClick={()=>setPage(page+1)} /></PaginationItem></PaginationContent></Pagination>:null}
  </Surface>
 </Grid>;
}
