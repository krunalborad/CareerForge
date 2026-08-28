export const STOP_WORDS = new Set(
  "the a an and or of to in for with on at by is are be as we you your our their from that this will have has can able strong good work working experience years team using use plus etc job role who what when".split(" ")
);

export const ACTION_VERBS = [
  "Built", "Led", "Designed", "Optimised", "Automated", "Shipped", "Migrated", "Scaled", "Reduced", "Launched",
];

export const BEHAVIOURAL_BANK = [
  "Tell me about a time you disagreed with a teammate. How did you resolve it?",
  "Describe the most challenging bug you have debugged and how you approached it.",
  "Tell me about a project you are proud of and your specific contribution.",
  "How do you prioritise when everything is urgent?",
  "Describe a time you received tough feedback. What did you change?",
  "Tell me about a deadline you missed and what you learned.",
];

export const TECH_BANK = {
  general: [
    "Walk me through the architecture of a {level}-level project you have built end to end.",
    "How do you decide between SQL and NoSQL for a new feature?",
    "Explain how you would debug a slow API endpoint in production.",
    "What does a good code review look like to you?",
    "How do you test the code you write?",
    "Explain a technical concept you know well to a non-technical stakeholder.",
  ],
  frontend: [
    "Explain the React rendering lifecycle and when memoisation actually helps.",
    "How would you make a large list render smoothly in the browser?",
    "What is the difference between controlled and uncontrolled components?",
    "How do you approach accessibility in a {level} frontend role?",
    "Explain CSS specificity and how you keep styles maintainable.",
    "How would you reduce a bundle from 2MB to under 500KB?",
  ],
  backend: [
    "Design a rate limiter for a public REST API.",
    "How do you keep JWT authentication secure in production?",
    "Explain database indexing and when an index hurts performance.",
    "How would you handle a job queue for sending 1M emails?",
    "Describe your approach to schema design in MongoDB.",
    "How do you make an API idempotent?",
  ],
  "full stack": [
    "Walk me through a MERN request from browser click to database write.",
    "How do you share validation logic between client and server?",
    "How would you implement file uploads securely?",
    "Explain how you'd add real-time notifications to an existing app.",
    "How do you structure a monorepo for a {level} team?",
    "What is your deployment and rollback strategy?",
  ],
  data: [
    "How would you clean a dataset with 20% missing values?",
    "Explain bias-variance tradeoff with a practical example.",
    "Write the logic for a rolling 7-day active user metric.",
    "How do you validate that a model is production ready?",
    "Explain a time series forecasting approach you have used.",
    "How would you design an A/B test for a signup flow?",
  ],
};
