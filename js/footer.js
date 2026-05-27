const footerYear = document.querySelector('[data-footer-year]')

if (footerYear) {
  footerYear.textContent = new Date().getFullYear()
}

import("https://cdn.jsdelivr.net/npm/motion@latest/+esm").then(({ animate, stagger }) => {
  const footer = document.querySelector('.site-footer')
  const revealItems = document.querySelectorAll('.footer-reveal')

  if (!footer || !revealItems.length) return

  revealItems.forEach(item => {
    item.style.opacity = '0'
    item.style.transform = 'translateY(24px)'
  })

  const showFooter = () => {
    animate(revealItems, {
      opacity: [0, 1],
      y: [24, 0],
      filter: ['blur(8px)', 'blur(0px)']
    }, {
      duration: .72,
      delay: stagger(.12),
      ease: [0.22, 1, 0.36, 1]
    })
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        showFooter()
        observer.unobserve(entry.target)
      }
    })
  }, {
    threshold: .24
  })

  observer.observe(footer)
}).catch(() => {
  const revealItems = document.querySelectorAll('.footer-reveal')

  revealItems.forEach(item => {
    item.style.opacity = '1'
    item.style.transform = 'none'
    item.style.filter = 'none'
  })
})