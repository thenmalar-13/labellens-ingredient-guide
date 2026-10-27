/**
 * Curated personal-care ingredient reference data.
 *
 * Sources for cosmetic functions: EU CosIng (Cosmetic Ingredients database)
 * function classifications, which are public, free, and non-proprietary.
 * The "function" values here mirror CosIng's official INCI function labels.
 * "notes" describe the classification honestly and never assert safety or
 * toxicity — those depend on concentration, formulation, and exposure that an
 * ingredient list alone cannot convey.
 *
 * This dataset is intentionally limited to well-established, widely-used
 * ingredients where the public classification is unambiguous. Unknown
 * ingredients resolve to an "insufficient evidence" state rather than a guess.
 */
export type CosmeticFunction =
  | "Surfactant"
  | "Emollient"
  | "Emulsifier"
  | "Preservative"
  | "Humectant"
  | "Solvent"
  | "Thickener"
  | "Buffering agent"
  | "Chelating agent"
  | "Fragrance"
  | "Antioxidant"
  | "Skin conditioning"
  | "Hair conditioning"
  | "Abrasive"
  | "Astringent"
  | "pH adjuster"
  | "Bulking agent"
  | "Binder"
  | "Antidandruff"
  | "Anticaries"
  | "Deodorant"
  | "Opacifier"
  | "UV filter"
  | "Antimicrobial"
  | "Solubilizing agent"
  | "Stabilizing agent";

export interface IngredientEntry {
  /** Canonical INCI name used for display. */
  name: string;
  /** Matchable aliases (lowercased, including common synonyms / trade spellings). */
  aliases: string[];
  /** CosIng-style cosmetic function(s). */
  functions: CosmeticFunction[];
  /** Honest, classification-level notes. Never a safety verdict. */
  notes: string;
  /** Optional PubChem CID (preferred compound). When absent, resolved live. */
  pubchemCid?: number;
}

/**
 * A safety verdict is deliberately never produced. "concerns" here reflects
 * *what would need to be true for a concern to exist*, framed as a question,
 * rather than asserting that a concern exists.
 */
export const PERSONAL_CARE_INGREDIENTS: IngredientEntry[] = [
  {
    name: "Aqua",
    aliases: ["aqua", "water", "eaux"],
    functions: ["Solvent"],
    notes:
      "Universal cosmetic solvent. Listed as the vehicle that carries the other ingredients.",
    pubchemCid: 962,    pubchemCid: 962,

  },
  {
    name: "Glycerin",
    aliases: ["glycerin", "glycerine", "glycerol", "propane-1,2,3-triol"],
    functions: ["Humectant", "Skin conditioning"],
    notes:
      "A humectant that draws water into the upper layers of skin; one of the most common moisturizing agents in cosmetics.",
    pubchemCid: 753,    pubchemCid: 753,

  },
  {
    name: "Cetyl Alcohol",
    aliases: ["cetyl alcohol", "1-hexadecanol", "hexadecan-1-ol"],
    functions: ["Emollient", "Emulsifier", "Thickener"],
    notes:
      "A fatty alcohol (not an intoxicating alcohol) used to thicken and stabilize emulsions and give a smooth skin feel.",
    pubchemCid: 2682,    pubchemCid: 2682,

  },
  {
    name: "Stearyl Alcohol",
    aliases: ["stearyl alcohol", "1-octadecanol", "octadecan-1-ol"],
    functions: ["Emollient", "Emulsifier", "Thickener"],
    notes:
      "A fatty alcohol used as a co-emulsifier and to give body to creams and lotions.",
    pubchemCid: 8221,    pubchemCid: 8221,

  },
  {
    name: "Cetearyl Alcohol",
    aliases: ["cetearyl alcohol", "cetostearyl alcohol"],
    functions: ["Emollient", "Emulsifier", "Thickener"],
    notes:
      "A blend of cetyl and stearyl alcohols used as a non-drying emollient and stabilizer.",    pubchemCid: 62238,

  },
  {
    name: "Sodium Lauryl Sulfate",
    aliases: ["sodium lauryl sulfate", "sls", "sodium dodecyl sulfate", "sds"],
    functions: ["Surfactant"],
    notes:
      "An anionic surfactant and foaming agent. Whether it is irritating depends on concentration, contact time, and formulation.",
    pubchemCid: 34233,    pubchemCid: 3423265,

  },
  {
    name: "Sodium Laureth Sulfate",
    aliases: ["sodium laureth sulfate", "sles", "sodium lauryl ether sulfate"],
    functions: ["Surfactant"],
    notes:
      "An ethoxylated anionic surfactant; milder than sodium lauryl sulfate at typical leave-on/rinse-off concentrations.",    pubchemCid: 23665884,

  },
  {
    name: "Sodium Lauroyl Sarcosinate",
    aliases: ["sodium lauroyl sarcosinate", "sodium n-lauroylsarcosinate"],
    functions: ["Surfactant", "Antimicrobial"],
    notes:
      "An anionic surfactant derived from sarcosine; used for foaming and cleansing.",
    pubchemCid: 23674831,    pubchemCid: 23668817,

  },
  {
    name: "Coco-Glucoside",
    aliases: ["coco-glucoside", "cocoglucoside"],
    functions: ["Surfactant"],
    notes:
      "A mild non-ionic surfactant from coconut-derived alcohols and glucose.",    pubchemCid: 369373,

  },
  {
    name: "Decyl Glucoside",
    aliases: ["decyl glucoside", "decyl d-glucopyranoside"],
    functions: ["Surfactant"],
    notes:
      "A mild non-ionic surfactant used in sensitive-skin and baby formulations.",
    pubchemCid: 3037542,    pubchemCid: 62142,

  },
  {
    name: "Cocamidopropyl Betaine",
    aliases: ["cocamidopropyl betaine", "capb", "cocamido propyl betaine"],
    functions: ["Surfactant"],
    notes:
      "An amphoteric co-surfactant that boosts foam and lowers the irritation of anionic surfactants.",
  },
  {
    name: "Phenoxyethanol",
    aliases: ["phenoxyethanol", "2-phenoxyethanol", "phenoxytol"],
    functions: ["Preservative"],
    notes:
      "A widely used broad-spectrum preservative. EU limits its use in leave-on products.",
    pubchemCid: 7603,    pubchemCid: 31236,

  },
  {
    name: "Methylparaben",
    aliases: ["methylparaben", "methyl paraben", "methyl 4-hydroxybenzoate"],
    functions: ["Preservative"],
    notes:
      "A paraben preservative. EU permits methylparaben up to a set maximum concentration; regulatory limits have changed over time.",
    pubchemCid: 7456,    pubchemCid: 7456,

  },
  {
    name: "Ethylparaben",
    aliases: ["ethylparaben", "ethyl paraben", "ethyl 4-hydroxybenzoate"],
    functions: ["Preservative"],
    notes:
      "A paraben preservative; EU restricted in some leave-on products for children.",
    pubchemCid: 8439,    pubchemCid: 8434,

  },
  {
    name: "Propylparaben",
    aliases: ["propylparaben", "propyl paraben", "propyl 4-hydroxybenzoate"],
    functions: ["Preservative"],
    notes:
      "A paraben preservative; EU has stricter concentration limits than for methylparaben/ethylparaben.",
    pubchemCid: 7175,    pubchemCid: 7175,

  },
  {
    name: "Butylparaben",
    aliases: ["butylparaben", "butyl paraben", "butyl 4-hydroxybenzoate"],
    functions: ["Preservative"],
    notes:
      "A paraben preservative; EU has the strictest limits among the common parabens.",
    pubchemCid: 7184,    pubchemCid: 7184,

  },
  {
    name: "Sodium Benzoate",
    aliases: ["sodium benzoate", "benzoate de sodium", "e211"],
    functions: ["Preservative"],
    notes:
      "A food-approved preservative also used in cosmetics; stable across a wide pH range.",
    pubchemCid: 517055,    pubchemCid: 517055,

  },
  {
    name: "Potassium Sorbate",
    aliases: ["potassium sorbate", "e202"],
    functions: ["Preservative"],
    notes:
      "A mild preservative effective against molds and yeasts.",
    pubchemCid: 23676785,    pubchemCid: 23676745,

  },
  {
    name: "Sorbic Acid",
    aliases: ["sorbic acid", "e200"],
    functions: ["Preservative"],
    notes:
      "An organic-acid preservative; works best in acidic formulations.",
    pubchemCid: 6234,    pubchemCid: 643460,

  },
  {
    name: "Benzoic Acid",
    aliases: ["benzoic acid", "e210"],
    functions: ["Preservative"],
    notes:
      "An organic-acid preservative used in acidic cosmetics and foods.",
    pubchemCid: 243,    pubchemCid: 243,

  },
  {
    name: "Citric Acid",
    aliases: ["citric acid", "e330", "2-hydroxypropane-1,2,3-tricarboxylic acid"],
    functions: ["Buffering agent", "pH adjuster"],
    notes:
      "Adjusts pH and acts as a mild chelating agent; very common in leave-on and rinse-off products.",
    pubchemCid: 311,    pubchemCid: 311,

  },
  {
    name: "Tocopherol",
    aliases: ["tocopherol", "vitamin e", "alpha-tocopherol", "dl-alpha-tocopherol"],
    functions: ["Antioxidant", "Skin conditioning"],
    notes:
      "A lipid-soluble antioxidant used to slow rancidity of oils and provide skin conditioning.",
    pubchemCid: 2116,    pubchemCid: 2116,

  },
  {
    name: "Tocopheryl Acetate",
    aliases: ["tocopheryl acetate", "vitamin e acetate", "alpha-tocopheryl acetate"],
    functions: ["Antioxidant", "Skin conditioning"],
    notes:
      "A more stable ester of vitamin E used for antioxidant protection and skin conditioning.",
    pubchemCid: 8368,    pubchemCid: 2117,

  },
  {
    name: "Ascorbic Acid",
    aliases: ["ascorbic acid", "l-ascorbic acid", "vitamin c"],
    functions: ["Antioxidant", "Buffering agent"],
    notes:
      "A water-soluble antioxidant; used for skin conditioning at low, stable pH.",
    pubchemCid: 54670067,    pubchemCid: 54670067,

  },
  {
    name: "Retinol",
    aliases: ["retinol", "vitamin a", "all-trans-retinol"],
    functions: ["Skin conditioning"],
    notes:
      "A vitamin A derivative for skin conditioning; effects are concentration-dependent and a frequent irritant at higher strengths.",
    pubchemCid: 445354,    pubchemCid: 445354,

  },
  {
    name: "Niacinamide",
    aliases: ["niacinamide", "nicotinamide", "vitamin b3", "vitamin pp"],
    functions: ["Skin conditioning"],
    notes:
      "A water-soluble form of vitamin B3 widely used for skin conditioning and barrier support.",
    pubchemCid: 936,    pubchemCid: 936,

  },
  {
    name: "Panthenol",
    aliases: ["panthenol", "dexpanthenol", "d-panthenol", "pro-vitamin b5"],
    functions: ["Skin conditioning", "Hair conditioning"],
    notes:
      "A provitamin of B5 used as a humectant and conditioning agent for skin and hair.",
    pubchemCid: 4678,    pubchemCid: 4678,

  },
  {
    name: "Hyaluronic Acid",
    aliases: ["hyaluronic acid", "sodium hyaluronate", "hyaluronan"],
    functions: ["Humectant", "Skin conditioning"],
    notes:
      "A glycosaminoglycan that binds water; used as a humectant across molecular-weight grades.",

  },
  {
    name: "Dimethicone",
    aliases: ["dimethicone", "polydimethylsiloxane", "pdms"],
    functions: ["Emollient", "Skin conditioning"],
    notes:
      "A silicone emollient that forms a breathable, non-greasy film.",

  },
  {
    name: "Cyclomethicone",
    aliases: ["cyclomethicone", "cyclopentasiloxane", "d5", "decamethylcyclopentasiloxane"],
    functions: ["Emollient", "Solvent"],
    notes:
      "A volatile silicone used for a light, fast-drying skin feel; regulatory scrutiny varies by jurisdiction.",

  },
  {
    name: "Sodium Chloride",
    aliases: ["sodium chloride", "salt", "nacl", "sea salt"],
    functions: ["Thickener", "Buffering agent"],
    notes:
      "Used to adjust viscosity and ionic strength; very common in gels and cleansers.",
    pubchemCid: 5234,    pubchemCid: 5234,

  },
  {
    name: "Xanthan Gum",
    aliases: ["xanthan gum", "xanthan", "e415"],
    functions: ["Thickener", "Stabilizing agent"],
    notes:
      "A polysaccharide gum used to thicken and stabilize emulsions and gels.",

  },
  {
    name: "Carbomer",
    aliases: ["carbomer", "carbopol", "crosspolymer"],
    functions: ["Thickener", "Stabilizing agent"],
    notes:
      "A synthetic high-molecular-weight polymer used to gel aqueous phases.",
  },
  {
    name: "Hydroxyethylcellulose",
    aliases: ["hydroxyethylcellulose", "hec", "hydroxyethyl cellulose"],
    functions: ["Thickener"],
    notes:
      "A cellulose-derived thickener for aqueous formulations.",    pubchemCid: 4327536,

  },
  {
    name: "Ceteareth-20",
    aliases: ["ceteareth-20", "ceteareth 20"],
    functions: ["Emulsifier"],
    notes:
      "An ethoxylated fatty-alcohol emulsifier used to blend oil and water phases.",
  },
  {
    name: "Polysorbate 20",
    aliases: ["polysorbate 20", "tween 20", "polyoxyethylene sorbitan monolaurate"],
    functions: ["Emulsifier", "Solubilizing agent"],
    notes:
      "A non-ionic emulsifier/solubilizer for oils and fragrances.",

  },
  {
    name: "Polysorbate 80",
    aliases: ["polysorbate 80", "tween 80", "polyoxyethylene sorbitan monooleate"],
    functions: ["Emulsifier", "Solubilizing agent"],
    notes:
      "A non-ionic emulsifier/solubilizer widely used in cosmetics and pharmaceuticals.",

  },
  {
    name: "Sorbitan Oleate",
    aliases: ["sorbitan oleate", "span 80"],
    functions: ["Emulsifier"],
    notes:
      "A non-ionic emulsifier often paired with polysorbates.",
    pubchemCid: 24231,    pubchemCid: 9920342,

  },
  {
    name: "Glyceryl Stearate",
    aliases: ["glyceryl stearate", "glyceryl monostearate", "gms"],
    functions: ["Emulsifier", "Emollient"],
    notes:
      "An emulsifier and co-emollient that gives creams a smooth texture.",
    pubchemCid: 8166,    pubchemCid: 93066,

  },
  {
    name: "PEG-100 Stearate",
    aliases: ["peg-100 stearate", "peg 100 stearate", "polyethylene glycol 100 stearate"],
    functions: ["Emulsifier"],
    notes:
      "An ethoxylated emulsifier used to stabilize oil-in-water creams.",
  },
  {
    name: "Caprylic/Capric Triglyceride",
    aliases: ["caprylic/capric triglyceride", "medium chain triglycerides", "mct", "fractionated coconut oil"],
    functions: ["Emollient"],
    notes:
      "A fractionated coconut-oil emollient; stable and non-greasy.",

  },
  {
    name: "Shea Butter",
    aliases: ["shea butter", "butyrospermum parkii butter", "karite butter"],
    functions: ["Emollient", "Skin conditioning"],
    notes:
      "A plant-derived emollient rich in fatty acids.",
  },
  {
    name: "Cocoa Butter",
    aliases: ["cocoa butter", "theobroma cacao seed butter"],
    functions: ["Emollient", "Skin conditioning"],
    notes:
      "A solid plant fat used as an emollient.",

  },
  {
    name: "Argan Oil",
    aliases: ["argan oil", "argania spinosa oil"],
    functions: ["Emollient", "Skin conditioning"],
    notes:
      "A plant oil high in oleic and linoleic acids used as an emollient.",
  },
  {
    name: "Jojoba Oil",
    aliases: ["jojoba oil", "simmondsia chinensis seed oil", "buxus chinensis oil"],
    functions: ["Emollient", "Hair conditioning"],
    notes:
      "A liquid wax ester from jojoba seeds; emollient for skin and hair.",
  },
  {
    name: "Squalane",
    aliases: ["squalane", "squalan", "perhydrosqualene"],
    functions: ["Emollient", "Skin conditioning"],
    notes:
      "A saturated hydrocarbon emollient; commonly plant-derived (olive/sugar cane).",
    pubchemCid: 7597,    pubchemCid: 8089,

  },
  {
    name: "Cetyl Palmitate",
    aliases: ["cetyl palmitate", "hexadecyl hexadecanoate"],
    functions: ["Emollient"],
    notes:
      "An ester emollient that adds a dry, silky skin feel.",
    pubchemCid: 9949,    pubchemCid: 10889,

  },
  {
    name: "Isopropyl Myristate",
    aliases: ["isopropyl myristate", "ipm", "tetradecanoic acid 1-methylethyl ester"],
    functions: ["Emollient", "Solubilizing agent"],
    notes:
      "An ester used to reduce greasiness and improve spreading.",
    pubchemCid: 8067,    pubchemCid: 8042,

  },
  {
    name: "Isopropyl Palmitate",
    aliases: ["isopropyl palmitate", "ipp"],
    functions: ["Emollient"],
    notes:
      "An ester emollient that improves spreadability.",
    pubchemCid: 10785,    pubchemCid: 8907,

  },
  {
    name: "Triethanolamine",
    aliases: ["triethanolamine", "tea", "2,2',2''-nitrilotriethanol"],
    functions: ["pH adjuster", "Emulsifier"],
    notes:
      "A base used to neutralize acidic polymers and adjust pH.",
    pubchemCid: 7618,    pubchemCid: 7618,

  },
  {
    name: "Disodium EDTA",
    aliases: ["disodium edta", "edta disodium", "disodium ethylenediaminetetraacetate", "edta"],
    functions: ["Chelating agent"],
    notes:
      "A chelating agent that binds trace metals and stabilizes formulations.",
    pubchemCid: 8767,    pubchemCid: 9839867,

  },
  {
    name: "Tetrasodium EDTA",
    aliases: ["tetrasodium edta", "edta tetrasodium"],
    functions: ["Chelating agent"],
    notes:
      "A chelating agent; stronger chelating form of EDTA.",    pubchemCid: 6144,

  },
  {
    name: "Alcohol Denat.",
    aliases: ["alcohol denat.", "alcohol denat", "denatured alcohol", "ethanol denatured", "sd alcohol"],
    functions: ["Solvent", "Antimicrobial"],
    notes:
      "Denatured ethanol used as a solvent and antimicrobial; can be drying at higher concentrations.",
    pubchemCid: 702,    pubchemCid: 702,

  },
  {
    name: "Benzyl Alcohol",
    aliases: ["benzyl alcohol", "phenylmethanol"],
    functions: ["Preservative", "Solvent", "Fragrance"],
    notes:
      "A multifunctional preservative and fragrance ingredient; a listed EU allergen.",
    pubchemCid: 244,    pubchemCid: 244,

  },
  {
    name: "Salicylic Acid",
    aliases: ["salicylic acid", "2-hydroxybenzoic acid", "bha"],
    functions: ["Antidandruff", "Antimicrobial", "pH adjuster"],
    notes:
      "A beta-hydroxy acid used for exfoliation and anti-dandruff action; regulatory limits vary.",
    pubchemCid: 338,    pubchemCid: 338,

  },
  {
    name: "Zinc Pyrithione",
    aliases: ["zinc pyrithione", "zpt", "zinc omadine"],
    functions: ["Antidandruff"],
    notes:
      "An anti-dandruff active; regulatory approvals have narrowed in the EU.",
    pubchemCid: 26043,    pubchemCid: 26041,

  },
  {
    name: "Selenium Sulfide",
    aliases: ["selenium sulfide", "selenium disulfide"],
    functions: ["Antidandruff"],
    notes:
      "An anti-dandruff active; restricted to specific product types.",    pubchemCid: 24011,

  },
  {
    name: "Allantoin",
    aliases: ["allantoin", "5-ureidohydantoin"],
    functions: ["Skin conditioning"],
    notes:
      "A skin-conditioning agent associated with soothing claims.",
    pubchemCid: 204,    pubchemCid: 204,

  },
  {
    name: "Bisabolol",
    aliases: ["bisabolol", "alpha-bisabolol", "levomenol"],
    functions: ["Skin conditioning"],
    notes:
      "A plant-derived sesquiterpene alcohol used for skin conditioning.",
    pubchemCid: 5370791,    pubchemCid: 1549992,

  },
  {
    name: "Ceramide NP",
    aliases: ["ceramide np", "ceramide 3", "n-stearoyl sphinganine"],
    functions: ["Skin conditioning"],
    notes:
      "A skin-identical lipid used in barrier-support formulations.",    pubchemCid: 57378373,

  },
  {
    name: "Urea",
    aliases: ["urea", "carbamide"],
    functions: ["Humectant", "Skin conditioning"],
    notes:
      "A humectant and keratolytic; concentration determines whether it moisturizes or exfoliates.",
    pubchemCid: 1176,    pubchemCid: 1176,

  },
  {
    name: "Lactic Acid",
    aliases: ["lactic acid", "2-hydroxypropanoic acid"],
    functions: ["pH adjuster", "Skin conditioning"],
    notes:
      "An alpha-hydroxy acid; concentration and pH determine whether it is a moisturizer or exfoliant.",
    pubchemCid: 612,    pubchemCid: 612,

  },
  {
    name: "Glycolic Acid",
    aliases: ["glycolic acid", "hydroxyacetic acid"],
    functions: ["pH adjuster", "Skin conditioning"],
    notes:
      "The smallest alpha-hydroxy acid; used for exfoliation, dependent on pH and concentration.",
    pubchemCid: 1031,    pubchemCid: 757,

  },
  {
    name: "Malic Acid",
    aliases: ["malic acid", "2-hydroxybutanedioic acid"],
    functions: ["pH adjuster"],
    notes:
      "An alpha-hydroxy acid used to adjust pH.",
    pubchemCid: 525,    pubchemCid: 525,

  },
  {
    name: "Tartaric Acid",
    aliases: ["tartaric acid", "2,3-dihydroxybutanedioic acid"],
    functions: ["pH adjuster"],
    notes:
      "An alpha-hydroxy acid used for pH adjustment.",
    pubchemCid: 875,    pubchemCid: 875,

  },
  {
    name: "Aluminum Chlorohydrate",
    aliases: ["aluminum chlorohydrate", "aluminium chlorohydrate", "ach"],
    functions: ["Deodorant"],
    notes:
      "An aluminum salt used as an antiperspirant active.",    pubchemCid: 71586946,

  },
  {
    name: "Aluminum Zirconium Tetrachlorohydrex Gly",
    aliases: ["aluminum zirconium tetrachlorohydrex gly", "azg"],
    functions: ["Deodorant"],
    notes:
      "An aluminum-zirconium salt used as an antiperspirant active.",    pubchemCid: 72941670,

  },
  {
    name: "Sodium Bicarbonate",
    aliases: ["sodium bicarbonate", "baking soda", "nahco3"],
    functions: ["pH adjuster", "Buffering agent"],
    notes:
      "A mild base used for pH adjustment and deodorizing.",
    pubchemCid: 516892,    pubchemCid: 516892,

  },
  {
    name: "Kaolin",
    aliases: ["kaolin", "kaolinite", "china clay"],
    functions: ["Abrasive", "Bulking agent"],
    notes:
      "A naturally occurring clay used as an absorbent and bulking agent.",

  },
  {
    name: "Talc",
    aliases: ["talc", "magnesium silicate", "talcum"],
    functions: ["Abrasive", "Bulking agent"],
    notes:
      "A magnesium silicate used as an absorbent and bulking agent; regulatory scrutiny of cosmetic talc continues.",
    pubchemCid: 16211468,    pubchemCid: 165411828,

  },
  {
    name: "Mica",
    aliases: ["mica", "potassium aluminum silicate"],
    functions: ["Bulking agent", "Opacifier"],
    notes:
      "A naturally occurring mineral used for opacity and slip.",    pubchemCid: 131842327,

  },
  {
    name: "Titanium Dioxide",
    aliases: ["titanium dioxide", "tio2", "ci 77891"],
    functions: ["UV filter", "Opacifier"],
    notes:
      "A mineral UV filter and opacifier; regulatory limits differ between sunscreens and other leave-on products.",
    pubchemCid: 26042,    pubchemCid: 26042,

  },
  {
    name: "Zinc Oxide",
    aliases: ["zinc oxide", "zno", "ci 77947"],
    functions: ["UV filter", "Opacifier"],
    notes:
      "A mineral UV filter; broad-spectrum protection depends on particle size and dispersion.",
    pubchemCid: 14806,    pubchemCid: 3007857,

  },
  {
    name: "Octinoxate",
    aliases: ["octinoxate", "octyl methoxycinnamate", "ethylhexyl methoxycinnamate"],
    functions: ["UV filter"],
    notes:
      "An organic UV filter; regulatory approvals and concentration limits vary by region.",    pubchemCid: 5355130,

  },
  {
    name: "Octocrylene",
    aliases: ["octocrylene"],
    functions: ["UV filter"],
    notes:
      "An organic UV filter that also stabilizes other UV filters; approval status varies.",
    pubchemCid: 21582,    pubchemCid: 22571,

  },
  {
    name: "Avobenzone",
    aliases: ["avobenzone", "butyl methoxydibenzoylmethane", "bmdm"],
    functions: ["UV filter"],
    notes:
      "A broad-spectrum organic UV filter; unstable without co-stabilizers.",
    pubchemCid: 6310088,    pubchemCid: 51040,

  },
  {
    name: "Homosalate",
    aliases: ["homosalate"],
    functions: ["UV filter"],
    notes:
      "A salicylate UV filter; EU concentration limits have been tightened.",    pubchemCid: 8362,

  },
  {
    name: "Oxybenzone",
    aliases: ["oxybenzone", "benzophenone-3", "bp-3"],
    functions: ["UV filter"],
    notes:
      "An organic UV filter; restricted or banned in some jurisdictions over environmental concerns.",
    pubchemCid: 4632,    pubchemCid: 4632,

  },
  {
    name: "Fragrance",
    aliases: ["fragrance", "parfum", "parfume", "perfume"],
    functions: ["Fragrance"],
    notes:
      "A composite of typically undisclosed aroma compounds; EU requires listed allergens to be disclosed.",
  },
  {
    name: "Linalool",
    aliases: ["linalool", "3,7-dimethyl-1,6-octadien-3-ol"],
    functions: ["Fragrance"],
    notes:
      "A naturally occurring fragrance compound; a declared EU fragrance allergen.",
    pubchemCid: 6549,    pubchemCid: 6549,

  },
  {
    name: "Limonene",
    aliases: ["limonene", "d-limonene", "dipentene"],
    functions: ["Fragrance"],
    notes:
      "A citrus-scented fragrance compound; a declared EU fragrance allergen.",
    pubchemCid: 22311,    pubchemCid: 22311,

  },
  {
    name: "Citronellol",
    aliases: ["citronellol", "3,7-dimethyloct-6-en-1-ol"],
    functions: ["Fragrance"],
    notes:
      "A floral fragrance compound; a declared EU fragrance allergen.",
    pubchemCid: 8842,    pubchemCid: 8842,

  },
  {
    name: "Geraniol",
    aliases: ["geraniol", "trans-3,7-dimethyl-2,6-octadien-1-ol"],
    functions: ["Fragrance"],
    notes:
      "A rose-like fragrance compound; a declared EU fragrance allergen.",
    pubchemCid: 637566,    pubchemCid: 637566,

  },
  {
    name: "Eugenol",
    aliases: ["eugenol", "4-allyl-2-methoxyphenol"],
    functions: ["Fragrance"],
    notes:
      "A clove-like fragrance compound; a declared EU fragrance allergen.",
    pubchemCid: 3314,    pubchemCid: 3314,

  },
  {
    name: "Coumarin",
    aliases: ["coumarin", "2h-1-benzopyran-2-one"],
    functions: ["Fragrance"],
    notes:
      "A sweet hay-like fragrance compound; a declared EU fragrance allergen.",
    pubchemCid: 323,    pubchemCid: 323,

  },
  {
    name: "Hexyl Cinnamal",
    aliases: ["hexyl cinnamal", "hexyl cinnamaldehyde", "alpha-hexylcinnamaldehyde"],
    functions: ["Fragrance"],
    notes:
      "A floral fragrance compound; a declared EU fragrance allergen.",
    pubchemCid: 1554019,    pubchemCid: 1715135,

  },
  {
    name: "Butylene Glycol",
    aliases: ["butylene glycol", "1,3-butanediol", "butane-1,3-diol"],
    functions: ["Humectant", "Solvent"],
    notes:
      "A glycol used as a humectant and penetration enhancer.",
    pubchemCid: 7893,    pubchemCid: 7896,

  },
  {
    name: "Propylene Glycol",
    aliases: ["propylene glycol", "propane-1,2-diol", "1,2-propanediol"],
    functions: ["Humectant", "Solvent"],
    notes:
      "A glycol used as a humectant and solvent; a common contact sensitizer in some individuals.",
    pubchemCid: 1030,    pubchemCid: 1030,

  },
  {
    name: "Pentylene Glycol",
    aliases: ["pentylene glycol", "1,2-pentanediol"],
    functions: ["Humectant", "Solvent"],
    notes:
      "A glycol used as a humectant and preservative booster.",
    pubchemCid: 10934,    pubchemCid: 93000,

  },
  {
    name: "Dipropylene Glycol",
    aliases: ["dipropylene glycol", "dpg"],
    functions: ["Solvent", "Humectant"],
    notes:
      "A glycol solvent and fragrance carrier.",
    pubchemCid: 329,    pubchemCid: 134692469,

  },
  {
    name: "Hydrolyzed Collagen",
    aliases: ["hydrolyzed collagen", "collagen hydrolysate"],
    functions: ["Skin conditioning", "Hair conditioning"],
    notes:
      "Hydrolyzed animal collagen used for film-forming and conditioning.",
  },
  {
    name: "Hydrolyzed Keratin",
    aliases: ["hydrolyzed keratin", "keratin hydrolysate"],
    functions: ["Hair conditioning"],
    notes:
      "Hydrolyzed keratin used in hair-conditioning products.",
  },
  {
    name: "Hydrolyzed Wheat Protein",
    aliases: ["hydrolyzed wheat protein", "wheat protein hydrolysate"],
    functions: ["Skin conditioning", "Hair conditioning"],
    notes:
      "A plant-protein hydrolysate; a concern for those with wheat/gluten allergy.",
  },
  {
    name: "Caffeine",
    aliases: ["caffeine", "1,3,7-trimethylxanthine"],
    functions: ["Skin conditioning"],
    notes:
      "A methylxanthine used for skin conditioning claims.",
    pubchemCid: 2519,    pubchemCid: 2519,

  },
  {
    name: "Green Tea Extract",
    aliases: ["green tea extract", "camellia sinensis leaf extract", "camellia sinensis extract"],
    functions: ["Antioxidant", "Skin conditioning"],
    notes:
      "A botanical extract rich in polyphenols; used for antioxidant and conditioning claims.",
  },
  {
    name: "Aloe Vera",
    aliases: ["aloe vera", "aloe barbadensis leaf juice", "aloe barbadensis", "aloe"],
    functions: ["Skin conditioning", "Humectant"],
    notes:
      "A plant extract used for skin conditioning and humectant claims.",
  },
  {
    name: "Witch Hazel",
    aliases: ["witch hazel", "hamamelis virginiana water", "hamamelis virginiana"],
    functions: ["Astringent"],
    notes:
      "A plant extract used as an astringent; ethanol content varies by preparation.",
  },
];

const matchIndex = new Map<string, IngredientEntry>();
for (const entry of PERSONAL_CARE_INGREDIENTS) {
  matchIndex.set(entry.name.toLowerCase(), entry);
  for (const alias of entry.aliases) matchIndex.set(alias.toLowerCase(), entry);
}

/** Normalize an ingredient name for matching. */
export function normalizeIngredientName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "")
    .trim();
}

/** Look up an ingredient in the curated dataset. Returns undefined if no match. */
export function findPersonalCareIngredient(rawName: string): IngredientEntry | undefined {
  const key = normalizeIngredientName(rawName);
  if (!key) return undefined;
  let entry = matchIndex.get(key);
  if (!entry) {
    // Try a contains match for INCI qualifiers like "Sodium Lauroyl Sarcosinate (30%)"
    for (const alias of matchIndex.keys()) {
      if (key.includes(alias) || alias.includes(key)) {
        entry = matchIndex.get(alias);
        break;
      }
    }
  }
  return entry;
}
