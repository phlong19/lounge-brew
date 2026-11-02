"use client";
import {useForm} from "react-hook-form";
import {useMutation,useQueryClient} from "@tanstack/react-query";
import {adminRequest} from "@/lib/admin/client";
import {AlertMessage} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Field,Form,Input,Label} from "@/components/ui/form";
import {Main,Stack} from "@/components/ui/layout";
import {AppLink} from "@/components/ui/link";
import {Media} from "@/components/ui/media";
import {Typography} from "@/components/ui/typography";
export function AdminLogin(){
 const client=useQueryClient(),form=useForm<{email:string;password:string}>({defaultValues:{email:"",password:""}});
 const login=useMutation({mutationFn:(values:{email:string;password:string})=>adminRequest("/api/admin/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:values.email.trim(),password:values.password})}),onSuccess:()=>{client.clear();window.location.assign("/admin");}});
 return <Main lang="vi" className="flex min-h-dvh items-center justify-center bg-[#F2F4EF] px-5 py-10"><Stack gap="lg" className="w-full max-w-sm"><Media src="/trixie/logo.png" alt="Trixie" width={150} height={60} fit="contain" className="mx-auto" /><Typography as="h1" variant="heading" className="text-center">Đăng nhập</Typography><Form noValidate onSubmit={form.handleSubmit(values=>login.mutate(values))} className="mt-5"><Field><Label htmlFor="design-email">Email</Label><Input id="design-email" type="email" autoComplete="username" placeholder="name@example.com" disabled={login.isPending} aria-invalid={!!form.formState.errors.email} {...form.register("email",{required:"Vui lòng nhập email.",pattern:{value:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,message:"Email không hợp lệ."}})} /></Field><Field><Label htmlFor="design-password">Mật khẩu</Label><Input id="design-password" type="password" autoComplete="current-password" disabled={login.isPending} aria-invalid={!!form.formState.errors.password} {...form.register("password",{required:"Vui lòng nhập mật khẩu."})} /></Field><Button type="submit" disabled={login.isPending}>{login.isPending?"Đang đăng nhập…":"Đăng nhập"}</Button></Form>{form.formState.errors.email||form.formState.errors.password?<AlertMessage variant="destructive">{form.formState.errors.email?.message||form.formState.errors.password?.message}</AlertMessage>:null}{login.error?<AlertMessage variant="destructive">{login.error.message}</AlertMessage>:null}<AppLink href="/" className="text-center text-sm underline">Xem website</AppLink></Stack></Main>;
}
