"use client";
import {useState} from "react";
import {useQuery,useQueryClient} from "@tanstack/react-query";
import {adminRequest,uploadAdminImage} from "@/lib/admin/client";
import type {ArticleRow} from "@/types/domain";
import {Button} from "@/components/ui/button";
import {Field,Form,Input,Label} from "@/components/ui/form";
import {Inline,Stack,Surface} from "@/components/ui/layout";
import {Typography} from "@/components/ui/typography";
import {AlertMessage} from "@/components/ui/alert";
import {ImageDropzone} from "@/components/ui/image-dropzone";
import {RichTextEditor} from "@/components/ui/rich-text-editor";
import {CheckboxField} from "@/components/ui/checkbox-field";
import {Dialog,DialogContent,DialogTitle,DialogDescription} from "@/components/ui/dialog";
import {AppLink} from "@/components/ui/link";
import {blogStyles as s} from "@/lib/ui/blog-styles";
type Blog=ArticleRow&{updated_at:string};
const empty=():Blog=>({id:"",title_vi:"",title_en:"",slug:"",content_vi:"",content_en:"",thumbnail_url:null,published_at:null,updated_at:""});
function BlogEditor({initial,onClose,onSaved}:{initial:Blog;onClose:()=>void;onSaved:()=>void}){
 const [draft,setDraft]=useState(initial),[file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[uploading,setUploading]=useState(false),[englishUploading,setEnglishUploading]=useState(false),[error,setError]=useState("");
 const blocked=busy||uploading||englishUploading;
 const change=(key:keyof Blog,value:string|null)=>setDraft(old=>({...old,[key]:value}));
 async function save(){setBusy(true);setError("");try{
 let thumbnail=draft.thumbnail_url;if(file){thumbnail=(await uploadAdminImage(file,"blog")).url;setDraft(old=>({...old,thumbnail_url:thumbnail}));setFile(null);}
 const {id,updated_at}=draft; const payload={title_vi:draft.title_vi,title_en:draft.title_en,slug:draft.slug,content_vi:draft.content_vi,content_en:draft.content_en,published_at:draft.published_at};
 await adminRequest(id?`/api/admin/blogs/${id}`:"/api/admin/blogs",{method:id?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...payload,thumbnail_url:thumbnail,...(id?{expectedUpdatedAt:updated_at}:{})})});onSaved();
 }catch(cause){setError(cause instanceof Error?cause.message:"Không thể lưu bài viết.");}finally{setBusy(false);}}
 return <Stack gap="lg"><Inline className="justify-between"><Typography as="h1" variant="heading">{draft.id?"Sửa bài viết":"Thêm bài viết"}</Typography><Button variant="outline" disabled={blocked} onClick={onClose}>Quay lại</Button></Inline>
 <Form onSubmit={event=>{event.preventDefault();void save();}} aria-busy={busy}><Surface className={s.editor}><Stack className={s.panel} gap="lg">
 <Field><Label htmlFor="blog-title" required>Tiêu đề tiếng Việt</Label><Input id="blog-title" required maxLength={200} disabled={busy} value={draft.title_vi} onChange={e=>change("title_vi",e.target.value)} /></Field>
 <Field><Label htmlFor="blog-slug" required>Đường dẫn</Label><Input id="blog-slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={200} disabled={busy} value={draft.slug} onChange={e=>change("slug",e.target.value)} /><Typography variant="small" tone="muted">Ví dụ: dem-nhac-tai-trixie</Typography></Field>
 <Field><Label htmlFor="blog-body">Nội dung tiếng Việt</Label><RichTextEditor id="blog-body" value={draft.content_vi} onChange={value=>change("content_vi",value)} uploadPurpose="blog" onUploadStateChange={setUploading} /></Field>
 <Field><Label htmlFor="blog-title-en" optionalLabel="không bắt buộc">Tiêu đề tiếng Anh</Label><Input id="blog-title-en" maxLength={200} disabled={busy} value={draft.title_en??""} onChange={e=>change("title_en",e.target.value)} /></Field>
 <Field><Label htmlFor="blog-body-en" optionalLabel="không bắt buộc">Nội dung tiếng Anh</Label><RichTextEditor id="blog-body-en" value={draft.content_en??""} onChange={value=>change("content_en",value)} uploadPurpose="blog" onUploadStateChange={setEnglishUploading} /></Field>
 </Stack><Stack className={s.panel} gap="lg"><Typography as="h2" variant="subheading">Ảnh bìa</Typography><ImageDropzone id="blog-cover" file={file??undefined} existingSrc={draft.thumbnail_url} onChange={setFile} /><CheckboxField label="Xuất bản trên website" disabled={busy} checked={!!draft.published_at} onChange={e=>change("published_at",e.target.checked?new Date().toISOString():null)} /><Button type="submit" disabled={blocked}>{busy?"Đang lưu…":"Lưu bài viết"}</Button></Stack></Surface>{error?<AlertMessage variant="destructive">{error}</AlertMessage>:null}</Form></Stack>;
}
export function AdminBlogs(){
 const client=useQueryClient(),[page,setPage]=useState(1),[editing,setEditing]=useState<Blog|null>(null),[deleting,setDeleting]=useState<Blog|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const query=useQuery({queryKey:["admin","blogs",page],queryFn:({signal})=>adminRequest(`/api/admin/blogs?page=${page}`,{signal}) as Promise<{items:Blog[];total:number;limit:number}>});
 async function edit(id:string){setBusy(true);setError("");try{const result=await adminRequest(`/api/admin/blogs/${id}`);setEditing(result.item);}catch(cause){setError((cause as Error).message);}finally{setBusy(false);}}
 async function remove(){if(!deleting)return;setBusy(true);setError("");try{await adminRequest(`/api/admin/blogs/${deleting.id}`,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({expectedUpdatedAt:deleting.updated_at})});setDeleting(null);await client.invalidateQueries({queryKey:["admin","blogs"]});}catch(cause){setError((cause as Error).message);}finally{setBusy(false);}}
 if(editing)return <BlogEditor key={editing.id} initial={editing} onClose={()=>setEditing(null)} onSaved={()=>{setEditing(null);void client.invalidateQueries({queryKey:["admin","blogs"]});}} />;
 return <Stack gap="lg"><Inline className="justify-between"><Typography as="h1" variant="heading">Bài viết</Typography><Button disabled={busy} onClick={()=>setEditing(empty())}>Thêm bài viết</Button></Inline>{error&&!deleting?<AlertMessage variant="destructive">{error}</AlertMessage>:null}
 <Surface className={s.panel}>{query.isPending?<Typography role="status">Đang tải bài viết…</Typography>:query.isError?<Stack><AlertMessage variant="destructive">{query.error.message}</AlertMessage><Button onClick={()=>void query.refetch()}>Thử lại</Button></Stack>:!query.data.items.length?<Typography>Chưa có bài viết.</Typography>:query.data.items.map(item=><Surface key={item.id} className={s.row}><Stack gap="xs"><Typography as="h2" variant="body" className="font-semibold">{item.title_vi}</Typography><Typography variant="small" tone="muted">{!item.published_at?"Bản nháp":Date.parse(item.published_at)>query.dataUpdatedAt?"Đã lên lịch":"Đã xuất bản"} · /journal/{item.slug}</Typography></Stack><Inline className={s.actions}>{item.published_at&&Date.parse(item.published_at)<=query.dataUpdatedAt?<AppLink href={`/journal/${item.slug}`} target="_blank">Xem bài viết</AppLink>:null}<Button variant="outline" disabled={busy} onClick={()=>void edit(item.id)}>Sửa</Button><Button variant="ghost" disabled={busy} onClick={()=>{setError("");setDeleting(item);}}>Xóa</Button></Inline></Surface>)}</Surface>
 <Inline className="justify-end"><Button variant="outline" disabled={page===1||busy} onClick={()=>setPage(p=>p-1)}>Trước</Button><Typography variant="small">Trang {page}</Typography><Button variant="outline" disabled={!query.data||page*query.data.limit>=query.data.total||busy} onClick={()=>setPage(p=>p+1)}>Tiếp</Button></Inline>
 <Dialog open={!!deleting} onOpenChange={open=>{if(!open&&!busy)setDeleting(null);}}><DialogContent className={s.dialog} closeLabel="Đóng"><DialogTitle>Xóa bài viết?</DialogTitle><DialogDescription>Bài viết “{deleting?.title_vi}” sẽ bị xóa vĩnh viễn. Các tệp ảnh vẫn được giữ lại.</DialogDescription>{error?<AlertMessage variant="destructive">{error}</AlertMessage>:null}<Inline className="justify-end"><Button variant="outline" disabled={busy} onClick={()=>setDeleting(null)}>Hủy</Button><Button disabled={busy} onClick={()=>void remove()}>{busy?"Đang xóa…":"Xóa bài viết"}</Button></Inline></DialogContent></Dialog></Stack>;
}
