(function(){
  'use strict';
  const root=document.documentElement;
  root.classList.add('m42-motion-ready');

  const toggle=document.querySelector('[data-toggle-menu]');
  const menu=document.querySelector('.mobile-menu');
  const closeMenu=()=>{
    if(!menu||!toggle)return;
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Open navigation menu');
  };
  if(toggle&&menu){
    toggle.addEventListener('click',()=>{
      const open=!menu.classList.contains('open');
      menu.classList.toggle('open',open);
      toggle.setAttribute('aria-expanded',String(open));
      toggle.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');
    });
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
    document.addEventListener('click',e=>{
      if(menu.classList.contains('open')&&!menu.contains(e.target)&&!toggle.contains(e.target))closeMenu();
    });
  }

  const header=document.querySelector('.site-header');
  const updateScroll=()=>{
    if(header)header.classList.toggle('is-scrolled',window.scrollY>16);
    const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    root.style.setProperty('--m42-scroll',Math.min(1,window.scrollY/max));
  };
  updateScroll();
  window.addEventListener('scroll',updateScroll,{passive:true});

  document.querySelectorAll('[data-expand]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll(btn.dataset.expand+' details').forEach(d=>d.open=true);
  }));
  document.querySelectorAll('[data-collapse]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll(btn.dataset.collapse+' details').forEach(d=>d.open=false);
  }));

  document.querySelectorAll('img').forEach((img,index)=>{
    if(!img.hasAttribute('loading')&&index>2)img.loading='lazy';
    if(!img.hasAttribute('decoding'))img.decoding='async';
  });

  const reveal=[...document.querySelectorAll('.m42-reveal')];
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if('IntersectionObserver' in window&&!reduce){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },{rootMargin:'0px 0px -8% 0px',threshold:.07});
    reveal.forEach((el,index)=>{
      el.style.transitionDelay=Math.min(index%3,2)*55+'ms';
      observer.observe(el);
    });
  }else reveal.forEach(el=>el.classList.add('is-visible'));

  const navLinks=[...document.querySelectorAll('.m42-section-nav a[href^="#"]')];
  if(navLinks.length&&'IntersectionObserver' in window){
    const targets=navLinks.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
    const activeObserver=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible)return;
      navLinks.forEach(link=>link.classList.toggle('is-active',link.getAttribute('href')==='#'+visible.target.id));
    },{rootMargin:'-32% 0px -58% 0px',threshold:[0,.1,.3,.6]});
    targets.forEach(target=>activeObserver.observe(target));
  }

  const fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(fine&&!reduce){
    document.querySelectorAll('[data-m42-tilt="hero"]').forEach(frame=>{
      let raf=0;
      const reset=()=>{
        frame.style.setProperty('--m42-rx','0deg');
        frame.style.setProperty('--m42-ry','0deg');
      };
      frame.addEventListener('pointermove',event=>{
        cancelAnimationFrame(raf);
        raf=requestAnimationFrame(()=>{
          const rect=frame.getBoundingClientRect();
          const x=(event.clientX-rect.left)/rect.width-.5;
          const y=(event.clientY-rect.top)/rect.height-.5;
          frame.style.setProperty('--m42-rx',(-y*1.8).toFixed(2)+'deg');
          frame.style.setProperty('--m42-ry',(x*2.4).toFixed(2)+'deg');
        });
      });
      frame.addEventListener('pointerleave',reset);
      frame.addEventListener('blur',reset,true);
    });
  }
})();
