import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import {
  CLUB_SECTIONS,
  searchClubKnowledge,
  type ClubSection,
} from "../lib/club-knowledge.js";

const sectionSchema = z.enum([
  "about",
  "programs",
  "team",
  "advisors",
  "events",
  "sponsors",
  "alumni_employers",
  "contact",
  "links",
]);

export default defineTool({
  description:
    "Return official Blockchain at UCI website facts: about, programs, team, events, sponsors, employers, contact, or links. Use searchQuery for keyword lookup across sections, or section for one topic.",
  effect: "read",
  inputSchema: z.object({
    section: sectionSchema.optional(),
    searchQuery: z.string().optional(),
  }),
  async execute({ section, searchQuery }) {
    if (section) {
      const content = CLUB_SECTIONS[section as ClubSection];
      return { section, ...content };
    }
    if (searchQuery?.trim()) {
      const { matches } = searchClubKnowledge(searchQuery);
      if (matches.length === 0) {
        return {
          searchQuery,
          matches: [],
          hint: "Try section names like team, sponsors, contact, or keywords like email, Solana, internship.",
        };
      }
      const detailed = matches.map(({ section: s }) => ({
        section: s,
        ...CLUB_SECTIONS[s],
      }));
      return { searchQuery, matches: detailed };
    }
    return {
      availableSections: Object.keys(CLUB_SECTIONS),
      hint: "Pass section or searchQuery.",
    };
  },
});
