import {Grid,Stack,Surface} from "@/components/ui/layout";
import {Skeleton} from "@/components/ui/skeleton";
import {Typography} from "@/components/ui/typography";
import {Table,TableHeader,TableHead,TableRow,TableBody,TableCell} from "@/components/ui/table";

export function ContentSkeleton({label="Đang tải…",image=false}:{label?:string;image?:boolean}){
 return <Stack role="status" aria-busy="true" gap="lg"><Typography className="sr-only">{label}</Typography>{image?<Skeleton className="aspect-[4/3] w-full" />:null}<Skeleton className="h-7 w-2/3" /><Stack gap="sm">{Array.from({length:4},(_,index)=><Skeleton key={index} className={index===3?"h-4 w-3/4":"h-4 w-full"} />)}</Stack><Grid className="grid-cols-2 gap-4"><Skeleton className="h-11" /><Skeleton className="h-11" /></Grid></Stack>;
}
export function TableSkeleton({columns,rows=6,label="Đang tải danh sách…"}:{columns:readonly string[];rows?:number;label?:string}){
 return <Surface role="status" aria-busy="true"><Typography className="sr-only">{label}</Typography><Table><TableHeader><TableRow>{columns.map((name,index)=><TableHead key={index}>{name||<Typography className="sr-only">Thao tác</Typography>}</TableHead>)}</TableRow></TableHeader><TableBody>{Array.from({length:rows},(_,row)=><TableRow key={row}>{columns.map((_,column)=><TableCell key={column}><Skeleton className={column===0?"h-9 min-w-24 w-3/4":"h-5 min-w-12 w-2/3"} /></TableCell>)}</TableRow>)}</TableBody></Table></Surface>;
}
