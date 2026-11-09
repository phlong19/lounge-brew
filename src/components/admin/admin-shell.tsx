"use client";
import type {ReactNode} from "react";
import {usePathname,useSearchParams} from "next/navigation";
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
import {adminStyles as s} from "@/lib/ui/admin-styles";
const labels:Record<AdminSection,string>={blogs:"Bài viết",events:"Sự kiện",video:"Video",seating:"Sơ đồ chỗ ngồi",reservations:"Đặt bàn",staff:"Nhân viên"};
const links:{key:AdminSection;href:string;icon:IconName}[]=[{key:"events",href:"/admin?section=events",icon:"calendar"},{key:"blogs",href:"/admin/blogs",icon:"article"},{key:"video",href:"/admin?section=video",icon:"music"},{key:"seating",href:"/admin?section=seating",icon:"seat"},{key:"reservations",href:"/admin/reservations",icon:"phone"},{key:"staff",href:"/admin/staff",icon:"users"}];
export function AdminShell({staff,children}:{staff:StaffInfo;children:ReactNode}){
 const selected=adminSection(usePathname(),useSearchParams().get("section")),tab=selected,reservations=useReservationNotifications(true);
 return <Main lang="vi" className={s.root} data-admin-design><Surface className={s.sidebar} data-admin-sidebar><Inline className="justify-between"><Media src="/trixie/logo.png" alt="Trixie" width={124} height={50} fit="contain" /></Inline><Navigation aria-label="Quản lý website" className={s.nav}>
 {links.filter(link=>link.key==="staff"?staff.role==="admin":true).map(link=><Button key={link.key} variant="ghost" className={s.navButton} asChild><AppLink href={link.href} aria-current={tab===link.key?"page":undefined}><Icon name={link.icon} />{labels[link.key]}{link.key==="reservations"&&reservations.pending?<Typography as="span" variant="small" className="ml-auto rounded-full bg-amber-100 px-2 text-amber-900">{reservations.pending}</Typography>:null}</AppLink></Button>)}
 </Navigation><Stack gap="sm" className="lg:mt-auto"><StaffMenu staff={staff} /><AppLink href="/" target="_blank" className="inline-flex min-h-11 items-center gap-3 text-sm text-stone-600"><Icon name="externalLink" />Xem website</AppLink></Stack></Surface>
 <Surface className={s.sheet}><Inline className={s.topbar}><Typography variant="small" tone="muted" className="hidden md:block">Quản lý website / <Typography as="span" variant="inline" tone="ink">{labels[tab]}</Typography></Typography></Inline><Stack gap="lg" className={s.canvas}>
 {reservations.notice?<AlertMessage><Inline className="justify-between gap-3"><AppLink href="/admin/reservations" className="font-medium underline">Có yêu cầu đặt bàn mới</AppLink><Button variant="ghost" onClick={reservations.dismiss}>Đóng thông báo</Button></Inline></AlertMessage>:null}
 {children}</Stack></Surface></Main>;
}
