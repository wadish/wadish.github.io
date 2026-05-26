const motionScript = document.createElement('script')

motionScript.type = 'module'
motionScript.textContent = `
  import { animate, stagger } from "https://cdn.jsdelivr.net/npm/motion@latest/+esm"

  const lines = document.querySelectorAll('.hero-line')
  const cards = document.querySelectorAll('.console-card')
  const nums = document.querySelectorAll('.console-number')
  const track = document.querySelector('.carousel-track')

  function buildNumber(node) {
    const value = node.dataset.value.trim()
    node.innerHTML = ''
    node.setAttribute('aria-label', value)

    const chars = value.split('')
    const digitsOnly = chars.filter(char => /\\d/.test(char))
    const totalDigits = digitsOnly.length
    let digitIndex = 0

    chars.forEach(char => {
      if (/\\d/.test(char)) {
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

  nums.forEach(buildNumber)

  animate(lines, {
    opacity: [0, 1],
    y: [24, 0]
  }, {
    duration: .78,
    delay: stagger(.11),
    ease: [0.22, 1, 0.36, 1]
  })

  animate(cards, {
    opacity: [0, 1],
    y: [20, 0]
  }, {
    duration: .74,
    delay: stagger(.12, { startDelay: .74 }),
    ease: [0.22, 1, 0.36, 1]
  })

  nums.forEach((num, numIndex) => {
    const reels = num.querySelectorAll('.num-reel')
    const statics = num.querySelectorAll('.num-static')
    const baseDelay = 1.02 + numIndex * .18

    reels.forEach((reel, index) => {
      const finalStep = Number(reel.dataset.finalStep)

      animate(reel, {
        y: ['0em', '-' + finalStep + 'em']
      }, {
        duration: 1.08,
        delay: baseDelay + index * .035,
        ease: [0.18, 0.95, 0.24, 1]
      })
    })

    animate(statics, {
      opacity: [0, 1],
      y: ['.45em', '0em']
    }, {
      duration: .58,
      delay: stagger(.03, { startDelay: baseDelay + .1 }),
      ease: [0.22, 1, 0.36, 1]
    })
  })

  let carouselMove

  function runCarousel() {
    if (!track) return

    if (carouselMove) {
      carouselMove.cancel()
    }

    const gap = parseFloat(getComputedStyle(track).gap) || 0
    const distance = track.scrollWidth / 2 + gap / 2

    carouselMove = animate(track, {
      x: [0, -distance]
    }, {
      duration: 40.5,
      ease: 'linear',
      repeat: Infinity
    })
  }

  runCarousel()
  window.addEventListener('resize', runCarousel)
`

document.head.appendChild(motionScript)