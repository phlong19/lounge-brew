import {Embed} from "@/components/ui/embed";
import {NativeVideo} from "@/components/ui/native-video";
import {Surface} from "@/components/ui/layout";
import type {ParsedVideo} from "@/lib/video";
import {cn} from "@/lib/utils";
export function VideoPlayer({video,title,className}:{video:ParsedVideo;title:string;className?:string}){
 return <Surface className={cn("relative aspect-video w-full overflow-hidden rounded-md bg-[#15201C]",className)}>{video.native?<NativeVideo src={video.src} title={title} />:<Embed src={video.src} title={title} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" className="absolute inset-0 h-full w-full" />}</Surface>;
}
