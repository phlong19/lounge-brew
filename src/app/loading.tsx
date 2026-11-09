import {getLocale} from "next-intl/server";
import {LandingLoading} from "@/components/content/landing-loading";
export default async function Loading(){return <LandingLoading english={(await getLocale())==="en"} />;}
