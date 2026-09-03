const uiWrapper = document.querySelector('.ui-wrapper')

let constructorCb = null
let followElements = []
let followElementsPositions = []
let popup = null
let carousels = []

class Carousel {
  constructor (container) {
    this.container = container
    this.track = container.querySelector('.carousel-track')
    this.prevBtn = container.querySelector('.carousel-btn--prev')
    this.nextBtn = container.querySelector('.carousel-btn--next')
    this.indicators = container.querySelector('.carousel-indicators')
    if (!this.track) return

    this.items = Array.from(this.track.children)
    this.pageCount = 0
    this.init()
  }

  init () {
    this.updatePagination()

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.scrollStep('prev')
      })
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.scrollStep('next')
      })
    }

    let scrollTid
    this.track.addEventListener('scroll', () => {
      clearTimeout(scrollTid)
      scrollTid = setTimeout(() => this.updateActiveDot(), 40)
    }, { passive: true })

    window.addEventListener('resize', () => {
      this.updatePagination()
      this.updateActiveDot()
    }, { passive: true })
  }

  updatePagination () {
    if (!this.indicators) return
    this.indicators.innerHTML = ''

    const trackWidth = this.track.clientWidth
    const scrollWidth = this.track.scrollWidth
    const maxScroll = scrollWidth - trackWidth

    if (maxScroll <= 10) {
      this.indicators.style.display = 'none'
      if (this.prevBtn) this.prevBtn.style.display = 'none'
      if (this.nextBtn) this.nextBtn.style.display = 'none'
      this.pageCount = 0
      return
    }

    this.indicators.style.display = 'flex'
    if (this.prevBtn) this.prevBtn.style.display = 'flex'
    if (this.nextBtn) this.nextBtn.style.display = 'flex'

    // Number of dots: for short lists use item count, for long lists use proportional steps
    const rawPages = Math.round(scrollWidth / (trackWidth * 0.75))
    this.pageCount = Math.min(this.items.length, Math.max(2, Math.min(8, rawPages)))

    for (let i = 0; i < this.pageCount; i++) {
      const dot = document.createElement('button')
      dot.className = `carousel-dot ${i === 0 ? 'carousel-dot--active' : ''}`
      dot.setAttribute('type', 'button')
      dot.setAttribute('aria-label', `Slide ${i + 1} of ${this.pageCount}`)
      dot.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        const targetScroll = maxScroll * (i / (this.pageCount - 1))
        this.track.scrollTo({ left: targetScroll, behavior: 'smooth' })
      })
      this.indicators.appendChild(dot)
    }
  }

  updateActiveDot () {
    if (!this.indicators || !this.pageCount) return
    const dots = this.indicators.querySelectorAll('.carousel-dot')
    if (!dots.length) return

    const trackWidth = this.track.clientWidth
    const maxScroll = this.track.scrollWidth - trackWidth
    if (maxScroll <= 0) return

    const currentScroll = this.track.scrollLeft
    const ratio = Math.max(0, Math.min(1, currentScroll / maxScroll))
    const activeIndex = Math.min(dots.length - 1, Math.round(ratio * (dots.length - 1)))

    dots.forEach((dot, idx) => {
      dot.classList.toggle('carousel-dot--active', idx === activeIndex)
    })
  }

  scrollStep (direction) {
    const scrollAmount = Math.max(160, this.track.clientWidth * 0.75)
    const delta = direction === 'next' ? scrollAmount : -scrollAmount
    this.track.scrollBy({ left: delta, behavior: 'smooth' })
  }

  reset () {
    if (this.track) {
      this.track.scrollLeft = 0
      this.updateActiveDot()
    }
  }
}

export default class UI {
  constructor (callback) {
    constructorCb = callback

    followElements = uiWrapper.querySelectorAll('[data-follow]')
    this.getFollowElementsPosition()

    const events = [
      { selector: '.burger', cb: this.toggleMenu.bind(this) },
      { selector: '.header-logo-link', cb: this.onPagingClick.bind(this) },
      { selector: '.fixed-content-header__contact', cb: this.onPagingClick.bind(this) },
      { selector: '.fixed-content-paging', cb: this.onPagingClick.bind(this) },
      { selector: '.menu-list', cb: this.onMenuPagingClick.bind(this) },
      { selector: '#button_email_list', cb: this.showPopup.bind(this, 'video') }
    ]

    events.forEach(event => {
      const element = uiWrapper.querySelector(event.selector)
      if (element) element.addEventListener('click', event.cb)
    })

    // Keyboard activation for menu items and paging dots
    const activateOnKey = cb => e => {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return
      if (!e.target.dataset || e.target.dataset.page === undefined) return
      e.preventDefault()
      cb(e)
    }
    const menuList = uiWrapper.querySelector('.menu-list')
    if (menuList) menuList.addEventListener('keydown', activateOnKey(this.onMenuPagingClick.bind(this)))
    const fixedPaging = uiWrapper.querySelector('.fixed-content-paging')
    if (fixedPaging) fixedPaging.addEventListener('keydown', activateOnKey(this.onPagingClick.bind(this)))

    // Escape key closes popup or menu
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (popup && popup.classList.contains('popup--active')) {
          this.closePopup()
        } else if (uiWrapper.classList.contains('menu-opened')) {
          this.toggleMenu()
        }
      }
    })

    // Close popup on close button click
    const popupCloseBtn = uiWrapper.querySelector('.popup__close-button')
    if (popupCloseBtn) {
      popupCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.closePopup()
      })
    }

    // Window resize re-computes button follow coordinates
    window.addEventListener('resize', () => {
      this.getFollowElementsPosition()
    }, { passive: true })

    const footerYear = uiWrapper.querySelector('.footer-copy__date')
    if (footerYear) footerYear.innerHTML = `© ${new Date().getFullYear()}`

    // Initialize all responsive carousels
    this.initCarousels()
  }

  initCarousels () {
    carousels = []
    const containers = uiWrapper.querySelectorAll('.carousel-container')
    containers.forEach(container => {
      carousels.push(new Carousel(container))
    })
  }

  ui_moveEvent (e, Use2DTextOver3D) {
    this.buttonMoveAnimation(e)
    if (Use2DTextOver3D) {
      this.mainLetters2DAnimation(e)
    }
  }

  buttonMoveAnimation (e) {
    const mouseLeft = e.clientX
    const mouseTop = e.clientY
    followElements.forEach((element, index) => {
      const elementPositions = followElementsPositions[index]
      if (!elementPositions) return

      if (mouseLeft > elementPositions.left - 100 && mouseLeft < elementPositions.right + 100 &&
          mouseTop > elementPositions.top - 100 && mouseTop < elementPositions.bottom + 100) {
        const moveX = (elementPositions.left - mouseLeft) / 10
        const moveY = (elementPositions.top - mouseTop) / 10

        const isCenteredY = element.dataset.follow === 'centered_y'
        element.style.transform = `translate3d(${-moveX}px, calc(${isCenteredY ? -50 : 0}% + ${-moveY}px), 0)`
        element.style.transition = ''
      } else {
        element.style.transform = ''
        element.style.transition = 'transform 500ms ease'
      }
    })
  }

  mainLetters2DAnimation (e) {
    const letters = document.querySelector('.configuration__letters')
    if (!letters) return
    const xCenter = window.innerWidth / 2
    const yCenter = window.innerHeight / 2
    const LettersXPosition = xCenter - e.clientX
    const LettersYPosition = yCenter - e.clientY
    letters.style.transform = `rotateX(${-LettersXPosition / 50}deg) rotateY(${LettersYPosition / 50}deg) translateX(-50%)`
  }

  showPopup (popupType) {
    popup = uiWrapper.querySelector(`[data-popup=${popupType}]`)
    if (!popup) return
    popup.classList.add('popup--active')
    popup.addEventListener('click', this.handleBackdropClick.bind(this))
    constructorCb().blockSceneScrolling(true)
  }

  handleBackdropClick (e) {
    if (e.target === popup) {
      this.closePopup()
    }
  }

  closePopup () {
    if (!popup) return
    popup.classList.remove('popup--active')
    popup.removeEventListener('click', this.handleBackdropClick.bind(this))
    constructorCb().blockSceneScrolling(false)
  }

  toggleMenu () {
    const isOpen = uiWrapper.classList.toggle('menu-opened')
    const burger = uiWrapper.querySelector('.burger')
    if (burger) {
      burger.classList.toggle('burger--active', isOpen)
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
    }
  }

  ui_moveScene (direction) {
    this.checkContentVisibility(direction)
  }

  onMenuPagingClick (e) {
    const target = e.target.closest('[data-page]')
    if (!target) return
    this.toggleMenu()
    this.onPagingClick({ target })
  }

  onPagingClick (e) {
    const target = e.target.closest('[data-page]')
    if (!target) return
    const datasetPage = +target.dataset.page
    if (datasetPage >= 0) {
      constructorCb().onPagingClick(datasetPage)
    }
  }

  getFollowElementsPosition () {
    followElementsPositions = []
    followElements.forEach(element => followElementsPositions.push(element.getBoundingClientRect()))
  }

  checkContentVisibility (direction) {
    const currentPage = constructorCb().getCurrentPage()
    const contentSections = uiWrapper.querySelectorAll('.content-section[data-page], .paging__page[data-page]')

    // Update active highlight on menu items
    const menuItems = uiWrapper.querySelectorAll('.menu-list__item')
    menuItems.forEach(item => {
      const page = +item.dataset.page
      item.classList.toggle('menu-list__item--active', page === currentPage)
    })

    const animateSection = section => {
      const sectionPage = +section.dataset.page
      const isActive = sectionPage === currentPage

      if (direction === 'down') {
        section.classList.add('section--hidden')
        section.classList.remove('section--hidden-reverse')
      } else {
        section.classList.add('section--hidden-reverse')
        section.classList.remove('section--hidden')
      }

      if (isActive) {
        section.style.display = 'flex'
        section.scrollTop = 0

        const updateTrack = () => {
          const track = section.querySelector('.carousel-track')
          if (track) {
            track.scrollLeft = 0
            const c = carousels.find(entry => entry.track === track)
            if (c) {
              c.updatePagination()
              c.updateActiveDot()
            }
          }
        }

        const removeClass = () => {
          section.classList.remove('section--hidden', 'section--hidden-reverse')
          updateTrack()
        }

        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(removeClass)
        })
        setTimeout(updateTrack, 300)
      }
    }

    contentSections.forEach(section => {
      section.style.opacity = '0'
      setTimeout(() => {
        section.removeAttribute('style')
        animateSection(section)
      }, 250)
    })
  }
}
