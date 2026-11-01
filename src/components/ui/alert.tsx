import type {ComponentPropsWithRef} from "react";
import {Icon} from "@/components/ui/icon";
import {typographyStyles} from "@/lib/ui/styles";
import {cn} from "@/lib/utils";
const variants={default:"border-stone-200 bg-stone-50 text-stone-800",warning:"border-amber-200 bg-amber-50 text-amber-950",destructive:"border-red-200 bg-red-50 text-red-900"} as const;
type Props=ComponentPropsWithRef<"div">&{variant?:keyof typeof variants};
export function Alert({className,variant="default",role,...props}:Props){return <div role={role??(variant==="destructive"?"alert":"status")} data-slot="alert" className={cn("relative grid w-full grid-cols-[1rem_minmax(0,1fr)] items-start gap-x-3 rounded-lg border p-4 text-sm [&>svg]:size-4 [&>svg]:translate-y-0.5",variants[variant],className)} {...props} />;}
export function AlertTitle({className,...props}:ComponentPropsWithRef<"h5">){return <h5 className={cn(typographyStyles.small,"col-start-2 mb-1 font-semibold leading-none tracking-tight",className)} {...props} />;}
export function AlertDescription({className,...props}:ComponentPropsWithRef<"div">){return <div className={cn(typographyStyles.small,"col-start-2 break-words leading-relaxed",className)} {...props} />;}
export function AlertMessage({children,variant="default",...props}:Props){return <Alert variant={variant} {...props}><Icon name={variant==="default"?"help":"warning"} /><AlertDescription>{children}</AlertDescription></Alert>;}
