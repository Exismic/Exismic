import { NextRequest, NextResponse } from "next/server";
import { isUuid } from "@/lib/support-agent/api-utils";
import { SUPPORT_WIDGET_CORS_HEADERS } from "@/lib/support-agent/cors";
import type { SupportAgent } from "@/lib/support-agent/types";
import { prisma } from "@/lib/prisma";

function escapeScriptJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const origin = new URL(request.url).origin;

  let agent: Partial<SupportAgent> = {
    id,
    name: "Exismic Support",
    welcome_message: "Hi, welcome in. How can I help today?",
    primary_color: "#8B5CF6",
    widget_position: "bottom-right",
    widget_icon_url: "",
  };

  if (isUuid(id)) {
    const [data] = await prisma.$queryRaw<SupportAgent[]>`
      select id, name, welcome_message, primary_color, widget_position, widget_icon_url
      from public.support_agents
      where id = ${id}::uuid
      limit 1
    `;
    if (data) agent = data;
  }

  const script = `
(function(){
  var cfg = ${escapeScriptJson({ agent, origin })};
  var id = 'exismic-support-widget-' + cfg.agent.id;
  if (document.getElementById(id)) return;

  function mount(){
    var side = cfg.agent.widget_position === 'bottom-left' ? 'left' : 'right';
    var root = document.createElement('div');
    root.id = id;

    var style = document.createElement('style');
    style.textContent =
      '#'+id+' *{box-sizing:border-box}' +
      '@keyframes lsFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}' +
      '@keyframes lsGlow{0%,100%{opacity:.55;transform:scale(.92)}50%{opacity:1;transform:scale(1.08)}}' +
      '@keyframes lsOrbit{to{transform:rotate(360deg)}}' +
      '@keyframes lsPanelIn{from{opacity:0;transform:translateY(18px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}' +
      '@keyframes lsDotPulse{0%,100%{opacity:.55;transform:scale(.86)}50%{opacity:1;transform:scale(1.18)}}' +
      '#'+id+' .ls-launcher{position:fixed;'+side+':22px;bottom:22px;z-index:2147483000;width:68px;height:68px;border:1px solid rgba(255,255,255,.16);border-radius:26px;color:#fff;background:rgba(5,5,9,.72);box-shadow:0 20px 65px rgba(34,211,238,.28),0 12px 35px rgba(0,0,0,.34);cursor:pointer;display:flex;align-items:center;justify-content:center;overflow:visible;isolation:isolate;animation:lsFloat 4.2s ease-in-out infinite;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease}' +
      '#'+id+' .ls-launcher:before{content:"";position:absolute;inset:-9px;border-radius:32px;background:radial-gradient(circle,rgba(34,211,238,.28),transparent 62%);filter:blur(8px);z-index:-1;animation:lsGlow 3.4s ease-in-out infinite}' +
      '#'+id+' .ls-launcher:after{content:"";position:absolute;inset:-5px;border-radius:30px;border:1px solid rgba(34,211,238,.28);opacity:.7}' +
      '#'+id+' .ls-launcher:hover{transform:translateY(-3px) scale(1.04);border-color:rgba(34,211,238,.38);box-shadow:0 28px 80px rgba(34,211,238,.38),0 16px 42px rgba(0,0,0,.38)}' +
      '#'+id+' .ls-orb{position:relative;width:58px;height:58px;border-radius:23px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 28% 20%,rgba(255,255,255,.86),transparent 16%),radial-gradient(circle at 70% 70%,rgba(34,211,238,.78),transparent 34%),linear-gradient(135deg,'+cfg.agent.primary_color+',#22d3ee);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 -18px 40px rgba(0,0,0,.12)}' +
      '#'+id+' .ls-orb-ring{position:absolute;inset:-5px;border-radius:27px;border:1px solid rgba(255,255,255,.16);border-top-color:rgba(255,255,255,.72);border-right-color:rgba(34,211,238,.58);animation:lsOrbit 8s linear infinite}' +
      '#'+id+' .ls-icon-img{position:absolute;inset:6px;z-index:2;width:calc(100% - 12px);height:calc(100% - 12px);display:none;border-radius:19px;object-fit:cover;box-shadow:inset 0 1px 0 rgba(255,255,255,.25)}' +
      '#'+id+' .ls-orb.has-image .ls-mark{display:none}' +
      '#'+id+' .ls-orb.has-image .ls-icon-img{display:block}' +
      '#'+id+' .ls-mark{position:relative;z-index:2;font:950 25px/1 Inter,ui-sans-serif,system-ui;letter-spacing:-.08em;text-shadow:0 3px 18px rgba(0,0,0,.25)}' +
      '#'+id+' .ls-node{position:absolute;width:8px;height:8px;border-radius:999px;background:#dff7ff;box-shadow:0 0 18px rgba(34,211,238,.9);animation:lsDotPulse 2.4s ease-in-out infinite}' +
      '#'+id+' .ls-node-a{right:8px;top:10px}' +
      '#'+id+' .ls-node-b{left:10px;bottom:12px;animation-delay:.65s;background:#fff6c7;box-shadow:0 0 18px rgba(250,204,21,.8)}' +
      '#'+id+' .ls-arc{position:absolute;left:-11px;top:25px;width:13px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.65));transform:rotate(-28deg)}' +
      '#'+id+' .ls-panel{position:fixed;'+side+':22px;bottom:100px;z-index:2147483000;width:min(390px,calc(100vw - 28px));height:min(570px,calc(100vh - 118px));overflow:hidden;border-radius:28px;background:#06070c;color:#fff;border:1px solid rgba(255,255,255,.14);box-shadow:0 28px 95px rgba(0,0,0,.52);font-family:Inter,ui-sans-serif,system-ui;display:none;flex-direction:column;animation:lsPanelIn .24s cubic-bezier(.2,.8,.2,1)}' +
      '#'+id+' .ls-head{display:flex;align-items:flex-start;gap:12px;padding:18px;border-bottom:1px solid rgba(255,255,255,.1);background:linear-gradient(135deg,rgba(139,92,246,.26),rgba(34,211,238,.10) 48%,rgba(0,0,0,.1))}' +
      '#'+id+' .ls-avatar{flex:0 0 auto;width:42px;height:42px;border-radius:16px;background:linear-gradient(135deg,'+cfg.agent.primary_color+',#22d3ee);display:flex;align-items:center;justify-content:center;color:#fff;font:950 13px/1 Inter,ui-sans-serif,system-ui;box-shadow:0 12px 34px rgba(139,92,246,.22)}' +
      '#'+id+' .ls-avatar img{width:100%;height:100%;border-radius:16px;object-fit:cover}' +
      '#'+id+' .ls-meta{min-width:0;flex:1}' +
      '#'+id+' .ls-title{font-size:15px;font-weight:950;letter-spacing:-.02em;color:#fff;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '#'+id+' .ls-sub{margin:6px 0 0;color:#c4c4cf;font-size:12.5px;line-height:1.45;font-weight:650}' +
      '#'+id+' .ls-status{display:inline-flex;align-items:center;gap:6px;margin-top:7px;color:#86efac;font-size:11px;font-weight:850}' +
      '#'+id+' .ls-dot{width:7px;height:7px;border-radius:999px;background:#34d399;box-shadow:0 0 16px rgba(52,211,153,.7)}' +
      '#'+id+' .ls-close{flex:0 0 auto;width:34px;height:34px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#d4d4dc;font:900 18px/1 Inter,ui-sans-serif,system-ui;cursor:pointer}' +
      '#'+id+' .ls-chat{flex:1;min-height:0;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:radial-gradient(circle at 50% 0%,rgba(139,92,246,.10),transparent 34%),#050507}' +
      '#'+id+' .ls-bubble{display:block;width:fit-content;max-width:84%;padding:11px 13px;border-radius:17px;font-size:13px;line-height:1.48;font-weight:650;white-space:pre-wrap;overflow-wrap:anywhere;word-break:normal;box-shadow:0 8px 24px rgba(0,0,0,.16)}' +
      '#'+id+' .ls-bot{align-self:flex-start;background:rgba(255,255,255,.09);color:#ececf2;border:1px solid rgba(255,255,255,.08);border-bottom-left-radius:7px}' +
      '#'+id+' .ls-user{align-self:flex-end;background:linear-gradient(135deg,'+cfg.agent.primary_color+',#22d3ee);color:#fff;border-bottom-right-radius:7px}' +
      '#'+id+' .ls-typing{opacity:.82}' +
      '#'+id+' .ls-suggestions{display:flex;flex-wrap:wrap;gap:7px;margin-top:2px}' +
      '#'+id+' .ls-chip{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.055);color:#d8d8e2;border-radius:999px;padding:7px 10px;font:850 11px/1 Inter,ui-sans-serif,system-ui;cursor:pointer}' +
      '#'+id+' .ls-foot{padding:0 13px 12px;background:#09090f;color:#70707a;font:800 10px/1 Inter,ui-sans-serif,system-ui;text-align:center}' +
      '#'+id+' .ls-form{display:flex;gap:9px;padding:12px;border-top:1px solid rgba(255,255,255,.1);background:#09090f}' +
      '#'+id+' .ls-input{flex:1;min-width:0;min-height:46px;border-radius:16px;border:1px solid rgba(255,255,255,.14);background:#111118;color:#fff;padding:0 14px;outline:none;font:750 14px Inter,ui-sans-serif,system-ui}' +
      '#'+id+' .ls-input::placeholder{color:#8b8b96}' +
      '#'+id+' .ls-input:focus{border-color:rgba(34,211,238,.45);box-shadow:0 0 0 3px rgba(34,211,238,.10)}' +
      '#'+id+' .ls-send{min-height:46px;border:0;border-radius:16px;background:linear-gradient(135deg,'+cfg.agent.primary_color+',#22d3ee);color:white;font:950 13px Inter,ui-sans-serif,system-ui;padding:0 16px;cursor:pointer;box-shadow:0 12px 30px rgba(34,211,238,.18)}' +
      '#'+id+' .ls-send:disabled{opacity:.6;cursor:not-allowed}' +
      '@media(max-width:520px){#'+id+' .ls-launcher{'+side+':16px;bottom:16px;width:64px;height:64px;border-radius:24px}#'+id+' .ls-orb{width:54px;height:54px;border-radius:21px}#'+id+' .ls-panel{'+side+':10px;bottom:88px;width:calc(100vw - 20px);height:min(560px,calc(100vh - 100px));border-radius:24px}#'+id+' .ls-head{padding:15px}#'+id+' .ls-chat{padding:13px}#'+id+' .ls-bubble{max-width:88%;font-size:13px}}' +
      '@media(prefers-reduced-motion:reduce){#'+id+' .ls-launcher,#'+id+' .ls-launcher:before,#'+id+' .ls-orb-ring,#'+id+' .ls-node,#'+id+' .ls-panel{animation:none}}';

    root.innerHTML =
      '<button class="ls-launcher" aria-label="Open support chat"><span class="ls-orb"><span class="ls-orb-ring"></span><span class="ls-arc"></span><img class="ls-icon-img" alt=""><span class="ls-mark">L</span><span class="ls-node ls-node-a"></span><span class="ls-node ls-node-b"></span></span></button>' +
      '<section class="ls-panel" aria-label="Support chat">' +
        '<div class="ls-head"><div class="ls-avatar"></div><div class="ls-meta"><p class="ls-title"></p><p class="ls-sub"></p><span class="ls-status"><span class="ls-dot"></span>Online now</span></div><button class="ls-close" type="button" aria-label="Close support chat">x</button></div>' +
        '<div class="ls-chat"></div>' +
        '<div class="ls-foot">Powered by Exismic Support Agent</div>' +
        '<form class="ls-form"><input class="ls-input" name="message" autocomplete="off" placeholder="Ask a question"><button class="ls-send">Send</button></form>' +
      '</section>';

    root.appendChild(style);
    document.body.appendChild(root);

    var launcher = root.querySelector('.ls-launcher');
    var orb = root.querySelector('.ls-orb');
    var iconImg = root.querySelector('.ls-icon-img');
    var panel = root.querySelector('.ls-panel');
    var avatar = root.querySelector('.ls-avatar');
    var title = root.querySelector('.ls-title');
    var sub = root.querySelector('.ls-sub');
    var close = root.querySelector('.ls-close');
    var chat = root.querySelector('.ls-chat');
    var form = root.querySelector('.ls-form');
    var input = root.querySelector('.ls-input');
    var send = root.querySelector('.ls-send');
    var conversationId = null;

    var agentName = cfg.agent.name || 'Exismic Support';
    var welcome = cfg.agent.welcome_message || 'Hi, welcome in. How can I help today?';
    var iconUrl = String(cfg.agent.widget_icon_url || '').trim();
    title.textContent = agentName;
    sub.textContent = 'Usually replies instantly';
    if (iconUrl) {
      iconImg.src = iconUrl;
      orb.className += ' has-image';
      var avatarImg = document.createElement('img');
      avatarImg.src = iconUrl;
      avatarImg.alt = '';
      avatar.appendChild(avatarImg);
    } else {
      avatar.textContent = agentName.split(/\\s+/).slice(0,2).map(function(part){return part.charAt(0)}).join('').toUpperCase() || 'AI';
    }

    function addBubble(text, own){
      var bubble = document.createElement('div');
      bubble.className = 'ls-bubble ' + (own ? 'ls-user' : 'ls-bot');
      bubble.textContent = text;
      chat.appendChild(bubble);
      chat.scrollTop = chat.scrollHeight;
      return bubble;
    }

    function sendMessage(text){
      var msg = String(text || '').trim();
      if (!msg || send.disabled) return;
      input.value = msg;
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }

    function addSuggestions(){
      var wrap = document.createElement('div');
      wrap.className = 'ls-suggestions';
      ['Pricing', 'Services', 'Contact team'].forEach(function(label){
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'ls-chip';
        chip.textContent = label;
        chip.onclick = function(){ sendMessage(label); };
        wrap.appendChild(chip);
      });
      chat.appendChild(wrap);
    }

    addBubble(welcome, false);
    addSuggestions();

    launcher.onclick = function(){
      panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
      if (panel.style.display === 'flex') input.focus();
    };

    close.onclick = function(){
      panel.style.display = 'none';
    };

    form.onsubmit = async function(event){
      event.preventDefault();
      var msg = input.value.trim();
      if (!msg) return;
      input.value = '';
      var oldSuggestions = chat.querySelector('.ls-suggestions');
      if (oldSuggestions) oldSuggestions.remove();
      addBubble(msg, true);
      var typing = addBubble('Typing...', false);
      typing.className += ' ls-typing';
      send.disabled = true;
      try {
        var res = await fetch(cfg.origin + '/api/support-agent/widget/' + cfg.agent.id + '/message', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ message: msg, conversationId: conversationId })
        });
        var data = await res.json().catch(function(){ return {}; });
        if (!res.ok) throw new Error(data.error || 'Request failed');
        conversationId = data.conversationId || conversationId;
        typing.textContent = data.reply || 'Please contact the business directly.';
      } catch (err) {
        typing.textContent = 'I could not connect right now. Please try again in a moment.';
      } finally {
        send.disabled = false;
        input.focus();
      }
    };
  }

  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount, { once: true });
})();`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      ...SUPPORT_WIDGET_CORS_HEADERS,
    },
  });
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: SUPPORT_WIDGET_CORS_HEADERS,
  });
}
