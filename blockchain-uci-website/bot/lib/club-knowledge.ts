/** Ground truth for public site content at https://www.uciblockchain.org/ */

export type ClubSection =
  | "about"
  | "programs"
  | "team"
  | "advisors"
  | "events"
  | "sponsors"
  | "alumni_employers"
  | "contact"
  | "links";

export type ClubSectionContent = {
  title: string;
  summary: string;
  bullets?: string[];
};

export const CLUB_SECTIONS: Record<ClubSection, ClubSectionContent> = {
  about: {
    title: "About Blockchain at UCI",
    summary:
      "Blockchain at UCI is UC Irvine's student-run blockchain and crypto club. We run workshops, build projects, host industry speakers, and connect members to internships and jobs in Web3.",
    bullets: [
      "Focus areas: Ethereum, Solana, DeFi, smart contracts, and the broader crypto ecosystem.",
      "Members come from computer science, economics, and other majors.",
    ],
  },
  programs: {
    title: "What we do",
    summary:
      "We collaborate with industry leaders to host events, teach practical blockchain skills, and help students in Orange County explore Web3 careers.",
    bullets: [
      "Meetings: general meetings, socials, meetups, conferences.",
      "Speakers: established leaders sharing industry perspectives.",
      "Education: workshops, conferences, seminars.",
      "Opportunity: internships, impactful projects, networking, jobs.",
    ],
  },
  team: {
    title: "Leadership team",
    summary: "Current student leadership (from the public website).",
    bullets: [
      "Michelle Makhija — Co-President",
      "Mitali Mittal — Co-President",
      "Bihan Dasgupta — Vice President",
      "Anjali Kumar — Project Manager",
      "Pamela Cabingao — Marketing Director",
      "Sumanth Pallamreddy — Technical Lead",
      "Enrico Appiani — Technical Advisor",
      "Jordan Finn — Technical Advisor",
      "Tobin Sia — Business Development Lead",
      "Ethan An — Business Development Co-Lead",
      "Chengyi Yu — Business Development Intern",
      "Bryan Barragan — Business Development Intern",
    ],
  },
  advisors: {
    title: "Faculty advisor",
    summary: "Bill Maurer serves as faculty advisor.",
    bullets: [
      "Bill Maurer — Dean, UCI School of Social Sciences.",
      "Research focus: payment systems, exchange, and cryptocurrencies from a sociolegal and anthropological lens.",
    ],
  },
  events: {
    title: "Major events",
    summary: "Past and recurring event types highlighted on the site.",
    bullets: [
      "UCI Blockathon",
      "Blockchain Development Day",
      "Women in Blockchain Summit",
      "Jason Les Riot Blockchain Panel",
    ],
  },
  sponsors: {
    title: "Sponsors",
    summary: "Organizations that have sponsored or partnered with the club.",
    bullets: [
      "Chainlink",
      "Circle",
      "Solana",
      "Sui",
      "TRON",
      "Polymarket",
      "Stand With Crypto",
    ],
  },
  alumni_employers: {
    title: "Where members have worked",
    summary:
      "Alumni and members have interned or worked at companies across blockchain, finance, and tech.",
    bullets: [
      "Amazon",
      "Apple",
      "Microsoft",
      "Cisco",
      "Tesla",
      "SpaceX",
      "Palo Alto Networks",
      "TikTok",
      "Disney",
      "Visa",
      "Capital One",
      "BlackRock",
      "Deloitte",
      "EY",
      "Coinbase",
      "Circle",
      "Ripple",
      "Gemini",
    ],
  },
  contact: {
    title: "Contact",
    summary: "Reach the club for questions, partnerships, or membership.",
    bullets: [
      "Email: blockchainatuci@gmail.com",
      "Use the site signup form (email list) or CONTACT section for general inquiries.",
    ],
  },
  links: {
    title: "Official links",
    summary: "Public profiles for Blockchain at UCI.",
    bullets: [
      "Website: https://www.uciblockchain.org/",
      "GitHub: https://github.com/blockchainuci/",
      "Instagram: https://www.instagram.com/blockchainuci/",
      "X: https://x.com/UCIBlockchain",
      "LinkedIn: https://www.linkedin.com/company/blockchain-at-uci",
    ],
  },
};

export function searchClubKnowledge(query: string): {
  matches: Array<{ section: ClubSection; snippet: string }>;
} {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { matches: [] };
  }

  const matches: Array<{ section: ClubSection; snippet: string }> = [];
  for (const [section, content] of Object.entries(CLUB_SECTIONS) as Array<
    [ClubSection, ClubSectionContent]
  >) {
    const haystack = [
      content.title,
      content.summary,
      ...(content.bullets ?? []),
    ]
      .join("\n")
      .toLowerCase();
    if (haystack.includes(q)) {
      matches.push({
        section,
        snippet: content.summary,
      });
    }
  }
  return { matches };
}
