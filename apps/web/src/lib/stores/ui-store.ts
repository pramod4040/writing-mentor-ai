import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

type UiState = {
  sidebarCollapsed: boolean;
  theme: Theme;
  defaultMentorTypeId: string | null;
  writingFontSize: number;
  writeSidebarWidth: number;
  aiReviewSidebarWidth: number;
  contentPanelHeight: number;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setDefaultMentorTypeId: (id: string) => void;
  setWritingFontSize: (size: number) => void;
  setWriteSidebarWidth: (width: number) => void;
  setAiReviewSidebarWidth: (width: number) => void;
  setContentPanelHeight: (height: number) => void;
};

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 32;
export const DEFAULT_SIDEBAR_WIDTH = 320;
export const MIN_SIDEBAR_WIDTH = 240;
export const MAX_SIDEBAR_WIDTH_RATIO = 0.5;
export const DEFAULT_CONTENT_PANEL_HEIGHT = 160;
export const MIN_CONTENT_PANEL_HEIGHT = 80;
export const MAX_CONTENT_PANEL_HEIGHT_RATIO = 0.5;

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      theme: 'light',
      defaultMentorTypeId: null,
      writingFontSize: 22,
      writeSidebarWidth: DEFAULT_SIDEBAR_WIDTH,
      aiReviewSidebarWidth: DEFAULT_SIDEBAR_WIDTH,
      contentPanelHeight: DEFAULT_CONTENT_PANEL_HEIGHT,
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      setDefaultMentorTypeId: (id) => set({ defaultMentorTypeId: id }),
      setWritingFontSize: (size) =>
        set({
          writingFontSize: Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, size)),
        }),
      setWriteSidebarWidth: (width) => set({ writeSidebarWidth: width }),
      setAiReviewSidebarWidth: (width) => set({ aiReviewSidebarWidth: width }),
      setContentPanelHeight: (height) => set({ contentPanelHeight: height }),
    }),
    {
      name: 'writer-mentor-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        defaultMentorTypeId: state.defaultMentorTypeId,
        writingFontSize: state.writingFontSize,
        writeSidebarWidth: state.writeSidebarWidth,
        aiReviewSidebarWidth: state.aiReviewSidebarWidth,
        contentPanelHeight: state.contentPanelHeight,
      }),
    },
  ),
);

export { MIN_FONT_SIZE, MAX_FONT_SIZE };
