const views = [...document.querySelectorAll('[data-view]')];
const cards = [...document.querySelectorAll('.project-card')];
const filters = [...document.querySelectorAll('[data-filter]')];
const themeButtons = [...document.querySelectorAll('[data-theme-choice]')];
const lightbox = document.querySelector('.lightbox');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const gsap = window.gsap;
const root = document.documentElement;
let returnFocus = null;
let workScroll = 0;
let currentView = 'home';
let routeTween;
let entranceTimeline;
let filterTween;
let galleryTween;
let counterTimeline;
let countersPlayed = false;
let lastBurst = 0;
let activeFilter = 'side';
const canAnimate = () => Boolean(gsap) && !reducedMotion.matches;
const isCute = () => root.dataset.theme === 'cute';
const motion = () => isCute()
  ? {ease: 'back.out(1.5)', duration: .8, y: 28, scale: .95, rotation: -1.5}
  : {ease: 'power3.out', duration: .65, y: 17, scale: 1, rotation: 0};
const formatCount = value => Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function updateExperience() {
  const years = Math.max(0, new Date().getFullYear() - 2019);
  const number = document.getElementById('experience-years');
  number.dataset.counter = String(years);
  number.textContent = String(years);
  number.parentElement.setAttribute('aria-label', `${years} years of experience, creating since 2019`);
  document.getElementById('year').textContent = new Date().getFullYear();
}
function countAchievements() {
  if (countersPlayed || !canAnimate()) return;
  countersPlayed = true;
  counterTimeline = gsap.timeline();
  document.querySelectorAll('[data-counter]').forEach((number, index) => {
    const target = Number(number.dataset.counter);
    const counter = {value: target * .35};
    counterTimeline.to(counter, {
      value: target, duration: isCute() ? 1.6 : 1.3, ease: 'power2.out',
      onUpdate: () => { number.textContent = formatCount(counter.value); },
      onComplete: () => { number.textContent = formatCount(target); }
    }, index * .08);
  });
}
function renderCatalog() {
  const side = root.dataset.theme;
  const sideName = side === 'cute' ? 'Cute side' : 'Dark side';
  const sideCount = cards.filter(card => card.dataset.side === side).length;
  cards.forEach(card => {
    card.hidden = activeFilter === 'all' ? false
      : activeFilter === 'art' ? card.dataset.category !== 'art'
      : card.dataset.side !== side;
  });
  const count = cards.filter(card => !card.hidden).length;
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter)));
  document.getElementById('side-filter-label').textContent = sideName;
  document.getElementById('side-filter-count').textContent = String(sideCount);
  document.getElementById('catalog-count').textContent = String(count);
  document.getElementById('catalog-name').textContent = activeFilter === 'all' ? 'All projects' : activeFilter === 'art' ? '3D art' : sideName;
  document.getElementById('catalog-description').textContent = activeFilter === 'all'
    ? 'Every project, newest first. Pick a card to read its story and explore the images.'
    : activeFilter === 'art' ? 'My Blender work and liminal spaces, available from either side.'
    : side === 'cute' ? 'JUST TYPE, Code Nodes, and FRAME WORLD. A softer side of my work.'
    : 'My horror games and darker worlds. Pick a project to see more.';
  document.getElementById('results-count').textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
}
function applyTheme(theme, animate = false, resetFilter = true) {
  const selected = theme === 'cute' ? 'cute' : 'rust';
  filterTween?.progress(1);
  entranceTimeline?.progress(1);
  galleryTween?.progress(1);
  root.dataset.theme = selected;
  if (resetFilter) activeFilter = 'side';
  renderCatalog();
  themeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === selected)));
  document.querySelector('meta[name="theme-color"]').setAttribute('content', selected === 'cute' ? '#fbf3ed' : '#181817');
  try { window.localStorage.setItem('wadish-theme', selected); } catch { /* Private/file contexts may disable storage. */ }
  if (animate && canAnimate()) enterView(document.getElementById(currentView), false);
}
function enterView(view, initial) {
  if (!canAnimate()) return;
  const style = motion();
  entranceTimeline = gsap.timeline({defaults: {ease: style.ease}});
  if (view.id === 'home') {
    entranceTimeline
      .fromTo(view.querySelectorAll('.hero-copy > *'), {opacity: 0, y: style.y}, {opacity: 1, y: 0, duration: style.duration, stagger: .09, clearProps: 'opacity,transform'})
      .fromTo(view.querySelectorAll('.achievement'), {opacity: 0, y: style.y, scale: style.scale}, {opacity: 1, y: 0, scale: 1, duration: style.duration, stagger: .09, clearProps: 'opacity,transform'}, .2)
      .fromTo(view.querySelectorAll('.side-choice'), {opacity: 0, y: style.y, rotation: style.rotation}, {opacity: 1, y: 0, rotation: 0, duration: style.duration, stagger: .12, clearProps: 'opacity,transform'}, .4);
    countAchievements();
  } else {
    entranceTimeline.fromTo(view, {opacity: 0, y: style.y}, {opacity: 1, y: 0, duration: style.duration, clearProps: 'opacity,transform'});
    if (view.id === 'work' && (initial || workScroll < 100)) {
      entranceTimeline.fromTo(cards.filter(card => !card.hidden), {opacity: 0, y: style.y, rotation: style.rotation, scale: style.scale}, {opacity: 1, y: 0, rotation: 0, scale: 1, duration: style.duration, stagger: .07, clearProps: 'opacity,transform'}, .12);
    }
  }
}
function route(initial = false) {
  if (location.hash === '#main') {
    document.getElementById('main').focus({preventScroll: true});
    return;
  }
  let id = location.hash.slice(1) || 'home';
  if (!views.some(view => view.id === id)) id = 'home';
  if (!initial && id === currentView && !routeTween) return;
  filterTween?.progress(1);
  entranceTimeline?.progress(1);
  routeTween?.kill();
  routeTween = null;
  if (gsap) gsap.set(views, {clearProps: 'opacity,transform'});
  if (currentView === 'work' && id !== 'work') workScroll = window.scrollY;
  const project = cards.find(card => card.getAttribute('href') === `#${id}`);
  if (project && project.dataset.side !== 'shared' && project.dataset.side !== root.dataset.theme) {
    applyTheme(project.dataset.side, false, false);
  }
  if (lightbox.open) lightbox.close();
  document.querySelectorAll('video').forEach(video => video.pause());
  const previous = document.getElementById(currentView);
  const show = () => {
    views.forEach(view => { view.hidden = view.id !== id; });
    document.querySelectorAll('[data-nav]').forEach(link => {
      const active = link.dataset.nav === (['home', 'about', 'socials'].includes(id) ? id : 'work');
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const view = document.getElementById(id);
    const heading = view.querySelector('h1,h2');
    document.title = id === 'home' ? 'wadishTheCreator - Indie game developer' : `${id === 'work' ? 'Projects' : heading.textContent.trim()} - wadishTheCreator`;
    currentView = id;
    routeTween = null;
    if (!initial) {
      heading.focus({preventScroll: true});
      window.scrollTo({top: id === 'work' ? workScroll : 0, behavior: 'instant'});
    }
    enterView(view, initial);
  };
  if (!initial && canAnimate()) routeTween = gsap.to(previous, {opacity: 0, y: isCute() ? -8 : 3, duration: .18, ease: 'power1.in', onComplete: show});
  else show();
}
themeButtons.forEach(button => button.addEventListener('click', () => {
  const enter = button.hasAttribute('data-enter');
  const viewingProject = cards.some(card => card.getAttribute('href') === `#${currentView}`);
  // Complete a pending navigation before changing its destination or style.
  routeTween?.progress(1);
  applyTheme(button.dataset.themeChoice, !enter && !viewingProject);
  if (enter || viewingProject) {
    workScroll = 0;
    if (location.hash !== '#work') location.hash = 'work';
    else route();
  }
}));
filters.forEach(button => button.addEventListener('click', () => {
  filterTween?.progress(1);
  entranceTimeline?.progress(1);
  const applyFilter = () => {
    activeFilter = button.dataset.filter;
    renderCatalog();
    const visible = cards.filter(card => !card.hidden);
    if (canAnimate()) {
      const style = motion();
      gsap.set(cards, {clearProps: 'opacity,transform'});
      entranceTimeline = gsap.fromTo(visible, {opacity: 0, y: style.y, scale: style.scale}, {opacity: 1, y: 0, scale: 1, duration: style.duration, stagger: .045, ease: style.ease, clearProps: 'opacity,transform'});
    }
    filterTween = null;
  };
  if (canAnimate()) filterTween = gsap.to(cards.filter(card => !card.hidden), {opacity: 0, duration: .13, onComplete: applyFilter});
  else applyFilter();
}));
document.querySelectorAll('.gallery-item').forEach(button => {
  button.setAttribute('aria-label', `View image and notes: ${button.dataset.title}`);
  button.setAttribute('aria-haspopup', 'dialog');
  button.addEventListener('click', () => {
    returnFocus = button;
    const image = lightbox.querySelector('img');
    image.src = button.dataset.full;
    image.alt = button.dataset.title;
    document.getElementById('image-title').textContent = button.dataset.title;
    document.getElementById('image-description').textContent = button.dataset.desc === '...' ? '' : button.dataset.desc;
    lightbox.showModal();
    document.body.style.overflow = 'hidden';
    if (canAnimate()) {
      const style = motion();
      galleryTween = gsap.fromTo(lightbox, {opacity: 0, y: style.y, scale: isCute() ? .9 : .99}, {opacity: 1, y: 0, scale: 1, duration: style.duration, ease: style.ease, clearProps: 'opacity,transform'});
    }
  });
});
function closeImage() {
  galleryTween?.progress(1);
  if (!lightbox.open) return;
  if (canAnimate()) galleryTween = gsap.to(lightbox, {opacity: 0, y: 8, duration: .18, onComplete: () => lightbox.close()});
  else lightbox.close();
}
lightbox.querySelector('.lightbox-close').addEventListener('click', closeImage);
lightbox.addEventListener('cancel', event => { event.preventDefault(); closeImage(); });
lightbox.addEventListener('click', event => {
  if (event.target !== lightbox) return;
  const rect = lightbox.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeImage();
});
lightbox.addEventListener('close', () => {
  galleryTween?.kill();
  if (gsap) gsap.set(lightbox, {clearProps: 'opacity,transform'});
  document.body.style.overflow = '';
  if (returnFocus && !returnFocus.closest('[data-view]').hidden) returnFocus.focus({preventScroll: true});
});

// Decorative effects never intercept clicks, replace cursors, or delay navigation.
const effects = document.createElement('div');
effects.className = 'effects-layer';
effects.setAttribute('aria-hidden', 'true');
document.body.append(effects);
function burst(event, target) {
  if (!canAnimate() || Date.now() - lastBurst < 130) return;
  lastBurst = Date.now();
  const rect = target.getBoundingClientRect();
  const x = event.detail ? event.clientX : rect.left + rect.width / 2;
  const y = event.detail ? event.clientY : rect.top + rect.height / 2;
  const cute = isCute();
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('span');
    particle.className = cute ? 'particle cute' : 'particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    effects.append(particle);
    const angle = (i / 8) * Math.PI * 2;
    const distance = cute ? 35 + Math.random() * 25 : 20 + Math.random() * 35;
    gsap.to(particle, {x: Math.cos(angle) * distance, y: Math.sin(angle) * distance + (cute ? -15 : 24), rotation: cute ? i * 30 : i * 45, scale: cute ? .25 : .15, opacity: 0, duration: cute ? .9 : .6, ease: 'power2.out', onComplete: () => particle.remove()});
  }
}
document.addEventListener('click', event => {
  const target = event.target.closest('a, button');
  if (target) burst(event, target);
});
const interactive = [...document.querySelectorAll('.project-card, .side-choice, .gallery-item, .social-link, .button')];
interactive.forEach(element => {
  element.addEventListener('pointerenter', () => {
    if (!canAnimate() || !finePointer.matches) return;
    gsap.to(element, {y: isCute() ? -7 : -3, rotation: isCute() ? -1 : 0, duration: isCute() ? .5 : .3, ease: isCute() ? 'back.out(2)' : 'power2.out', overwrite: 'auto'});
  });
  element.addEventListener('pointerleave', () => {
    if (!gsap) return;
    gsap.to(element, {y: 0, rotation: 0, duration: canAnimate() ? .5 : 0, ease: isCute() ? 'elastic.out(1, .5)' : 'power2.out', clearProps: 'transform', overwrite: 'auto'});
  });
});
reducedMotion.addEventListener('change', () => {
  if (!reducedMotion.matches) return;
  routeTween?.progress(1);
  filterTween?.progress(1);
  entranceTimeline?.progress(1);
  galleryTween?.progress(1);
  counterTimeline?.progress(1);
  if (gsap) {
    gsap.killTweensOf(interactive);
    gsap.set(interactive, {clearProps: 'transform'});
    gsap.killTweensOf([...effects.children]);
  }
  effects.replaceChildren();
});
window.addEventListener('hashchange', () => route());
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) { counterTimeline?.progress(1); updateExperience(); }
});
let savedTheme = 'rust';
try { savedTheme = window.localStorage.getItem('wadish-theme') || 'rust'; } catch { /* The theme picker remains usable. */ }
applyTheme(savedTheme);
updateExperience();
route(true);
