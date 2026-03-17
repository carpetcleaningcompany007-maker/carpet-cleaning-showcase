
document.addEventListener("click", (e)=>{
  const btn=e.target.closest('[data-nav-toggle]');
  if(btn){
    const parent=btn.closest('.dropdown');
    parent.classList.toggle('open');
  }
});
