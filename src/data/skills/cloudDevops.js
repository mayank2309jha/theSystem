// Cloud, containerization, and DevOps.
export const cloudDevopsSkills = [
  {
    id: "docker",
    name: "Docker",
    category: "Cloud & DevOps",
    level: 10,
    why: "Used across multiple resume projects (containerized pipelines, memory-limit calibration, fault-injection testing).",
    subskills: [
      { id: "docker-images", name: "Writing Dockerfiles", weight: 2, todos: ["Write a multi-stage Dockerfile for a project currently using a single-stage build and measure the image-size reduction", "Explain layer caching's effect on build speed"] },
      { id: "docker-compose", name: "Docker Compose", weight: 2, todos: ["Wire up a multi-service local dev environment with docker-compose", "Explain networking between containers in a compose setup"] },
      { id: "docker-networking-volumes", name: "Networking & Volumes", weight: 1, todos: ["Explain bind mounts vs named volumes and when to use each", "Debug a container networking issue (can't reach another service) end to end"] },
    ],
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    category: "Cloud & DevOps",
    level: 10,
    why: "A real, flagged gap against DevOps-flavored companies (Navi, Nexus, Neysa) — Nexus's interview was entirely container/K8s-focused with zero DSA.",
    subskills: [
      { id: "k8s-core-objects", name: "Core Objects (Pods, Deployments, Services)", weight: 3, todos: ["Deploy a containerized project to a local cluster (minikube/kind) with a Deployment + Service", "Explain the difference between a Deployment and a StatefulSet"] },
      { id: "k8s-networking", name: "Kubernetes Networking", weight: 2, todos: ["Explain how a Service routes traffic to pods (kube-proxy, ClusterIP)", "Explain Ingress's role versus a plain Service"] },
      { id: "k8s-scaling", name: "Scaling & Health Checks", weight: 2, todos: ["Configure liveness/readiness probes for a real deployment", "Explain HorizontalPodAutoscaler's scaling trigger mechanism"] },
      { id: "k8s-vs-vm", name: "VM vs Container Internals", weight: 2, todos: ["Explain the isolation mechanism difference between a VM (hypervisor) and a container (namespaces/cgroups)", "Explain why containers start faster than VMs"] },
    ],
  },
  {
    id: "cicd",
    name: "CI/CD Pipelines",
    category: "Cloud & DevOps",
    level: 10,
    why: "Demonstrated via GitHub Actions CI in the Impact of Label Noise project's reproducible benchmarking pipeline.",
    subskills: [
      { id: "cicd-pipeline-design", name: "Pipeline Design (build/test/deploy)", weight: 2, todos: ["Add a lint+test GitHub Actions workflow to a project that doesn't have one yet", "Explain the trade-off between a monolithic pipeline and separate build/test/deploy stages"] },
      { id: "cicd-caching", name: "Build Caching in CI", weight: 1, todos: ["Add dependency caching to a CI workflow and measure the speedup", "Explain cache invalidation risk in a CI caching setup"] },
      { id: "cicd-deployment-strategies", name: "Deployment Strategies (blue-green, canary)", weight: 2, todos: ["Explain blue-green vs canary deployment with a real rollback scenario for each", "Design a rollback plan for a failed canary deployment"] },
    ],
  },
  {
    id: "aws",
    name: "AWS",
    category: "Cloud & DevOps",
    level: 10,
    why: "The dominant cloud platform — relevant to Navi's reported \"focus on AWS/cloud infrastructure architecture\" interview advice.",
    subskills: [
      { id: "aws-compute", name: "EC2 / Compute Basics", weight: 2, todos: ["Launch and configure an EC2 instance with proper security groups", "Explain the difference between an EC2 instance and a serverless (Lambda) function for a given workload"] },
      { id: "aws-storage", name: "S3 & Storage", weight: 1, todos: ["Set up an S3 bucket with proper access policies (not public-by-accident)", "Explain S3 storage classes and when to use each"] },
      { id: "aws-iam", name: "IAM & Security", weight: 2, todos: ["Write a least-privilege IAM policy for a real service", "Explain the principle of least privilege with a concrete IAM example"] },
    ],
  },
  {
    id: "gcp",
    name: "Google Cloud Platform (GCP)",
    category: "Cloud & DevOps",
    level: 10,
    why: "A common alternative to AWS — worth basic familiarity given some companies (NETRA's deployment stack included Supabase/Render/Vercel-adjacent platforms) run on GCP.",
    subskills: [
      { id: "gcp-compute-engine", name: "Compute Engine & Cloud Run", weight: 2, todos: ["Deploy a containerized service to Cloud Run", "Explain when Cloud Run fits better than a full Kubernetes cluster"] },
      { id: "gcp-iam", name: "IAM & Service Accounts", weight: 1, todos: ["Set up a service account with scoped permissions for a real integration", "Explain the risk of an overly broad service-account key"] },
    ],
  },
  {
    id: "terraform",
    name: "Terraform / Infrastructure as Code",
    category: "Cloud & DevOps",
    level: 10,
    why: "Increasingly expected per industry hiring trends for 2026 — provisioning infra reproducibly instead of clicking through a console.",
    subskills: [
      { id: "terraform-basics", name: "Resource Definitions & State", weight: 2, todos: ["Write a Terraform config that provisions a real resource (bucket, VM, or DB)", "Explain Terraform state's purpose and the risk of manual drift"] },
      { id: "terraform-modules", name: "Modules & Reusability", weight: 1, todos: ["Refactor a flat Terraform config into a reusable module", "Explain variables/outputs' role in module composition"] },
    ],
  },
  {
    id: "git",
    name: "Git & Version Control",
    category: "Cloud & DevOps",
    level: 10,
    why: "Demonstrated implicitly across every project; explicit team collaboration on the Search & Retrieval Engine's 3-person bias-detection work.",
    subskills: [
      { id: "git-branching", name: "Branching & Merge Strategies", weight: 2, todos: ["Explain rebase vs merge with a concrete scenario for each", "Resolve a real merge conflict without discarding either side's work"] },
      { id: "git-collaboration", name: "PR Workflow & Code Review", weight: 2, todos: ["Write up your branching/PR workflow for a project that had a team", "Give a real, specific code review comment on someone else's PR (not just \"LGTM\")"] },
      { id: "git-recovery", name: "Recovering from Mistakes", weight: 1, todos: ["Practice recovering a \"lost\" commit using reflog", "Explain the difference between git reset --soft/--mixed/--hard"] },
    ],
  },
];
