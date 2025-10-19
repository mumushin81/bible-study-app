# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Language Preference

**IMPORTANT: Always respond in Korean (한국어) when working in this repository.** This project is primarily focused on Korean users studying Hebrew Bible verses, and the maintainer prefers Korean communication.

## Project Overview

This is "Eden Bible Study App" - a React-based mobile-responsive web application for studying Genesis verses in Hebrew with detailed commentary and flashcard learning features. The app provides:

- Hebrew verse display with IPA pronunciation and Korean transliteration
- Modern Korean translation/paraphrase
- Interactive flashcard system for Hebrew word learning
- Deep theological commentary with color-coded sections
- Progressive web app features with dark/light theme toggle

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
tsc -b

# Run end-to-end tests (Playwright)
npx playwright test

# Run specific test file
npx playwright test tests/app.spec.ts

# Run tests in UI mode
npx playwright test --ui

# Generate test report
npx playwright show-report

# Crawl Genesis chapter data (utility script)
npm run crawl
```

## Architecture Overview

### Core Structure
- **React 18** with TypeScript
- **Vite** as build tool
- **Tailwind CSS** for styling with glassmorphism design patterns
- **Framer Motion** for smooth animations and transitions
- **Zustand** for state management (user preferences, bookmarks, progress)

### Key Directories
- `src/components/` - Reusable UI components (tabs, flashcards, bottom sheets)
- `src/data/` - Static data files (verses, bible books catalog)
- `src/store/` - Zustand store for user state persistence
- `src/types/` - TypeScript interfaces for verses, words, commentary
- `scripts/` - Utility scripts (web crawling for Hebrew text extraction)

### Data Model Hierarchy
```
Verse
├── Basic info (id, reference, hebrew, ipa, korean, modern)
├── words[] - Array of Word objects for flashcard learning
└── commentary? - Optional deep study content
    ├── intro - Contextual introduction
    ├── sections[] - Color-coded theological analysis cards
    ├── whyQuestion? - Child-friendly Q&A
    └── conclusion? - Theological significance
```

### Component Architecture
- **App.tsx** - Main container with swipe navigation and tab management
- **StudyTab.tsx** - Primary study interface with collapsible flashcards and commentary
- **FlashCard.tsx** - Interactive Hebrew word learning cards with flip animations
- **SwipeableContent.tsx** - Touch gesture handling for verse navigation
- **BottomNavigation.tsx** - Tab-based navigation system

### State Management
- **userStore.ts** - Persistent user data (points, level, studied verses, dark mode)
- Local storage for bookmarked words and UI preferences
- Real-time state for flashcard flip status and commentary section visibility

## Development Guidelines

### Responsive Design Principles
- Use `clamp()` for responsive typography instead of fixed font sizes
- Prioritize responsive layouts over scroll implementations
- Pattern: `font-size: clamp(min, preferred, max)`
- Break words appropriately: `word-break: keep-all` for Korean, `break-all` for IPA

### Design System
- **Glassmorphism**: `backdrop-filter: blur(20px)` with semi-transparent backgrounds
- **Color Palette**: Purple/cyan for dark mode, amber/orange gradients for light mode
- **Animation**: Framer Motion with `duration: 0.3-0.5` for consistency
- **Spacing**: Consistent `gap-2/4/6` and `p-4/6` patterns

### Data Content Rules
Following `VERSE_CREATION_GUIDELINES.md`:
- Commentary sections MUST follow format: `히브리어 (한글발음) - 설명`
- Color sequence: purple → blue → green → pink/orange/yellow
- Modern Korean should be natural paraphrase, not literal translation
- Word root format: `히브리어 어근 (한글발음)`

### Code Modification Principles
Based on `DEVELOPMENT_GUIDELINES.md`:
1. **Preserve existing features** - Always list current functionality before modifications
2. **Minimal changes** - Address root cause only, avoid unnecessary refactoring
3. **Responsive-first** - Use clamp() and flexible layouts instead of scrolling
4. **Alternative suggestions** - Provide 3+ options with trade-offs explained

## Common Development Tasks

### Adding New Bible Verses
1. Follow structure in `src/types/index.ts` - Verse interface
2. Add to `src/data/verses.ts` following the extensive format guidelines
3. Ensure all Hebrew text includes proper nikud (vowel points)
4. Test flashcard functionality and commentary rendering

### Modifying Commentary System
- Commentary sections use color-coded cards with specific emoji patterns
- Each section requires: emoji, title (with Hebrew), description, points array, color
- WhyQuestion section targets children with simple language and Bible references

### UI/UX Development
- All animations use Framer Motion with consistent timing
- Dark mode uses cyan/violet gradients, light mode uses amber/purple
- Mobile-first responsive design with swipe gestures
- Glass morphism effects throughout with proper backdrop blur

### State Management
- Use Zustand store for persistent user data
- Local storage for temporary UI preferences (bookmarks, collapsed sections)
- All state changes should trigger appropriate animations

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom glassmorphism utilities
- **Animation**: Framer Motion for all transitions and gestures
- **State**: Zustand with persistence middleware
- **Data**: Static JSON with TypeScript interfaces
- **Build**: Vite with React plugin, PostCSS, Autoprefixer

## Important Files

- `src/types/index.ts` - Complete TypeScript interfaces
- `src/data/verses.ts` - All verse content with commentary
- `DEVELOPMENT_GUIDELINES.md` - Detailed development principles and patterns
- `VERSE_CREATION_GUIDELINES.md` - Content creation rules and format requirements