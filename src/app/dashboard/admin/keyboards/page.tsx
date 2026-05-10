"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Save, Globe, ChevronLeft, Settings2,
  CheckCircle2, Info, Keyboard, Copy, Eye, EyeOff,
  GripVertical, Smartphone, Monitor
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface KeyDef {
  id: string;
  primary: string;
  label: string;
  phonetic: string;
  alts: string;     // comma-separated alt chars
  row: number;
  col: number;
  width: number;
}

interface KeyboardLayout {
  id: string;
  name: string;
  community: string;
  script: string;
  layoutType: "mobile" | "desktop" | "both";
  isActive: boolean;
  keys: KeyDef[];
}

// Built-in templates per script
const SCRIPT_TEMPLATES: Record<string, Array<{ primary: string; label: string; phonetic: string }[]>> = {
  lepcha: [
    [
      { primary: "ᰀ", label: "ᰀ", phonetic: "Ka" },
      { primary: "ᰁ", label: "ᰁ", phonetic: "Kha" },
      { primary: "ᰂ", label: "ᰂ", phonetic: "Ga" },
      { primary: "ᰃ", label: "ᰃ", phonetic: "Nga" },
      { primary: "ᰄ", label: "ᰄ", phonetic: "Ca" },
      { primary: "ᰅ", label: "ᰅ", phonetic: "Cha" },
      { primary: "ᰆ", label: "ᰆ", phonetic: "Ja" },
      { primary: "ᰇ", label: "ᰇ", phonetic: "Nya" },
      { primary: "ᰈ", label: "ᰈ", phonetic: "Ta" },
      { primary: "ᰉ", label: "ᰉ", phonetic: "Tha" },
    ],
    [
      { primary: "ᰊ", label: "ᰊ", phonetic: "Da" },
      { primary: "ᰋ", label: "ᰋ", phonetic: "Na" },
      { primary: "ᰌ", label: "ᰌ", phonetic: "Pa" },
      { primary: "ᰍ", label: "ᰍ", phonetic: "Pha" },
      { primary: "ᰎ", label: "ᰎ", phonetic: "Ba" },
      { primary: "ᰏ", label: "ᰏ", phonetic: "Ma" },
      { primary: "ᰐ", label: "ᰐ", phonetic: "Tsa" },
      { primary: "ᰑ", label: "ᰑ", phonetic: "Tsha" },
      { primary: "ᰒ", label: "ᰒ", phonetic: "Dza" },
      { primary: "ᰓ", label: "ᰓ", phonetic: "Wa" },
    ],
    [
      { primary: "ᰔ", label: "ᰔ", phonetic: "Sha" },
      { primary: "ᰕ", label: "ᰕ", phonetic: "Sa" },
      { primary: "ᰖ", label: "ᰖ", phonetic: "Ha" },
      { primary: "ᰗ", label: "ᰗ", phonetic: "La" },
      { primary: "ᰘ", label: "ᰘ", phonetic: "Ra" },
      { primary: "ᰙ", label: "ᰙ", phonetic: "Ya" },
    ],
  ],
  tibetan: [
    [
      { primary: "ཀ", label: "ཀ", phonetic: "Ka" },
      { primary: "ཁ", label: "ཁ", phonetic: "Kha" },
      { primary: "ག", label: "ག", phonetic: "Ga" },
      { primary: "ང", label: "ང", phonetic: "Nga" },
      { primary: "ཅ", label: "ཅ", phonetic: "Ca" },
      { primary: "ཆ", label: "ཆ", phonetic: "Cha" },
      { primary: "ཇ", label: "ཇ", phonetic: "Ja" },
      { primary: "ཉ", label: "ཉ", phonetic: "Nya" },
      { primary: "ཏ", label: "ཏ", phonetic: "Ta" },
      { primary: "ཐ", label: "ཐ", phonetic: "Tha" },
    ],
    [
      { primary: "ད", label: "ད", phonetic: "Da" },
      { primary: "ན", label: "ན", phonetic: "Na" },
      { primary: "པ", label: "པ", phonetic: "Pa" },
      { primary: "ཕ", label: "ཕ", phonetic: "Pha" },
      { primary: "བ", label: "བ", phonetic: "Ba" },
      { primary: "མ", label: "མ", phonetic: "Ma" },
      { primary: "ཙ", label: "ཙ", phonetic: "Tsa" },
      { primary: "ཚ", label: "ཚ", phonetic: "Tsha" },
      { primary: "ཛ", label: "ཛ", phonetic: "Dza" },
      { primary: "ཝ", label: "ཝ", phonetic: "Wa" },
    ],
  ],
};

function makeKeysFromTemplate(script: string): KeyDef[] {
  const rows = SCRIPT_TEMPLATES[script] ?? SCRIPT_TEMPLATES.lepcha;
  const keys: KeyDef[] = [];
  let id = 1;
  rows.forEach((row, ri) => {
    row.forEach((k, ci) => {
      keys.push({ id: String(id++), ...k, alts: "", row: ri, col: ci, width: 1 });
    });
  });
  return keys;
}

const SAMPLE_COMMUNITIES = ["Lepcha", "Bhutia", "Limbu", "Tamang", "Rai"];
const SCRIPTS = ["lepcha", "tibetan", "limbu", "devanagari", "custom"];

export default function KeyboardBuilderPage() {
  const [layouts, setLayouts] = useState<KeyboardLayout[]>([
    {
      id: "1",
      name: "Lepcha Standard",
      community: "Lepcha",
      script: "lepcha",
      layoutType: "both",
      isActive: true,
      keys: makeKeysFromTemplate("lepcha"),
    },
  ]);

  const [activeLayoutId, setActiveLayoutId] = useState("1");
  const [editingKey, setEditingKey] = useState<KeyDef | null>(null);
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  const [saved, setSaved] = useState(false);
  const [showAddLayout, setShowAddLayout] = useState(false);
  const [newLayout, setNewLayout] = useState<{ name: string; community: string; script: string; layoutType: "mobile" | "desktop" | "both" }>({ name: "", community: "Lepcha", script: "lepcha", layoutType: "both" });

  const activeLayout = layouts.find((l) => l.id === activeLayoutId) ?? layouts[0];

  const rows = activeLayout
    ? Array.from(new Set(activeLayout.keys.map((k) => k.row))).sort()
    : [];

  const keysInRow = (row: number) =>
    activeLayout?.keys.filter((k) => k.row === row).sort((a, b) => a.col - b.col) ?? [];

  const updateKey = useCallback((updated: KeyDef) => {
    setLayouts((prev) =>
      prev.map((layout) =>
        layout.id === activeLayoutId
          ? { ...layout, keys: layout.keys.map((k) => (k.id === updated.id ? updated : k)) }
          : layout
      )
    );
    setEditingKey(null);
  }, [activeLayoutId]);

  const deleteKey = useCallback((keyId: string) => {
    setLayouts((prev) =>
      prev.map((layout) =>
        layout.id === activeLayoutId
          ? { ...layout, keys: layout.keys.filter((k) => k.id !== keyId) }
          : layout
      )
    );
    setEditingKey(null);
  }, [activeLayoutId]);

  const addKey = useCallback((row: number) => {
    const newKey: KeyDef = {
      id: String(Date.now()),
      primary: "?",
      label: "?",
      phonetic: "",
      alts: "",
      row,
      col: (activeLayout?.keys.filter((k) => k.row === row).length ?? 0),
      width: 1,
    };
    setLayouts((prev) =>
      prev.map((layout) =>
        layout.id === activeLayoutId
          ? { ...layout, keys: [...layout.keys, newKey] }
          : layout
      )
    );
    setEditingKey(newKey);
  }, [activeLayoutId, activeLayout]);

  const addRow = useCallback(() => {
    const maxRow = Math.max(-1, ...(activeLayout?.keys.map((k) => k.row) ?? []));
    addKey(maxRow + 1);
  }, [activeLayout, addKey]);

  const addLayout = useCallback(() => {
    const id = String(Date.now());
    setLayouts((prev) => [
      ...prev,
      {
        id,
        name: newLayout.name || `${newLayout.community} Keyboard`,
        community: newLayout.community,
        script: newLayout.script,
        layoutType: newLayout.layoutType,
        isActive: false,
        keys: makeKeysFromTemplate(newLayout.script),
      },
    ]);
    setActiveLayoutId(id);
    setShowAddLayout(false);
    setNewLayout({ name: "", community: "Lepcha", script: "lepcha", layoutType: "both" });
  }, [newLayout]);

  const toggleActive = useCallback((layoutId: string) => {
    setLayouts((prev) =>
      prev.map((l) => ({ ...l, isActive: l.id === layoutId ? !l.isActive : l.isActive }))
    );
  }, []);

  const handleSave = useCallback(async () => {
    // In production: POST /api/admin/keyboards with layout data
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-5 border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link href="/dashboard/admin" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-primary" />
              <h1 className="text-white font-bold text-lg">Keyboard Builder</h1>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Create and manage community script keyboards</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddLayout(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-all"
            >
              <Plus className="w-4 h-4" /> New Keyboard
            </button>
            <button
              onClick={handleSave}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                saved ? "bg-emerald-600 text-white" : "bg-primary text-white hover:bg-primary/90"
              )}
            >
              {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save</>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 flex-col lg:flex-row">
        {/* Sidebar: Layouts */}
        <div className="lg:w-64 shrink-0 space-y-3">
          <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider">Keyboards</h2>
          {layouts.map((layout) => (
            <div
              key={layout.id}
              onClick={() => setActiveLayoutId(layout.id)}
              className={cn(
                "rounded-xl border p-3 cursor-pointer transition-all",
                activeLayoutId === layout.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background-secondary hover:border-primary/30"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-foreground truncate">{layout.name}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleActive(layout.id); }}
                  className={cn(
                    "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors",
                    layout.isActive
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-border text-foreground-muted"
                  )}
                >
                  {layout.isActive ? "Active" : "Draft"}
                </button>
              </div>
              <p className="text-xs text-foreground-muted">{layout.community} · {layout.script}</p>
              <p className="text-xs text-foreground-muted">{layout.keys.length} keys · {layout.layoutType}</p>
            </div>
          ))}

          {/* Info */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Active keyboards appear in lessons, AI tutor, contributor uploads, and writing practice.
              </p>
            </div>
          </div>
        </div>

        {/* Main: Builder */}
        <div className="flex-1 space-y-4">
          {activeLayout && (
            <>
              {/* Layout settings */}
              <div className="bg-background-secondary rounded-2xl border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Settings2 className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold text-foreground">Layout Settings</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-foreground-muted block mb-1">Name</label>
                    <input
                      value={activeLayout.name}
                      onChange={(e) => setLayouts((prev) => prev.map((l) => l.id === activeLayoutId ? { ...l, name: e.target.value } : l))}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-foreground-muted block mb-1">Community</label>
                    <select
                      value={activeLayout.community}
                      onChange={(e) => setLayouts((prev) => prev.map((l) => l.id === activeLayoutId ? { ...l, community: e.target.value } : l))}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
                    >
                      {SAMPLE_COMMUNITIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-foreground-muted block mb-1">Script</label>
                    <select
                      value={activeLayout.script}
                      onChange={(e) => setLayouts((prev) => prev.map((l) => l.id === activeLayoutId ? { ...l, script: e.target.value } : l))}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
                    >
                      {SCRIPTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-foreground-muted block mb-1">Device</label>
                    <select
                      value={activeLayout.layoutType}
                      onChange={(e) => setLayouts((prev) => prev.map((l) => l.id === activeLayoutId ? { ...l, layoutType: e.target.value as "mobile" | "desktop" | "both" } : l))}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="both">Both</option>
                      <option value="mobile">Mobile only</option>
                      <option value="desktop">Desktop only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Key editor */}
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Left: key layout canvas */}
                <div className="bg-background-secondary rounded-2xl border border-border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                      <Keyboard className="w-4 h-4 text-primary" /> Key Layout
                    </h2>
                    <button onClick={addRow} className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add Row
                    </button>
                  </div>

                  <div className="space-y-2">
                    {rows.map((row) => (
                      <div key={row} className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-foreground-muted w-5 text-center shrink-0">{row + 1}</span>
                        {keysInRow(row).map((key) => (
                          <button
                            key={key.id}
                            onClick={() => setEditingKey(editingKey?.id === key.id ? null : key)}
                            className={cn(
                              "flex flex-col items-center justify-center rounded-xl border transition-all",
                              "min-w-[42px] h-12 px-1",
                              editingKey?.id === key.id
                                ? "border-primary bg-primary/10 shadow-sm shadow-primary/20"
                                : "border-border bg-background hover:border-primary/40 hover:bg-primary/5"
                            )}
                            style={{ width: `${key.width * 42}px` }}
                          >
                            <span className="text-lg leading-none">{key.label}</span>
                            {key.phonetic && (
                              <span className="text-[9px] text-foreground-muted leading-none mt-0.5">{key.phonetic}</span>
                            )}
                          </button>
                        ))}
                        <button
                          onClick={() => addKey(row)}
                          className="flex items-center justify-center w-8 h-8 rounded-lg border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-foreground-muted" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-foreground-muted mt-3 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Click any key to edit it. Click + to add.
                  </p>
                </div>

                {/* Right: key editor form */}
                <div className="bg-background-secondary rounded-2xl border border-border p-5">
                  <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-primary" /> Key Properties
                  </h2>

                  {editingKey ? (
                    <KeyEditor
                      key={editingKey.id}
                      initial={editingKey}
                      onSave={updateKey}
                      onDelete={() => deleteKey(editingKey.id)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <Keyboard className="w-10 h-10 text-foreground-muted mb-3" />
                      <p className="text-sm text-foreground-muted">Select a key to edit its properties</p>
                      <p className="text-xs text-foreground-muted mt-1">Or click + to add a new key</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-background-secondary rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" /> Live Preview
                  </h2>
                  <div className="flex gap-1 bg-background rounded-xl border border-border overflow-hidden">
                    <button
                      onClick={() => setPreviewMode("mobile")}
                      className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all",
                        previewMode === "mobile" ? "bg-primary text-white" : "text-foreground-muted hover:text-foreground"
                      )}
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Mobile
                    </button>
                    <button
                      onClick={() => setPreviewMode("desktop")}
                      className={cn("flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all",
                        previewMode === "desktop" ? "bg-primary text-white" : "text-foreground-muted hover:text-foreground"
                      )}
                    >
                      <Monitor className="w-3.5 h-3.5" /> Desktop
                    </button>
                  </div>
                </div>

                <div className={cn(
                  "mx-auto border-2 border-border rounded-2xl bg-background-tertiary overflow-hidden",
                  previewMode === "mobile" ? "max-w-sm" : "max-w-full"
                )}>
                  <div className="p-2 space-y-1.5">
                    {rows.map((row) => (
                      <div key={row} className="flex gap-1 justify-center flex-wrap">
                        {keysInRow(row).map((key) => (
                          <div
                            key={key.id}
                            className="flex flex-col items-center justify-center rounded-xl bg-background border border-border shadow-sm"
                            style={{ width: `${key.width * (previewMode === "mobile" ? 38 : 46)}px`, height: previewMode === "mobile" ? "48px" : "52px" }}
                          >
                            <span className={cn("leading-none", previewMode === "mobile" ? "text-base" : "text-lg")}>{key.label}</span>
                            {key.phonetic && (
                              <span className="text-[9px] text-foreground-muted mt-0.5">{key.phonetic}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}

                    {/* Space + Backspace row */}
                    <div className="flex gap-1 justify-between px-2">
                      <div className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground-muted">🌐 EN</div>
                      <div className="flex-1 py-2 rounded-xl bg-background border border-border text-xs text-center text-foreground-muted">space</div>
                      <div className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-foreground-muted">⌫</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Layout Modal */}
      <AnimatePresence>
        {showAddLayout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddLayout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              className="bg-background rounded-2xl border border-border p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-foreground mb-4">New Keyboard Layout</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-foreground-muted block mb-1">Layout Name</label>
                  <input
                    value={newLayout.name}
                    onChange={(e) => setNewLayout((v) => ({ ...v, name: e.target.value }))}
                    placeholder="e.g., Lepcha Standard Mobile"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background-secondary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground-muted block mb-1">Community</label>
                  <select
                    value={newLayout.community}
                    onChange={(e) => setNewLayout((v) => ({ ...v, community: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background-secondary focus:outline-none focus:border-primary"
                  >
                    {SAMPLE_COMMUNITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-foreground-muted block mb-1">Script</label>
                  <select
                    value={newLayout.script}
                    onChange={(e) => setNewLayout((v) => ({ ...v, script: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background-secondary focus:outline-none focus:border-primary"
                  >
                    {SCRIPTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-foreground-muted block mb-1">Device Target</label>
                  <div className="flex gap-2">
                    {(["mobile", "desktop", "both"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setNewLayout((v) => ({ ...v, layoutType: t }))}
                        className={cn(
                          "flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-all",
                          newLayout.layoutType === t ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground-muted hover:border-primary/30"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowAddLayout(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground-muted hover:text-foreground transition-colors">Cancel</button>
                <button onClick={addLayout} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all">Create Keyboard</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Key Editor Form ────────────────────────────────────────────────────────────

function KeyEditor({
  initial,
  onSave,
  onDelete,
}: {
  initial: KeyDef;
  onSave: (k: KeyDef) => void;
  onDelete: () => void;
}) {
  const [form, setForm] = useState(initial);

  return (
    <div className="space-y-3">
      <div className="flex justify-center mb-2">
        <div className="w-16 h-16 rounded-2xl bg-background border-2 border-primary/30 flex flex-col items-center justify-center">
          <span className="text-3xl leading-none">{form.label || "?"}</span>
          {form.phonetic && <span className="text-[10px] text-foreground-muted mt-0.5">{form.phonetic}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-foreground-muted block mb-1">Character (Unicode)</label>
          <input
            value={form.primary}
            onChange={(e) => setForm((v) => ({ ...v, primary: e.target.value, label: e.target.value }))}
            className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-lg text-center focus:outline-none focus:border-primary"
            maxLength={4}
          />
        </div>
        <div>
          <label className="text-xs text-foreground-muted block mb-1">Display Label</label>
          <input
            value={form.label}
            onChange={(e) => setForm((v) => ({ ...v, label: e.target.value }))}
            className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-center focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-foreground-muted block mb-1">Phonetic hint</label>
        <input
          value={form.phonetic}
          onChange={(e) => setForm((v) => ({ ...v, phonetic: e.target.value }))}
          placeholder="e.g., Ka, Tha, Nga"
          className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="text-xs text-foreground-muted block mb-1">Long-press variants (comma-separated)</label>
        <input
          value={form.alts}
          onChange={(e) => setForm((v) => ({ ...v, alts: e.target.value }))}
          placeholder="e.g., ᰀ꩞,ᰀᰧ"
          className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="text-xs text-foreground-muted block mb-1">Width multiplier</label>
        <div className="flex gap-2">
          {[0.5, 1, 1.5, 2].map((w) => (
            <button
              key={w}
              onClick={() => setForm((v) => ({ ...v, width: w }))}
              className={cn(
                "flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all",
                form.width === w ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground-muted hover:border-primary/30"
              )}
            >
              {w}×
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onDelete()}
          className="flex items-center gap-1.5 px-3 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
        <button
          onClick={() => onSave(form)}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
        >
          <Save className="w-4 h-4" /> Apply Changes
        </button>
      </div>
    </div>
  );
}
