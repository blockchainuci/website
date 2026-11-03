import {
  defineChannel,
  GET,
  POST,
  publicEndpoint,
} from "@grok/agent-sdk/channels";
import * as z from "zod/v4";

type WebsiteState = {
  sessionKey: string;
};

function replyKey(sessionKey: string) {
  return `website:reply:${sessionKey}`;
}

/**
 * Website chat webhook. After deploy, point the static site widget at:
 *   POST {AGENT_URL}/v1/channels/website/chat
 *   GET  {AGENT_URL}/v1/channels/website/reply?sessionKey=…
 */
export default defineChannel<WebsiteState>({
  auth: [publicEndpoint()],
  state: { sessionKey: "" },
  routes: [
    POST("/chat", {
      description: "Visitor message from uciblockchain.org chat widget",
      bodySchema: z.object({
        message: z.string().min(1).max(4000),
        sessionKey: z.string().min(1).max(128).optional(),
      }),
      handler: async (_request, { send, waitUntil, body, host }) => {
        const sessionKey = body.sessionKey ?? crypto.randomUUID();
        await host.kv.put(replyKey(sessionKey), {
          ready: false,
          text: "",
          at: Date.now(),
        });
        waitUntil(
          send(body.message, {
            continuationToken: `website:${sessionKey}`,
            state: { sessionKey },
            title: "Website visitor",
          }),
        );
        return Response.json({ ok: true, sessionKey });
      },
    }),
    GET("/reply", {
      description: "Poll assistant reply for a website chat sessionKey",
      querySchema: z.object({
        sessionKey: z.string().min(1).max(128),
      }),
      handler: async (_request, { query, host }) => {
        const stored = await host.kv.get(replyKey(query.sessionKey));
        if (!stored) {
          return Response.json({ ready: false, text: "" });
        }
        return Response.json(stored);
      },
    }),
  ],
  events: {
    async "message.completed"(event, channel, ctx) {
      if (event.data.finishReason === "tool_call" || !event.data.text) {
        return;
      }
      const sessionKey = channel.state.sessionKey;
      if (!sessionKey) {
        return;
      }
      await ctx.host.kv.put(replyKey(sessionKey), {
        ready: true,
        text: event.data.text,
        at: Date.now(),
      });
    },
  },
});
