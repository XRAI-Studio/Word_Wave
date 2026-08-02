// Course content, assembled in learn-path order.
//
// Spanish (course "es"): the shipping course.
//   Level 1 (sections 1-10)  — the core course, basics through grammar
//   Level 2 (10 sections)    — harder material on the same themes
//   Level 3 (10 sections)    — typed-answer reinforcement of all L1+L2 vocab
//
// Latin (course "la"): a DEV-ONLY fixture (isAvailable: false) proving the
//   two-course pipeline; replaced by full grammar-verified content in Phase 1b.
//
// Content lives in the course-data-*.ts files; shared shapes and authoring
// rules live in course-types.ts.

import { level1Sections } from "./course-data-level1";
import { level2Sections } from "./course-data-level2";
import { level3Sections } from "./course-data-level3";
import { latinLevel1Sections } from "./course-data-latin-level1";
import type { CourseDef, SectionDef } from "./course-types";

export type { WordDef, SentenceDef, UnitDef, SectionDef, CourseDef } from "./course-types";

// Stamp each level file's sections with their level number (the level files
// don't carry it themselves).
const withLevel = (sections: SectionDef[], level: number) =>
  sections.map((section) => ({ ...section, level }));

export const spanishSections: SectionDef[] = [
  ...withLevel(level1Sections, 1),
  ...withLevel(level2Sections, 2),
  ...withLevel(level3Sections, 3),
];

export const courses: CourseDef[] = [
  {
    code: "es",
    name: "Spanish",
    promptLanguageName: "Spanish",
    emblem: "🇪🇸",
    order: 1,
    correctLabel: "¡Correcto!",
    celebrateLabel: "¡Muy bien!",
    isAvailable: true,
    sections: spanishSections,
  },
  {
    code: "la",
    name: "Latin",
    promptLanguageName: "Latin",
    emblem: "🏛️",
    order: 2,
    correctLabel: "Rēctē!",
    celebrateLabel: "Euge!",
    // Phase 1b: Latin Level 1 is live. Grammar-reviewed 2026-08-01 (all 86
    // units; no case, agreement or verb-ending errors found — see PLAN.md).
    isAvailable: true,
    sections: latinLevel1Sections,
  },
];

// Back-compat: the single Spanish section list some tooling still imports.
export const sections = spanishSections;
