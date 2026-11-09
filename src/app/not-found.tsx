import {getLocale} from "next-intl/server";
import {SiteHeader} from "@/components/layout/site-header";
import {SiteFooter} from "@/components/layout/site-footer";
import {Button} from "@/components/ui/button";
import {Main,Stack,Surface,Inline} from "@/components/ui/layout";
import {AppLink} from "@/components/ui/link";
import {Icon} from "@/components/ui/icon";
import {Typography} from "@/components/ui/typography";
import {pageStateStyles as s} from "@/lib/ui/page-state-styles";

export default async function NotFound(){
 const english=(await getLocale())==="en";
 return <><SiteHeader /><Main id="main-content" className={s.missing}><Surface className={s.split}>
 <Stack className={s.copy}><Typography className={s.code} aria-hidden="true">404</Typography><Typography as="h1" variant="heading">{english?"Page not found":"Không tìm thấy trang"}</Typography><Typography variant="lead" className="max-w-md">{english?"The page does not exist or has been moved.":"Trang bạn truy cập không tồn tại hoặc đã được di chuyển."}</Typography><Inline className={s.actions}><Button asChild><AppLink href="/"><Icon name="home" />{english?"Back to home":"Về trang chủ"}</AppLink></Button><Button variant="outline" asChild><AppLink href="/events">{english?"Explore live shows":"Khám phá lịch diễn"}<Icon name="arrowUpRight" /></AppLink></Button></Inline></Stack>

 </Surface></Main><SiteFooter /></>;
}
