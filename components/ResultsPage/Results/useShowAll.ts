import { useState, useEffect } from 'react'
import { Section } from '../../types'

interface UseShowAllReturn {
  showAll: boolean
  setShowAll: (b: boolean) => void
  renderedSections: Section[]
  hideShowAll: boolean
}

export default function useShowAll(sections: Section[]) : UseShowAllReturn {
  const [showAll, setShowAll] = useState(false)

  const sectionsShownByDefault = sections.length < 3 ? sections.length : 3
  const [renderedSections, setRenderedSections] = useState(sections.slice(0, sectionsShownByDefault))
  const hideShowAll = sectionsShownByDefault === sections.length

  useEffect(() => {
    if (showAll) {
      setRenderedSections(sections)
    } else {
      setRenderedSections(sections.slice(0, sectionsShownByDefault))
    }
  }, [sections, sectionsShownByDefault, showAll])

  return {
    showAll: showAll,
    setShowAll: setShowAll,
    renderedSections: renderedSections,
    hideShowAll: hideShowAll,
  }
}
