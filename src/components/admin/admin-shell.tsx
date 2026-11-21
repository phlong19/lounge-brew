"use client";
import type {ReactNode} from "react";
import {usePathname} from "next/navigation";
import {useReservationNotifications} from "@/lib/admin/use-reservation-notifications";
import {StaffMenu,type StaffInfo} from "@/components/admin/staff-menu";
import {adminSection,type AdminSection} from "@/lib/admin/navigation";
import {AlertMessage} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Icon,type IconName} from "@/components/ui/icon";
import {Inline,Main,Navigation,Stack,Surface} from "@/components/ui/layout";
import {AppLink} from "@/components/ui/link";
import {Media} from "@/components/ui/media";
import {Typography} from "@/components/ui/typography";
import {Tooltip,TooltipContent,TooltipProvider,TooltipTrigger} from "@/components/ui/tooltip";
import {adminStyles as s} from "@/lib/ui/admin-styles";
const labels:Record<AdminSection,string>={blogs:"Bài viết",events:"Sự kiện",video:"Video",seating:"Sơ đồ chỗ ngồi",reservations:"Đặt bàn",staff:"Nhân viên"};
const links:{key:AdminSection;href:string;icon:IconName}[]=[{key:"events",href:"/admin/events",icon:"calendar"},{key:"blogs",href:"/admin/blogs",icon:"article"},{key:"video",href:"/admin/video",icon:"music"},{key:"seating",href:"/admin/seating",icon:"seat"},{key:"reservations",href:"/admin/reservations",icon:"phone"},{key:"staff",href:"/admin/staff",icon:"users"}];
export function AdminShell({staff,children}:{staff:StaffInfo;children:ReactNode}){
 const selected=adminSection(usePathname()),tab=selected,reservations=useReservationNotifications(true);
 return <Main lang="vi" className={s.root} data-admin-design><Surface className={s.sidebar} data-admin-sidebar><Inline className="justify-center lg:justify-between"><Media src="/trixie/logo.png" alt="Trixie" width={124} height={50} fit="contain" className="w-12 lg:w-auto" /></Inline><TooltipProvider delayDuration={200}><Navigation aria-label="Quản lý website" className={s.nav}>
 {links.filter(link=>link.key==="staff"?staff.role==="admin":true).map(link=><Tooltip key={link.key}><TooltipTrigger asChild><Button variant="ghost" className={s.navButton} asChild><AppLink href={link.href} aria-current={tab===link.key?"page":undefined}><Icon name={link.icon} /><Typography as="span" className="sr-only lg:not-sr-only">{labels[link.key]}</Typography>{link.key==="reservations"&&reservations.pending?<Typography as="span" variant="small" className="absolute right-0 top-0 rounded-full bg-amber-100 px-1 text-xs text-amber-900 lg:static lg:ml-auto lg:px-2">{reservations.pending}</Typography>:null}</AppLink></Button></TooltipTrigger><TooltipContent side="right" className="lg:hidden">{labels[link.key]}</TooltipContent></Tooltip>)}
 </Navigation><Stack gap="sm" className="mt-auto"><StaffMenu staff={staff} /><Tooltip><TooltipTrigger asChild><AppLink href="/" target="_blank" className="inline-flex min-h-11 items-center justify-center gap-3 text-sm text-stone-600 lg:justify-start"><Icon name="externalLink" /><Typography as="span" className="sr-only lg:not-sr-only">Xem website</Typography></AppLink></TooltipTrigger><TooltipContent side="right" className="lg:hidden">Xem website</TooltipContent></Tooltip></Stack></TooltipProvider></Surface>
 <Surface className={s.sheet}><Inline className={s.topbar}><Typography variant="small" tone="muted" className="hidden md:block">Quản lý website / <Typography as="span" variant="inline" tone="ink">{labels[tab]}</Typography></Typography></Inline><Stack gap="lg" className={s.canvas}>
 {reservations.notice?<AlertMessage><Inline className="justify-between gap-3"><AppLink href="/admin/reservations" className="font-medium underline">Có yêu cầu đặt bàn mới</AppLink><Button variant="ghost" onClick={reservations.dismiss}>Đóng thông báo</Button></Inline></AlertMessage>:null}
 {children}</Stack></Surface></Main>;
}
