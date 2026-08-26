/* Chef Claudinei - page behaviour.

   Loaded with `defer` from the <head> of index.html, so it downloads during the
   parse and runs after it, still before DOMContentLoaded - which is what the
   safety net inlined in the <head> waits for.

   In order: compact bar on scroll, mobile menu, footer year, scroll reveal,
   generate_lead listener, and - last, always - the data-ready flag. Nothing may
   be added after that flag: it means "the whole script ran", and code below it
   would let an error leave the `js` class up with a dead menu button.
*/
(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // compact bar once the page scrolls
  var navbar = document.getElementById('navbar');
  addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', scrollY > 60);
  }, { passive: true });

  // Mobile menu. Five ways to close it, and aria-expanded/aria-label follow all
  // five - every one of them goes through menu(), which is the only place those
  // two attributes are written. Never toggle the classes by hand.
  var btn = document.getElementById('menu-btn');
  var list = document.getElementById('nav-links');

  function menu(open) {
    list.classList.toggle('open', open);
    btn.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    menu(!list.classList.contains('open'));
  });
  list.addEventListener('click', function (e) {          // 1. tapping a link
    if (e.target.closest('a')) { menu(false); }
  });
  document.addEventListener('click', function (e) {      // 2. tapping outside
    if (list.classList.contains('open') && !list.contains(e.target)) { menu(false); }
  });
  addEventListener('keydown', function (e) {             // 3. Escape returns focus
    if (e.key === 'Escape' && list.classList.contains('open')) { menu(false); btn.focus(); }
  });
  addEventListener('resize', function () {               // 4. back above the breakpoint
    if (innerWidth > 760) { menu(false); }
  });
  list.addEventListener('focusout', function (e) {       // 5. focus left the panel
    // In landscape the panel covers the top of the page, so tabbing past the
    // last link used to move focus onto a button hidden underneath it. Guarded
    // on relatedTarget: focus leaving the document entirely is the click-outside
    // case, already handled above.
    var to = e.relatedTarget;
    if (to && to !== btn && !list.contains(to)) { menu(false); }
  });

  var year = document.getElementById('year');
  if (year) { year.textContent = new Date().getFullYear(); }

  // Scroll reveal. Still off under reduced motion - not because the CSS cannot
  // reach it (it can, now that this is a class) but because with no observer
  // there is nothing to run. The `reveal-on` gate is still what guarantees an
  // interrupted script renders the page complete instead of blank.
  if (!reduced && 'IntersectionObserver' in window) {
    var ROLES = [
      ['.section-label', 'label'],
      ['.section-title', 'title'],
      ['.section-text',  'text'],
      ['.stat',          'text'],
      ['.contact-item',  'text'],
      ['.about-imgs',    'media'],
      ['.service-card',  'media'],
      ['.menu-col',      'media'],
      ['.gallery-item',  'media']
    ];

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    ROLES.forEach(function (pair) {
      document.querySelectorAll(pair[0]).forEach(function (el, i) {
        el.dataset.reveal = pair[1];
        if (i) { el.style.setProperty('--i', i); }   // stagger within the group
        io.observe(el);
      });
    });

    // Only now: any CSS that starts an element hidden hangs off this class, so
    // adding it after the attributes exist avoids a frame with everything
    // invisible.
    document.documentElement.classList.add('reveal-on');
  }

  // Conversion: one delegated listener covers every phone, SMS, WhatsApp and email
  // link on the page, including ones added later. Nothing is tagged in the
  // markup - the location is read from the DOM.
  function linkLocation(a) {
    if (a.closest('nav')) { return 'header'; }
    if (a.closest('footer')) { return 'footer'; }
    var section = a.closest('section[id]');
    return section ? section.id : 'other';
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="tel:"], a[href^="sms:"], a[href^="mailto:"], a[href*="wa.me"]') : null;
    if (!a || typeof gtag !== 'function') { return; }
    gtag('event', 'generate_lead', {
      method: a.href.indexOf('wa.me') > -1 ? 'whatsapp'
        : a.href.indexOf('mailto:') === 0 ? 'email'
        : a.href.indexOf('sms:') === 0 ? 'sms' : 'phone',
      link_location: linkLocation(a)
    });
  });

  // Last instruction on purpose: the flag means "the whole script ran". Raise it
  // earlier and a runtime error in the middle would leave the `js` class up with
  // a dead menu button - six links unreachable on a phone.
  document.documentElement.dataset.ready = 'ok';
})();
