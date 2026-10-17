(function(){
  const btn=document.getElementById('menuToggle');
  const nav=document.getElementById('navLinks');
  if(btn && nav){
    btn.addEventListener('click',()=>{
      const open=nav.classList.toggle('open');
      btn.setAttribute('aria-expanded',String(open));
    });
    nav.addEventListener('click',e=>{
      if(e.target.closest('a')){
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded','false');
      }
    });
  }
})();
