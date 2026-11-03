import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  description: "Answers a contact question using lookup_club_info.",
  async test(t) {
    await t.send("What email should I use to contact Blockchain at UCI?");
    t.succeeded();
    t.calledTool("lookup_club_info");
  },
});
