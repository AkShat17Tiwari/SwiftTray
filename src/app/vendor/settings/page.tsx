"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Clock, MapPin, Phone, Mail, Globe } from "lucide-react";

export default function VendorSettingsPage() {
  const [outletName, setOutletName] = useState("Spice Junction");
  const [location, setLocation] = useState("Block A, Ground Floor, Main Campus");
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("21:00");
  const [isOpen, setIsOpen] = useState(true);
  const [contactEmail, setContactEmail] = useState("spice@campus.edu");
  const [contactPhone, setContactPhone] = useState("+91 98765 43210");

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold mb-1">
          Outlet <span className="gradient-text">Settings</span>
        </h1>
        <p className="text-sm text-muted-foreground">Manage your outlet profile and operating hours</p>
      </motion.div>

      {/* Outlet Status */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold mb-1">Outlet Status</h2>
            <p className="text-xs text-muted-foreground">Toggle your outlet availability for students</p>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${isOpen ? "bg-emerald-500" : "bg-muted"}`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${isOpen ? "right-1" : "left-1"}`} />
          </button>
        </div>
        <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-medium ${isOpen ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
          {isOpen ? "✅ Your outlet is currently accepting orders" : "⛔ Your outlet is currently closed"}
        </div>
      </motion.div>

      {/* Basic Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-bold">Basic Information</h2>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Outlet Name</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={outletName} onChange={(e) => setOutletName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Contact Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Contact Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Operating Hours */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 space-y-4">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Operating Hours
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Opening Time</label>
            <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Closing Time</label>
            <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-6 py-3 rounded-xl gradient-primary text-white font-semibold shadow-colored flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        Save Changes
      </motion.button>
    </div>
  );
}
