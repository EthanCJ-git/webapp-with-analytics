export type Project = {
  slug: string;
  title: string;
  summary: string;
  description: string[];
  tech: string[];
  year: string;
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "portfolio-analytics",
    title: "This site",
    summary:
      "A personal portfolio with a hand-rolled, privacy-first analytics pipeline instead of a third-party tracking script.",
    description: [
      "Built on Next.js App Router with the public pages statically rendered from local content — no database on the read path. Visits are recorded through a single edge API route that hashes the visitor's IP and user agent with a server-side salt (SHA-256), so returning-visitor recognition works without cookies, client-side storage, or a consent banner.",
      "A Supabase Postgres table with row-level security stores events; the owner-only dashboard reads aggregates directly through RLS with no hand-written authorization code. Sessions are derived at query time with a window-function query rather than stored, keeping the write path a single unconditional insert.",
    ],
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Postgres"],
    year: "2026",
    links: [{ label: "Source", href: "https://github.com/EthanCJ-git" }],
  },
  {
    slug: "signalk-cloud",
    title: "SignalK Cloud",
    summary:
      "A multi-tenant boat monitoring platform that ingests live SignalK sensor data from sailboats and serves it as historical charts and real-time telemetry.",
    description: [
      "Boats stream SignalK data over MQTT to AWS IoT Core, where it's processed and written to TimeStream for time-series storage and DynamoDB for tenant, organization, and device state. A Spring Boot REST API — secured with Cognito-issued JWTs — serves live and historical data per organization, with subscription tiers gating features like historical charts and alerting.",
      "Built as a hexagonal architecture with a framework-free domain layer: business rules such as authorization and billing tier limits live in plain-Java domain services, thin use cases orchestrate them, and Spring/AWS specifics stay isolated in adapters. Infrastructure is provisioned with Terraform across IoT Core, TimeStream, DynamoDB, ECS Fargate, and Cognito.",
    ],
    tech: ["Java", "Spring Boot", "AWS IoT Core", "TimeStream", "DynamoDB", "Terraform"],
    year: "2026",
    links: [{ label: "Source", href: "https://github.com/EthanCJ-git/signalk-cloud" }],
  },
];
