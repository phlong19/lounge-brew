import {getLocale} from "next-intl/server";
import {PageSkeleton} from "@/components/content/page-skeleton";
export default async function Loading(){return <PageSkeleton english={(await getLocale())==="en"} />;}
