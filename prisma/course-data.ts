// LingoDuo Spanish course content, assembled in learn-path order:
//   Level 1 (sections 1-10)  — the core course, basics through grammar
//   Level 2 (10 sections)    — harder material on the same themes
//   Level 3 (10 sections)    — typed-answer reinforcement of all L1+L2 vocab
//
// Content lives in the course-data-level*.ts files; shared shapes and
// authoring rules live in course-types.ts.

import { level1Sections } from "./course-data-level1";
import { level2Sections } from "./course-data-level2";
import { level3Sections } from "./course-data-level3";

export type { WordDef, SentenceDef, UnitDef, SectionDef } from "./course-types";

export const sections = [...level1Sections, ...level2Sections, ...level3Sections];
