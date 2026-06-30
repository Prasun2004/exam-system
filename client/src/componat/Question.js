const questionsData = [
  {
    "id": 1,
    "section": "Hematopoiesis",
    "question": "Which cytokine drives a multipotent stem cell to become a common myeloid progenitor?",
    "options": [
      "Interleukin-3 (IL-3)",
      "GM-CSF",
      "Stem Cell Factor",
      "Flt3 Ligand"
    ],
    "answer": "Interleukin-3 (IL-3)"
  },
  {
    "id": 2,
    "section": "Hematopoiesis",
    "question": "What is the correct chronological sequence of embryonic hematopoiesis sites?",
    "options": [
      "Yolk sac -> Liver -> Spleen -> Bone marrow",
      "Yolk sac -> Spleen -> Liver -> Bone marrow",
      "Liver -> Yolk sac -> Spleen -> Bone marrow",
      "Yolk sac -> Liver -> Bone marrow -> Spleen"
    ],
    "answer": "Yolk sac -> Liver -> Spleen -> Bone marrow"
  },
  {
    "id": 3,
    "section": "Hematopoiesis",
    "question": "Which cell type in the marrow niche directly provides self-renewal signals via CXCL12?",
    "options": [
      "CXCL12-abundant reticular cells",
      "Endosteal osteoclasts",
      "Sinusoidal endothelial cells",
      "Sympathetic nerve fibers"
    ],
    "answer": "CXCL12-abundant reticular cells"
  },
  {
    "id": 4,
    "section": "Erythropoiesis",
    "question": "At which stages does hemoglobin synthesis begin and nucleus extrusion occur?",
    "options": [
      "Basophilic erythroblast; Orthochromatic erythroblast",
      "Polychromatophilic erythroblast; Reticulocyte",
      "Proerythroblast; Orthochromatic erythroblast",
      "Basophilic erythroblast; Polychromatophilic erythroblast"
    ],
    "answer": "Basophilic erythroblast; Orthochromatic erythroblast"
  },
  {
    "id": 5,
    "section": "Erythropoiesis",
    "question": "Which renal cells detect hypoxia to upregulate erythropoietin production?",
    "options": [
      "Peritubular interstitial fibroblasts",
      "Visceral podocytes",
      "Macula densa cells",
      "Glomerular mesangial cells"
    ],
    "answer": "Peritubular interstitial fibroblasts"
  },
  {
    "id": 6,
    "section": "Erythropoiesis",
    "question": "What does New Methylene Blue stain to visualize reticulocytes?",
    "options": [
      "Residual ribosomal RNA",
      "Mitochondrial fragments",
      "Ferritin aggregates",
      "Nuclear remnants"
    ],
    "answer": "Residual ribosomal RNA"
  },
  {
    "id": 7,
    "section": "Anemia",
    "question": "Which molecule blocks ferroportin to trap iron inside macrophages during chronic inflammation?",
    "options": [
      "Hepcidin",
      "Ferroportin",
      "Transferrin receptor 2",
      "Erythroferrone"
    ],
    "answer": "Hepcidin"
  },
  {
    "id": 8,
    "section": "Anemia",
    "question": "Labs: Hb 9.2, MCV 64, RBC 5.8 x 10^12/L, RDW 13.5%. What is the diagnosis?",
    "options": [
      "Beta-thalassemia minor",
      "Iron deficiency anemia",
      "Anemia of chronic disease",
      "Sideroblastic anemia"
    ],
    "answer": "Beta-thalassemia minor"
  },
  {
    "id": 9,
    "section": "Anemia",
    "question": "Which blocked pathway causes neurological symptoms in pure Vitamin B12 deficiency?",
    "options": [
      "Methylmalonyl-CoA to Succinyl-CoA",
      "Homocysteine to Methionine",
      "5-methylTHF to THF",
      "Ribonucleotide reductase pathway"
    ],
    "answer": "Methylmalonyl-CoA to Succinyl-CoA"
  },
  {
    "id": 10,
    "section": "Anemia",
    "question": "A smear shows schistocytes and a platelet count of 32,000/µL. What must be ruled out immediately?",
    "options": [
      "Thrombotic Thrombocytopenic Purpura",
      "Immune Thrombocytopenic Purpura",
      "Hereditary Spherocytosis",
      "Autoimmune Hemolytic Anemia"
    ],
    "answer": "Thrombotic Thrombocytopenic Purpura"
  },
  {
    "id": 11,
    "section": "Anemia",
    "question": "A patient with a mechanical heart valve has low haptoglobin and hemosiderinuria. Identify the mechanism.",
    "options": [
      "Microangiopathic intravascular hemolysis",
      "Macrophage-mediated extravascular hemolysis",
      "Complement-mediated intravascular hemolysis",
      "Splenic sequestration"
    ],
    "answer": "Microangiopathic intravascular hemolysis"
  },
  {
    "id": 12,
    "section": "Liver Function Test",
    "question": "Labs: Total Bilirubin 12, Direct 10.5, ALP 450, ALT 55. Urine has bilirubin but no urobilinogen. Diagnosis?",
    "options": [
      "Choledocholithiasis",
      "Acute Viral Hepatitis A",
      "Gilbert Syndrome",
      "Crigler-Najjar Syndrome Type I"
    ],
    "answer": "Choledocholithiasis"
  },
  {
    "id": 13,
    "section": "Liver Function Test",
    "question": "Why is the AST:ALT ratio > 2:1 in alcoholic liver disease?",
    "options": [
      "Pyridoxal-5'-phosphate deficiency suppresses ALT synthesis",
      "AST has a shorter half-life than ALT",
      "Alcohol induces membrane-bound AST release",
      "Centrilobular necrosis destroys ALT pools"
    ],
    "answer": "Pyridoxal-5'-phosphate deficiency suppresses ALT synthesis"
  },
  {
    "id": 14,
    "section": "Liver Function Test",
    "question": "What is the molecular defect in Gilbert Syndrome?",
    "options": [
      "Reduced activity of Bilirubin UGT1A1",
      "Mutation in ABCC2 gene (MRP2)",
      "Defect in SLCO1B1/SLCO1B3 transporters",
      "Absence of hepatic ligandin"
    ],
    "answer": "Reduced activity of Bilirubin UGT1A1"
  },
  {
    "id": 15,
    "section": "Liver Function Test",
    "question": "Why is Prothrombin Time (PT) a better acute liver failure indicator than albumin?",
    "options": [
      "Factor VII half-life is 4-6 hours; Albumin is 20 days",
      "Albumin production is preserved by muscles",
      "Factor VII is synthesized by endothelial cells",
      "Albumin binds to acute-phase reactants"
    ],
    "answer": "Factor VII half-life is 4-6 hours; Albumin is 20 days"
  },
  {
    "id": 16,
    "section": "Bacterial Identification",
    "question": "An oxidase-positive, motile rod produces green pigment at 42°C. What is its key metabolic property?",
    "options": [
      "Oxidizes glucose but does not ferment it",
      "Ferments lactose slowly",
      "Produces H2S on TSI agar",
      "Hydrolyzes urea rapidly"
    ],
    "answer": "Oxidizes glucose but does not ferment it"
  },
  {
    "id": 17,
    "section": "Bacterial Identification",
    "question": "KIA reaction is K/A with gas and heavy H2S. The colony is non-lactose fermenting. Identify the organism.",
    "options": [
      "Salmonella enteritidis",
      "Shigella dysenteriae",
      "Proteus vulgaris",
      "Escherichia coli"
    ],
    "answer": "Salmonella enteritidis"
  },
  {
    "id": 18,
    "section": "Bacterial Identification",
    "question": "Which culture medium is highly selective for isolating Bordetella pertussis?",
    "options": [
      "Bordet-Gengou agar",
      "TCBS agar",
      "Lowenstein-Jensen medium",
      "Chocolate agar with V factor"
    ],
    "answer": "Bordet-Gengou agar"
  },
  {
    "id": 19,
    "section": "Bacterial Identification",
    "question": "What factors are required for the growth of Haemophilus influenzae?",
    "options": [
      "X factor (Hemin) and V factor (NAD)",
      "X factor and Coenzyme A",
      "V factor and Vitamin K",
      "Factor VIII and L-cysteine"
    ],
    "answer": "X factor (Hemin) and V factor (NAD)"
  },
  {
    "id": 20,
    "section": "Bacterial Identification",
    "question": "What is the mechanism of action of the Vibrio cholerae enterotoxin?",
    "options": [
      "ADP-riboxylation of Gs protein",
      "Inhibition of protein synthesis via 28S rRNA",
      "Cleavage of synaptobrevin",
      "Inactivation of Gi protein"
    ],
    "answer": "ADP-riboxylation of Gs protein"
  },
  {
    "id": 21,
    "section": "Fixative + Universal Precaution",
    "question": "What is the formaldehyde gas percentage in 10% Neutral Buffered Formalin, and how does it fix tissue?",
    "options": [
      "4%; cross-linking amino groups via methylene bridges",
      "10%; coagulating proteins by dehydration",
      "37%; precipitating nucleic acids",
      "1%; forming salt linkages"
    ],
    "answer": "4%; cross-linking amino groups via methylene bridges"
  },
  {
    "id": 22,
    "section": "Fixative + Universal Precaution",
    "question": "A vaccinated tech gets a needle stick from an HBeAg+ patient. What is the immediate step?",
    "options": [
      "Test anti-HBs titers; if <10 mIU/mL, give HBIG + booster",
      "Administer 3-dose vaccine series immediately",
      "Give prophylactic tenofovir for 28 days",
      "No action required due to vaccine history"
    ],
    "answer": "Test anti-HBs titers; if <10 mIU/mL, give HBIG + booster"
  },
  {
    "id": 23,
    "section": "Fixative + Universal Precaution",
    "question": "Which fixative can replace 95% ethanol for Papanicolaou smear fixation without altering morphology?",
    "options": [
      "100% Methanol",
      "10% Neutral Buffered Formalin",
      "Bouin's Fluid",
      "Carnoy's Fluid"
    ],
    "answer": "100% Methanol"
  },
  {
    "id": 24,
    "section": "Fixative + Universal Precaution",
    "question": "What concentration of Sodium Hypochlorite and contact time are required to clean blood spills?",
    "options": [
      "10% solution (1:10) for 10–20 minutes",
      "70% Isopropyl alcohol for 30 seconds",
      "0.5% Chlorhexidine for 5 minutes",
      "1% Glutaraldehyde for 2 minutes"
    ],
    "answer": "10% solution (1:10) for 10–20 minutes"
  },
  {
    "id": 25,
    "section": "Hemoglobin Estimation",
    "question": "Why does leaving the Sahli mixture for 30 minutes instead of 10 minutes falsely elevate results?",
    "options": [
      "Acid hematin conversion is time-dependent and takes 45 minutes to maximize",
      "Plasma proteins precipitate over time, creating turbidity",
      "Atmospheric oxidation converts carboxyhemoglobin",
      "Distilled water evaporates, concentrating the color"
    ],
"answer": "Acid hematin conversion is time-dependent and takes 45 minutes to maximize"
},
{
"id": 26,
"section": "Hemoglobin Estimation",
"question": "How do you correct a falsely high Drabkin's hemoglobin reading caused by lipemic plasma?",
"options": [
"Centrifuge the mixture and read the supernatant",
"Dilute Drabkin's reagent with distilled water",
"Pre-warm the sample at 56°C for 10 minutes",
"Blank the spectrophotometer using the lipemic plasma"
],
"answer": "Centrifuge the mixture and read the supernatant"
},
{
"id": 27,
"section": "Hemoglobin Estimation",
"question": "What wavelength is used in the cyanmethemoglobin assay, and which hemoglobin form is unmeasured?",
"options": [
"540 nm; Sulfhemoglobin",
"505 nm; Carboxyhemoglobin",
"570 nm; Methemoglobin",
"620 nm; Oxyhemoglobin"
],
"answer": "540 nm; Sulfhemoglobin"
},
{
"id": 28,
"section": "Coagulation",
"question": "A sudden warfarin-induced spike in PT/INR is primarily due to the early depletion of which factor?",
"options": [
"Factor VII",
"Factor IX",
"Factor X",
"Factor II"
],
"answer": "Factor VII"
},
{
"id": 29,
"section": "Coagulation",
"question": "An asymptomatic male has an isolated APTT of 82s. A 1:1 mixing study fails to correct it. Diagnosis?",
"options": [
"Lupus Anticoagulant",
"Factor VIII deficiency",
"Factor XII deficiency",
"Heparin contamination"
],
"answer": "Lupus Anticoagulant"
},
{
"id": 30,
"section": "Coagulation",
"question": "What artifactual error occurs if a coagulation tube is only filled halfway?",
"options": [
"PT and APTT are falsely prolonged",
"PT and APTT are falsely shortened",
"PT is shortened; APTT is prolonged",
"Results remain unaffected"
],
"answer": "PT and APTT are falsely prolonged"
},
{
"id": 31,
"section": "Coagulation",
"question": "A newborn has prolonged PT and APTT, but normal TT and platelets. A mixing study corrects both. Deficiency?",
"options": [
"Factor X deficiency",
"Factor XIII deficiency",
"Factor VII deficiency",
"Dysfibrinogenemia"
],
"answer": "Factor X deficiency"
},
{
"id": 32,
"section": "Coding-Decoding",
"question": "If HEMATOPOIESIS is encrypted as IELDVRUMSMKX, how will ERYTHROPOIESIS be encoded?",
"options": [
"FUDUKSNVRMKX",
"FTDUTSOVRMLY",
"FTEVKSNVRMKX",
"FUDUKSOVSNKY"
],
"answer": "FUDUKSNVRMKX"
},
{
"id": 33,
"section": "Coding-Decoding",
"question": "If ANEMIA is coded as 1145131 and LIVER is 12922518, what is the code for FIXATIVE?",
"options": [
"69241209225",
"69241199225",
"69221209215",
"69241208225"
],
"answer": "69241209225"
},
{
"id": 34,
"section": "Coding-Decoding",
"question": "If 'Anemia diagnosed early' is '7x 2m 9p' and 'Early intervention works' is '9p 4k 3b', what is 'Anemia'?",
"options": [
"7x",
"2m",
"9p",
"5r"
],
"answer": "7x"
},
{
"id": 35,
"section": "Coding-Decoding",
"question": "If 'Fixative' means 'Staining' and 'Staining' means 'Centrifugation', what separates blood cells from plasma?",
"options": [
"Centrifugation",
"Incubation",
"Staining",
"Disposal"
],
"answer": "Centrifugation"
},
{
"id": 36,
"section": "Coding-Decoding",
"question": "If COAGULATION is encrypted as DPBHTMBSJPO, what is the decrypted form of BMFNJB?",
"options": [
"ANEMIA",
"BLOOD",
"CANCER",
"ALBUMIN"
],
"answer": "ANEMIA"
},
{
"id": 37,
"section": "Puzzle",
"question": "C is 3rd. Two samples sit between C and B. G is 1st. D is after G. A is right before F. Who is 4th?",
"options": [
"D",
"E",
"A",
"F"
],
"answer": "D"
},
{
"id": 38,
"section": "Number Series",
"question": "Complete the sequence: 4, 11, 30, 67, 128, ?",
"options": [
"219",
"197",
"215",
"243"
],
"answer": "219"
},
{
"id": 39,
"section": "Odd One Out",
"question": "Identify the odd term out: 343, 512, 729, 1000, 1331, 2197, 2744",
"options": [
"1331",
"2197",
"729",
"2744"
],
"answer": "1331"
},
{
"id": 40,
"section": "Venn Diagram",
"question": "Out of 120 techs, 65 use Hematology, 50 use Coagulation, and 25 use both. How many use neither?",
"options": [
"30",
"20",
"45",
"15"
],
"answer": "30"
},
{
"id": 41,
"section": "Seating Arrangement",
"question": "6 people sit in a circle. P is opposite R. Q is right of P. T is between P and S. Who is left of R?",
"options": [
"U",
"Q",
"S",
"T"
],
"answer": "U"
},
{
"id": 42,
"section": "Percentage",
"question": "A lab spends 40% budget on reagents, 30% of the rest on repair, and saves ₹42,000. Total budget?",
"options": [
"₹1,00,000",
"₹1,20,000",
"₹90,000",
"₹1,40,000"
],
"answer": "₹1,00,000"
},
{
"id": 43,
"section": "Ratio & Proportion",
"question": "A 640 mL mixture contains fixative, solvent, and water in a 3:5:8 ratio. What is the water volume?",
"options": [
"320 mL",
"200 mL",
"120 mL",
"240 mL"
],
"answer": "320 mL"
},
{
"id": 44,
"section": "Time & Work",
"question": "Tech A does 60 samples in 4h. Tech B does 60 in 6h. Working together, how long to finish 150 samples?",
"options": [
"6 hours",
"5 hours",
"4.5 hours",
"7 hours"
],
"answer": "6 hours"
},
{
"id": 45,
"section": "History",
"question": "Who discovered the ABO blood group system in 1900?",
"options": [
"Karl Landsteiner",
"William Harvey",
"Alexander Wiener",
"Paul Ehrlich"
],
"answer": "Karl Landsteiner"
}
];
export default questionsData;
