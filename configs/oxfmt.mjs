/**
 * Formatter settings that print what Prettier 3 printed with its default
 * options. Files the project-template governance sync owns, and the generated
 * changelog, are left as they are.
 */
export default {
  ignorePatterns: [
    ".github/**",
    ".claude/**",
    ".gitleaks.toml",
    "Taskfile.yml",
    "Taskfile.yaml",
    "CHANGELOG.md",
  ],
  printWidth: 80,
  sortPackageJson: false,
};
