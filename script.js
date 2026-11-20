const nav=document.querySelector(".nav"),menu=document.querySelector(".menu");menu.addEventListener("click",()=>nav.classList.toggle("open"));document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));document.querySelector(".theme").addEventListener("click",()=>document.body.classList.toggle("dark"));document.getElementById("year").textContent=new Date().getFullYear();
// ---- AI chat box (talks to /api/chat) ----
const EMAIL="wielothonyuthe2005@gmail.com";
const fab=document.getElementById("chatFab"),box=document.getElementById("chat"),body=document.getElementById("chatBody"),form=document.getElementById("chatForm"),chips=document.getElementById("chatChips"),sendBtn=document.getElementById("chatSend");
const history=[];let busy=false;
function toggleChat(open){box.hidden=!open;fab.setAttribute("aria-expanded",open);fab.textContent=open?"✕":"💬";if(open)form.message.focus();}
fab.addEventListener("click",()=>toggleChat(box.hidden));
document.getElementById("chatClose").addEventListener("click",()=>toggleChat(false));
function say(t,me){const d=document.createElement("div");d.className="bubble"+(me?" me":"");d.textContent=t;body.appendChild(d);body.scrollTop=body.scrollHeight;return d;}
async function ask(text){
  if(busy||!text.trim())return;
  busy=true;sendBtn.disabled=true;chips.style.display="none";
  say(text,true);history.push({role:"user",content:text});
  const wait=say("Thinking…");
  try{
    const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:history})});
    if(!r.ok){let m="";try{m=(await r.json()).error}catch{}throw new Error(m||("HTTP "+r.status));}
    const {reply}=await r.json();
    wait.textContent=reply;history.push({role:"assistant",content:reply});
  }catch(err){
    wait.textContent="Sorry, I couldn't answer right now. You can email Wielotho at "+EMAIL+".\n\n[debug: "+err.message+"]";
    history.pop();
  }
  busy=false;sendBtn.disabled=false;body.scrollTop=body.scrollHeight;
}
form.addEventListener("submit",e=>{e.preventDefault();const t=form.message.value;form.reset();ask(t);});
chips.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>ask(b.textContent)));
