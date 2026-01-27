import { useRef, useState, useEffect, FC } from 'react'

interface AutoScrollTitleProps {
  text: string
}

const AutoScrollTitle: FC<AutoScrollTitleProps> = ({ text }) => {
  const textRef = useRef<HTMLDivElement>(null)
  const [overflowDistance, setOverflowDistance] = useState(0)

  useEffect(() => {
    const checkOverflow = () => {
      const element = textRef.current
      if (element) {
        const scrollWidth = element.scrollWidth
        const clientWidth = element.clientWidth

        // Если текст шире контейнера, вычисляем разницу
        if (scrollWidth > clientWidth) {
          // Добавляем небольшой буфер (например, 2px), чтобы текст не прилипал к краю в конце
          setOverflowDistance(scrollWidth - clientWidth + 2)
        } else {
          setOverflowDistance(0)
        }
      }
    }

    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [text])

  // Вычисляем длительность анимации, чтобы скорость была одинаковой
  // независимо от длины текста (например, 50px в секунду)
  const duration = overflowDistance > 0 ? overflowDistance / 50 : 0

  const isOverflow = overflowDistance > 0

  return (
    <div className="w-full overflow-hidden relative group">
      <div
        ref={textRef}
        // Передаем вычисленную дистанцию в CSS переменную
        style={
          {
            '--marquee-x': `-${overflowDistance}px`,
            '--marquee-duration': `${duration}s`, // Use dynamic duration
          } as React.CSSProperties
        }
        className={`
          whitespace-nowrap text-sm font-semibold text-gray-900 mb-2
          ${isOverflow ? 'text-ellipsis overflow-hidden' : ''}
          
          /* В animation-class добавлено '_alternate' */
          /* Используем arbitrary value для настройки времени и типа анимации */
          ${
            isOverflow
              ? 'group-hover:animate-[marquee_var(--marquee-duration)_linear_infinite_alternate] group-hover:overflow-visible'
              : ''
          }
        `}
      >
        {text}
      </div>

      {isOverflow && (
        <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent group-hover:hidden pointer-events-none" />
      )}
    </div>
  )
}

export default AutoScrollTitle
