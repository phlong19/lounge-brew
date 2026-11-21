"use client";
import {useLocale,useTranslations} from "next-intl";
import {useQuery} from "@tanstack/react-query";
import {publicVideoOptions} from "@/lib/public/query";
import {parseVideo} from "@/lib/video";
import {VideoPlayer} from "@/components/content/video-player";
import {Button} from "@/components/ui/button";
import {ContentSkeleton} from "@/components/ui/loading-state";
import {Article,Container,Section,Stack} from "@/components/ui/layout";
import {Reveal} from "@/components/ui/reveal";
import {Typography} from "@/components/ui/typography";
import {videoStyles} from "@/lib/ui/home-styles";
export function HomeVideo(){
 const locale=useLocale(),t=useTranslations("PreservedHome"),query=useQuery(publicVideoOptions());
 const item=query.data,video=item?.is_visible?parseVideo(item.source_url):null;
 if(query.data===null)return null;
 if(item&&(!video||video.provider!==item.provider))return null;
 const heading=(locale==="en"?item?.heading_en?.trim():null)||item?.heading_vi||t("videoTitle");
 return <Section id="booking" data-home-section="booking" aria-labelledby="video-heading" className={videoStyles.section}><Container><Article id="video" data-home-section="video" className={videoStyles.frame}><Stack gap="md"><Reveal><Typography as="h2" variant="heading" id="video-heading">{heading}</Typography></Reveal><Reveal delay={1}>{!item?query.isError?<Stack><Typography role="alert">{locale==="en"?"Unable to load the video.":"Không tải được video."}</Typography><Button variant="outline" className="w-fit" onClick={()=>void query.refetch()}>{locale==="en"?"Try again":"Thử lại"}</Button></Stack>:<ContentSkeleton label={locale==="en"?"Loading video…":"Đang tải video…"} />:video?<VideoPlayer key={video.src} video={video} title={heading} className="rounded-none" />:null}</Reveal></Stack></Article></Container></Section>;
}
