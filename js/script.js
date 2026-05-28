import("https://cdn.jsdelivr.net/npm/motion@latest/+esm").then(({ animate, stagger }) => {
  const preloader = document.querySelector('.preloader')
  const lines = document.querySelectorAll('.hero-line')
  const cards = document.querySelectorAll('.console-card')
  const nums = document.querySelectorAll('.console-number')
  const track = document.querySelector('.carousel-track')
  const carouselShell = document.querySelector('.carousel-shell')
  const scrollUp = document.querySelector('.scroll-up')
  const revealBlocks = document.querySelectorAll('.reveal-block')
  const galleryItems = document.querySelectorAll('.gallery-item')
  const lightbox = document.querySelector('.lightbox')
  const lightboxContent = document.querySelector('.lightbox-content')
  const lightboxImg = document.querySelector('.lightbox img')
  const lightboxTitle = document.querySelector('.lightbox-text h3')
  const lightboxDesc = document.querySelector('.lightbox-text p')
  const lightboxClose = document.querySelector('.lightbox-close')
  const progressPopup = document.querySelector('.progress-popup')
  const progressPopupPanel = document.querySelector('.progress-popup-panel')
  const progressPopupClose = document.querySelector('.progress-popup-close')


  let progressPopupStarted = false
  let progressPopupVisible = false
  let progressPopupTimer
  let progressPopupPointerId = null
  let progressPopupStartX = 0
  let progressPopupStartY = 0
  let progressPopupCurrentX = 0
  let progressPopupCurrentY = 0
  let progressPopupDragging = false

  function resetProgressPopupDrag() {
    if (!progressPopupPanel) return

    progressPopupPanel.classList.remove('is-dragging')
    progressPopupPanel.style.transform = ''
    progressPopupPanel.style.opacity = ''
  }

  function showProgressPopup() {
    if (!progressPopup || !progressPopupPanel || progressPopupVisible) return

    progressPopupVisible = true
    resetProgressPopupDrag()
    progressPopup.classList.add('is-open')
    progressPopup.setAttribute('aria-hidden', 'false')

    animate(progressPopup, {
      opacity: [0, 1],
      x: [32, 0],
      y: [-32, 0],
      scale: [.97, 1]
    }, {
      duration: .48,
      ease: [0.22, 1, 0.36, 1]
    })

    animate(progressPopupPanel, {
      filter: ['blur(10px)', 'blur(0px)']
    }, {
      duration: .48,
      ease: [0.22, 1, 0.36, 1]
    })
  }

  function hideProgressPopup() {
    if (!progressPopup || !progressPopupVisible) return

    progressPopupVisible = false
    clearTimeout(progressPopupTimer)

    animate(progressPopup, {
      opacity: [1, 0],
      x: [0, 28],
      y: [0, -24],
      scale: [1, .97]
    }, {
      duration: .28,
      ease: [0.22, 1, 0.36, 1]
    }).finished.then(() => {
      progressPopup.classList.remove('is-open')
      progressPopup.setAttribute('aria-hidden', 'true')
      resetProgressPopupDrag()
    })
  }

  function scheduleProgressPopup() {
    if (progressPopupStarted || !progressPopup) return

    progressPopupStarted = true
    progressPopupTimer = setTimeout(showProgressPopup, 3000)
  }

  function finishProgressPopupSwipe() {
    if (!progressPopupPanel || progressPopupPointerId === null) return

    const shouldClose = Math.abs(progressPopupCurrentX) > 96 || Math.abs(progressPopupCurrentY) > 78
    const fromX = progressPopupCurrentX
    const fromY = progressPopupCurrentY
    const fromOpacity = Math.max(.38, 1 - (Math.abs(fromX) + Math.abs(fromY)) / 320)

    progressPopupPointerId = null
    progressPopupDragging = false
    progressPopupPanel.classList.remove('is-dragging')
    progressPopupPanel.style.transform = ''
    progressPopupPanel.style.opacity = ''

    if (shouldClose) {
      hideProgressPopup()
      return
    }

    animate(progressPopupPanel, {
      x: [fromX, 0],
      y: [fromY, 0],
      rotate: [fromX * .025, 0],
      opacity: [fromOpacity, 1]
    }, {
      duration: .26,
      ease: [0.22, 1, 0.36, 1]
    })
  }

  let introStarted = false
  let numbersStarted = false

  function buildNumber(node) {
    const value = node.dataset.value.trim()
    node.innerHTML = ''
    node.setAttribute('aria-label', value)

    const chars = value.split('')
    const digitsOnly = chars.filter(char => /\d/.test(char))
    const totalDigits = digitsOnly.length
    let digitIndex = 0

    chars.forEach(char => {
      if (/\d/.test(char)) {
        const reverseIndex = totalDigits - digitIndex - 1
        const extraTurns = Math.max(1, Math.min(3, Math.floor(reverseIndex / 2) + 1))
        const target = Number(char)
        const finalStep = extraTurns * 10 + target

        const slot = document.createElement('span')
        const reel = document.createElement('span')

        slot.className = 'num-slot'
        reel.className = 'num-reel'
        reel.dataset.finalStep = finalStep
        reel.dataset.order = digitIndex

        for (let i = 0; i <= finalStep; i++) {
          const digit = document.createElement('span')
          digit.textContent = i % 10
          reel.appendChild(digit)
        }

        slot.appendChild(reel)
        node.appendChild(slot)
        digitIndex++
      } else {
        const staticChar = document.createElement('span')
        staticChar.className = 'num-static'
        staticChar.dataset.order = digitIndex
        staticChar.textContent = char
        node.appendChild(staticChar)
      }
    })
  }

  function animateNumbers() {
    if (numbersStarted) return
    numbersStarted = true

    nums.forEach((num, numIndex) => {
      const reels = num.querySelectorAll('.num-reel')
      const statics = num.querySelectorAll('.num-static')
      const baseDelay = numIndex * .1

      reels.forEach((reel, index) => {
        const finalStep = Number(reel.dataset.finalStep)

        animate(reel, {
          y: ['0em', '-' + finalStep + 'em']
        }, {
          duration: 1.12,
          delay: baseDelay + index * .032,
          ease: [0.17, 0.92, 0.22, 1]
        })
      })

      animate(statics, {
        opacity: [0, 1],
        y: ['.45em', '0em']
      }, {
        duration: .5,
        delay: stagger(.025, { startDelay: baseDelay + .08 }),
        ease: [0.22, 1, 0.36, 1]
      })
    })
  }

  function startIntro() {
    if (introStarted) return
    introStarted = true

    animate(lines, {
      opacity: [0, 1],
      y: [24, 0]
    }, {
      duration: .72,
      delay: stagger(.09),
      ease: [0.22, 1, 0.36, 1]
    })

    animate(cards, {
      opacity: [0, 1],
      y: [18, 0]
    }, {
      duration: .58,
      delay: stagger(.09, { startDelay: .36 }),
      ease: [0.22, 1, 0.36, 1]
    })

    setTimeout(animateNumbers, 650)
    scheduleProgressPopup()
  }

  function hidePreloader() {
    if (!preloader) {
      startIntro()
      return
    }

    animate(preloader, {
      opacity: [1, 0]
    }, {
      duration: .5,
      ease: [0.22, 1, 0.36, 1]
    }).finished.then(() => {
      preloader.remove()
      startIntro()
    })
  }

  nums.forEach(buildNumber)

  window.addEventListener('load', () => {
    setTimeout(hidePreloader, 300)
  })

  setTimeout(hidePreloader, 2200)

  let carouselMove
  let carouselStarted = false
  let lastWidth = window.innerWidth
  let originalCards = []

  function saveOriginalCards() {
    if (!track) return
    originalCards = Array.from(track.children).map(card => card.cloneNode(true))
  }

  function buildInfiniteTrack() {
    if (!track || !originalCards.length) return 0

    track.innerHTML = ''

    originalCards.forEach(card => {
      track.appendChild(card.cloneNode(true))
    })

    originalCards.forEach(card => {
      track.appendChild(card.cloneNode(true))
    })

    let guard = 0

    while (track.scrollWidth < window.innerWidth * 3 && guard < 14) {
      originalCards.forEach(card => {
        track.appendChild(card.cloneNode(true))
      })

      guard++
    }

    const firstClone = track.children[originalCards.length]

    return firstClone ? firstClone.offsetLeft : track.scrollWidth / 2
  }

  function startCarousel() {
    if (!track || carouselStarted || !originalCards.length) return

    carouselStarted = true

    const distance = buildInfiniteTrack()

    carouselMove = animate(track, {
      x: [0, -distance]
    }, {
      duration: 40.5,
      ease: 'linear',
      repeat: Infinity
    })
  }

  function restartCarousel() {
    if (!track || !carouselStarted) return

    if (carouselMove) {
      carouselMove.cancel()
    }

    carouselStarted = false
    track.style.transform = ''
    startCarousel()
  }

  function showCarousel() {
    animate(carouselShell, {
      opacity: [0, 1],
      y: [28, 0]
    }, {
      duration: .8,
      ease: [0.22, 1, 0.36, 1]
    })

    setTimeout(startCarousel, 260)
  }

  saveOriginalCards()

  if (carouselShell) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          showCarousel()
          observer.unobserve(entry.target)
        }
      })
    }, {
      threshold: .25
    })

    observer.observe(carouselShell)
  }

  function revealProjectBlock(block) {
    const title = block.querySelector('.project-copy h2')
    const paragraphs = block.querySelectorAll('.project-copy p')
    const hint = block.querySelector('.gallery-hint')
    const gallery = block.querySelectorAll('.gallery-item')
    const videos = block.querySelectorAll('.gallery-video')
    const widget = block.querySelector('.steam-widget')
    const roadmap = block.querySelector('.roadmap')
    const socialsHeading = block.querySelector('.socials-heading')
    const socialLinks = block.querySelectorAll('.social-link')
    const socialsNote = block.querySelector('.socials-note')

    const textElements = [title, ...paragraphs].filter(Boolean)
    const sideElements = [hint, ...gallery, ...videos, widget].filter(Boolean)
    const socialElements = [socialsHeading, ...socialLinks, socialsNote].filter(Boolean)

    if (textElements.length) {
      animate(textElements, {
        opacity: [0, 1],
        x: [-38, 0],
        y: [10, 0],
        filter: ['blur(8px)', 'blur(0px)']
      }, {
        duration: .78,
        delay: stagger(.075),
        ease: [0.22, 1, 0.36, 1]
      })
    }

    if (sideElements.length) {
      animate(sideElements, {
        opacity: [0, 1],
        x: [36, 0],
        y: [12, 0],
        scale: [.985, 1],
        filter: ['blur(8px)', 'blur(0px)']
      }, {
        duration: .74,
        delay: stagger(.065, { startDelay: .14 }),
        ease: [0.22, 1, 0.36, 1]
      })
    }

    if (socialElements.length) {
      animate(socialElements, {
        opacity: [0, 1],
        y: [28, 0],
        scale: [.985, 1],
        filter: ['blur(8px)', 'blur(0px)']
      }, {
        duration: .74,
        delay: stagger(.07, { startDelay: .08 }),
        ease: [0.22, 1, 0.36, 1]
      })
    }

    if (roadmap) {
      animate(roadmap, {
        opacity: [0, 1],
        y: [30, 0],
        filter: ['blur(7px)', 'blur(0px)']
      }, {
        duration: .76,
        delay: .36,
        ease: [0.22, 1, 0.36, 1]
      })
    }
  }

  if (revealBlocks.length) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealProjectBlock(entry.target)
          revealObserver.unobserve(entry.target)
        }
      })
    }, {
      threshold: .2,
      rootMargin: '0px 0px -8% 0px'
    })

    revealBlocks.forEach(block => revealObserver.observe(block))
  }

  let resizeTimer

  window.addEventListener('resize', () => {
    const currentWidth = window.innerWidth

    if (Math.abs(currentWidth - lastWidth) < 80) return

    lastWidth = currentWidth

    clearTimeout(resizeTimer)

    resizeTimer = setTimeout(() => {
      restartCarousel()
    }, 260)
  })

  let scrollUpVisible = false
  let scrollUpAnimation

  function showScrollUp() {
    if (!scrollUp || scrollUpVisible) return

    scrollUpVisible = true
    scrollUp.classList.add('is-active')

    if (scrollUpAnimation) scrollUpAnimation.cancel()

    scrollUpAnimation = animate(scrollUp, {
      opacity: [0, 1],
      y: [14, 0]
    }, {
      duration: .38,
      ease: [0.22, 1, 0.36, 1]
    })
  }

  function hideScrollUpButton() {
    if (!scrollUp || !scrollUpVisible) return

    scrollUpVisible = false
    scrollUp.classList.remove('is-active')

    if (scrollUpAnimation) scrollUpAnimation.cancel()

    scrollUpAnimation = animate(scrollUp, {
      opacity: [1, 0],
      y: [0, 14]
    }, {
      duration: .28,
      ease: [0.22, 1, 0.36, 1]
    })
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 520) {
      showScrollUp()
    } else {
      hideScrollUpButton()
    }
  }, {
    passive: true
  })

  if (progressPopupClose) {
    progressPopupClose.addEventListener('click', hideProgressPopup)
  }

  if (progressPopupPanel) {
    progressPopupPanel.addEventListener('pointerdown', event => {
      if (!progressPopupVisible || event.target.closest('.progress-popup-close')) return

      progressPopupPointerId = event.pointerId
      progressPopupStartX = event.clientX
      progressPopupStartY = event.clientY
      progressPopupCurrentX = 0
      progressPopupCurrentY = 0
      progressPopupDragging = true
      progressPopupPanel.classList.add('is-dragging')
      progressPopupPanel.setPointerCapture(event.pointerId)
    })

    progressPopupPanel.addEventListener('pointermove', event => {
      if (!progressPopupDragging || event.pointerId !== progressPopupPointerId) return

      progressPopupCurrentX = event.clientX - progressPopupStartX
      progressPopupCurrentY = event.clientY - progressPopupStartY

      const opacity = Math.max(.38, 1 - (Math.abs(progressPopupCurrentX) + Math.abs(progressPopupCurrentY)) / 320)
      progressPopupPanel.style.transform = `translate(${progressPopupCurrentX}px, ${progressPopupCurrentY}px) rotate(${progressPopupCurrentX * .025}deg)`
      progressPopupPanel.style.opacity = opacity
    })

    progressPopupPanel.addEventListener('pointerup', finishProgressPopupSwipe)
    progressPopupPanel.addEventListener('pointercancel', finishProgressPopupSwipe)
  }

  if (scrollUp) {
    scrollUp.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    })
  }

  function lockPage() {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.setProperty('--lock-padding', scrollBarWidth + 'px')
    document.body.classList.add('lightbox-open')
  }

  function unlockPage() {
    document.body.classList.remove('lightbox-open')
    document.body.style.removeProperty('--lock-padding')
  }

  function openLightbox(src, alt, title, desc) {
    if (!lightbox || !lightboxImg || !lightboxContent) return

    lightboxImg.src = src
    lightboxImg.alt = alt || ''
    lightboxTitle.textContent = title || 'Image'
    lightboxDesc.textContent = desc || ''
    lightbox.classList.add('is-open')
    lightbox.setAttribute('aria-hidden', 'false')
    lockPage()

    animate(lightbox, {
      opacity: [0, 1]
    }, {
      duration: .26,
      ease: [0.22, 1, 0.36, 1]
    })

    animate(lightboxContent, {
      opacity: [0, 1],
      scale: [.96, 1]
    }, {
      duration: .34,
      ease: [0.22, 1, 0.36, 1]
    })
  }

  function closeLightbox() {
    if (!lightbox || !lightboxContent || !lightboxImg || !lightbox.classList.contains('is-open')) return

    animate(lightboxContent, {
      opacity: [1, 0],
      scale: [1, .96]
    }, {
      duration: .2,
      ease: [0.22, 1, 0.36, 1]
    })

    animate(lightbox, {
      opacity: [1, 0]
    }, {
      duration: .24,
      ease: [0.22, 1, 0.36, 1]
    }).finished.then(() => {
      lightbox.classList.remove('is-open')
      lightbox.setAttribute('aria-hidden', 'true')
      unlockPage()
      lightboxImg.src = ''
    })
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img')
      const src = item.dataset.full || img.src
      const title = item.dataset.title || img.alt
      const desc = item.dataset.desc || ''

      openLightbox(src, img.alt, title, desc)
    })
  })

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox)
  }

  if (lightbox) {
    lightbox.addEventListener('click', event => {
      if (event.target === lightbox) {
        closeLightbox()
      }
    })
  }

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeLightbox()
      hideProgressPopup()
    }
  })
})