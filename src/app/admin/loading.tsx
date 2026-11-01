import {Grid,Stack} from "@/components/ui/layout";
import {Skeleton} from "@/components/ui/skeleton";
import {TableSkeleton} from "@/components/ui/loading-state";
export default function Loading(){return <Stack gap="lg" data-admin-page-loading><Skeleton className="h-8 w-40" /><Grid className="gap-3 sm:grid-cols-3"><Skeleton className="h-11" /><Skeleton className="h-11" /><Skeleton className="h-11" /></Grid><TableSkeleton columns={["", "", "", ""]} label="Đang tải trang…" /></Stack>;}
