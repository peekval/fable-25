/* FABLE/25 shop layer — injected on every template + guide page.
   Static paywall: previews stay open (they sell), the buy bar prices each
   template, and guide reproduction prompts lock behind a licence key.
   Key check is deterrence, not cryptography — real fulfilment happens
   after purchase by e-mail. */
(function(){
  "use strict";
  var m=location.pathname.match(/\/(\d\d)-([a-z0-9-]+)\//);
  if(!m) return;
  var num=+m[1], slug=m[1]+"-"+m[2], isGuide=/\/guide\//.test(location.pathname);

  function tier(n){
    if(n>=70) return {name:"Wave VI",price:690,label:"CHF 690"};
    if(n>=65) return {name:"Big Five",price:null,label:"Showcase — Kollektion auf Anfrage"};
    if(n>=59) return {name:"Swiss Template",price:690,label:"CHF 690"};
    if(n>=49) return {name:"Signature",price:980,label:"CHF 980"};
    return {name:"Standard",price:490,label:"CHF 490"};
  }
  var T=tier(num);
  var MAIL="laserfabio@icloud.com";
  function buyHref(){
    var s=encodeURIComponent("Kaufanfrage Template "+slug.toUpperCase()+(T.price?" (CHF "+T.price+")":" (Kollektion)"));
    var b=encodeURIComponent("Hallo Fabio\n\nIch möchte das Template \""+slug+"\" kaufen.\n\nName / Firma:\nRechnungsadresse:\n\nDanke!");
    return "mailto:"+MAIL+"?subject="+s+"&body="+b;
  }

  /* licence key: djb2 over normalized key, allowlist of hashes */
  function h(s){var x=5381;s=s.toUpperCase().replace(/[^A-Z0-9]/g,"");for(var i=0;i<s.length;i++)x=((x<<5)+x+s.charCodeAt(i))>>>0;return x.toString(36)}
  var OK={"o0iv4c":1,"1i9nmdt":1}; /* owner + demo licence */
  function licensed(){try{return OK[h(localStorage.getItem("fable25-licence")||"")]===1}catch(e){return false}}
  function saveKey(k){try{localStorage.setItem("fable25-licence",k)}catch(e){}}

  var css=document.createElement("style");
  css.textContent=
  ".f25-bar{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:2147483000;display:flex;align-items:center;gap:14px;background:rgba(11,11,14,.92);border:1px solid rgba(245,243,238,.2);border-radius:999px;padding:9px 10px 9px 20px;font-family:'Space Grotesk',system-ui,sans-serif;font-size:13px;color:#F5F3EE;backdrop-filter:blur(8px);box-shadow:0 12px 34px rgba(0,0,0,.45);max-width:calc(100vw - 24px)}"+
  ".f25-bar .t{letter-spacing:.06em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"+
  ".f25-bar .t b{color:#FFD98A;font-weight:600;margin-left:8px}"+
  ".f25-bar a.buy{background:#F5F3EE;color:#0B0B0E;text-decoration:none;border-radius:999px;padding:8px 18px;font-weight:600;letter-spacing:.03em;white-space:nowrap}"+
  ".f25-bar a.buy:hover{background:#FFD98A}"+
  ".f25-bar a.all{color:#B9B7BE;text-decoration:none;font-size:12px;white-space:nowrap}"+
  ".f25-bar a.all:hover{color:#F5F3EE}"+
  ".f25-bar button{background:none;border:0;color:#8B8B94;font-size:16px;cursor:pointer;padding:2px 8px 2px 0;line-height:1}"+
  "@media(max-width:560px){.f25-bar{gap:9px;padding-left:14px;font-size:12px}.f25-bar a.all{display:none}}"+
  ".f25-lock{position:relative;border-radius:10px;overflow:hidden}"+
  ".f25-lock .f25-blur{filter:blur(9px) saturate(.8);user-select:none;pointer-events:none}"+
  ".f25-gate{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(8,8,10,.72);text-align:center;padding:26px;font-family:'Space Grotesk',system-ui,sans-serif}"+
  ".f25-gate h3{color:#F5F3EE;font-size:17px;font-weight:600;letter-spacing:.02em}"+
  ".f25-gate p{color:#B9B7BE;font-size:13.5px;max-width:42ch;line-height:1.6}"+
  ".f25-gate .row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}"+
  ".f25-gate input{background:rgba(245,243,238,.08);border:1px solid rgba(245,243,238,.25);border-radius:8px;color:#F5F3EE;padding:10px 14px;font-family:ui-monospace,monospace;font-size:13px;letter-spacing:.08em;width:220px}"+
  ".f25-gate button,.f25-gate a.buy{background:#F5F3EE;color:#0B0B0E;border:0;border-radius:8px;padding:10px 18px;font-weight:600;font-size:13px;cursor:pointer;text-decoration:none}"+
  ".f25-gate .err{color:#FF8A7A;font-size:12px;min-height:16px}"+
  ".f25-gate .ok{color:#9FE3A8;font-size:13px}";
  document.head.appendChild(css);

  if(!isGuide){
    /* ---- template preview: buy bar ---- */
    try{if(sessionStorage.getItem("f25-hide-"+slug))return}catch(e){}
    var bar=document.createElement("div");
    bar.className="f25-bar";bar.setAttribute("role","complementary");bar.setAttribute("aria-label","Template kaufen");
    bar.innerHTML="<span class='t'>"+(licensed()?"Lizenz aktiv · "+T.name:"Template-Vorschau · "+T.name)+
      (T.price?"<b>"+T.label+"</b>":"<b>"+T.label+"</b>")+"</span>"+
      (T.price?"<a class='buy' href='"+buyHref()+"'>Kaufen</a>":"<a class='buy' href='mailto:"+MAIL+"?subject=Big%20Five%20Kollektion'>Anfragen</a>")+
      "<a class='all' href='/#pricing'>Alle Templates</a><button aria-label='Ausblenden'>×</button>";
    bar.querySelector("button").addEventListener("click",function(){
      bar.remove();try{sessionStorage.setItem("f25-hide-"+slug,"1")}catch(e){}
    });
    (document.body||document.documentElement).appendChild(bar);
  }else{
    /* ---- guide: hard paywall on the reproduction prompt ---- */
    if(licensed())return;
    var pre=document.getElementById("prompt")||document.getElementById("prompt-text")||document.getElementById("promptText");if(!pre)return;
    var box=pre.closest(".pbox,.prompt-box,.promptbox,.prompt-wrap")||pre.parentElement;
    /* Sicherung: nie mehr als ~60% der Seite sperren — sonst nur das pre selbst */
    if(box.getBoundingClientRect().height>document.documentElement.scrollHeight*0.6) box=pre;
    var wrap=document.createElement("div");wrap.className="f25-lock";
    box.parentElement.insertBefore(wrap,box);wrap.appendChild(box);box.classList.add("f25-blur");
    var gate=document.createElement("div");gate.className="f25-gate";
    gate.innerHTML="<h3>Repro-Prompt ist Teil des Template-Kaufs</h3>"+
      "<p>Mit dem Kauf erhältst du die Template-Datei, diesen vollständigen Reproduktions-Prompt, den Technik-Guide und eine kommerzielle Einzellizenz.</p>"+
      "<div class='row'><input placeholder='FABLE-XXXX-XXXX' aria-label='Lizenzschlüssel'><button>Freischalten</button></div>"+
      "<div class='err'></div>"+
      "<a class='buy' href='"+buyHref()+"'>"+(T.price?"Template kaufen · "+T.label:"Kollektion anfragen")+"</a>";
    wrap.appendChild(gate);
    gate.querySelector("button").addEventListener("click",function(){
      var k=gate.querySelector("input").value;
      if(OK[h(k)]===1){saveKey(k);gate.innerHTML="<p class='ok'>Lizenz aktiviert — viel Freude beim Bauen.</p>";box.classList.remove("f25-blur");setTimeout(function(){gate.remove()},1400);}
      else gate.querySelector(".err").textContent="Ungültiger Schlüssel.";
    });
  }
})();
