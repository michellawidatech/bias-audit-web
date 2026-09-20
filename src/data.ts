export const RESEARCH = {
  title:
    "Bias Evaluation Framework in AI-Powered Resume Classification Using DistilBERT with SHAP Explainability and Automated Fairness Flagging",
  authors: [
    "Jotika Aleeshya Halim",
    "Michella Arlene Wijaya Radika",
    "Diana",
    "Shania Priccilia",
  ],
  affiliation: "Bina Nusantara University",
  venue: "ICISS 2026",
  dataset: {
    resumes: 2400,
    classes: 24,
    source: "Kaggle",
    year: 2021,
    split: "70 / 15 / 15",
    trainBefore: 1737,
    trainAfter: 1920,
    val: 372,
    test: 373,
  },
  performance: {
    accuracy: 0.748,
    precision: 0.7661,
    recall: 0.748,
    f1: 0.7466,
  },
  fairness: {
    meanAccuracy: 0.75,
    meanSuitability: 0.661,
    selectionParityMean: 0.717,
    selectionParitySD: 0.1845,
    belowDI: 6,
    totalClasses: 24,
    fprRange: "0.000–0.031" as const,
    overselected: ["Engineering", "Finance", "Sales", "Teacher"],
    overselectedThreshold: 1.19,
  },
  flags: {
    uncertainThreshold: 0.627,
    shapThreshold: 0.005,
    diThreshold: 0.8,
    uncertain: { n: 165, pct: 44.2 },
    potentialBias: { n: 153, pct: 41.0 },
    fairnessRisk: { n: 72, pct: 19.3 },
    atLeastOne: { n: 283, pct: 75.9 },
    noFlag: { n: 90, pct: 24.1 },
  },
} as const;

export type ShapRow = {
  occupation: string;
  token: string;
  meanShap: number;
  note: string;
};

export const SHAP_ROWS: ShapRow[] = [
  {
    occupation: "CONSULTANT",
    token: "female",
    meanShap: 0.014535,
    note: "Largest positive proxy-token push observed in the reported sample.",
  },
  {
    occupation: "CONSULTANT",
    token: "experienced",
    meanShap: 0.014253,
    note: "Seniority indicator with strong upward push for Consultant.",
  },
  {
    occupation: "TEACHER",
    token: "experienced",
    meanShap: 0.012069,
    note: "Seniority indicator pushing Teacher suitability upward.",
  },
  {
    occupation: "ENGINEERING",
    token: "senior",
    meanShap: 0.009925,
    note: "Seniority token with upward push for Engineering.",
  },
  {
    occupation: "DESIGNER",
    token: "boys",
    meanShap: -0.005141,
    note: "Gendered token pushing Designer suitability downward.",
  },
];

export const PIPELINE_STAGES = [
  {
    id: "raw",
    index: "01",
    name: "Raw Resume PDF",
    short: "RAW",
    what: "2,400 native PDF resumes across 24 occupation classes (Kaggle, 2021). No explicit demographic labels.",
    why: "The audit starts from the real artifact HR would screen — not a cleaned toy input.",
    tech: ["2,400 PDFs", "24 classes", "No demographic labels"],
  },
  {
    id: "prep",
    index: "02",
    name: "PDF / Text Preprocessing",
    short: "PREP",
    what: "Native PDFs via pdfplumber, scanned PDFs via pytesseract. Unicode normalization, PII removal, excess-space removal, lowercasing.",
    why: "Standardizes noisy resume text so classification and SHAP attribute to content, not formatting artifacts.",
    tech: ["pdfplumber + pytesseract", "PII removal", "70 / 15 / 15 split", "Hybrid sampling → 1,920 train"],
  },
  {
    id: "distilbert",
    index: "03",
    name: "DistilBERT Classifier",
    short: "MODEL",
    what: "DistilBERT sequence classifier over 24 occupation classes with softmax output. Suitability score in [0, 1]. 512-token chunks, 256-token stride.",
    why: "Produces both the occupation prediction and the confidence signal the audit reasons about.",
    tech: ["LR 3.71e-5 · batch 16 · 3 epochs", "Warmup 10% · dropout 0.2", "Optuna search", "Acc 0.7480 · F1 0.7466"],
  },
  {
    id: "shap",
    index: "04",
    name: "SHAP Explainability",
    short: "SHAP",
    what: "Token-level attribution showing which words pushed the suitability prediction up or down. 386 instances mapped to proxy-variable tokens.",
    why: "Accuracy alone hides process. SHAP exposes whether gendered or seniority tokens carried weight.",
    tech: ["30 resumes / class (22 for BPO)", "Proxy tokens: female, boys, senior…", "|mean SHAP| > 0.005 → flag"],
  },
  {
    id: "fairness",
    index: "05",
    name: "Fairness Evaluation",
    short: "FAIR",
    what: "Cross-occupation selection parity, per-class accuracy parity, and Disparate Impact (DI) ratio per class.",
    why: "Checks systematic imbalance: are some occupations selected far more or less often than the average?",
    tech: ["Mean suitability 0.661", "Parity mean 0.717 · SD 0.1845", "DI < 0.8 → risk · 6 of 24 classes"],
  },
  {
    id: "flags",
    index: "06",
    name: "Automated Flagging",
    short: "FLAGS",
    what: "Three explicit thresholds turn signals into review flags: suitability < 0.627, proxy |SHAP| > 0.005, DI < 0.8.",
    why: "Removes silent judgment calls — every flag traces to a stated numeric rule.",
    tech: ["UNCERTAIN < 0.627", "POTENTIAL BIAS > 0.005", "FAIRNESS RISK DI < 0.8"],
  },
  {
    id: "llama",
    index: "07",
    name: "LLaMA 2 Explanation",
    short: "LLM",
    what: "Converts SHAP outputs and flags into a human-readable explanation written for HR review.",
    why: "HR should not read raw SHAP vectors. The LLM translates evidence into an action: review, don't auto-accept.",
    tech: ["HR-facing narrative", "Cites thresholds", "Review recommendation"],
  },
  {
    id: "hr",
    index: "08",
    name: "HR Review",
    short: "HR",
    what: "A decision-support handoff. Flagged resumes receive additional scrutiny before any hiring decision is finalized.",
    why: "The framework is an audit layer, not an autonomous hiring system.",
    tech: ["75.9% flagged for review", "24.1% no flag", "Human decides"],
  },
] as const;

/* --------------------------------------------------------------------------
   The excerpt used in the reader. Same text and same four proxy tokens the
   study inspected — the highlighted words are proxy-signal candidates, not
   words labelled discriminatory.
   -------------------------------------------------------------------------- */

export type Proxy = {
  token: string;
  kind: "Gendered term" | "Seniority indicator";
  gloss: string;
};

export const PROXY_TOKENS: Record<string, Proxy> = {
  female: {
    token: "female",
    kind: "Gendered term",
    gloss:
      "In the Consultant sample this pushed suitability upward on average. The framework treats it as a proxy signal to audit — not proof of discrimination, and not inherently disqualifying.",
  },
  experienced: {
    token: "experienced",
    kind: "Seniority indicator",
    gloss:
      "Experience can be legitimate. But when it dominates a prediction beyond role requirements, the framework asks whether tenure language is standing in for merit.",
  },
  senior: {
    token: "senior",
    kind: "Seniority indicator",
    gloss:
      "Same audit logic as other seniority language: relevant in context, but its influence should be visible and reviewable rather than silent.",
  },
  boys: {
    token: "boys",
    kind: "Gendered term",
    gloss:
      "Direction matters too. SHAP records pushes both ways, and a token that lowers a score is as much a review signal as one that raises it.",
  },
};

export const EXCERPT: { w: string; proxy?: string }[] = [
  { w: "Female", proxy: "female" },
  { w: "consultant" },
  { w: "with" },
  { w: "ten" },
  { w: "years" },
  { w: "of" },
  { w: "experience", proxy: "experienced" },
  { w: "." },
  { w: "Experienced", proxy: "experienced" },
  { w: "in" },
  { w: "stakeholder" },
  { w: "management" },
  { w: "and" },
  { w: "senior", proxy: "senior" },
  { w: "program" },
  { w: "leadership" },
  { w: "." },
  { w: "Mentored" },
  { w: "boys", proxy: "boys" },
  { w: "coding" },
  { w: "club" },
  { w: "and" },
  { w: "led" },
  { w: "cross-functional" },
  { w: "delivery" },
  { w: "." },
];

export const PRIOR_WORK = [
  {
    stage: "Pre-processing",
    claim: "Sanitize or debias the data",
    limit:
      "Cleans inputs before training — valuable, but **cannot reveal what the trained model actually relies on** at inference time.",
  },
  {
    stage: "In-processing",
    claim: "Optimize for fairness during training",
    limit:
      "Constrains learning toward parity — yet the resulting decision process **often remains a black box to HR.**",
  },
  {
    stage: "Post-processing",
    claim: "Inspect or adjust the outputs",
    limit:
      "Corrects decisions after they are generated — sometimes after harm, and **usually without explaining why.**",
  },
] as const;

export const COMBINATION = [
  { layer: "Classification", detail: "DistilBERT · 24 classes" },
  { layer: "Explainability", detail: "SHAP token attribution" },
  { layer: "Fairness evaluation", detail: "Parity + disparate impact" },
  { layer: "Automated flagging", detail: "Explicit thresholds" },
  { layer: "Interpretation", detail: "LLaMA 2, human-readable" },
] as const;

export const REFRAME = [
  {
    when: "Instead of only asking",
    q: "“Did the AI classify the resume correctly?”",
    p: "A single accuracy number. Silent about process, confidence, or imbalance.",
  },
  {
    when: "The framework also asks",
    q: "“What influenced the prediction?”",
    p: "SHAP token attribution — which words pushed the score, and by how much.",
  },
  {
    when: "Then",
    q: "“Was the model uncertain? Is selection imbalanced?”",
    p: "Suitability vs. 0.627 · proxy SHAP vs. 0.005 · DI ratio vs. 0.8.",
  },
  {
    when: "Finally",
    q: "“Should HR review this decision?”",
    p: "Flags and the LLaMA 2 narrative route flagged resumes to a human — before hiring.",
  },
] as const;

export const LIMITATIONS = [
  {
    t: "No explicit demographic labels",
    tag: "Limits individual-level fairness",
    p: "Without ground-truth demographics, the audit reasons via occupation-level parity and proxy-token language — a principled substitute, not a replacement.",
  },
  {
    t: "2021 Kaggle dataset",
    tag: "May not represent current hiring",
    p: "Language, roles, and hiring norms shift. Results describe this corpus — 2,400 resumes from 2021 — not today's labor market.",
  },
  {
    t: "Limited SHAP sample",
    tag: "Stratified sample, not a census",
    p: "Attribution used 30 resumes per occupation (22 for BPO). Reported means are evidence within that sample, not the full distribution.",
  },
  {
    t: "No mitigation comparison",
    tag: "Detection without ranked fixes",
    p: "Flagged biases were not compared against debiasing methods — the work exposes risk; it does not yet rank fixes.",
  },
  {
    t: "No adversarial robustness testing",
    tag: "Next hardening step",
    p: "Robustness against deliberately gamed resumes remains untested — stated openly as future work.",
  },
] as const;

export const FUTURE = [
  { t: "Validate with explicit demographic labels", p: "Move from proxy-token and occupation-level analysis to individual-level fairness evaluation." },
  { t: "Extend to multilingual resumes", p: "Test whether proxy signals and thresholds generalize beyond English-language resumes." },
  { t: "Compare bias mitigation techniques", p: "Evaluate detection against concrete debiasing methods — rank fixes, not just risks." },
  { t: "Test adversarial robustness", p: "Probe the pipeline with manipulated resumes designed to game classification or attribution." },
  { t: "Conduct studies with HR professionals", p: "Measure whether flags and LLaMA 2 explanations actually improve review quality in practice." },
  { t: "Real-time HR decision-support interface", p: "Integrate the audit loop into a live screening surface HR teams already use." },
] as const;

export const RULES = [
  {
    id: "uncertain",
    cls: "r-uncertain",
    name: "Uncertain decision",
    expr: "suitability < 0.627",
    title: "Confidence below the suitability threshold",
    body: "The model's confidence sits under the defined suitability threshold. The prediction should receive additional scrutiny rather than auto-acceptance.",
    detail:
      "Rule: suitability score < 0.627 → UNCERTAIN_DECISION. In the test set this fired on 165 resumes (44.2%). Low confidence is treated as a reason to slow down, because mean suitability across occupations was 0.661 — so 0.627 sits meaningfully below typical confidence.",
    n: 165,
    pct: 44.2,
  },
  {
    id: "bias",
    cls: "r-bias",
    name: "Potential bias",
    expr: "|mean SHAP| > 0.005",
    title: "Proxy-token influence above threshold",
    body: "Mean absolute SHAP value above 0.005 for proxy tokens such as gendered words or seniority indicators. Potential demographic or proxy-variable influence detected.",
    detail:
      "Rule: |mean SHAP| > 0.005 on proxy-variable tokens → POTENTIAL_BIAS. Fired on 153 resumes (41.0%). 386 instances in the analysis mapped to proxy tokens. A positive SHAP value pushed suitability up; a negative value pushed it down — both directions count.",
    n: 153,
    pct: 41.0,
  },
  {
    id: "risk",
    cls: "r-risk",
    name: "Fairness risk",
    expr: "DI ratio < 0.8",
    title: "Selection-rate imbalance for the predicted class",
    body: "The predicted class shows a selection-rate imbalance per the Disparate Impact threshold — class selection rate against the mean of other classes.",
    detail:
      "Rule: DI ratio < 0.8 → FAIRNESS_RISK, the legal-rule threshold used by the framework. 6 of 24 occupations fell below it; it fired on 72 test resumes (19.3%). Engineering, Finance, Sales and Teacher were overselected with ratios above 1.19. Cross-occupation parity mean 0.717, SD 0.1845.",
    n: 72,
    pct: 19.3,
  },
] as const;
