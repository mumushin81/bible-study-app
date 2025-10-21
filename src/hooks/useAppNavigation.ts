import { useReducer } from 'react'

interface NavigationState {
  bookId: string
  chapter: number
  verseIndex: number
}

type NavigationAction =
  | { type: 'SET_BOOK'; bookId: string; chapter: number }
  | { type: 'SET_VERSE_INDEX'; verseIndex: number }
  | { type: 'NEXT_VERSE' }
  | { type: 'PREV_VERSE' }

const initialState: NavigationState = {
  bookId: 'genesis',
  chapter: 1,
  verseIndex: 0,
}

function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'SET_BOOK':
      return {
        ...state,
        bookId: action.bookId,
        chapter: action.chapter,
        verseIndex: 0,
      }
    case 'SET_VERSE_INDEX':
      return {
        ...state,
        verseIndex: action.verseIndex,
      }
    case 'NEXT_VERSE':
      return {
        ...state,
        verseIndex: state.verseIndex + 1,
      }
    case 'PREV_VERSE':
      return {
        ...state,
        verseIndex: Math.max(0, state.verseIndex - 1),
      }
    default:
      return state
  }
}

export function useAppNavigation() {
  const [navigation, dispatch] = useReducer(navigationReducer, initialState)

  const setBook = (bookId: string, chapter: number) => {
    dispatch({ type: 'SET_BOOK', bookId, chapter })
  }

  const setVerseIndex = (verseIndex: number) => {
    dispatch({ type: 'SET_VERSE_INDEX', verseIndex })
  }

  const nextVerse = () => {
    dispatch({ type: 'NEXT_VERSE' })
  }

  const prevVerse = () => {
    dispatch({ type: 'PREV_VERSE' })
  }

  return {
    navigation,
    setBook,
    setVerseIndex,
    nextVerse,
    prevVerse,
  }
}
