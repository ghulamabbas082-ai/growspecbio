
(function(){
  const toggle=document.querySelector('[data-toggle-menu]');
  const menu=document.querySelector('.mobile-menu');
  if(toggle&&menu){toggle.addEventListener('click',()=>menu.classList.toggle('open'));}
  document.querySelectorAll('[data-expand]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll(btn.dataset.expand+' details').forEach(d=>d.open=true)}));
  document.querySelectorAll('[data-collapse]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll(btn.dataset.collapse+' details').forEach(d=>d.open=false)}));
  document.querySelectorAll('img').forEach((img,i)=>{ if(!img.hasAttribute('loading') && i>2) img.loading='lazy'; if(!img.hasAttribute('decoding')) img.decoding='async'; });
})();
