"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Clock, Save } from "lucide-react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";

export default function VendorSettingsPage() {
  const workspace = useQuery(api.dashboards.vendorWorkspace, {});
  const updateSettings = useMutation(api.outlets.updateSettings);
  const toggleAvailability = useMutation(api.outlets.toggleAvailability);
  const outlet = workspace?.outlet;
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [open, setOpen] = useState("08:00");
  const [close, setClose] = useState("21:00");
  const [pending, setPending] = useState(false);
  useEffect(() => { if (!outlet) return; setName(outlet.name); setLocation(outlet.location); setEmail(outlet.contactEmail ?? ""); setPhone(outlet.contactPhone ?? ""); setOpen(outlet.operatingHours.open); setClose(outlet.operatingHours.close); }, [outlet]);
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!outlet) return; setPending(true); try { await updateSettings({ outletId: outlet._id, name, location, contactEmail: email || undefined, contactPhone: phone || undefined, open, close }); toast.success("Outlet settings saved"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save settings"); } finally { setPending(false); } };
  if (workspace === undefined) return <p className="py-20 text-center text-sm text-muted-foreground">Loading settings…</p>;
  if (!outlet) return <p className="py-20 text-center text-sm text-muted-foreground">An approved outlet assignment is required.</p>;
  return <form onSubmit={submit} className="space-y-6 max-w-2xl"><header><h1 className="text-2xl font-extrabold">Outlet <span className="gradient-text">Settings</span></h1><p className="text-sm text-muted-foreground">Changes save directly to the assigned outlet</p></header>
  <section className="glass-card p-5 flex justify-between gap-4 items-center"><div><h2 className="font-bold">Accepting orders</h2><p className="text-xs text-muted-foreground">Students can only place orders while the outlet is open.</p></div><button type="button" onClick={() => toggleAvailability({ outletId: outlet._id }).catch(() => toast.error("Could not change outlet status"))} aria-pressed={outlet.isOpen} className={`min-h-11 px-4 rounded-xl text-sm font-semibold ${outlet.isOpen ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-700"}`}>{outlet.isOpen ? "Open" : "Closed"}</button></section>
  <section className="glass-card p-5 grid gap-4"><h2 className="font-bold">Basic information</h2>{[["Outlet name",name,setName,"text"],["Location",location,setLocation,"text"],["Contact email",email,setEmail,"email"],["Contact phone",phone,setPhone,"tel"]] .map(([label,value,setter,type]) => <label key={String(label)} className="text-sm font-semibold">{String(label)}<input type={String(type)} value={String(value)} onChange={(event) => (setter as (value:string)=>void)(event.target.value)} required={label === "Outlet name" || label === "Location"} className="mt-2 w-full min-h-11 px-3 rounded-xl bg-secondary/50 border"/></label>)}</section>
  <section className="glass-card p-5 grid sm:grid-cols-2 gap-4"><h2 className="sm:col-span-2 font-bold flex items-center gap-2"><Clock className="w-4 h-4"/>Operating hours</h2><label className="text-sm font-semibold">Opening time<input type="time" value={open} onChange={(event) => setOpen(event.target.value)} required className="mt-2 w-full min-h-11 px-3 rounded-xl bg-secondary/50 border"/></label><label className="text-sm font-semibold">Closing time<input type="time" value={close} onChange={(event) => setClose(event.target.value)} required className="mt-2 w-full min-h-11 px-3 rounded-xl bg-secondary/50 border"/></label></section>
  <button disabled={pending} className="w-full min-h-12 rounded-xl gradient-primary text-white font-semibold flex justify-center items-center gap-2 disabled:opacity-60"><Save className="w-4 h-4"/>{pending ? "Saving…" : "Save changes"}</button></form>;
}
