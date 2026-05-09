import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

// ─── User slice ───────────────────────────────────────────────────────────────

interface UserState {
  id: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
  communityId: string | null;
  xp: number;
  streak: number;
  level: number;
  image: string | null;
  setUser: (user: Partial<Omit<UserState, "setUser" | "clearUser" | "addXp">>) => void;
  clearUser: () => void;
  addXp: (amount: number) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        id: null,
        name: null,
        email: null,
        role: null,
        communityId: null,
        xp: 0,
        streak: 0,
        level: 1,
        image: null,
        setUser: (user) => set((state) => ({ ...state, ...user })),
        clearUser: () =>
          set({ id: null, name: null, email: null, role: null, communityId: null, xp: 0, streak: 0, level: 1, image: null }),
        addXp: (amount) =>
          set((state) => {
            const newXp = state.xp + amount;
            const newLevel = Math.floor(newXp / 500) + 1;
            return { xp: newXp, level: newLevel };
          }),
      }),
      { name: "sikkimverse-user" }
    ),
    { name: "UserStore" }
  )
);

// ─── UI slice ─────────────────────────────────────────────────────────────────

interface UIState {
  sidebarOpen: boolean;
  notificationCount: number;
  activeLesson: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setNotificationCount: (count: number) => void;
  decrementNotifications: () => void;
  setActiveLesson: (id: string | null) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarOpen: false,
      notificationCount: 0,
      activeLesson: null,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setNotificationCount: (count) => set({ notificationCount: count }),
      decrementNotifications: () =>
        set((s) => ({ notificationCount: Math.max(0, s.notificationCount - 1) })),
      setActiveLesson: (id) => set({ activeLesson: id }),
    }),
    { name: "UIStore" }
  )
);

// ─── Learn slice ──────────────────────────────────────────────────────────────

interface LearnState {
  currentCourseId: string | null;
  currentLessonId: string | null;
  completedLessons: string[];
  quizScore: number | null;
  setCurrentCourse: (id: string | null) => void;
  setCurrentLesson: (id: string | null) => void;
  markLessonComplete: (id: string) => void;
  setQuizScore: (score: number | null) => void;
  resetLearnState: () => void;
}

export const useLearnStore = create<LearnState>()(
  devtools(
    persist(
      (set) => ({
        currentCourseId: null,
        currentLessonId: null,
        completedLessons: [],
        quizScore: null,
        setCurrentCourse: (id) => set({ currentCourseId: id }),
        setCurrentLesson: (id) => set({ currentLessonId: id }),
        markLessonComplete: (id) =>
          set((s) => ({
            completedLessons: s.completedLessons.includes(id)
              ? s.completedLessons
              : [...s.completedLessons, id],
          })),
        setQuizScore: (score) => set({ quizScore: score }),
        resetLearnState: () =>
          set({ currentCourseId: null, currentLessonId: null, quizScore: null }),
      }),
      { name: "sikkimverse-learn" }
    ),
    { name: "LearnStore" }
  )
);
