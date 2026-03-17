
(function(){
  document.addEventListener('click', function(e){
    const btn = e.target.closest('[data-nav-toggle]');
    if (btn){
      const dropdown = btn.closest('.dropdown');
      if (window.innerWidth < 1024 && dropdown){
        e.preventDefault();
        dropdown.classList.toggle('open');
      }
    }
  });

  const phone = document.getElementById("phoneField");
  const email = document.getElementById("emailField");
  const wrap = document.getElementById("extraFields");
  if (phone && email && wrap) {
    function shouldOpen(){ return phone.value.trim().length >= 8 && email.value.trim().length > 0 && email.checkValidity(); }
    function sync(){ wrap.classList.toggle("is-open", shouldOpen()); }
    ["input","blur","change"].forEach(evt => {
      phone.addEventListener(evt, sync, {passive:true});
      email.addEventListener(evt, sync, {passive:true});
    });
    sync();
  }

  async function submitQuote(e, form){
    e.preventDefault();
    const btn = document.getElementById("submitBtn");
    const oldText = btn ? btn.textContent : "";
    if (btn){ btn.disabled = true; btn.textContent = "Sending..."; }
    try{
      const res = await fetch(form.action, {method:"POST", body:new FormData(form), headers:{"Accept":"application/json"}});
      if(!res.ok) throw new Error("Form submit failed");
      window.location.href = (form.getAttribute('data-thankyou') || "thank-you.html");
    }catch(err){
      alert("Sorry, it didn’t send. Please try again, or call 07802 563213.");
      if (btn){ btn.disabled = false; btn.textContent = oldText || "Get my quote"; }
    }
  }
  window.submitQuote = submitQuote;

  window.addEventListener("load", () => document.documentElement.classList.add("is-ready"));
  const els = Array.from(document.querySelectorAll('[data-anim="reveal"]'));
  if (els.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach((e)=>{
        if(e.isIntersecting){
          e.target.classList.add("in-view");
          io.unobserve(e.target);
        }
      });
    }, {threshold:0.14});
    els.forEach(el=>io.observe(el));
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
