'use client'

interface ScrollToFormButtonProps {
  children: React.ReactNode
  className?: string
}

export default function ScrollToFormButton({ children, className }: ScrollToFormButtonProps) {
  const scrollToForm = () => {
    const formElement = document.getElementById('lead-form')
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <button onClick={scrollToForm} className={className}>
      {children}
    </button>
  )
}