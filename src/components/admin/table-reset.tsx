import {Button} from "@/components/ui/button";
import {Icon} from "@/components/ui/icon";
export function TableReset({onReset,className}:{onReset:()=>void;className?:string}){
 return <Button variant="outline" className={className} onClick={onReset}><Icon name="reset" className="size-4" />Đặt lại bộ lọc</Button>;
}
