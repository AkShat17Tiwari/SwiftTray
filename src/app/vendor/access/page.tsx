"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Loader2, Store, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useAuthRole } from "@/hooks/use-auth-role";

export default function VendorAccessPage() {
  const router = useRouter();
  const auth = useAuthRole();
  const outlets = useQuery(api.outlets.list, {}) ?? [];
  const requests = useQuery(
    api.vendorAssignments.getByVendor,
    auth.isSignedIn ? {} : "skip"
  );
  const requestAccess = useMutation(api.vendorAssignments.request);
  const [outletId, setOutletId] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);

  if (auth.isLoaded && !auth.isSignedIn) {
    router.replace("/sign-in/student?next=/vendor/access");
    return null;
  }
  if (auth.hasVendorAccess) {
    router.replace("/vendor");
    return null;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!outletId) return;
    setPending(true);
    try {
      await requestAccess({
        outletId: outletId as Id<"outlets">,
        notes: notes.trim() || undefined,
      });
      toast.success("Vendor access request sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send request.");
    } finally {
      setPending(false);
    }
  };

  const pendingRequest = requests?.find((request) => request.status === "pending");
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-lg neu-card-static p-6 sm:p-8">
        <div className="w-12 h-12 rounded-2xl gradient-warning flex items-center justify-center shadow-colored mb-5">
          <Store className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold">Vendor access</h1>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          Vendor accounts are approved by an administrator and tied to exactly one outlet.
        </p>

        {pendingRequest ? (
          <div className="rounded-2xl neu-pressed p-5 text-center">
            <CheckCircle2 className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="font-bold mt-3">Approval pending</p>
            <p className="text-sm text-muted-foreground mt-1">
              An administrator will review your outlet request.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold">Outlet</span>
              <select
                value={outletId}
                onChange={(event) => setOutletId(event.target.value)}
                required
                className="w-full mt-2 px-4 py-3 rounded-xl neu-input text-sm"
              >
                <option value="">Choose an outlet</option>
                {outlets.map((outlet) => (
                  <option key={outlet._id} value={outlet._id}>{outlet.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Why do you need access?</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={300}
                rows={3}
                className="w-full mt-2 px-4 py-3 rounded-xl neu-input text-sm resize-none"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="w-full min-h-12 rounded-xl neu-btn-primary text-[#1A2E35] font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              Request vendor access
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
