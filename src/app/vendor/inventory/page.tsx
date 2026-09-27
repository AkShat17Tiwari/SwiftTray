"use client";

import { useState } from "react";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { AlertTriangle, Check, Package, Search } from "lucide-react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";

export default function VendorInventoryPage() {
  const [search, setSearch] = useState("");
  const workspace = useQuery(api.dashboards.vendorWorkspace, {});
  const items = useQuery(api.menuItems.listForManagement, workspace?.outlet ? { outletId: workspace.outlet._id } : "skip");
  const toggle = useMutation(api.menuItems.toggleAvailability);
  const visible = (items ?? []).filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()));
  const available = (items ?? []).filter((item) => item.isAvailable).length;
  return <div className="space-y-6"><header><h1 className="text-2xl font-extrabold">Inventory <span className="gradient-text">Control</span></h1><p className="text-sm text-muted-foreground">Live menu availability for {workspace?.outlet.name ?? "your outlet"}</p></header>
  <div className="grid grid-cols-3 gap-4">{[[Package,items?.length ?? 0,"Total items","text-indigo-500"],[Check,available,"In stock","text-emerald-600"],[AlertTriangle,(items?.length ?? 0)-available,"Unavailable","text-red-600"]].map(([Icon,value,label,color]) => { const Component = Icon as typeof Package; return <div key={String(label)} className="glass-card p-4 text-center"><Component className={`w-5 h-5 mx-auto mb-2 ${color}`}/><p className="text-xl font-extrabold">{String(value)}</p><p className="text-xs text-muted-foreground">{String(label)}</p></div>; })}</div>
  <label className="relative block"><span className="sr-only">Search inventory</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search inventory" className="w-full min-h-11 pl-10 pr-4 rounded-xl bg-secondary/50 border"/></label>
  <div className="glass-card overflow-hidden">{workspace === undefined || (workspace?.outlet && items === undefined) ? <p className="p-12 text-center text-sm text-muted-foreground">Loading inventory…</p> : !workspace?.outlet ? <p className="p-12 text-center text-sm text-muted-foreground">An approved outlet assignment is required.</p> : visible.length === 0 ? <p className="p-12 text-center text-sm text-muted-foreground">No matching items.</p> : visible.map((item) => <div key={item._id} className="flex items-center gap-4 p-4 border-b last:border-0"><Image src={item.image} alt="" width={40} height={40} className="w-10 h-10 rounded-xl object-cover"/><div className="flex-1 min-w-0"><p className="font-semibold truncate">{item.name}</p><p className="text-xs text-muted-foreground">{item.category} · {item.prepTime} min</p></div><button type="button" onClick={() => toggle({ id: item._id }).catch((error) => toast.error(error instanceof Error ? error.message : "Could not update item"))} aria-pressed={item.isAvailable} className={`min-h-10 px-3 rounded-xl text-xs font-semibold ${item.isAvailable ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-700"}`}>{item.isAvailable ? "In stock" : "Unavailable"}</button></div>)}</div></div>;
}
