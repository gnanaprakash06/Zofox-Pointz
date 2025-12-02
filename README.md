# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```

---

## Additional Features in This Template

This repository is a **template repo** preconfigured with the following features:

- **React DOM**: Preconfigured to use `react-dom` for rendering React components.
- **Tailwind CSS v4**: Tailwind CSS is already set up for styling, using the latest version (v4).
- **Path Aliases**: Path aliases are configured for both app-related files and Node.js-related files for consistency and future-proofing. The alias `@src/*` maps to the `src` directory, making imports cleaner and easier to manage.
  - Example:
    ```typescript
    import MyComponent from "@src/components/MyComponent";
    ```
- **ESLint Configuration**: Includes type-aware linting rules and React-specific linting rules for better code quality.

---

## Commands to Use This Template

Here are the commands to get started with this template:

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start Development Server**:

   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```
4. **Preview Production Build**:

   ```bash
   npm run preview
   ```

5. **Run ESLint**:
   ```bash
   npm run lint
   ```

---

## Path Aliases

For consistency and future-proofing, path aliases have been added to both `tsconfig.app.json` and `tsconfig.node.json`. This ensures that the alias `@src/*` works seamlessly in both app-related files and Node.js-related files (e.g., `vite.config.ts`).

### Example Usage:

```typescript
import MyComponent from "@src/components/MyComponent";
```

### Configuration:

- **`tsconfig.app.json`**:

  ```jsonc
  "baseUrl": ".",
  "paths": {
    "@src/*": ["./src/*"]
  }
  ```

- **`tsconfig.node.json`**:

  ```jsonc
  "baseUrl": ".",
  "paths": {
    "@src/*": ["./src/*"]
  }
  ```

  This ensures that path aliases are consistent across the project.

---

## Tailwind CSS

Tailwind CSS is pre configured with tailwind v4 in this template

---

### 2. **Add a Section for Dependencies**

You could list the key dependencies and their purposes for future reference. For example:

```

markdown

## Key Dependencies

- **React** (`react` and `react-dom`): Core library for building user interfaces.
- **React Router DOM** (`react-router-dom`): For routing and navigation in the app.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Vite**: Fast build tool and development server.
- **TypeScript**: Adds static typing to JavaScript.
- **ESLint**: Linter for maintaining code quality.
- **Prettier**: Code formatter for consistent styling.
- **Prettier Plugin for Tailwind CSS**: Ensures Tailwind classes are sorted automatically.

```

## Future Enhancements

- Add unit testing with Vitest or Jest.
- Configure CI/CD pipelines for automated builds and deployments.
- Add more Tailwind CSS plugins (e.g., `@tailwindcss/forms`, `@tailwindcss/typography`).

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd vite-ttt-repo
   ```

## Notes for Future Reference

- This template is designed to be a starting point for projects using React, TypeScript, Vite, and Tailwind CSS.
- The configuration is optimized for modern development workflows, including HMR (Hot Module Replacement) and type-aware linting.
- The inclusion of path aliases in both app and Node configurations ensures compatibility and maintainability for future development.

---

Feel free to customize this template further to suit your project needs!

```

```
