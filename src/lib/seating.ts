export type SeatingAsset = { object_path: string; width: number | null; height: number | null };
export type SeatingSettings = {
 id: string; lower_asset_id: string | null; upper_asset_id: string | null;
 is_visible: boolean; updated_at: string;
 lower: SeatingAsset | null; upper: SeatingAsset | null;
};
export const seatingSelect = "id,lower_asset_id,upper_asset_id,is_visible,updated_at,lower:media_assets!lower_asset_id(object_path,width,height),upper:media_assets!upper_asset_id(object_path,width,height)";
export function seatingImageUrl(asset: SeatingAsset | null): string | null {
 const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
 return asset && base ? `${base}/storage/v1/object/public/lounge-public/${asset.object_path}` : null;
}
