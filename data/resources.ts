// Curated, real learning resources. The model may only pick from these ids,
// so every link shown to a user is one a human checked.

export type Cost = "free" | "paid" | "funded";
export type ResType = "course" | "cert" | "programme" | "guide" | "community";

export interface Resource {
  id: string;
  title: string;
  provider: string;
  type: ResType;
  cost: Cost;
  hours: number;
  url: string;
  tags: string[];
  irish?: boolean;
}

export const RESOURCES: Resource[] = [
  // Irish public upskilling
  { id: "springboard", title: "Springboard+ funded courses", provider: "HEA / Government of Ireland", type: "programme", cost: "funded", hours: 300, url: "https://springboardcourses.ie/", tags: ["ireland", "ai", "data", "cyber", "software", "career-change"], irish: true },
  { id: "skillnet", title: "Skillnet Ireland upskilling networks", provider: "Skillnet Ireland", type: "programme", cost: "funded", hours: 40, url: "https://www.skillnetireland.ie/", tags: ["ireland", "ai", "leadership", "finance", "digital"], irish: true },
  { id: "ecollege", title: "eCollege free online courses", provider: "SOLAS", type: "course", cost: "free", hours: 30, url: "https://www.ecollege.ie/", tags: ["ireland", "digital", "data", "software", "beginner"], irish: true },
  { id: "jobsireland", title: "JobsIreland public job service", provider: "Department of Social Protection", type: "programme", cost: "free", hours: 2, url: "https://jobsireland.ie/", tags: ["ireland", "jobs", "career-change"], irish: true },
  { id: "cyberskills", title: "Cyber Skills micro-credentials", provider: "Cyber Skills (MTU-led)", type: "course", cost: "funded", hours: 60, url: "https://cyberskills.ie/", tags: ["ireland", "cyber", "security"], irish: true },

  // AI foundations
  { id: "elements-of-ai", title: "Elements of AI (multilingual)", provider: "University of Helsinki & MinnaLearn", type: "course", cost: "free", hours: 30, url: "https://www.elementsofai.com/", tags: ["ai", "beginner", "multilingual", "everyone"] },
  { id: "ai-for-everyone", title: "AI For Everyone", provider: "DeepLearning.AI · Coursera", type: "course", cost: "free", hours: 6, url: "https://www.coursera.org/learn/ai-for-everyone", tags: ["ai", "beginner", "everyone", "product", "leadership"] },
  { id: "google-ai-essentials", title: "Google AI Essentials", provider: "Google · Coursera", type: "course", cost: "paid", hours: 10, url: "https://www.coursera.org/learn/google-ai-essentials", tags: ["ai", "beginner", "everyone", "productivity"] },
  { id: "anthropic-courses", title: "Anthropic courses: prompt engineering & tool use", provider: "Anthropic · GitHub", type: "course", cost: "free", hours: 12, url: "https://github.com/anthropics/courses", tags: ["ai", "prompting", "llm", "software"] },
  { id: "prompting-guide", title: "Prompt Engineering Guide", provider: "DAIR.AI", type: "guide", cost: "free", hours: 8, url: "https://www.promptingguide.ai/", tags: ["ai", "prompting", "llm"] },
  { id: "dlai-short", title: "Short courses on LLM apps, agents & RAG", provider: "DeepLearning.AI", type: "course", cost: "free", hours: 10, url: "https://www.deeplearning.ai/short-courses/", tags: ["ai", "llm", "agents", "rag", "software"] },
  { id: "hf-llm", title: "Hugging Face LLM Course", provider: "Hugging Face", type: "course", cost: "free", hours: 30, url: "https://huggingface.co/learn/llm-course", tags: ["ai", "llm", "open-source", "ml", "software"] },
  { id: "hf-agents", title: "Hugging Face AI Agents Course", provider: "Hugging Face", type: "course", cost: "free", hours: 20, url: "https://huggingface.co/learn/agents-course", tags: ["ai", "agents", "open-source", "software"] },
  { id: "fastai", title: "Practical Deep Learning for Coders", provider: "fast.ai", type: "course", cost: "free", hours: 40, url: "https://course.fast.ai/", tags: ["ai", "ml", "software", "data"] },
  { id: "do-gradient", title: "Build AI agents on DigitalOcean Gradient", provider: "DigitalOcean Docs", type: "guide", cost: "free", hours: 4, url: "https://docs.digitalocean.com/products/gradient-ai-platform/", tags: ["ai", "agents", "cloud", "software", "deployment"] },

  // Cloud & solutions (forward-deployed / solutions engineering)
  { id: "aws-ai-practitioner", title: "AWS Certified AI Practitioner", provider: "Amazon Web Services", type: "cert", cost: "paid", hours: 25, url: "https://aws.amazon.com/certification/certified-ai-practitioner/", tags: ["ai", "cloud", "cert", "product", "solutions"] },
  { id: "aws-saa", title: "AWS Certified Solutions Architect – Associate", provider: "Amazon Web Services", type: "cert", cost: "paid", hours: 60, url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/", tags: ["cloud", "cert", "solutions", "architecture", "software", "deployment"] },
  { id: "azure-ai-900", title: "Microsoft Azure AI Fundamentals", provider: "Microsoft Learn", type: "cert", cost: "paid", hours: 15, url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/", tags: ["ai", "cloud", "cert", "beginner"] },
  { id: "azure-ai-102", title: "Microsoft Azure AI Engineer Associate", provider: "Microsoft Learn", type: "cert", cost: "paid", hours: 50, url: "https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/", tags: ["ai", "cloud", "cert", "software", "solutions"] },
  { id: "gcp-genai-leader", title: "Google Cloud Generative AI Leader", provider: "Google Cloud", type: "cert", cost: "paid", hours: 15, url: "https://cloud.google.com/learn/certification/generative-ai-leader", tags: ["ai", "cert", "leadership", "product", "strategy"] },
  { id: "mom-test", title: "The Mom Test: customer discovery", provider: "Rob Fitzpatrick", type: "guide", cost: "paid", hours: 5, url: "https://www.momtestbook.com/", tags: ["clients", "discovery", "solutions", "product", "consulting"] },
  { id: "toastmasters", title: "Toastmasters: presenting & demos", provider: "Toastmasters International", type: "community", cost: "paid", hours: 20, url: "https://www.toastmasters.org/", tags: ["communication", "clients", "demos", "leadership", "consulting"] },

  // Data, finance & analytics
  { id: "google-data", title: "Google Data Analytics Certificate", provider: "Google · Coursera", type: "cert", cost: "paid", hours: 180, url: "https://www.coursera.org/professional-certificates/google-data-analytics", tags: ["data", "analytics", "cert", "finance", "career-change"] },
  { id: "pl-300", title: "Microsoft Power BI Data Analyst", provider: "Microsoft Learn", type: "cert", cost: "paid", hours: 40, url: "https://learn.microsoft.com/en-us/credentials/certifications/data-analyst-associate/", tags: ["data", "analytics", "cert", "finance", "reporting"] },
  { id: "kaggle-learn", title: "Kaggle Learn: Python, SQL, ML", provider: "Kaggle", type: "course", cost: "free", hours: 20, url: "https://www.kaggle.com/learn", tags: ["data", "python", "sql", "ml", "finance", "beginner"] },

  // Product, governance, design, sector
  { id: "duke-ai-pm", title: "AI Product Management Specialization", provider: "Duke University · Coursera", type: "course", cost: "paid", hours: 40, url: "https://www.coursera.org/specializations/ai-product-management-duke", tags: ["product", "ai", "strategy", "leadership"] },
  { id: "iapp-aigp", title: "IAPP AI Governance Professional (AIGP)", provider: "IAPP", type: "cert", cost: "paid", hours: 40, url: "https://iapp.org/certify/aigp/", tags: ["governance", "compliance", "legal", "ai", "cert", "risk"] },
  { id: "eu-ai-act", title: "EU AI Act explorer", provider: "Future of Life Institute", type: "guide", cost: "free", hours: 4, url: "https://artificialintelligenceact.eu/", tags: ["governance", "compliance", "legal", "ai", "risk", "public"] },
  { id: "google-ux", title: "Google UX Design Certificate", provider: "Google · Coursera", type: "cert", cost: "paid", hours: 200, url: "https://www.coursera.org/professional-certificates/google-ux-design", tags: ["design", "ux", "cert", "creative", "product"] },
  { id: "ai-healthcare", title: "AI in Healthcare Specialization", provider: "Stanford · Coursera", type: "course", cost: "paid", hours: 50, url: "https://www.coursera.org/specializations/ai-healthcare", tags: ["health", "ai", "data"] },
  { id: "google-cyber", title: "Google Cybersecurity Certificate", provider: "Google · Coursera", type: "cert", cost: "paid", hours: 170, url: "https://www.coursera.org/professional-certificates/google-cybersecurity", tags: ["cyber", "security", "cert", "career-change"] },
  { id: "freecodecamp", title: "freeCodeCamp certifications", provider: "freeCodeCamp", type: "course", cost: "free", hours: 300, url: "https://www.freecodecamp.org/", tags: ["software", "coding", "beginner", "career-change", "python"] },
];

export const RESOURCE_BY_ID = Object.fromEntries(RESOURCES.map((r) => [r.id, r]));

/** Compact listing passed to the model so it can pick ids. */
export const RESOURCE_CATALOG = RESOURCES.map(
  (r) => `${r.id} | ${r.title} | ${r.type}, ${r.cost}, ~${r.hours}h | tags: ${r.tags.join(",")}`,
).join("\n");
