// Classical Latin — Level 1 (grammar-sequenced, DCC-core vocabulary).
//
// Progression: 1st-declension nouns & the nominative (S1) → accusative &
// transitive verbs (S2) → 2nd-declension masculine (S3) → 2nd-declension
// neuter (S4) → adjective agreement (S5) → prepositions + accusative (S6) →
// prepositions + ablative (S7) → present-tense verbs, 1st–4th conjugation
// (S8) → plurals & plural agreement (S9) → consolidation (S10). 10 sections /
// 86 units (10, 12, then 8×8) to mirror Spanish Level 1.
//
// SCOPE NOTE: this Level 1 deliberately goes beyond the original PLAN.md split.
// It teaches the ablative, all prepositions, adjective agreement, a handful of
// 3rd/4th-declension nouns (arbor, mōns, collis, rēx, lēx, pāx, mare, sōl,
// portus, turris) and 3rd/4th-conjugation verbs (currit, venit, legit, scrībit,
// mittit, dūcit, pōnit, regit) — all of which PLAN.md had assigned to Level 2.
// Reviewed and accepted 2026-08-01: withholding the ablative and prepositions
// would leave Level 1 unable to say very much, and mainstream beginner courses
// introduce them early too. Level 2 must therefore build ON this rather than
// re-teach it — see the revised Level 2 spec in PLAN.md.
//
// Conventions: macrons shown; consonantal v and j; sentences use the unmarked
// SOV order (verb last) as the beginner default. Every sentence is
// constructible from its bank (the `s()` helper verifies this at load time).

import { s, w, type SectionDef } from "./course-types";

export const latinLevel1Sections: SectionDef[] = [
  // ============================ SECTION 1 ============================
  // First declension nouns; the nominative; intransitive verbs + copula.
  {
    id: "section-la-1",
    title: "Section 1: Prīma Verba",
    description: "First-declension nouns and the nominative case",
    level: 1,
    units: [
      {
        title: "Fēminae",
        description: "People (feminine)",
        words: [
          w("puella", "girl"),
          w("fēmina", "woman"),
          w("amīca", "friend"),
          w("fīlia", "daughter"),
          w("rēgīna", "queen"),
          w("domina", "lady"),
        ],
        sentences: [
          s("puella cantat", "the girl sings", ["puella", "cantat", "fēmina", "ambulat"], ["puella"]),
          s("fēmina ambulat", "the woman walks", ["fēmina", "ambulat", "amīca", "labōrat"], ["fēmina"]),
          s("rēgīna laeta est", "the queen is happy", ["rēgīna", "laeta", "est", "fīlia", "bona"], ["rēgīna"]),
        ],
      },
      {
        title: "Nātūra I",
        description: "Nature",
        words: [
          w("aqua", "water"),
          w("terra", "land"),
          w("silva", "forest"),
          w("rosa", "rose"),
          w("herba", "grass"),
          w("ōra", "shore"),
        ],
        sentences: [
          s("rosa pulchra est", "the rose is beautiful", ["rosa", "pulchra", "est", "herba", "alta"], ["rosa"]),
          s("silva magna est", "the forest is big", ["silva", "magna", "est", "terra", "parva"], ["silva"]),
          s("aqua alta est", "the water is deep", ["aqua", "alta", "est", "ōra", "longa"], ["aqua"]),
        ],
      },
      {
        title: "Domus I",
        description: "The house",
        words: [
          w("casa", "cottage"),
          w("mēnsa", "table"),
          w("porta", "gate"),
          w("fenestra", "window"),
          w("culīna", "kitchen"),
          w("sella", "chair"),
        ],
        sentences: [
          s("casa parva est", "the cottage is small", ["casa", "parva", "est", "mēnsa", "magna"], ["casa"]),
          s("porta alta est", "the gate is high", ["porta", "alta", "est", "fenestra", "lāta"], ["porta"]),
          s("mēnsa longa est", "the table is long", ["mēnsa", "longa", "est", "sella", "parva"], ["mēnsa"]),
        ],
      },
      {
        title: "Vīta",
        description: "Life and fortune",
        words: [
          w("vīta", "life"),
          w("fāma", "fame"),
          w("fortūna", "fortune"),
          w("cūra", "care"),
          w("grātia", "grace"),
          w("glōria", "glory"),
        ],
        sentences: [
          s("vīta bona est", "life is good", ["vīta", "bona", "est", "fāma", "magna"], ["vīta"]),
          s("fortūna caeca est", "fortune is blind", ["fortūna", "caeca", "est", "glōria", "magna"], ["fortūna"]),
          s("glōria magna est", "the glory is great", ["glōria", "magna", "est", "fāma", "longa"], ["glōria"]),
        ],
      },
      {
        title: "Caelum I",
        description: "Sky and weather",
        words: [
          w("lūna", "moon"),
          w("aura", "breeze"),
          w("flamma", "flame"),
          w("umbra", "shadow"),
          w("unda", "wave"),
          w("procella", "storm"),
        ],
        sentences: [
          s("lūna clāra est", "the moon is bright", ["lūna", "clāra", "est", "flamma", "alta"], ["lūna"]),
          s("flamma alta est", "the flame is high", ["flamma", "alta", "est", "unda", "magna"], ["flamma"]),
          s("procella magna est", "the storm is big", ["procella", "magna", "est", "aura", "parva"], ["procella"]),
        ],
      },
      {
        title: "Cīvitās I",
        description: "Town and community",
        words: [
          w("patria", "homeland"),
          w("turba", "crowd"),
          w("taberna", "shop"),
          w("pecūnia", "money"),
          w("corōna", "crown"),
          w("epistula", "letter"),
        ],
        sentences: [
          s("patria clāra est", "the homeland is famous", ["patria", "clāra", "est", "turba", "magna"], ["patria"]),
          s("turba magna est", "the crowd is big", ["turba", "magna", "est", "taberna", "parva"], ["turba"]),
          s("epistula longa est", "the letter is long", ["epistula", "longa", "est", "corōna", "pulchra"], ["epistula"]),
        ],
      },
      {
        title: "Virī I",
        description: "Men (first-declension masculine)",
        words: [
          w("poēta", "poet"),
          w("agricola", "farmer"),
          w("nauta", "sailor"),
          w("incola", "inhabitant"),
          w("scrība", "clerk"),
          w("aurīga", "charioteer"),
        ],
        sentences: [
          s("poēta cantat", "the poet sings", ["poēta", "cantat", "nauta", "labōrat"], ["poēta"]),
          s("agricola labōrat", "the farmer works", ["agricola", "labōrat", "incola", "ambulat"], ["agricola"]),
          s("nauta nāvigat", "the sailor sails", ["nauta", "nāvigat", "aurīga", "festīnat"], ["nauta"]),
        ],
      },
      {
        title: "Bellum I",
        description: "War (first-declension nouns)",
        words: [
          w("sagitta", "arrow"),
          w("hasta", "spear"),
          w("victōria", "victory"),
          w("pugna", "battle"),
          w("īra", "anger"),
          w("fuga", "flight"),
        ],
        sentences: [
          s("victōria magna est", "the victory is great", ["victōria", "magna", "est", "pugna", "longa"], ["victōria"]),
          s("pugna longa est", "the battle is long", ["pugna", "longa", "est", "īra", "magna"], ["pugna"]),
          s("hasta longa est", "the spear is long", ["hasta", "longa", "est", "sagitta", "acūta"], ["hasta"]),
        ],
      },
      {
        title: "Animālia I",
        description: "Animals",
        words: [
          w("aquila", "eagle"),
          w("columba", "dove"),
          w("rāna", "frog"),
          w("fera", "wild beast"),
          w("lupa", "she-wolf"),
          w("capra", "goat"),
        ],
        sentences: [
          s("aquila volat", "the eagle flies", ["aquila", "volat", "columba", "cantat"], ["aquila"]),
          s("rāna natat", "the frog swims", ["rāna", "natat", "fera", "ambulat"], ["rāna"]),
          s("lupa fera est", "the she-wolf is a wild beast", ["lupa", "fera", "est", "capra", "parva"], ["lupa", "fera"]),
        ],
      },
      {
        title: "Schola I",
        description: "School and language",
        words: [
          w("fābula", "story"),
          w("littera", "letter"),
          w("lingua", "language"),
          w("memoria", "memory"),
          w("sententia", "opinion"),
          w("charta", "paper"),
        ],
        sentences: [
          s("fābula longa est", "the story is long", ["fābula", "longa", "est", "littera", "parva"], ["fābula"]),
          s("lingua Latīna est", "the language is Latin", ["lingua", "Latīna", "est", "memoria", "bona"], ["lingua"]),
          s("memoria bona est", "the memory is good", ["memoria", "bona", "est", "sententia", "longa"], ["memoria"]),
        ],
      },
    ],
  },

  // ============================ SECTION 2 ============================
  // The accusative case and transitive verbs (subject–object–verb).
  {
    id: "section-la-2",
    title: "Section 2: Accūsātīvus",
    description: "The accusative case and transitive verbs",
    level: 1,
    units: [
      {
        title: "Domus II",
        description: "Around the house",
        words: [
          w("jānua", "doorway"),
          w("aula", "hall"),
          w("vīlla", "country house"),
          w("ārea", "courtyard"),
          w("cella", "storeroom"),
          w("scāla", "ladder"),
        ],
        sentences: [
          s("puella vīllam habet", "the girl has a country house", ["puella", "vīllam", "habet", "aulam", "spectat"], ["puella", "vīlla"]),
          s("fēmina jānuam spectat", "the woman looks at the doorway", ["fēmina", "jānuam", "spectat", "aulam", "habet"], ["fēmina", "jānua"]),
          s("domina aulam parat", "the lady prepares the hall", ["domina", "aulam", "parat", "cellam", "habet"], ["domina", "aula"]),
        ],
      },
      {
        title: "Cibus I",
        description: "Food and drink",
        words: [
          w("cēna", "dinner"),
          w("mēnsa", "table"),
          w("cerevisia", "beer"),
          w("olīva", "olive"),
          w("ūva", "grape"),
          w("farīna", "flour"),
        ],
        sentences: [
          s("puella cēnam parat", "the girl prepares dinner", ["puella", "cēnam", "parat", "olīvam", "habet"], ["puella", "cēna"]),
          s("fēmina ūvam habet", "the woman has a grape", ["fēmina", "ūvam", "habet", "olīvam", "portat"], ["fēmina", "ūva"]),
          s("domina olīvam dat", "the lady gives an olive", ["domina", "olīvam", "dat", "ūvam", "parat"], ["domina", "olīva"]),
        ],
      },
      {
        title: "Labor I",
        description: "Work in the fields",
        words: [
          w("terra", "land"),
          w("herba", "grass"),
          w("aqua", "water"),
          w("umbra", "shadow"),
          w("harēna", "sand"),
          w("rīpa", "riverbank"),
        ],
        sentences: [
          s("agricola terram amat", "the farmer loves the land", ["agricola", "terram", "amat", "herbam", "spectat"], ["agricola", "terra"]),
          s("nauta aquam spectat", "the sailor watches the water", ["nauta", "aquam", "spectat", "rīpam", "amat"], ["nauta", "aqua"]),
          s("incola rīpam habet", "the inhabitant has a riverbank", ["incola", "rīpam", "habet", "harēnam", "amat"], ["incola", "rīpa"]),
        ],
      },
      {
        title: "Rēgnum",
        description: "The kingdom",
        words: [
          w("rēgīna", "queen"),
          w("corōna", "crown"),
          w("glōria", "glory"),
          w("patria", "homeland"),
          w("victōria", "victory"),
          w("fāma", "fame"),
        ],
        sentences: [
          s("rēgīna corōnam habet", "the queen has a crown", ["rēgīna", "corōnam", "habet", "patriam", "amat"], ["rēgīna", "corōna"]),
          s("fēmina patriam amat", "the woman loves the homeland", ["fēmina", "patriam", "amat", "corōnam", "habet"], ["fēmina", "patria"]),
          s("rēgīna victōriam laudat", "the queen praises the victory", ["rēgīna", "victōriam", "laudat", "glōriam", "amat"], ["rēgīna", "victōria"]),
        ],
      },
      {
        title: "Epistulae",
        description: "Letters and words",
        words: [
          w("epistula", "letter"),
          w("fābula", "story"),
          w("littera", "letter"),
          w("charta", "paper"),
          w("lingua", "language"),
          w("sententia", "opinion"),
        ],
        sentences: [
          s("poēta fābulam nārrat", "the poet tells a story", ["poēta", "fābulam", "nārrat", "epistulam", "scrībit"], ["poēta", "fābula"]),
          s("scrība epistulam scrībit", "the clerk writes a letter", ["scrība", "epistulam", "scrībit", "chartam", "habet"], ["scrība", "epistula"]),
          s("puella linguam amat", "the girl loves the language", ["puella", "linguam", "amat", "fābulam", "nārrat"], ["puella", "lingua"]),
        ],
      },
      {
        title: "Bellum II",
        description: "Weapons and battle",
        words: [
          w("sagitta", "arrow"),
          w("hasta", "spear"),
          w("pugna", "battle"),
          w("victōria", "victory"),
          w("praeda", "booty"),
          w("cōpia", "supply"),
        ],
        sentences: [
          s("nauta hastam portat", "the sailor carries a spear", ["nauta", "hastam", "portat", "sagittam", "habet"], ["nauta", "hasta"]),
          s("aurīga sagittam timet", "the charioteer fears the arrow", ["aurīga", "sagittam", "timet", "pugnam", "spectat"], ["aurīga", "sagitta"]),
          s("agricola praedam spectat", "the farmer watches the booty", ["agricola", "praedam", "spectat", "cōpiam", "habet"], ["agricola", "praeda"]),
        ],
      },
      {
        title: "Nātūra III",
        description: "Plants and flowers",
        words: [
          w("rosa", "rose"),
          w("herba", "grass"),
          w("silva", "forest"),
          w("ūva", "grape"),
          w("spīna", "thorn"),
          w("viola", "violet"),
        ],
        sentences: [
          s("puella rosam portat", "the girl carries a rose", ["puella", "rosam", "portat", "herbam", "habet"], ["puella", "rosa"]),
          s("fēmina herbam spectat", "the woman looks at the grass", ["fēmina", "herbam", "spectat", "silvam", "amat"], ["fēmina", "herba"]),
          s("agricola silvam amat", "the farmer loves the forest", ["agricola", "silvam", "amat", "ūvam", "portat"], ["agricola", "silva"]),
        ],
      },
      {
        title: "Cīvitās II",
        description: "In the town",
        words: [
          w("taberna", "shop"),
          w("via", "street"),
          w("porta", "gate"),
          w("turba", "crowd"),
          w("pecūnia", "money"),
          w("fenestra", "window"),
        ],
        sentences: [
          s("fēmina pecūniam habet", "the woman has money", ["fēmina", "pecūniam", "habet", "tabernam", "spectat"], ["fēmina", "pecūnia"]),
          s("puella viam spectat", "the girl watches the street", ["puella", "viam", "spectat", "portam", "amat"], ["puella", "via"]),
          s("incola portam spectat", "the inhabitant watches the gate", ["incola", "portam", "spectat", "tabernam", "amat"], ["incola", "porta"]),
        ],
      },
      {
        title: "Deae",
        description: "Goddesses and worship",
        words: [
          w("dea", "goddess"),
          w("āra", "altar"),
          w("stella", "star"),
          w("victima", "victim"),
          w("flamma", "flame"),
          w("grātia", "grace"),
        ],
        sentences: [
          s("fēmina deam laudat", "the woman praises the goddess", ["fēmina", "deam", "laudat", "āram", "spectat"], ["fēmina", "dea"]),
          s("puella āram spectat", "the girl looks at the altar", ["puella", "āram", "spectat", "stellam", "amat"], ["puella", "āra"]),
          s("domina victimam parat", "the lady prepares the victim", ["domina", "victimam", "parat", "flammam", "spectat"], ["domina", "victima"]),
        ],
      },
      {
        title: "Animālia II",
        description: "More animals",
        words: [
          w("aquila", "eagle"),
          w("columba", "dove"),
          w("capra", "goat"),
          w("vacca", "cow"),
          w("equa", "mare"),
          w("cauda", "tail"),
        ],
        sentences: [
          s("puella columbam amat", "the girl loves the dove", ["puella", "columbam", "amat", "capram", "spectat"], ["puella", "columba"]),
          s("agricola capram habet", "the farmer has a goat", ["agricola", "capram", "habet", "vaccam", "amat"], ["agricola", "capra"]),
          s("fēmina vaccam spectat", "the woman watches the cow", ["fēmina", "vaccam", "spectat", "equam", "habet"], ["fēmina", "vacca"]),
        ],
      },
      {
        title: "Diēs",
        description: "The day",
        words: [
          w("lūna", "moon"),
          w("stella", "star"),
          w("aurōra", "dawn"),
          w("umbra", "shadow"),
          w("hōra", "hour"),
          w("mora", "delay"),
        ],
        sentences: [
          s("puella lūnam spectat", "the girl watches the moon", ["puella", "lūnam", "spectat", "stellam", "amat"], ["puella", "lūna"]),
          s("nauta stellam spectat", "the sailor watches the star", ["nauta", "stellam", "spectat", "aurōram", "amat"], ["nauta", "stella"]),
          s("fēmina aurōram amat", "the woman loves the dawn", ["fēmina", "aurōram", "amat", "umbram", "spectat"], ["fēmina", "aurōra"]),
        ],
      },
      {
        title: "Amīcitia",
        description: "Friendship",
        words: [
          w("amīca", "friend"),
          w("grātia", "grace"),
          w("cūra", "care"),
          w("epistula", "letter"),
          w("fīlia", "daughter"),
          w("vīta", "life"),
        ],
        sentences: [
          s("puella amīcam vocat", "the girl calls her friend", ["puella", "amīcam", "vocat", "fīliam", "amat"], ["puella", "amīca"]),
          s("fēmina fīliam amat", "the woman loves her daughter", ["fēmina", "fīliam", "amat", "amīcam", "vocat"], ["fēmina", "fīlia"]),
          s("amīca epistulam dat", "the friend gives a letter", ["amīca", "epistulam", "dat", "cūram", "habet"], ["amīca", "epistula"]),
        ],
      },
    ],
  },

  // ============================ SECTION 3 ============================
  // Second-declension masculine nouns (-us), nominative and accusative.
  {
    id: "section-la-3",
    title: "Section 3: Secunda Dēclīnātiō",
    description: "Second-declension masculine nouns",
    level: 1,
    units: [
      {
        title: "Virī II",
        description: "Men and roles",
        words: [
          w("servus", "slave"),
          w("dominus", "master"),
          w("amīcus", "friend"),
          w("fīlius", "son"),
          w("vir", "man"),
          w("puer", "boy"),
        ],
        sentences: [
          s("dominus servum vocat", "the master calls the slave", ["dominus", "servum", "vocat", "amīcum", "videt"], ["dominus", "servus"]),
          s("servus dominum timet", "the slave fears the master", ["servus", "dominum", "timet", "puerum", "videt"], ["servus", "dominus"]),
          s("fīlius amīcum habet", "the son has a friend", ["fīlius", "amīcum", "habet", "virum", "vocat"], ["fīlius", "amīcus"]),
        ],
      },
      {
        title: "Ager",
        description: "The farm",
        words: [
          w("ager", "field"),
          w("hortus", "garden"),
          w("equus", "horse"),
          w("taurus", "bull"),
          w("asinus", "donkey"),
          w("rīvus", "stream"),
        ],
        sentences: [
          s("agricola equum habet", "the farmer has a horse", ["agricola", "equum", "habet", "taurum", "videt"], ["agricola", "equus"]),
          s("servus hortum cūrat", "the slave tends the garden", ["servus", "hortum", "cūrat", "agrum", "amat"], ["servus", "hortus"]),
          s("puer taurum timet", "the boy fears the bull", ["puer", "taurum", "timet", "asinum", "videt"], ["puer", "taurus"]),
        ],
      },
      {
        title: "Domus III",
        description: "Home and hearth",
        words: [
          w("mūrus", "wall"),
          w("hortus", "garden"),
          w("locus", "place"),
          w("lectus", "bed"),
          w("focus", "hearth"),
          w("nummus", "coin"),
        ],
        sentences: [
          s("dominus mūrum spectat", "the master looks at the wall", ["dominus", "mūrum", "spectat", "hortum", "amat"], ["dominus", "mūrus"]),
          s("servus focum parat", "the slave prepares the hearth", ["servus", "focum", "parat", "lectum", "cūrat"], ["servus", "focus"]),
          s("puer nummum habet", "the boy has a coin", ["puer", "nummum", "habet", "locum", "spectat"], ["puer", "nummus"]),
        ],
      },
      {
        title: "Populus",
        description: "People and rulers",
        words: [
          w("populus", "people"),
          w("dominus", "master"),
          w("lēgātus", "envoy"),
          w("nūntius", "messenger"),
          w("captīvus", "captive"),
          w("socius", "ally"),
        ],
        sentences: [
          s("populus dominum laudat", "the people praise the master", ["populus", "dominum", "laudat", "lēgātum", "videt"], ["populus", "dominus"]),
          s("nūntius epistulam portat", "the messenger carries a letter", ["nūntius", "epistulam", "portat", "socium", "vocat"], ["nūntius", "epistula"]),
          s("lēgātus socium vocat", "the envoy calls the ally", ["lēgātus", "socium", "vocat", "captīvum", "videt"], ["lēgātus", "socius"]),
        ],
      },
      {
        title: "Bellum III",
        description: "Soldiers and camp",
        words: [
          w("mūrus", "wall"),
          w("gladius", "sword"),
          w("locus", "place"),
          w("animus", "spirit"),
          w("numerus", "number"),
          w("modus", "manner"),
        ],
        sentences: [
          s("vir gladium portat", "the man carries a sword", ["vir", "gladium", "portat", "mūrum", "spectat"], ["vir", "gladius"]),
          s("puer animum habet", "the boy has spirit", ["puer", "animum", "habet", "numerum", "spectat"], ["puer", "animus"]),
          s("dominus mūrum aedificat", "the master builds a wall", ["dominus", "mūrum", "aedificat", "gladium", "portat"], ["dominus", "mūrus"]),
        ],
      },
      {
        title: "Caelum II",
        description: "Sky and winds",
        words: [
          w("ventus", "wind"),
          w("campus", "plain"),
          w("mundus", "world"),
          w("rīvus", "stream"),
          w("fluvius", "river"),
          w("lupus", "wolf"),
        ],
        sentences: [
          s("nauta ventum timet", "the sailor fears the wind", ["nauta", "ventum", "timet", "fluvium", "spectat"], ["nauta", "ventus"]),
          s("puer campum spectat", "the boy looks at the plain", ["puer", "campum", "spectat", "mundum", "amat"], ["puer", "campus"]),
          s("agricola fluvium amat", "the farmer loves the river", ["agricola", "fluvium", "amat", "rīvum", "spectat"], ["agricola", "fluvius"]),
        ],
      },
      {
        title: "Discipulī",
        description: "Teacher and pupils",
        words: [
          w("magister", "teacher"),
          w("discipulus", "pupil"),
          w("liber", "book"),
          w("puer", "boy"),
          w("animus", "spirit"),
          w("stilus", "pen"),
        ],
        sentences: [
          s("magister puerum docet", "the teacher teaches the boy", ["magister", "puerum", "docet", "discipulum", "vocat"], ["magister", "puer"]),
          s("discipulus librum habet", "the pupil has a book", ["discipulus", "librum", "habet", "magistrum", "videt"], ["discipulus", "liber"]),
          s("puer librum amat", "the boy loves the book", ["puer", "librum", "amat", "magistrum", "laudat"], ["puer", "liber"]),
        ],
      },
      {
        title: "Deī",
        description: "Gods and temple",
        words: [
          w("deus", "god"),
          w("locus", "place"),
          w("mūrus", "wall"),
          w("equus", "horse"),
          w("taurus", "bull"),
          w("nūntius", "messenger"),
        ],
        sentences: [
          s("populus deum laudat", "the people praise the god", ["populus", "deum", "laudat", "nūntium", "vocat"], ["populus", "deus"]),
          s("vir taurum dat", "the man gives a bull", ["vir", "taurum", "dat", "equum", "habet"], ["vir", "taurus"]),
          s("servus equum dūcit", "the slave leads the horse", ["servus", "equum", "dūcit", "taurum", "videt"], ["servus", "equus"]),
        ],
      },
    ],
  },

  // ============================ SECTION 4 ============================
  // Second-declension neuter nouns (-um); nominative = accusative.
  {
    id: "section-la-4",
    title: "Section 4: Neutra",
    description: "Second-declension neuter nouns",
    level: 1,
    units: [
      {
        title: "Domus IV",
        description: "Things in the house",
        words: [
          w("dōnum", "gift"),
          w("vīnum", "wine"),
          w("aurum", "gold"),
          w("pōculum", "cup"),
          w("scamnum", "bench"),
          w("signum", "sign"),
        ],
        sentences: [
          s("domina dōnum dat", "the lady gives a gift", ["domina", "dōnum", "dat", "vīnum", "habet"], ["domina", "dōnum"]),
          s("servus vīnum portat", "the slave carries the wine", ["servus", "vīnum", "portat", "pōculum", "habet"], ["servus", "vīnum"]),
          s("dominus aurum spectat", "the master looks at the gold", ["dominus", "aurum", "spectat", "signum", "amat"], ["dominus", "aurum"]),
        ],
      },
      {
        title: "Oppidum",
        description: "The town",
        words: [
          w("oppidum", "town"),
          w("templum", "temple"),
          w("forum", "forum"),
          w("tēctum", "roof"),
          w("saxum", "rock"),
          w("aedificium", "building"),
        ],
        sentences: [
          s("populus templum aedificat", "the people build a temple", ["populus", "templum", "aedificat", "oppidum", "spectat"], ["populus", "templum"]),
          s("vir forum spectat", "the man looks at the forum", ["vir", "forum", "spectat", "tēctum", "amat"], ["vir", "forum"]),
          s("puer saxum portat", "the boy carries a rock", ["puer", "saxum", "portat", "oppidum", "spectat"], ["puer", "saxum"]),
        ],
      },
      {
        title: "Bellum IV",
        description: "War and its dangers",
        words: [
          w("bellum", "war"),
          w("perīculum", "danger"),
          w("vāllum", "rampart"),
          w("castellum", "fort"),
          w("scūtum", "shield"),
          w("tēlum", "weapon"),
        ],
        sentences: [
          s("populus bellum timet", "the people fear war", ["populus", "bellum", "timet", "perīculum", "spectat"], ["populus", "bellum"]),
          s("vir scūtum portat", "the man carries a shield", ["vir", "scūtum", "portat", "tēlum", "habet"], ["vir", "scūtum"]),
          s("puer perīculum timet", "the boy fears the danger", ["puer", "perīculum", "timet", "bellum", "spectat"], ["puer", "perīculum"]),
        ],
      },
      {
        title: "Caelum III",
        description: "Sky, land, and sea",
        words: [
          w("caelum", "sky"),
          w("frūmentum", "grain"),
          w("prātum", "meadow"),
          w("stāgnum", "pool"),
          w("grānum", "seed"),
          w("pōmum", "fruit"),
        ],
        sentences: [
          s("agricola frūmentum habet", "the farmer has grain", ["agricola", "frūmentum", "habet", "pōmum", "portat"], ["agricola", "frūmentum"]),
          s("puella pōmum portat", "the girl carries the fruit", ["puella", "pōmum", "portat", "grānum", "habet"], ["puella", "pōmum"]),
          s("nauta caelum spectat", "the sailor watches the sky", ["nauta", "caelum", "spectat", "stāgnum", "amat"], ["nauta", "caelum"]),
        ],
      },
      {
        title: "Verba",
        description: "Words and deeds",
        words: [
          w("verbum", "word"),
          w("factum", "deed"),
          w("cōnsilium", "plan"),
          w("exemplum", "example"),
          w("ōtium", "leisure"),
          w("studium", "eagerness"),
        ],
        sentences: [
          s("magister verbum docet", "the teacher teaches a word", ["magister", "verbum", "docet", "exemplum", "dat"], ["magister", "verbum"]),
          s("poēta cōnsilium laudat", "the poet praises the plan", ["poēta", "cōnsilium", "laudat", "factum", "nārrat"], ["poēta", "cōnsilium"]),
          s("discipulus studium habet", "the pupil has eagerness", ["discipulus", "studium", "habet", "ōtium", "amat"], ["discipulus", "studium"]),
        ],
      },
      {
        title: "Convīvium",
        description: "The feast",
        words: [
          w("convīvium", "banquet"),
          w("mulsum", "mead"),
          w("ōvum", "egg"),
          w("mālum", "apple"),
          w("rāpum", "turnip"),
          w("condīmentum", "seasoning"),
        ],
        sentences: [
          s("domina convīvium parat", "the lady prepares the banquet", ["domina", "convīvium", "parat", "ōvum", "dat"], ["domina", "convīvium"]),
          s("servus ōvum portat", "the slave carries an egg", ["servus", "ōvum", "portat", "mālum", "habet"], ["servus", "ōvum"]),
          s("puer mālum habet", "the boy has an apple", ["puer", "mālum", "habet", "rāpum", "portat"], ["puer", "mālum"]),
        ],
      },
      {
        title: "Rēgnum II",
        description: "Realm and rule",
        words: [
          w("rēgnum", "kingdom"),
          w("imperium", "command"),
          w("aurum", "gold"),
          w("dōnum", "gift"),
          w("praemium", "reward"),
          w("vōtum", "vow"),
        ],
        sentences: [
          s("rēgīna rēgnum spectat", "the queen surveys the kingdom", ["rēgīna", "rēgnum", "spectat", "imperium", "amat"], ["rēgīna", "rēgnum"]),
          s("dominus praemium dat", "the master gives a reward", ["dominus", "praemium", "dat", "dōnum", "habet"], ["dominus", "praemium"]),
          s("populus imperium laudat", "the people praise the command", ["populus", "imperium", "laudat", "rēgnum", "spectat"], ["populus", "imperium"]),
        ],
      },
      {
        title: "Templum",
        description: "Worship and offering",
        words: [
          w("templum", "temple"),
          w("dōnum", "gift"),
          w("signum", "sign"),
          w("sacrum", "rite"),
          w("vōtum", "vow"),
          w("sacellum", "shrine"),
        ],
        sentences: [
          s("fēmina dōnum dat", "the woman gives a gift", ["fēmina", "dōnum", "dat", "templum", "spectat"], ["fēmina", "dōnum"]),
          s("populus signum spectat", "the people look at the sign", ["populus", "signum", "spectat", "templum", "laudat"], ["populus", "signum"]),
          s("vir vōtum habet", "the man has a vow", ["vir", "vōtum", "habet", "sacrum", "parat"], ["vir", "vōtum"]),
        ],
      },
    ],
  },

  // ============================ SECTION 5 ============================
  // First/second-declension adjectives and noun–adjective agreement.
  {
    id: "section-la-5",
    title: "Section 5: Adjectīva",
    description: "Adjective agreement (first and second declension)",
    level: 1,
    units: [
      {
        title: "Adjectīva I",
        description: "Size and measure",
        words: [
          w("bonus", "good"),
          w("malus", "bad"),
          w("magnus", "big"),
          w("parvus", "small"),
          w("longus", "long"),
          w("lātus", "wide"),
        ],
        sentences: [
          s("puella bona est", "the girl is good", ["puella", "bona", "est", "magna", "laeta"], ["bonus"]),
          s("servus malus est", "the slave is bad", ["servus", "malus", "est", "bonus", "parvus"], ["malus"]),
          s("mūrus longus est", "the wall is long", ["mūrus", "longus", "est", "lātus", "altus"], ["longus"]),
        ],
      },
      {
        title: "Adjectīva II",
        description: "New and old",
        words: [
          w("altus", "high"),
          w("novus", "new"),
          w("antīquus", "old"),
          w("pulcher", "beautiful"),
          w("plēnus", "full"),
          w("vacuus", "empty"),
        ],
        sentences: [
          s("templum novum est", "the temple is new", ["templum", "novum", "est", "antīquum", "plēnum"], ["novus"]),
          s("casa antīqua est", "the cottage is old", ["casa", "antīqua", "est", "nova", "pulchra"], ["antīquus"]),
          s("pōculum plēnum est", "the cup is full", ["pōculum", "plēnum", "est", "vacuum", "novum"], ["plēnus"]),
        ],
      },
      {
        title: "Colōrēs",
        description: "Colours",
        words: [
          w("albus", "white"),
          w("niger", "black"),
          w("ruber", "red"),
          w("flāvus", "yellow"),
          w("fuscus", "dark"),
          w("caeruleus", "blue"),
        ],
        sentences: [
          s("rosa rubra est", "the rose is red", ["rosa", "rubra", "est", "alba", "flāva"], ["ruber"]),
          s("equus niger est", "the horse is black", ["equus", "niger", "est", "albus", "fuscus"], ["niger"]),
          s("caelum caeruleum est", "the sky is blue", ["caelum", "caeruleum", "est", "album", "fuscum"], ["caeruleus"]),
        ],
      },
      {
        title: "Adjectīva III",
        description: "Strength and shape",
        words: [
          w("amplus", "large"),
          w("angustus", "narrow"),
          w("crassus", "thick"),
          w("dūrus", "hard"),
          w("firmus", "strong"),
          w("aequus", "level"),
        ],
        sentences: [
          s("via angusta est", "the street is narrow", ["via", "angusta", "est", "ampla", "dūra"], ["angustus"]),
          s("mūrus firmus est", "the wall is strong", ["mūrus", "firmus", "est", "dūrus", "amplus"], ["firmus"]),
          s("saxum dūrum est", "the rock is hard", ["saxum", "dūrum", "est", "firmum", "amplum"], ["dūrus"]),
        ],
      },
      {
        title: "Adjectīva IV",
        description: "Mood and character",
        words: [
          w("laetus", "happy"),
          w("miser", "wretched"),
          w("īrātus", "angry"),
          w("placidus", "calm"),
          w("timidus", "fearful"),
          w("superbus", "proud"),
        ],
        sentences: [
          s("puella laeta est", "the girl is happy", ["puella", "laeta", "est", "īrāta", "placida"], ["laetus"]),
          s("dominus īrātus est", "the master is angry", ["dominus", "īrātus", "est", "superbus", "placidus"], ["īrātus"]),
          s("puer timidus est", "the boy is fearful", ["puer", "timidus", "est", "miser", "laetus"], ["timidus"]),
        ],
      },
      {
        title: "Adjectīva V",
        description: "Health and safety",
        words: [
          w("sacer", "sacred"),
          w("sānus", "healthy"),
          w("aeger", "sick"),
          w("tūtus", "safe"),
          w("aptus", "fit"),
          w("certus", "sure"),
        ],
        sentences: [
          s("templum sacrum est", "the temple is sacred", ["templum", "sacrum", "est", "tūtum", "certum"], ["sacer"]),
          s("fēmina sāna est", "the woman is healthy", ["fēmina", "sāna", "est", "aegra", "tūta"], ["sānus"]),
          s("locus tūtus est", "the place is safe", ["locus", "tūtus", "est", "certus", "aptus"], ["tūtus"]),
        ],
      },
      {
        title: "Adjectīva VI",
        description: "Worth and freedom",
        words: [
          w("cārus", "dear"),
          w("dignus", "worthy"),
          w("līber", "free"),
          w("pius", "dutiful"),
          w("sōlus", "alone"),
          w("tōtus", "whole"),
        ],
        sentences: [
          s("amīcus cārus est", "the friend is dear", ["amīcus", "cārus", "est", "dignus", "pius"], ["cārus"]),
          s("servus līber est", "the slave is free", ["servus", "līber", "est", "sōlus", "cārus"], ["līber"]),
          s("fīlia sōla est", "the daughter is alone", ["fīlia", "sōla", "est", "tōta", "cāra"], ["sōlus"]),
        ],
      },
      {
        title: "Adjectīva VII",
        description: "Position",
        words: [
          w("dexter", "right"),
          w("sinister", "left"),
          w("medius", "middle"),
          w("summus", "highest"),
          w("īmus", "lowest"),
          w("proximus", "nearest"),
        ],
        sentences: [
          s("mūrus summus est", "the wall is highest", ["mūrus", "summus", "est", "medius", "īmus"], ["summus"]),
          s("porta dextra est", "the gate is on the right", ["porta", "dextra", "est", "sinistra", "media"], ["dexter"]),
          s("locus medius est", "the place is in the middle", ["locus", "medius", "est", "proximus", "summus"], ["medius"]),
        ],
      },
    ],
  },

  // ============================ SECTION 6 ============================
  // Prepositions taking the accusative (motion toward / through).
  {
    id: "section-la-6",
    title: "Section 6: Praepositiōnēs I",
    description: "Prepositions with the accusative",
    level: 1,
    units: [
      {
        title: "Iter I",
        description: "To places",
        words: [
          w("oppidum", "town"),
          w("vīcus", "village"),
          w("fundus", "farm"),
          w("lūcus", "grove"),
          w("campus", "plain"),
          w("hortus", "garden"),
        ],
        sentences: [
          s("puella ad oppidum ambulat", "the girl walks to the town", ["puella", "ad", "oppidum", "ambulat", "vīcum", "currit"], ["oppidum"]),
          s("puer ad vīcum currit", "the boy runs to the village", ["puer", "ad", "vīcum", "currit", "fundum", "festīnat"], ["vīcus"]),
          s("servus ad lūcum festīnat", "the slave hurries to the grove", ["servus", "ad", "lūcum", "festīnat", "campum", "properat"], ["lūcus"]),
        ],
      },
      {
        title: "Iter II",
        description: "Through the town",
        words: [
          w("via", "street"),
          w("porta", "gate"),
          w("forum", "forum"),
          w("templum", "temple"),
          w("rēgia", "palace"),
          w("mūrus", "wall"),
        ],
        sentences: [
          s("fēmina per viam ambulat", "the woman walks through the street", ["fēmina", "per", "viam", "ambulat", "portam", "festīnat"], ["via"]),
          s("vir ad forum properat", "the man hastens to the forum", ["vir", "ad", "forum", "properat", "templum", "ambulat"], ["forum"]),
          s("puella ad rēgiam festīnat", "the girl hurries to the palace", ["puella", "ad", "rēgiam", "festīnat", "portam", "ambulat"], ["rēgia"]),
        ],
      },
      {
        title: "Bēstiae in viā",
        description: "Animals on the move",
        words: [
          w("lupus", "wolf"),
          w("equus", "horse"),
          w("taurus", "bull"),
          w("asinus", "donkey"),
          w("capra", "goat"),
          w("columba", "dove"),
        ],
        sentences: [
          s("lupus per silvam currit", "the wolf runs through the forest", ["lupus", "per", "silvam", "currit", "campum", "errat"], ["lupus"]),
          s("equus ad rīvum currit", "the horse runs to the stream", ["equus", "ad", "rīvum", "currit", "fluvium", "festīnat"], ["equus"]),
          s("columba ad hortum volat", "the dove flies to the garden", ["columba", "ad", "hortum", "volat", "mūrum", "properat"], ["columba"]),
        ],
      },
      {
        title: "Ad templum",
        description: "Toward worship",
        words: [
          w("templum", "temple"),
          w("āra", "altar"),
          w("deus", "god"),
          w("dea", "goddess"),
          w("victima", "victim"),
          w("dōnum", "gift"),
        ],
        sentences: [
          s("fēmina ad āram ambulat", "the woman walks to the altar", ["fēmina", "ad", "āram", "ambulat", "templum", "spectat"], ["āra"]),
          s("populus ad templum properat", "the people hasten to the temple", ["populus", "ad", "templum", "properat", "āram", "spectat"], ["templum"]),
          s("puella victimam ad āram dūcit", "the girl leads the victim to the altar", ["puella", "victimam", "ad", "āram", "dūcit", "portat"], ["victima"]),
        ],
      },
      {
        title: "In oppidum",
        description: "Into the town",
        words: [
          w("taberna", "shop"),
          w("jānua", "doorway"),
          w("aula", "hall"),
          w("forum", "forum"),
          w("porta", "gate"),
          w("casa", "cottage"),
        ],
        sentences: [
          s("vir in tabernam intrat", "the man enters the shop", ["vir", "in", "tabernam", "intrat", "casam", "spectat"], ["taberna"]),
          s("fēmina in aulam ambulat", "the woman walks into the hall", ["fēmina", "in", "aulam", "ambulat", "jānuam", "spectat"], ["aula"]),
          s("puer per portam currit", "the boy runs through the gate", ["puer", "per", "portam", "currit", "jānuam", "festīnat"], ["porta"]),
        ],
      },
      {
        title: "Trāns flūmen",
        description: "Across the water",
        words: [
          w("fluvius", "river"),
          w("rīvus", "stream"),
          w("unda", "wave"),
          w("ōra", "shore"),
          w("harēna", "sand"),
          w("rīpa", "riverbank"),
        ],
        sentences: [
          s("puer trāns rīvum natat", "the boy swims across the stream", ["puer", "trāns", "rīvum", "natat", "fluvium", "spectat"], ["rīvus"]),
          s("nauta ad ōram nāvigat", "the sailor sails to the shore", ["nauta", "ad", "ōram", "nāvigat", "rīpam", "spectat"], ["ōra"]),
          s("fēmina trāns harēnam ambulat", "the woman walks across the sand", ["fēmina", "trāns", "harēnam", "ambulat", "rīpam", "spectat"], ["harēna"]),
        ],
      },
      {
        title: "Ante portam",
        description: "Before the walls",
        words: [
          w("statua", "statue"),
          w("columna", "column"),
          w("mūrus", "wall"),
          w("porta", "gate"),
          w("turris", "tower"),
          w("templum", "temple"),
        ],
        sentences: [
          s("vir ante portam stat", "the man stands before the gate", ["vir", "ante", "portam", "stat", "mūrum", "spectat"], ["porta"]),
          s("fēmina ante statuam stat", "the woman stands before the statue", ["fēmina", "ante", "statuam", "stat", "columnam", "spectat"], ["statua"]),
          s("puella prope columnam stat", "the girl stands near the column", ["puella", "prope", "columnam", "stat", "statuam", "spectat"], ["columna"]),
        ],
      },
      {
        title: "Contrā hostem",
        description: "Facing the enemy",
        words: [
          w("gladius", "sword"),
          w("hasta", "spear"),
          w("sagitta", "arrow"),
          w("scūtum", "shield"),
          w("tēlum", "weapon"),
          w("mūrus", "wall"),
        ],
        sentences: [
          s("vir contrā mūrum pugnat", "the man fights against the wall", ["vir", "contrā", "mūrum", "pugnat", "portam", "spectat"], ["mūrus"]),
          s("puer gladium contrā lupum tenet", "the boy holds a sword against the wolf", ["puer", "gladium", "contrā", "lupum", "tenet", "portat"], ["gladius"]),
          s("nauta hastam contrā taurum tenet", "the sailor holds a spear against the bull", ["nauta", "hastam", "contrā", "taurum", "tenet", "portat"], ["hasta"]),
        ],
      },
    ],
  },

  // ============================ SECTION 7 ============================
  // Prepositions taking the ablative (place where / accompaniment / source).
  {
    id: "section-la-7",
    title: "Section 7: Praepositiōnēs II",
    description: "Prepositions with the ablative",
    level: 1,
    units: [
      {
        title: "In locō",
        description: "Where things are",
        words: [
          w("hortus", "garden"),
          w("silva", "forest"),
          w("via", "street"),
          w("casa", "cottage"),
          w("templum", "temple"),
          w("campus", "plain"),
        ],
        sentences: [
          s("puella in hortō labōrat", "the girl works in the garden", ["puella", "in", "hortō", "labōrat", "silvā", "ambulat"], ["hortus"]),
          s("puer in silvā errat", "the boy wanders in the forest", ["puer", "in", "silvā", "errat", "viā", "ambulat"], ["silva"]),
          s("fēmina in casā labōrat", "the woman works in the cottage", ["fēmina", "in", "casā", "labōrat", "hortō", "sedet"], ["casa"]),
        ],
      },
      {
        title: "Cum amīcīs",
        description: "Together with",
        words: [
          w("amīcus", "friend"),
          w("amīca", "friend"),
          w("servus", "slave"),
          w("fīlia", "daughter"),
          w("fīlius", "son"),
          w("domina", "lady"),
        ],
        sentences: [
          s("puella cum amīcā ambulat", "the girl walks with her friend", ["puella", "cum", "amīcā", "ambulat", "fīliā", "cantat"], ["amīca"]),
          s("dominus cum servō labōrat", "the master works with the slave", ["dominus", "cum", "servō", "labōrat", "fīliō", "ambulat"], ["servus"]),
          s("fēmina cum fīliā sedet", "the woman sits with her daughter", ["fēmina", "cum", "fīliā", "sedet", "amīcā", "cantat"], ["fīlia"]),
        ],
      },
      {
        title: "Ex oppidō",
        description: "Out of a place",
        words: [
          w("oppidum", "town"),
          w("vīlla", "country house"),
          w("templum", "temple"),
          w("hortus", "garden"),
          w("silva", "forest"),
          w("aula", "hall"),
        ],
        sentences: [
          s("vir ex oppidō ambulat", "the man walks out of the town", ["vir", "ex", "oppidō", "ambulat", "vīllā", "festīnat"], ["oppidum"]),
          s("puella ex vīllā currit", "the girl runs out of the country house", ["puella", "ex", "vīllā", "currit", "aulā", "festīnat"], ["vīlla"]),
          s("servus ex hortō venit", "the slave comes out of the garden", ["servus", "ex", "hortō", "venit", "silvā", "ambulat"], ["hortus"]),
        ],
      },
      {
        title: "Sine cūrā",
        description: "Without something",
        words: [
          w("cūra", "care"),
          w("pecūnia", "money"),
          w("aqua", "water"),
          w("cibus", "food"),
          w("mora", "delay"),
          w("perīculum", "danger"),
        ],
        sentences: [
          s("poēta sine cūrā cantat", "the poet sings without care", ["poēta", "sine", "cūrā", "cantat", "morā", "labōrat"], ["cūra"]),
          s("agricola sine aquā labōrat", "the farmer works without water", ["agricola", "sine", "aquā", "labōrat", "cibō", "sedet"], ["aqua"]),
          s("nauta sine morā nāvigat", "the sailor sails without delay", ["nauta", "sine", "morā", "nāvigat", "cūrā", "festīnat"], ["mora"]),
        ],
      },
      {
        title: "Sub caelō",
        description: "Under and below",
        words: [
          w("caelum", "sky"),
          w("mūrus", "wall"),
          w("arbor", "tree"),
          w("tēctum", "roof"),
          w("saxum", "rock"),
          w("umbra", "shadow"),
        ],
        sentences: [
          s("puer sub arbore sedet", "the boy sits under the tree", ["puer", "sub", "arbore", "sedet", "tēctō", "stat"], ["arbor"]),
          s("puella sub tēctō stat", "the girl stands under the roof", ["puella", "sub", "tēctō", "stat", "mūrō", "sedet"], ["tēctum"]),
          s("servus sub mūrō labōrat", "the slave works under the wall", ["servus", "sub", "mūrō", "labōrat", "saxō", "sedet"], ["mūrus"]),
        ],
      },
      {
        title: "Dē monte",
        description: "Down from",
        words: [
          w("mōns", "mountain"),
          w("mūrus", "wall"),
          w("caelum", "sky"),
          w("rīpa", "riverbank"),
          w("tēctum", "roof"),
          w("collis", "hill"),
        ],
        sentences: [
          s("aqua dē monte fluit", "water flows down from the mountain", ["aqua", "dē", "monte", "fluit", "colle", "cadit"], ["mōns"]),
          s("puer dē colle currit", "the boy runs down from the hill", ["puer", "dē", "colle", "currit", "mūrō", "festīnat"], ["collis"]),
          s("fēmina dē rīpā spectat", "the woman looks down from the riverbank", ["fēmina", "dē", "rīpā", "spectat", "tēctō", "stat"], ["rīpa"]),
        ],
      },
      {
        title: "Prō patriā",
        description: "For and before",
        words: [
          w("patria", "homeland"),
          w("populus", "people"),
          w("rēx", "king"),
          w("lēx", "law"),
          w("pāx", "peace"),
          w("glōria", "glory"),
        ],
        sentences: [
          s("vir prō patriā pugnat", "the man fights for the homeland", ["vir", "prō", "patriā", "pugnat", "populō", "labōrat"], ["patria"]),
          s("populus prō pāce ōrat", "the people pray for peace", ["populus", "prō", "pāce", "ōrat", "lēge", "labōrat"], ["pāx"]),
          s("poēta dē glōriā cantat", "the poet sings about glory", ["poēta", "dē", "glōriā", "cantat", "pāce", "nārrat"], ["glōria"]),
        ],
      },
      {
        title: "Ā marī",
        description: "From the sea and land",
        words: [
          w("mare", "sea"),
          w("ōra", "shore"),
          w("terra", "land"),
          w("īnsula", "island"),
          w("portus", "harbour"),
          w("unda", "wave"),
        ],
        sentences: [
          s("nauta ā terrā nāvigat", "the sailor sails from the land", ["nauta", "ā", "terrā", "nāvigat", "ōrā", "festīnat"], ["terra"]),
          s("puella in ōrā stat", "the girl stands on the shore", ["puella", "in", "ōrā", "stat", "undā", "ambulat"], ["ōra"]),
          s("vir ab īnsulā nāvigat", "the man sails away from the island", ["vir", "ab", "īnsulā", "nāvigat", "ōrā", "festīnat"], ["īnsula"]),
        ],
      },
    ],
  },

  // ============================ SECTION 8 ============================
  // Verbs (present, 3rd person singular): 2nd conjugation + more action verbs.
  {
    id: "section-la-8",
    title: "Section 8: Verba",
    description: "Present-tense verbs (third person singular)",
    level: 1,
    units: [
      {
        title: "Verba I",
        description: "Seeing and knowing",
        words: [
          w("videt", "sees"),
          w("monet", "warns"),
          w("docet", "teaches"),
          w("tenet", "holds"),
          w("movet", "moves"),
          w("timet", "fears"),
        ],
        sentences: [
          s("magister puerum docet", "the teacher teaches the boy", ["magister", "puerum", "docet", "monet", "videt"], ["docet"]),
          s("servus dominum timet", "the slave fears the master", ["servus", "dominum", "timet", "videt", "monet"], ["timet"]),
          s("puer gladium tenet", "the boy holds the sword", ["puer", "gladium", "tenet", "movet", "portat"], ["tenet"]),
        ],
      },
      {
        title: "Verba II",
        description: "Sitting and staying",
        words: [
          w("sedet", "sits"),
          w("manet", "remains"),
          w("rīdet", "laughs"),
          w("tacet", "is silent"),
          w("jubet", "orders"),
          w("respondet", "answers"),
        ],
        sentences: [
          s("puella in hortō sedet", "the girl sits in the garden", ["puella", "in", "hortō", "sedet", "manet", "rīdet"], ["sedet"]),
          s("fēmina in casā manet", "the woman stays in the cottage", ["fēmina", "in", "casā", "manet", "sedet", "labōrat"], ["manet"]),
          s("puer rīdet", "the boy laughs", ["puer", "rīdet", "tacet", "sedet", "cantat"], ["rīdet"]),
        ],
      },
      {
        title: "Verba III",
        description: "Giving and telling",
        words: [
          w("portat", "carries"),
          w("laudat", "praises"),
          w("vocat", "calls"),
          w("parat", "prepares"),
          w("dat", "gives"),
          w("nārrat", "tells"),
        ],
        sentences: [
          s("poēta fābulam nārrat", "the poet tells a story", ["poēta", "fābulam", "nārrat", "epistulam", "dat"], ["nārrat"]),
          s("domina cēnam parat", "the lady prepares dinner", ["domina", "cēnam", "parat", "dōnum", "dat"], ["parat"]),
          s("dominus dōnum dat", "the master gives a gift", ["dominus", "dōnum", "dat", "rosam", "portat"], ["dat"]),
        ],
      },
      {
        title: "Verba IV",
        description: "Guarding and building",
        words: [
          w("cūrat", "cares for"),
          w("servat", "guards"),
          w("superat", "overcomes"),
          w("oppugnat", "attacks"),
          w("aedificat", "builds"),
          w("pugnat", "fights"),
        ],
        sentences: [
          s("vir oppidum servat", "the man guards the town", ["vir", "oppidum", "servat", "mūrum", "aedificat"], ["servat"]),
          s("populus templum aedificat", "the people build a temple", ["populus", "templum", "aedificat", "mūrum", "servat"], ["aedificat"]),
          s("vir prō patriā pugnat", "the man fights for the homeland", ["vir", "prō", "patriā", "pugnat", "oppidum", "servat"], ["pugnat"]),
        ],
      },
      {
        title: "Verba V",
        description: "Asking and showing",
        words: [
          w("rogat", "asks"),
          w("mōnstrat", "shows"),
          w("nūntiat", "announces"),
          w("dōnat", "presents"),
          w("spectat", "watches"),
          w("salūtat", "greets"),
        ],
        sentences: [
          s("nūntius victōriam nūntiat", "the messenger announces the victory", ["nūntius", "victōriam", "nūntiat", "epistulam", "portat"], ["nūntiat"]),
          s("servus viam mōnstrat", "the slave shows the way", ["servus", "viam", "mōnstrat", "portam", "spectat"], ["mōnstrat"]),
          s("puer amīcum rogat", "the boy asks his friend", ["puer", "amīcum", "rogat", "vocat", "salūtat"], ["rogat"]),
        ],
      },
      {
        title: "Verba VI",
        description: "Harming and destroying",
        words: [
          w("valet", "is strong"),
          w("terret", "frightens"),
          w("dēlet", "destroys"),
          w("auget", "increases"),
          w("juvat", "helps"),
          w("necat", "kills"),
        ],
        sentences: [
          s("lupus puerum terret", "the wolf frightens the boy", ["lupus", "puerum", "terret", "fēminam", "videt"], ["terret"]),
          s("bellum oppidum dēlet", "the war destroys the town", ["bellum", "oppidum", "dēlet", "mūrum", "terret"], ["dēlet"]),
          s("puer valet", "the boy is strong", ["puer", "valet", "sedet", "rīdet", "manet"], ["valet"]),
        ],
      },
      {
        title: "Verba VII",
        description: "Coming and going",
        words: [
          w("currit", "runs"),
          w("venit", "comes"),
          w("errat", "wanders"),
          w("properat", "hastens"),
          w("intrat", "enters"),
          w("stat", "stands"),
        ],
        sentences: [
          s("puer ad silvam currit", "the boy runs to the forest", ["puer", "ad", "silvam", "currit", "festīnat", "ambulat"], ["currit"]),
          s("nauta ad ōram venit", "the sailor comes to the shore", ["nauta", "ad", "ōram", "venit", "nāvigat", "festīnat"], ["venit"]),
          s("vir in forō stat", "the man stands in the forum", ["vir", "in", "forō", "stat", "templō", "sedet"], ["stat"]),
        ],
      },
      {
        title: "Verba VIII",
        description: "Reading and sending",
        words: [
          w("legit", "reads"),
          w("scrībit", "writes"),
          w("mittit", "sends"),
          w("dūcit", "leads"),
          w("pōnit", "places"),
          w("regit", "rules"),
        ],
        sentences: [
          s("magister librum legit", "the teacher reads the book", ["magister", "librum", "legit", "scrībit", "tenet"], ["legit"]),
          s("scrība epistulam scrībit", "the clerk writes a letter", ["scrība", "epistulam", "scrībit", "legit", "dat"], ["scrībit"]),
          s("dominus servum mittit", "the master sends the slave", ["dominus", "servum", "mittit", "dūcit", "vocat"], ["mittit"]),
        ],
      },
    ],
  },

  // ============================ SECTION 9 ============================
  // Plurals (nominative and accusative) and plural verb agreement.
  {
    id: "section-la-9",
    title: "Section 9: Numerus Plūrālis",
    description: "Plural nouns, adjectives, and verbs",
    level: 1,
    units: [
      {
        title: "Plūrālia I",
        description: "Feminine plurals",
        words: [
          w("puella", "girl"),
          w("fēmina", "woman"),
          w("amīca", "friend"),
          w("fīlia", "daughter"),
          w("rēgīna", "queen"),
          w("domina", "lady"),
        ],
        sentences: [
          s("puellae cantant", "the girls sing", ["puellae", "cantant", "fēminae", "ambulant"], ["puella"]),
          s("fēminae ambulant", "the women walk", ["fēminae", "ambulant", "amīcae", "labōrant"], ["fēmina"]),
          s("rēgīnae bonae sunt", "the queens are good", ["rēgīnae", "bonae", "sunt", "fīliae", "laetae"], ["rēgīna"]),
        ],
      },
      {
        title: "Plūrālia II",
        description: "Masculine plurals",
        words: [
          w("servus", "slave"),
          w("dominus", "master"),
          w("amīcus", "friend"),
          w("fīlius", "son"),
          w("puer", "boy"),
          w("vir", "man"),
        ],
        sentences: [
          s("servī labōrant", "the slaves work", ["servī", "labōrant", "puerī", "ambulant"], ["servus"]),
          s("puerī currunt", "the boys run", ["puerī", "currunt", "virī", "festīnant"], ["puer"]),
          s("dominī bonī sunt", "the masters are good", ["dominī", "bonī", "sunt", "amīcī", "laetī"], ["dominus"]),
        ],
      },
      {
        title: "Plūrālia III",
        description: "Neuter plurals",
        words: [
          w("dōnum", "gift"),
          w("vīnum", "wine"),
          w("templum", "temple"),
          w("oppidum", "town"),
          w("verbum", "word"),
          w("bellum", "war"),
        ],
        sentences: [
          s("templa magna sunt", "the temples are big", ["templa", "magna", "sunt", "oppida", "alta"], ["templum"]),
          s("dōna pulchra sunt", "the gifts are beautiful", ["dōna", "pulchra", "sunt", "vīna", "bona"], ["dōnum"]),
          s("bella longa sunt", "the wars are long", ["bella", "longa", "sunt", "verba", "multa"], ["bellum"]),
        ],
      },
      {
        title: "Plūrālia IV",
        description: "Carrying many things",
        words: [
          w("rosa", "rose"),
          w("ūva", "grape"),
          w("olīva", "olive"),
          w("corōna", "crown"),
          w("hasta", "spear"),
          w("sagitta", "arrow"),
        ],
        sentences: [
          s("puellae rosās portant", "the girls carry roses", ["puellae", "rosās", "portant", "ūvās", "habent"], ["rosa"]),
          s("fēminae ūvās habent", "the women have grapes", ["fēminae", "ūvās", "habent", "olīvās", "portant"], ["ūva"]),
          s("virī hastās tenent", "the men hold spears", ["virī", "hastās", "tenent", "sagittās", "portant"], ["hasta"]),
        ],
      },
      {
        title: "Plūrālia V",
        description: "Masculine plural objects",
        words: [
          w("equus", "horse"),
          w("taurus", "bull"),
          w("servus", "slave"),
          w("amīcus", "friend"),
          w("captīvus", "captive"),
          w("socius", "ally"),
        ],
        sentences: [
          s("dominī servōs vocant", "the masters call the slaves", ["dominī", "servōs", "vocant", "equōs", "dūcunt"], ["servus"]),
          s("agricolae equōs cūrant", "the farmers tend the horses", ["agricolae", "equōs", "cūrant", "taurōs", "habent"], ["equus"]),
          s("virī amīcōs laudant", "the men praise their friends", ["virī", "amīcōs", "laudant", "sociōs", "vocant"], ["amīcus"]),
        ],
      },
      {
        title: "Numerī",
        description: "Numbers",
        words: [
          w("ūnus", "one"),
          w("duo", "two"),
          w("trēs", "three"),
          w("quattuor", "four"),
          w("quīnque", "five"),
          w("decem", "ten"),
        ],
        sentences: [
          s("duae puellae cantant", "two girls sing", ["duae", "puellae", "cantant", "trēs", "ambulant"], ["duo"]),
          s("trēs puerī currunt", "three boys run", ["trēs", "puerī", "currunt", "quattuor", "festīnant"], ["trēs"]),
          s("quīnque virī labōrant", "five men work", ["quīnque", "virī", "labōrant", "decem", "sedent"], ["quīnque"]),
        ],
      },
      {
        title: "Plūrālia VI",
        description: "Plural places",
        words: [
          w("puella", "girl"),
          w("liber", "book"),
          w("mūrus", "wall"),
          w("via", "street"),
          w("hortus", "garden"),
          w("templum", "temple"),
        ],
        sentences: [
          s("puellae in hortīs labōrant", "the girls work in the gardens", ["puellae", "in", "hortīs", "labōrant", "viīs", "ambulant"], ["puella"]),
          s("librī in mēnsā sunt", "the books are on the table", ["librī", "in", "mēnsā", "sunt", "mūrī", "stant"], ["liber"]),
          s("virī mūrōs aedificant", "the men build walls", ["virī", "mūrōs", "aedificant", "templa", "servant"], ["mūrus"]),
        ],
      },
      {
        title: "Familia",
        description: "The family together",
        words: [
          w("fīlius", "son"),
          w("fīlia", "daughter"),
          w("avus", "grandfather"),
          w("avia", "grandmother"),
          w("amīcus", "friend"),
          w("amīca", "friend"),
        ],
        sentences: [
          s("fīliī in casā manent", "the sons stay in the cottage", ["fīliī", "in", "casā", "manent", "hortō", "sedent"], ["fīlius"]),
          s("fīliae cantant", "the daughters sing", ["fīliae", "cantant", "fīliī", "rīdent"], ["fīlia"]),
          s("avus et avia sedent", "the grandfather and grandmother sit", ["avus", "et", "avia", "sedent", "manent", "rīdent"], ["avus"]),
        ],
      },
    ],
  },

  // ============================ SECTION 10 ============================
  // Consolidation: adverbs, conjunctions, and mixed review sentences.
  {
    id: "section-la-10",
    title: "Section 10: Repetītiō",
    description: "Adverbs, conjunctions, and review",
    level: 1,
    units: [
      {
        title: "Adverbia I",
        description: "When and how often",
        words: [
          w("semper", "always"),
          w("saepe", "often"),
          w("nunc", "now"),
          w("hodiē", "today"),
          w("herī", "yesterday"),
          w("crās", "tomorrow"),
        ],
        sentences: [
          s("puella semper cantat", "the girl always sings", ["puella", "semper", "cantat", "saepe", "ambulat"], ["semper"]),
          s("servus hodiē labōrat", "the slave works today", ["servus", "hodiē", "labōrat", "herī", "sedet"], ["hodiē"]),
          s("fēmina saepe rīdet", "the woman often laughs", ["fēmina", "saepe", "rīdet", "nunc", "cantat"], ["saepe"]),
        ],
      },
      {
        title: "Adverbia II",
        description: "Well and badly",
        words: [
          w("bene", "well"),
          w("male", "badly"),
          w("ita", "yes"),
          w("nōn", "not"),
          w("quoque", "also"),
          w("tandem", "finally"),
        ],
        sentences: [
          s("puer bene cantat", "the boy sings well", ["puer", "bene", "cantat", "male", "rīdet"], ["bene"]),
          s("servus male labōrat", "the slave works badly", ["servus", "male", "labōrat", "bene", "sedet"], ["male"]),
          s("puella quoque cantat", "the girl also sings", ["puella", "quoque", "cantat", "nōn", "rīdet"], ["quoque"]),
        ],
      },
      {
        title: "Coniūnctiōnēs",
        description: "Joining words",
        words: [
          w("et", "and"),
          w("sed", "but"),
          w("aut", "or"),
          w("nam", "for"),
          w("quod", "because"),
          w("ubi", "where"),
        ],
        sentences: [
          s("puella cantat sed puer tacet", "the girl sings but the boy is silent", ["puella", "cantat", "sed", "puer", "tacet", "rīdet"], ["sed"]),
          s("servus labōrat et dominus sedet", "the slave works and the master sits", ["servus", "labōrat", "et", "dominus", "sedet", "manet"], ["et"]),
          s("puer rīdet aut cantat", "the boy laughs or sings", ["puer", "rīdet", "aut", "cantat", "tacet", "sedet"], ["aut"]),
        ],
      },
      {
        title: "Locī",
        description: "Places review",
        words: [
          w("templum", "temple"),
          w("forum", "forum"),
          w("hortus", "garden"),
          w("silva", "forest"),
          w("via", "street"),
          w("mūrus", "wall"),
        ],
        sentences: [
          s("vir in forō stat", "the man stands in the forum", ["vir", "in", "forō", "stat", "templō", "sedet"], ["forum"]),
          s("puella per viam ambulat", "the girl walks through the street", ["puella", "per", "viam", "ambulat", "silvam", "currit"], ["via"]),
          s("servus ad templum festīnat", "the slave hurries to the temple", ["servus", "ad", "templum", "festīnat", "hortum", "ambulat"], ["templum"]),
        ],
      },
      {
        title: "Cibus II",
        description: "Food review",
        words: [
          w("cibus", "food"),
          w("aqua", "water"),
          w("vīnum", "wine"),
          w("cēna", "dinner"),
          w("mēnsa", "table"),
          w("pōculum", "cup"),
        ],
        sentences: [
          s("servus cibum parat", "the slave prepares the food", ["servus", "cibum", "parat", "cēnam", "dat"], ["cibus"]),
          s("domina vīnum dat", "the lady gives the wine", ["domina", "vīnum", "dat", "aquam", "portat"], ["vīnum"]),
          s("puer aquam portat", "the boy carries the water", ["puer", "aquam", "portat", "cibum", "habet"], ["aqua"]),
        ],
      },
      {
        title: "Rēgnum III",
        description: "People and rule",
        words: [
          w("rēx", "king"),
          w("rēgīna", "queen"),
          w("populus", "people"),
          w("servus", "slave"),
          w("dominus", "master"),
          w("nūntius", "messenger"),
        ],
        sentences: [
          s("rēx populum regit", "the king rules the people", ["rēx", "populum", "regit", "rēgīnam", "vocat"], ["rēx"]),
          s("rēgīna dōnum dat", "the queen gives a gift", ["rēgīna", "dōnum", "dat", "corōnam", "habet"], ["rēgīna"]),
          s("nūntius epistulam portat", "the messenger carries a letter", ["nūntius", "epistulam", "portat", "dōnum", "dat"], ["nūntius"]),
        ],
      },
      {
        title: "Nātūra IV",
        description: "Sky and sea review",
        words: [
          w("lūna", "moon"),
          w("stella", "star"),
          w("mare", "sea"),
          w("terra", "land"),
          w("caelum", "sky"),
          w("sōl", "sun"),
        ],
        sentences: [
          s("lūna clāra est", "the moon is bright", ["lūna", "clāra", "est", "stella", "alta"], ["lūna"]),
          s("nauta mare spectat", "the sailor watches the sea", ["nauta", "mare", "spectat", "terram", "amat"], ["mare"]),
          s("puer caelum spectat", "the boy watches the sky", ["puer", "caelum", "spectat", "stellās", "amat"], ["caelum"]),
        ],
      },
      {
        title: "Colloquium",
        description: "Greetings",
        words: [
          w("salvē", "hello"),
          w("valē", "goodbye"),
          w("grātiās", "thank you"),
          w("ita", "yes"),
          w("minimē", "no"),
          w("sīc", "thus"),
        ],
        sentences: [
          s("salvē amīce", "hello friend", ["salvē", "amīce", "valē", "grātiās"], ["salvē"]),
          s("valē amīca", "goodbye friend", ["valē", "amīca", "salvē", "grātiās"], ["valē"]),
          s("ita est", "so it is", ["ita", "est", "minimē", "sīc"], ["ita"]),
        ],
      },
    ],
  },
];
