---
applyTo: "**"
---

# GitHub Copilot Custom Instructions — Modern Node.js (JavaScript)

## Context
We build cloud-native services in **Node.js 20 LTS** with ECMAScript modules.

Stack overview
- Runtime: Node.js 20 LTS (ES2023 features enabled)  
- Package manager: **pnpm**  
- Linting/formatting: **ESLint** (Airbnb rules) + **Prettier**  
- Testing: built-in **node:test** runner + **c8** for coverage  
- Validation: **Zod**  
- CI/CD: **GitHub Actions** (matrix: Linux, macOS, Windows)  
- Cloud: **Azure Functions** / Container Apps  
- Docs: JSDoc + Markdown  

## Copilot Instructions

1. **Use ESM syntax**  
   `import`/`export` only. No `require` or `module.exports`.

2. **Target Node.js 20+**  
   Leverage ES2023 features such as `findLast`, `Array.at`, and top-level `await`.  
   No callbacks—always `async/await`.

3. **Enforce security**  
   Validate all external input with Zod schemas.  
   Never interpolate untrusted data into SQL or shell commands.  
   Follow OWASP Top-10 guidelines.

4. **Follow our style guide**  
   Airbnb ESLint rules + Prettier.  
   2-space indent, single quotes, trailing commas.  
   camelCase variables, PascalCase classes, UPPER_SNAKE_CASE env vars.

5. **Keep modules small**  
   One feature per file, ≈ 300 LOC max.  
   Export a single default when logical.  
   Place helper functions at the bottom.

6. **Add JSDoc**  
   Provide concise JSDoc for every exported function.  
   Use `@param`, `@returns`, `@async` tags.

7. **Write tests with `node:test`**  
   Mirror each source file with `*.test.js`.  
   Use `describe` / `it`.  
   Mock dependencies with `test.mock()`.

8. **Use pnpm workspaces**  
   For multi-package repos, prefer `pnpm add -w` for shared dependencies.

9. **Manage config via dotenv**  
   Load env vars through `dotenv` in `config/index.js`.  
   Never commit `.env` files.

10. **Prefer native Node APIs**  
    Use `node:fs/promises` and other `node:`-namespaced imports.  
    Avoid large transitive dependencies.

11. **Document and demo**  
    Update the README with a usage example for each public function.  
    Provide sample snippets in Markdown code blocks.

12. **Cloud readiness**  
    Keep code stateless; offload state to Redis or Azure Cosmos DB.  
    Include Azure Functions bindings in examples where relevant.

## Negative Instructions
- Do **not** suggest CommonJS or callback APIs.  
- Do **not** include outdated libraries like `request` or `body-parser`.  
- Do **not** assume use of npm or yarn.  