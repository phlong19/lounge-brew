import {Container,Grid,Inline,Main,Stack,Surface} from "@/components/ui/layout";
import {Skeleton} from "@/components/ui/skeleton";
import {ContentSkeleton} from "@/components/ui/loading-state";
import {Typography} from "@/components/ui/typography";

export function PageSkeleton({event=false,english=false}:{event?:boolean;english?:boolean}){
 const label=english?"Loading page…":"Đang tải trang…";

 return <Main aria-busy="true" role="status"><Typography className="sr-only">{label}</Typography><Surface className="border-b border-stone-200 bg-white py-5"><Container><Inline className="justify-between"><Skeleton className="h-12 w-32" /><Skeleton className="h-10 w-24" /></Inline></Container></Surface><Container className="max-w-[1440px] py-12"><Stack gap="xl">{event?<><Grid className="items-start gap-8 md:grid-cols-[280px_minmax(0,1fr)]"><Skeleton className="h-72" /><ContentSkeleton label={label} /></Grid><Grid className="gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"><ContentSkeleton image label={label} /><ContentSkeleton image label={label} /></Grid></>:<><Skeleton className="h-12 w-2/3" /><Grid className="gap-8 md:grid-cols-3">{Array.from({length:3},(_,index)=><ContentSkeleton key={index} image label={label} />)}</Grid></>}</Stack></Container></Main>;
}
