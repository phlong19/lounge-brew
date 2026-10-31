"use client";
import {useQuery} from "@tanstack/react-query";
import {publicSeatingOptions} from "@/lib/public/query";
import {seatingImageUrl} from "@/lib/seating";
import {SeatingPlan,type SeatingImage} from "@/components/lounge/seating-plan";
export function PublicSeating({english=false}:{english?:boolean}){
 const {data}=useQuery(publicSeatingOptions());
 const images:SeatingImage[]=[];
 if(data?.is_visible)for(const [index,asset] of [data.lower,data.upper].entries()){
  const src=seatingImageUrl(asset);
  if(src&&asset)images.push({src,label:(english?"Floor ":"Tầng ")+(index+1),width:asset.width||1200,height:asset.height||900});
 }
 return <SeatingPlan key={images.map(image=>image.src).join("|")} images={images} english={english} />;
}
