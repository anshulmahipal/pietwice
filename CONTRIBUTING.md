# Contributing to pietwice

Thank you for your interest in contributing to pietwice! This document outlines our branching standards and contribution guidelines.

## Branching Standards

### Branch Naming Conventions

We follow a consistent branch naming pattern to maintain clarity and organization:

#### Format
```
<type>/<description>
```

#### Branch Types

- **`feature/`** - New features or enhancements
  - Example: `feature/add-dark-mode-toggle`
  - Example: `feature/export-data-csv`

- **`bugfix/`** or **`fix/`** - Bug fixes
  - Example: `bugfix/fix-transaction-calculation`
  - Example: `fix/resolve-category-deletion-issue`

- **`hotfix/`** - Critical production fixes that need immediate attention
  - Example: `hotfix/fix-data-loss-bug`
  - Example: `hotfix/security-patch`

- **`chore/`** - Maintenance tasks, dependency updates, refactoring
  - Example: `chore/update-react-native-version`
  - Example: `chore/refactor-database-service`

- **`docs/`** - Documentation updates
  - Example: `docs/update-api-documentation`
  - Example: `docs/add-contributing-guide`

- **`test/`** - Adding or updating tests
  - Example: `test/add-unit-tests-transactions`
  - Example: `test/update-integration-tests`

- **`refactor/`** - Code refactoring without changing functionality
  - Example: `refactor/optimize-database-queries`
  - Example: `refactor/restructure-components`

### Branch Naming Guidelines

1. **Use lowercase letters** - Branch names should be lowercase
2. **Use hyphens** - Separate words with hyphens (`-`)
3. **Be descriptive** - Use clear, concise descriptions
4. **Keep it short** - Aim for 3-5 words maximum
5. **No special characters** - Avoid spaces, underscores, or special characters
6. **Reference issues** - Optionally include issue numbers: `feature/add-export-123`

### Branch Workflow

#### Main Branches

- **`main`** - Production-ready code. Always stable and deployable.
- **`develop`** - Integration branch for features. All feature branches merge here first.

#### Creating a Branch

1. **Always start from `main`** (or `develop` if using GitFlow):
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Keep branches focused** - One branch should address one feature or fix

3. **Keep branches up to date** - Regularly rebase or merge from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout feature/your-feature-name
   git rebase main
   ```

#### Branch Protection Rules

- **`main` branch is protected** - Direct pushes are not allowed
- **Require pull requests** - All changes must go through PR review
- **Require approvals** - At least one approval required before merging
- **Require status checks** - All CI/CD checks must pass
- **No force pushes** - Force pushes to `main` are not allowed

### Pull Request Process

1. **Create a Pull Request** from your feature branch to `main`
2. **Use descriptive titles** - Follow the format: `[Type] Brief description`
   - Example: `[Feature] Add dark mode toggle`
   - Example: `[Bugfix] Fix transaction calculation error`
3. **Fill out the PR template** - Describe what changed and why
4. **Link related issues** - Reference any related issues using `#issue-number`
5. **Request reviews** - Assign reviewers and wait for approval
6. **Address feedback** - Make requested changes and update the PR
7. **Squash and merge** - Once approved, squash commits when merging

### Commit Message Standards

Follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Examples
```
feat(transactions): add bulk delete functionality

fix(categories): resolve deletion issue with active transactions

docs(readme): update installation instructions

chore(deps): update react-native to 0.72.0
```

### Best Practices

1. **Keep branches small** - Smaller PRs are easier to review
2. **Commit often** - Make frequent, logical commits
3. **Write clear commit messages** - Explain what and why, not how
4. **Test before PR** - Ensure your code works and tests pass
5. **Update documentation** - Keep docs in sync with code changes
6. **Delete merged branches** - Clean up after merging

### Branch Lifecycle

1. **Create** → `git checkout -b feature/new-feature`
2. **Develop** → Make commits and push regularly
3. **Update** → Rebase/merge from main regularly
4. **Review** → Create PR and get feedback
5. **Merge** → Squash and merge to main
6. **Delete** → Remove branch after merge

## Questions?

If you have questions about our branching standards, please:
- Open an issue for discussion
- Contact maintainers at zeroinsights@gmail.com
- Check existing PRs for examples

Thank you for contributing to pietwice! 🎉
