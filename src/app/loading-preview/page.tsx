import type {Metadata} from "next";
import {getLocale} from "next-intl/server";
import {LandingLoading} from "@/components/content/landing-loading";
export const metadata:Metadata={title:"Loading preview",robots:{index:false,follow:false}};
export default async function LoadingPreview(){return <LandingLoading preview english={(await getLocale())==="en"} />;}
