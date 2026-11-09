"use client";
import {CreationCloseDialog} from "@/components/admin/creation-close-dialog";
import {useCreationExit} from "@/lib/admin/use-creation-exit";
import {useRouter} from "next/navigation";
import {useToast} from "@/components/ui/toast";
import {Icon} from "@/components/ui/icon";
import {Table,TableHeader,TableHead,TableRow,TableBody,TableCell,TableEmpty} from "@/components/ui/table";
import {TableSkeleton} from "@/components/ui/loading-state";
import {formatDate} from "@/lib/dates";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import {blogSlugFromTitle} from "@/lib/admin/blog-slug";
import {useState,useRef} from "react";
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
 const [language,setLanguage]=useState("vi"),[manualSlug,setManualSlug]=useState(!!initial.id&&!initial.is_draft||!!initial.slug&&initial.slug!==blogSlugFromTitle(initial.title_vi));
 const blocked=busy||uploading||englishUploading;
 const [mediaSession]=useState(()=>crypto.randomUUID()),[closePrompt,setClosePrompt]=useState(false);
 const destination=useRef<string|null>(null);const router=useRouter();
 function finishClose(){setClosePrompt(false);onClose();if(destination.current)router.push(destination.current);}
 async function discard(){if(blocked)return;setBusy(true);setError("");try{await adminRequest("/api/admin/drafts",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({media_session:mediaSession})});finishClose();}catch(cause){setError((cause as Error).message);setClosePrompt(true);}finally{setBusy(false);}}
 function requestClose(href?:string){if(blocked)return;destination.current=href??null;if(!initial.id){setClosePrompt(true);setError("");}else void discard();}
 useCreationExit(!initial.id,href=>requestClose(href));
 function changeTitle(value:string){setDraft(old=>({...old,title_vi:value,slug:manualSlug?old.slug:blogSlugFromTitle(value)}));}
 const change=(key:keyof Blog,value:string|null)=>setDraft(old=>({...old,[key]:value}));
 async function save(asDraft=false){if(blocked)return;if(!asDraft){if(!draft.title_vi.trim()||!draft.slug.trim()){setLanguage("vi");setError("Vui lòng nhập tiêu đề tiếng Việt và đường dẫn.");return;}if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)){setError("Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch nối.");return;}}setBusy(true);setError("");try{
 let thumbnail=draft.thumbnail_url;if(file){thumbnail=(await uploadAdminImage(file,"blog",mediaSession)).url;setDraft(old=>({...old,thumbnail_url:thumbnail}));setFile(null);}
 const {id,updated_at}=draft;const payload={title_vi:draft.title_vi,title_en:draft.title_en,slug:draft.slug,content_vi:draft.content_vi,content_en:draft.content_en,published_at:draft.published_at,thumbnail_url:thumbnail};
 if(asDraft){await adminRequest("/api/admin/drafts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"article",id:draft.is_draft?id:null,expectedUpdatedAt:updated_at||null,media_session:mediaSession,data:payload})});}
 else {const existing=!!id&&!draft.is_draft;await adminRequest(existing?`/api/admin/blogs/${id}`:"/api/admin/blogs",{method:existing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...payload,media_session:mediaSession,...(draft.is_draft?{draft_id:id}:{}),...(id?{expectedUpdatedAt:updated_at}:{})})});}
 setClosePrompt(false);onSaved();if(destination.current)router.push(destination.current);
 }catch(cause){setError(cause instanceof Error?cause.message:"Không thể lưu bài viết.");}finally{setBusy(false);}}
 return <Stack gap="lg"><CreationCloseDialog open={closePrompt} busy={blocked} error={error} onKeepEditing={()=>{setClosePrompt(false);destination.current=null;}} onSaveDraft={()=>void save(true)} onDiscard={()=>void discard()} /><Inline gap="sm"><Button variant="outline" size="icon" disabled={blocked} onClick={()=>requestClose()} aria-label="Quay lại"><Icon name="arrowLeft" /></Button><Typography as="h1" variant="heading">{draft.id?"Sửa bài viết":"Thêm bài viết"}</Typography></Inline>
 <Form noValidate onSubmit={event=>{event.preventDefault();void save();}} aria-busy={busy}><Surface className={s.editor}><Stack className={s.panel} gap="lg">
 <Field><Inline className="justify-between gap-3"><Label htmlFor={language==="vi"?"blog-title":"blog-title-en"} required={language==="vi"} optionalLabel={language==="en"?"không bắt buộc":undefined}>{language==="vi"?"Tiêu đề tiếng Việt":"Tiêu đề tiếng Anh"}</Label><Select value={language} onValueChange={setLanguage} disabled={blocked}><SelectTrigger aria-label="Ngôn ngữ bài viết" className="h-8 min-h-8 w-32 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="vi">Tiếng Việt</SelectItem><SelectItem value="en">Tiếng Anh</SelectItem></SelectContent></Select></Inline><Input id={language==="vi"?"blog-title":"blog-title-en"} required={language==="vi"} maxLength={200} disabled={busy} value={language==="vi"?draft.title_vi:draft.title_en??""} onChange={e=>language==="vi"?changeTitle(e.target.value):change("title_en",e.target.value)} /></Field>
 <Field><Label htmlFor="blog-slug" required>Đường dẫn</Label><Input id="blog-slug" placeholder="dem-nhac-tai-trixie" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={200} disabled={busy} value={draft.slug} onChange={e=>{setManualSlug(!!e.target.value);change("slug",e.target.value);}} /></Field>
 <Surface hidden={language!=="vi"}><Field><Label htmlFor="blog-body">Nội dung tiếng Việt</Label><RichTextEditor mediaSession={mediaSession} id="blog-body" value={draft.content_vi} onChange={value=>change("content_vi",value)} uploadPurpose="blog" onUploadStateChange={setUploading} /></Field></Surface>
 <Surface hidden={language!=="en"}><Field><Label htmlFor="blog-body-en" optionalLabel="không bắt buộc">Nội dung tiếng Anh</Label><RichTextEditor mediaSession={mediaSession} id="blog-body-en" value={draft.content_en??""} onChange={value=>change("content_en",value)} uploadPurpose="blog" onUploadStateChange={setEnglishUploading} /></Field></Surface>
 </Stack><Stack className={s.coverPanel} gap="lg"><Typography as="h2" variant="subheading">Ảnh bìa</Typography><ImageDropzone compact id="blog-cover" file={file??undefined} existingSrc={draft.thumbnail_url} onChange={next=>{setFile(next);if(!next)change("thumbnail_url",null);}} /><CheckboxField label="Xuất bản trên website" disabled={busy} checked={!!draft.published_at} onChange={e=>change("published_at",e.target.checked?new Date().toISOString():null)} /><Inline className="justify-end gap-2"><Button variant="outline" disabled={blocked} onClick={()=>requestClose()}>Hủy</Button>{!draft.id||draft.is_draft?<Button variant="outline" disabled={blocked} onClick={()=>void save(true)}>Lưu bản nháp</Button>:null}<Button type="submit" disabled={blocked}>{busy?"Đang lưu…":"Lưu"}</Button></Inline></Stack></Surface>{error?<AlertMessage variant="destructive">{error}</AlertMessage>:null}</Form></Stack>;
}
export function AdminBlogs(){
 const toast=useToast();const client=useQueryClient(),[page,setPage]=useState(1),[editing,setEditing]=useState<Blog|null>(null),[deleting,setDeleting]=useState<Blog|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const query=useQuery({queryKey:["admin","blogs",page],queryFn:({signal})=>adminRequest(`/api/admin/blogs?page=${page}`,{signal}) as Promise<{items:Blog[];total:number;limit:number}>});
 async function edit(id:string){setBusy(true);setError("");try{const result=await adminRequest(`/api/admin/blogs/${id}`);setEditing(result.item);}catch(cause){setError((cause as Error).message);}finally{setBusy(false);}}
 async function remove(){if(!deleting)return;setBusy(true);setError("");try{await adminRequest(deleting.is_draft?"/api/admin/drafts":`/api/admin/blogs/${deleting.id}`,{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:deleting.id,expectedUpdatedAt:deleting.updated_at})});setDeleting(null);await client.invalidateQueries({queryKey:["admin","blogs"]});}catch(cause){setError((cause as Error).message);}finally{setBusy(false);}}
 if(editing)return <BlogEditor key={editing.id} initial={editing} onClose={()=>setEditing(null)} onSaved={()=>{setEditing(null);toast("Đã lưu bài viết.");void client.invalidateQueries({queryKey:["admin","blogs"]});}} />;
 return <Stack gap="lg"><Inline className="justify-between"><Typography as="h1" variant="heading">Bài viết</Typography><Button disabled={busy} onClick={()=>setEditing(empty())}><Icon name="plus" />Thêm bài viết</Button></Inline>{error&&!deleting?<AlertMessage variant="destructive">{error}</AlertMessage>:null}
 <Surface className="overflow-hidden rounded-lg border border-stone-200">
 {query.isPending?<TableSkeleton columns={["Tiêu đề","Đường dẫn","Trạng thái","Ngày xuất bản","Thao tác"]} label="Đang tải bài viết…" />:<><Table aria-label="Danh sách bài viết"><TableHeader><TableRow><TableHead>Tiêu đề</TableHead><TableHead>Đường dẫn</TableHead><TableHead>Trạng thái</TableHead><TableHead>Ngày xuất bản</TableHead><TableHead className="text-right">Thao tác</TableHead></TableRow></TableHeader><TableBody>
 {query.isError?<TableRow><TableCell colSpan={5}><Stack className="items-center py-8"><AlertMessage variant="destructive">{query.error.message}</AlertMessage><Button variant="outline" onClick={()=>void query.refetch()}>Thử lại</Button></Stack></TableCell></TableRow>:!query.data?.items.length?<TableEmpty columns={5}>Chưa có bài viết.</TableEmpty>:query.data.items.map(item=><TableRow key={item.id}><TableCell><Typography className="min-w-48 font-medium">{item.title_vi||"Bản nháp chưa đặt tên"}</Typography></TableCell><TableCell><Typography variant="small" tone="muted" className="max-w-72 break-words">{item.is_draft?"Chưa xuất bản":`/journal/${item.slug}`}</Typography></TableCell><TableCell><Typography variant="small" className="whitespace-nowrap">{!item.published_at?"Bản nháp":Date.parse(item.published_at)>query.dataUpdatedAt?"Đã lên lịch":"Đã xuất bản"}</Typography></TableCell><TableCell><Typography variant="small" className="whitespace-nowrap">{item.published_at?formatDate(item.published_at):"—"}</Typography></TableCell><TableCell><Inline className="justify-end gap-2 flex-nowrap">{item.published_at&&Date.parse(item.published_at)<=query.dataUpdatedAt?<Button size="sm" variant="ghost" asChild><AppLink href={`/journal/${item.slug}`} target="_blank"><Icon name="externalLink" />Xem</AppLink></Button>:null}<Button size="sm" variant="outline" disabled={busy} onClick={()=>void edit(item.id)}><Icon name="pencil" />Sửa</Button><Button size="sm" variant="destructive" disabled={busy} onClick={()=>{setError("");setDeleting(item);}}><Icon name="trash" />Xóa</Button></Inline></TableCell></TableRow>)}
 </TableBody></Table></>}
 <Inline className="justify-between border-t border-stone-200 px-4 py-3"><Typography variant="small" tone="muted">Tổng: {query.data?.total??0} bài viết</Typography><Inline gap="sm"><Button variant="outline" disabled={page===1||busy} onClick={()=>setPage(p=>p-1)}>Trước</Button><Typography variant="small">Trang {page}</Typography><Button variant="outline" disabled={!query.data||page*query.data.limit>=query.data.total||busy} onClick={()=>setPage(p=>p+1)}>Tiếp</Button></Inline></Inline></Surface>
 <Dialog open={!!deleting} onOpenChange={open=>{if(!open&&!busy)setDeleting(null);}}><DialogContent className={s.dialog} closeLabel="Đóng"><DialogTitle>Xóa bài viết?</DialogTitle><DialogDescription>Bài viết “{deleting?.title_vi}” sẽ bị xóa vĩnh viễn. Ảnh không còn được sử dụng sẽ được xóa khỏi kho lưu trữ. Không thể hoàn tác.</DialogDescription>{error?<AlertMessage variant="destructive">{error}</AlertMessage>:null}<Inline className="justify-end"><Button variant="outline" disabled={busy} onClick={()=>setDeleting(null)}>Hủy</Button><Button variant="destructive" disabled={busy} onClick={()=>void remove()}>{busy?"Đang xóa…":"Xóa bài viết"}</Button></Inline></DialogContent></Dialog></Stack>;
}
