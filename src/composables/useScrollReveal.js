import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollReveal() {
  const scrollProgress = ref(0)
  const isScrolled = ref(false)
  let observer = null

  function handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
    isScrolled.value = scrollTop > 24
    scrollProgress.value = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0
  }

  onMounted(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer?.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    )

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      observer.observe(el)
    })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  return {
    scrollProgress,
    isScrolled
  }
}