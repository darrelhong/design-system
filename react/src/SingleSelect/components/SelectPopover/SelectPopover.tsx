import { PropsWithChildren, useEffect, useMemo, useRef } from 'react'
import { Box, useMergeRefs, useOutsideClick } from '@chakra-ui/react'
import {
  autoUpdate,
  flip,
  hide,
  offset,
  size,
  useFloating,
} from '@floating-ui/react'

import { useSelectContext } from '../../SelectContext'

import { SelectPopoverContext } from './SelectPopoverContext'

export const SelectPopoverProvider = ({
  children,
}: PropsWithChildren): JSX.Element => {
  const { setIsFocused, isOpen } = useSelectContext()

  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const { x, y, refs, reference, floating, strategy, update } = useFloating({
    placement: 'bottom-start',
    strategy: 'absolute',
    open: isOpen,
    middleware: [
      // offset middleware should be the first middleware
      offset(1),
      flip(),
      hide(),
      // Set width to be the same as the reference element.
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          })
        },
      }),
    ],
  })

  const mergedReferenceRefs = useMergeRefs(wrapperRef, reference)

  const floatingStyles = useMemo(
    () => ({
      position: strategy,
      top: y ?? 0,
      left: x ?? 0,
    }),
    [strategy, x, y],
  )

  useEffect(() => {
    if (isOpen && refs.reference.current && refs.floating.current) {
      return autoUpdate(refs.reference.current, refs.floating.current, update)
    }
  }, [isOpen, update, refs.floating, refs.reference])

  useOutsideClick({
    ref: wrapperRef,
    handler: () => setIsFocused(false),
  })

  return (
    <SelectPopoverContext.Provider
      value={{
        floatingRef: floating,
        floatingStyles,
      }}
    >
      <Box ref={mergedReferenceRefs}>{children}</Box>
    </SelectPopoverContext.Provider>
  )
}
