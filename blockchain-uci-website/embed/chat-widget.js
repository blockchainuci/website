/**
 * Minimal chat widget for uciblockchain.org.
 * Set data-agent-url on the script tag to your deployed agent base URL, e.g.
 *   https://your-agent.host/blockchain-uci-website
 * Paths used: /v1/channels/website/chat and /v1/channels/website/reply
 */
(function () {
  const script = document.currentScript;
  const agentBase = (script && script.getAttribute("data-agent-url")) || "";
  if (!agentBase) {
    return;
  }

  const base = agentBase.replace(/\/$/, "");
  const chatUrl = `${base}/v1/channels/website/chat`;
  const replyUrl = `${base}/v1/channels/website/reply`;
  const storageKey = "blockchain-uci-chat-session";

  let sessionKey = localStorage.getItem(storageKey);
  if (!sessionKey) {
    sessionKey = crypto.randomUUID();
    localStorage.setItem(storageKey, sessionKey);
  }

  const root = document.createElement("div");
  root.id = "bci-chat-root";
  root.innerHTML = `
    <button type="button" id="bci-chat-toggle" aria-expanded="false" aria-controls="bci-chat-panel">Chat</button>
    <div id="bci-chat-panel" hidden>
      <header>Blockchain at UCI</header>
      <div id="bci-chat-log" role="log" aria-live="polite"></div>
      <form id="bci-chat-form">
        <input id="bci-chat-input" type="text" maxlength="4000" placeholder="Ask about the club…" autocomplete="off" />
        <button type="submit">Send</button>
      </form>
    </div>
  `;
  document.body.appendChild(root);

  const toggle = root.querySelector("#bci-chat-toggle");
  const panel = root.querySelector("#bci-chat-panel");
  const log = root.querySelector("#bci-chat-log");
  const form = root.querySelector("#bci-chat-form");
  const input = root.querySelector("#bci-chat-input");

  function append(role, text) {
    const line = document.createElement("p");
    line.className = role === "user" ? "bci-chat-user" : "bci-chat-bot";
    line.textContent = text;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  toggle.addEventListener("click", () => {
    const open = panel.hasAttribute("hidden");
    panel.toggleAttribute("hidden", !open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      input.focus();
    }
  });

  async function pollReply(key, attempts) {
    for (let i = 0; i < attempts; i += 1) {
      const res = await fetch(
        `${replyUrl}?sessionKey=${encodeURIComponent(key)}`,
      );
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }
      const data = await res.json();
      if (data.ready && data.text) {
        return data.text;
      }
      await new Promise((r) => setTimeout(r, 800));
    }
    return "Sorry — the assistant is taking too long. Email blockchainatuci@gmail.com and we will help.";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) {
      return;
    }
    input.value = "";
    append("user", message);
    append("bot", "…");

    try {
      const res = await fetch(chatUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, sessionKey }),
      });
      const payload = await res.json().catch(() => ({}));
      if (payload.sessionKey) {
        sessionKey = payload.sessionKey;
        localStorage.setItem(storageKey, sessionKey);
      }
      const answer = await pollReply(sessionKey, 45);
      log.lastChild.textContent = answer;
    } catch {
      log.lastChild.textContent =
        "Could not reach the assistant. Try again or email blockchainatuci@gmail.com.";
    }
  });
})();
