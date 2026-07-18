// Classical Latin — DEV/E2E FIXTURE ONLY (course "la", isAvailable: false).
//
// This is a tiny, hand-verified slice used to prove the two-course pipeline
// end-to-end (seed → learn path → lesson → swap). It is NOT shipped to
// production and is replaced by the full grammar-verified Latin Level 1 in
// Phase 1b. Sentences use the unmarked SOV order (verb last) and display
// macrons; typed answers are macron/j-i/v-u insensitive.

import { s, w, type SectionDef } from "./course-types";

export const latinFixtureSections: SectionDef[] = [
  {
    id: "section-la-fixture-1",
    title: "Section 1: Fundāmenta",
    description: "First Latin nouns and verbs",
    level: 1,
    units: [
      {
        title: "Nōmina",
        description: "First nouns",
        words: [
          w("puella", "girl"),
          w("puer", "boy"),
          w("aqua", "water"),
          w("terra", "land"),
          w("silva", "forest"),
          w("via", "road"),
        ],
        sentences: [
          s(
            "puella aquam amat",
            "the girl loves the water",
            ["puella", "aquam", "amat", "puer", "silvam", "videt"],
            ["puella", "aqua"]
          ),
          s(
            "puer silvam videt",
            "the boy sees the forest",
            ["puer", "silvam", "videt", "puella", "viam", "amat"],
            ["puer", "silva"]
          ),
          s(
            "puella viam videt",
            "the girl sees the road",
            ["puella", "viam", "videt", "puer", "terram", "amat"],
            ["puella", "via"]
          ),
        ],
      },
      {
        title: "Verba",
        description: "First verbs",
        words: [
          w("amat", "loves"),
          w("videt", "sees"),
          w("portat", "carries"),
          w("est", "is"),
          w("et", "and"),
          w("nōn", "not"),
        ],
        sentences: [
          s(
            "puer aquam portat",
            "the boy carries the water",
            ["puer", "aquam", "portat", "puella", "terram", "amat"],
            ["puer", "aqua", "portat"]
          ),
          s(
            "puella terram amat",
            "the girl loves the land",
            ["puella", "terram", "amat", "puer", "silvam", "videt"],
            ["puella", "terra", "amat"]
          ),
          s(
            "puer silvam nōn videt",
            "the boy does not see the forest",
            ["puer", "silvam", "nōn", "videt", "puella", "amat"],
            ["puer", "silva", "videt"]
          ),
        ],
      },
    ],
  },
];
