"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Delete, Space, Globe, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Built-in script data ───────────────────────────────────────────────────────

interface KeyDef {
  primary: string;
  label: string;
  phonetic?: string;
  alts?: Array<{ char: string; label: string }>;
  width?: number;
}

type KeyRow = KeyDef[];

interface ScriptLayout {
  name: string;
  code: string;
  rows: KeyRow[];
}

const LEPCHA_LAYOUT: ScriptLayout = {
  name: "Lepcha (Róng)",
  code: "lepcha",
  rows: [
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
      // Vowel diacritics
      { primary: "ᰣ", label: "ᰣ", phonetic: "AA" },
      { primary: "ᰤ", label: "ᰤ", phonetic: "I" },
      { primary: "ᰥ", label: "ᰥ", phonetic: "U" },
      { primary: "ᰦ", label: "ᰦ", phonetic: "E" },
    ],
  ],
};

const LIMBU_LAYOUT: ScriptLayout = {
  name: "Limbu (Sirijonga)",
  code: "limbu",
  rows: [
    [
      { primary: "ᤁ", label: "ᤁ", phonetic: "Ka" },
      { primary: "ᤂ", label: "ᤂ", phonetic: "Kha" },
      { primary: "ᤃ", label: "ᤃ", phonetic: "Ga" },
      { primary: "ᤄ", label: "ᤄ", phonetic: "Gha" },
      { primary: "ᤅ", label: "ᤅ", phonetic: "Nga" },
      { primary: "ᤆ", label: "ᤆ", phonetic: "Ca" },
      { primary: "ᤇ", label: "ᤇ", phonetic: "Cha" },
      { primary: "ᤈ", label: "ᤈ", phonetic: "Ja" },
      { primary: "ᤉ", label: "ᤉ", phonetic: "Jha" },
      { primary: "ᤊ", label: "ᤊ", phonetic: "Nya" },
    ],
    [
      { primary: "ᤋ", label: "ᤋ", phonetic: "Ta" },
      { primary: "ᤌ", label: "ᤌ", phonetic: "Tha" },
      { primary: "ᤍ", label: "ᤍ", phonetic: "Da" },
      { primary: "ᤎ", label: "ᤎ", phonetic: "Dha" },
      { primary: "ᤏ", label: "ᤏ", phonetic: "Na" },
      { primary: "ᤐ", label: "ᤐ", phonetic: "Pa" },
      { primary: "ᤑ", label: "ᤑ", phonetic: "Pha" },
      { primary: "ᤒ", label: "ᤒ", phonetic: "Ba" },
      { primary: "ᤓ", label: "ᤓ", phonetic: "Bha" },
      { primary: "ᤔ", label: "ᤔ", phonetic: "Ma" },
    ],
    [
      { primary: "ᤕ", label: "ᤕ", phonetic: "Ya" },
      { primary: "ᤖ", label: "ᤖ", phonetic: "Ra" },
      { primary: "ᤗ", label: "ᤗ", phonetic: "La" },
      { primary: "ᤘ", label: "ᤘ", phonetic: "Wa" },
      { primary: "ᤙ", label: "ᤙ", phonetic: "Sa" },
      { primary: "ᤚ", label: "ᤚ", phonetic: "Sha" },
      { primary: "ᤛ", label: "ᤛ", phonetic: "Ssa" },
      { primary: "ᤜ", label: "ᤜ", phonetic: "Ha" },
    ],
  ],
};

const TIBETAN_LAYOUT: ScriptLayout = {
  name: "Bhutia (Tibetan Script)",
  code: "tibetan",
  rows: [
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
    [
      { primary: "ཞ", label: "ཞ", phonetic: "Zha" },
      { primary: "ཟ", label: "ཟ", phonetic: "Za" },
      { primary: "འ", label: "འ", phonetic: "'A" },
      { primary: "ཡ", label: "ཡ", phonetic: "Ya" },
      { primary: "ར", label: "ར", phonetic: "Ra" },
      { primary: "ལ", label: "ལ", phonetic: "La" },
      { primary: "ཤ", label: "ཤ", phonetic: "Sha" },
      { primary: "ས", label: "ས", phonetic: "Sa" },
      { primary: "ཧ", label: "ཧ", phonetic: "Ha" },
      { primary: "་", label: "་", phonetic: "·" },
    ],
  ],
};

export const BUILT_IN_SCRIPTS: ScriptLayout[] = [
  LEPCHA_LAYOUT,
  LIMBU_LAYOUT,
  TIBETAN_LAYOUT,
];

// ── Component ──────────────────────────────────────────────────────────────────

interface NativeKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
  communityCode?: string;
  className?: string;
  showPhonetics?: boolean;
}

export default function NativeKeyboard({
  value,
  onChange,
  onClose,
  communityCode,
  className,
  showPhonetics = true,
}: NativeKeyboardProps) {
  const [activeScript, setActiveScript] = useState<ScriptLayout>(() => {
    if (communityCode === "bhutia" || communityCode === "tibetan") return TIBETAN_LAYOUT;
    if (communityCode === "limbu") return LIMBU_LAYOUT;
    return LEPCHA_LAYOUT;
  });
  const [isEnglish, setIsEnglish] = useState(false);
  const [longPressKey, setLongPressKey] = useState<KeyDef | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const insertChar = useCallback((char: string) => {
    onChange(value + char);
  }, [value, onChange]);

  const backspace = useCallback(() => {
    // Handle surrogate pairs and combining chars properly
    const arr = [...value];
    arr.pop();
    onChange(arr.join(""));
  }, [value, onChange]);

  const handleKeyDown = useCallback((key: KeyDef) => {
    longPressTimer.current = setTimeout(() => {
      if (key.alts && key.alts.length > 0) {
        setLongPressKey(key);
      }
    }, 400);
  }, []);

  const handleKeyUp = useCallback((key: KeyDef) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!longPressKey) {
      insertChar(key.primary);
    }
  }, [insertChar, longPressKey]);

  const handleAltSelect = useCallback((char: string) => {
    insertChar(char);
    setLongPressKey(null);
  }, [insertChar]);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  const ENGLISH_ROWS = [
    "qwertyuiop".split(""),
    "asdfghjkl".split(""),
    "zxcvbnm".split(""),
  ];

  return (
    <div className={cn("bg-background-secondary border border-border rounded-2xl overflow-hidden shadow-lg", className)}>
      {/* Script selector */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-background-tertiary">
        <Globe className="w-4 h-4 text-foreground-muted shrink-0" />
        <div className="flex gap-1 flex-1 overflow-x-auto">
          {BUILT_IN_SCRIPTS.map((s) => (
            <button
              key={s.code}
              onClick={() => { setActiveScript(s); setIsEnglish(false); }}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0",
                !isEnglish && activeScript.code === s.code
                  ? "bg-primary text-white"
                  : "text-foreground-muted hover:text-foreground hover:bg-border"
              )}
            >
              {s.name.split(" ")[0]}
            </button>
          ))}
          <button
            onClick={() => setIsEnglish(true)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0",
              isEnglish ? "bg-primary text-white" : "text-foreground-muted hover:text-foreground hover:bg-border"
            )}
          >
            English
          </button>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-border transition-colors shrink-0">
            <X className="w-4 h-4 text-foreground-muted" />
          </button>
        )}
      </div>

      {/* Keys */}
      <div className="p-2 space-y-1.5">
        {isEnglish
          ? ENGLISH_ROWS.map((row, ri) => (
              <div key={ri} className="flex gap-1 justify-center">
                {row.map((ch) => (
                  <button
                    key={ch}
                    onPointerDown={(e) => { e.preventDefault(); insertChar(ch); }}
                    className="flex-1 max-w-[38px] h-10 rounded-xl bg-background border border-border text-foreground text-sm font-medium
                      hover:bg-primary/10 hover:border-primary/40 active:scale-95 transition-all touch-none select-none"
                  >
                    {ch.toUpperCase()}
                  </button>
                ))}
              </div>
            ))
          : activeScript.rows.map((row, ri) => (
              <div key={ri} className="flex gap-1 justify-center flex-wrap">
                {row.map((key) => (
                  <div key={key.primary} className="relative">
                    <button
                      onPointerDown={(e) => { e.preventDefault(); handleKeyDown(key); }}
                      onPointerUp={(e) => { e.preventDefault(); handleKeyUp(key); }}
                      onPointerLeave={() => {
                        if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
                      }}
                      className="flex flex-col items-center justify-center h-12 min-w-[40px] px-2 rounded-xl
                        bg-background border border-border hover:bg-primary/10 hover:border-primary/40
                        active:scale-95 transition-all touch-none select-none"
                      style={{ width: key.width ? `${key.width * 40}px` : undefined }}
                    >
                      <span className="text-lg leading-none">{key.label}</span>
                      {showPhonetics && key.phonetic && (
                        <span className="text-[9px] text-foreground-muted mt-0.5 leading-none">{key.phonetic}</span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ))
        }

        {/* Control row */}
        <div className="flex gap-1 justify-between mt-1">
          <button
            onPointerDown={(e) => { e.preventDefault(); setIsEnglish((v) => !v); }}
            className="flex items-center gap-1 px-3 h-10 rounded-xl bg-background border border-border text-xs text-foreground-muted
              hover:bg-primary/10 hover:border-primary/40 active:scale-95 transition-all touch-none select-none"
          >
            <Globe className="w-3.5 h-3.5" />
            {isEnglish ? activeScript.name.split(" ")[0] : "EN"}
          </button>
          <button
            onPointerDown={(e) => { e.preventDefault(); insertChar(" "); }}
            className="flex-1 h-10 rounded-xl bg-background border border-border text-xs text-foreground-muted
              hover:bg-primary/10 hover:border-primary/40 active:scale-95 transition-all touch-none select-none"
          >
            space
          </button>
          <button
            onPointerDown={(e) => { e.preventDefault(); backspace(); }}
            className="flex items-center gap-1 px-3 h-10 rounded-xl bg-background border border-border
              hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 active:scale-95 transition-all touch-none select-none"
          >
            <Delete className="w-4 h-4 text-foreground-muted" />
          </button>
        </div>
      </div>

      {/* Long-press popup */}
      <AnimatePresence>
        {longPressKey && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-2xl"
            onClick={() => setLongPressKey(null)}
          >
            <motion.div
              className="bg-background border border-border rounded-2xl p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs text-foreground-muted mb-3 text-center">Variants of {longPressKey.label}</p>
              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  onClick={() => handleAltSelect(longPressKey.primary)}
                  className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors"
                >
                  <span className="text-xl">{longPressKey.label}</span>
                  <span className="text-[9px] text-foreground-muted">{longPressKey.phonetic}</span>
                </button>
                {longPressKey.alts?.map((alt) => (
                  <button
                    key={alt.char}
                    onClick={() => handleAltSelect(alt.char)}
                    className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-background border border-border hover:bg-primary/10 transition-colors"
                  >
                    <span className="text-xl">{alt.label}</span>
                    <span className="text-[9px] text-foreground-muted">{alt.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Inline keyboard trigger ────────────────────────────────────────────────────

interface KeyboardInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  communityCode?: string;
  className?: string;
  inputClassName?: string;
  label?: string;
}

export function KeyboardInput({
  value,
  onChange,
  placeholder,
  communityCode,
  className,
  inputClassName,
  label,
}: KeyboardInputProps) {
  const [showKeyboard, setShowKeyboard] = useState(false);

  return (
    <div className={cn("relative", className)}>
      {label && <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowKeyboard(true)}
          placeholder={placeholder}
          className={cn(
            "w-full px-4 py-2.5 pr-10 rounded-xl border border-border bg-background text-foreground",
            "focus:outline-none focus:border-primary placeholder:text-foreground-muted",
            inputClassName
          )}
        />
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); setShowKeyboard((v) => !v); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
          title="Toggle native keyboard"
        >
          <Globe className="w-4 h-4 text-foreground-muted" />
        </button>
      </div>
      <AnimatePresence>
        {showKeyboard && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <NativeKeyboard
              value={value}
              onChange={onChange}
              onClose={() => setShowKeyboard(false)}
              communityCode={communityCode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
