"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";

type AnnouncementType = "info" | "warning" | "promotion" | "maintenance";
type TargetRole = "all" | "student" | "vendor";

export default function AdminAnnouncementsPage() {
  const announcements = useQuery(api.announcements.listAll, {});
  const create = useMutation(api.announcements.create);
  const update = useMutation(api.announcements.update);
  const remove = useMutation(api.announcements.remove);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<AnnouncementType>("info");
  const [targetRole, setTargetRole] = useState<TargetRole>("all");
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); setPending(true); try { await create({ title: title.trim(), content: content.trim(), type, targetRole }); setTitle(""); setContent(""); setOpen(false); toast.success("Announcement published"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not publish"); } finally { setPending(false); } };
  return <div className="space-y-6"><header className="flex justify-between gap-4"><div><h1 className="text-2xl font-extrabold">Campus <span className="gradient-text">Announcements</span></h1><p className="text-sm text-muted-foreground">Broadcast live messages by account role</p></div><button type="button" onClick={() => setOpen((value) => !value)} className="min-h-11 px-4 rounded-xl gradient-primary text-white text-sm font-semibold flex items-center gap-2"><Plus className="w-4 h-4"/>New</button></header>
  {open && <form onSubmit={submit} className="glass-card p-5 grid gap-4"><label className="text-sm font-semibold">Title<input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={4} maxLength={120} className="mt-2 w-full min-h-11 px-3 rounded-xl bg-secondary/50 border"/></label><label className="text-sm font-semibold">Message<textarea value={content} onChange={(event) => setContent(event.target.value)} required minLength={10} maxLength={1000} rows={4} className="mt-2 w-full p-3 rounded-xl bg-secondary/50 border"/></label><div className="grid sm:grid-cols-2 gap-4"><label className="text-sm font-semibold">Type<select value={type} onChange={(event) => setType(event.target.value as AnnouncementType)} className="mt-2 w-full min-h-11 px-3 rounded-xl bg-secondary/50 border"><option value="info">Information</option><option value="warning">Warning</option><option value="promotion">Promotion</option><option value="maintenance">Maintenance</option></select></label><label className="text-sm font-semibold">Audience<select value={targetRole} onChange={(event) => setTargetRole(event.target.value as TargetRole)} className="mt-2 w-full min-h-11 px-3 rounded-xl bg-secondary/50 border"><option value="all">Everyone</option><option value="student">Students</option><option value="vendor">Vendors</option></select></label></div><button disabled={pending} className="min-h-11 rounded-xl gradient-primary text-white font-semibold disabled:opacity-60">{pending ? "Publishing…" : "Publish announcement"}</button></form>}
  <div className="space-y-3">{announcements === undefined ? <p className="py-12 text-center text-sm text-muted-foreground">Loading announcements…</p> : announcements.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">No announcements yet.</p> : announcements.map((announcement) => <article key={announcement._id} className={`glass-card p-5 ${announcement.isActive ? "" : "opacity-60"}`}><div className="flex gap-4 justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{announcement.title}</h2><span className="px-2 py-1 rounded-full text-[10px] bg-secondary uppercase">{announcement.type}</span><span className="px-2 py-1 rounded-full text-[10px] bg-secondary">{announcement.targetRole}</span></div><p className="text-sm text-muted-foreground mt-2">{announcement.content}</p></div><div className="flex gap-2"><button type="button" onClick={() => update({ id: announcement._id, isActive: !announcement.isActive }).catch(() => toast.error("Could not update announcement"))} className="min-w-10 min-h-10 rounded-xl bg-secondary flex items-center justify-center" aria-label={announcement.isActive ? "Deactivate announcement" : "Activate announcement"}>{announcement.isActive ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}</button><button type="button" onClick={() => window.confirm("Delete this announcement?") && remove({ id: announcement._id }).catch(() => toast.error("Could not delete announcement"))} className="min-w-10 min-h-10 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center" aria-label="Delete announcement"><Trash2 className="w-4 h-4"/></button></div></div></article>)}</div></div>;
}
