// Security — a real gap not represented on the original resumes but a growing
// 2026 hiring priority across the industry (per web research), and directly
// relevant to this app's own RLS/privacy design decisions.
export const securitySkills = [
  {
    id: "appsec-fundamentals",
    name: "Application Security Fundamentals",
    category: "Security",
    level: 10,
    why: "Directly relevant to real work already done in this project — SQL injection prevention in dynamic DDL, RLS policy design.",
    subskills: [
      { id: "appsec-owasp-top10", name: "OWASP Top 10", weight: 3, todos: ["Explain SQL injection, XSS, and CSRF with a concrete exploit example for each", "Find and fix one real injection-style vulnerability in a personal project"] },
      { id: "appsec-input-validation", name: "Input Validation & Sanitization", weight: 2, todos: ["Add proper input validation to an endpoint that currently trusts client input", "Explain the difference between validation, sanitization, and encoding"] },
      { id: "appsec-secure-defaults", name: "Secure-by-Default Design", weight: 2, todos: ["Audit a real project for a resource that's public by accident (like the app-resumes bucket issue this project actually hit)", "Explain defense-in-depth with a real example from this codebase"] },
    ],
  },
  {
    id: "auth-authz-patterns",
    name: "Authentication & Authorization Patterns",
    category: "Security",
    level: 10,
    why: "Broader than JWT mechanics specifically — the architectural patterns (RBAC, RLS) behind who can do what.",
    subskills: [
      { id: "authz-rbac", name: "Role-Based Access Control (RBAC)", weight: 2, todos: ["Design an RBAC scheme for a real multi-role application", "Explain the difference between authentication and authorization with a concrete example"] },
      { id: "authz-row-level-security", name: "Row-Level Security (RLS)", weight: 3, todos: ["Re-derive this app's own RLS policy design (auth.uid() = user_id pattern) and explain why it's safe even if client code is compromised", "Write an RLS policy from scratch for a new table with a real access requirement"] },
    ],
  },
  {
    id: "cryptography-basics",
    name: "Cryptography Basics",
    category: "Security",
    level: 10,
    why: "The foundation beneath HTTPS, JWT signing, and password storage — worth conceptual fluency even without implementing crypto primitives yourself.",
    subskills: [
      { id: "crypto-symmetric-asymmetric", name: "Symmetric vs Asymmetric Encryption", weight: 2, todos: ["Explain the performance/key-distribution trade-off between symmetric and asymmetric encryption", "Explain how TLS uses both (asymmetric handshake, symmetric session)"] },
      { id: "crypto-hashing-passwords", name: "Password Hashing", weight: 2, todos: ["Explain why passwords must be hashed with a salt, never encrypted or stored plain", "Explain why bcrypt/argon2 are preferred over a fast hash like SHA-256 for passwords"] },
    ],
  },
];
