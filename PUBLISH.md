# Publishing Guide

This guide explains how to publish the CTERA AI n8n node to npm.

## Prerequisites

1. **npm Account**: You need an npm account with access to the `@ctera` organization
   - If you don't have an account: [Sign up at npmjs.com](https://www.npmjs.com/signup)
   - Request access to `@ctera` organization from the organization admin

2. **npm CLI**: Ensure npm is installed and up to date
   ```bash
   npm --version  # Should be 7.0.0 or higher
   ```

3. **Build Tools**: All dependencies should be installed
   ```bash
   npm install
   ```

## Pre-Publication Checklist

Before publishing, ensure:

- [ ] All changes are committed and pushed to GitHub
- [ ] Version number is updated in `package.json`
- [ ] `CHANGELOG.md` is updated (if exists) or version history in `README.md`
- [ ] Code builds without errors: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] Tests pass (if any): `npm test`
- [ ] `README.md` is up to date with latest features and examples

## Publishing Steps

### 1. Authenticate with npm

If not already logged in:

```bash
npm login
```

Enter your npm credentials when prompted.

Verify you're logged in:

```bash
npm whoami
```

### 2. Update Version Number

Update the version in `package.json` following [Semantic Versioning](https://semver.org/):

```bash
# For bug fixes (0.1.0 → 0.1.1)
npm version patch

# For new features (0.1.0 → 0.2.0)
npm version minor

# For breaking changes (0.1.0 → 1.0.0)
npm version major
```

Or manually edit `package.json`:

```json
{
  "version": "0.1.1"
}
```

### 3. Build the Package

```bash
npm run build
```

This compiles TypeScript and copies necessary assets to the `dist/` folder.

### 4. Test the Build Locally (Optional)

Before publishing, test the package installation locally:

```bash
# Pack the package
npm pack

# This creates a tarball like: ctera-n8n-nodes-ctera-ai-0.1.0.tgz
# Install it locally to test
npm install -g ./ctera-n8n-nodes-ctera-ai-0.1.0.tgz

# Test in your n8n instance
# Then uninstall
npm uninstall -g @ctera/n8n-nodes-ctera-ai

# Clean up
rm ctera-n8n-nodes-ctera-ai-0.1.0.tgz
```

### 5. Publish to npm

```bash
npm publish --access public
```

**Note**: The `--access public` flag is required for scoped packages (`@ctera/...`) to be publicly accessible.

### 6. Verify Publication

Check that the package is available:

```bash
npm view @ctera/n8n-nodes-ctera-ai
```

Visit the npm page: https://www.npmjs.com/package/@ctera/n8n-nodes-ctera-ai

### 7. Create Git Tag and Release

After successful publication:

```bash
# Create and push a git tag
git tag v0.1.0
git push origin v0.1.0
```

On GitHub, create a release:
1. Go to **Releases** → **Draft a new release**
2. Choose the tag you just created
3. Title: `v0.1.0`
4. Add release notes describing changes
5. Publish release

## Post-Publication

1. **Test Installation**: Install the published package in a fresh n8n instance
   ```bash
   npm install -g @ctera/n8n-nodes-ctera-ai
   ```

2. **Update Documentation**: Ensure any external documentation references the new version

3. **Announce**: Notify team/users about the new version

## Troubleshooting

### Error: "You do not have permission to publish"

**Solution**: 
- Ensure you're logged in: `npm whoami`
- Request access to `@ctera` organization
- Verify `publishConfig.access` is set to `"public"` in `package.json`

### Error: "Version already exists"

**Solution**: Update the version number in `package.json` to a higher version

### Error: "No README data"

**Solution**: Ensure `README.md` exists in the root directory

### Build Failures

**Solution**:
- Check TypeScript compilation: `npm run build`
- Fix any linting errors: `npm run lintfix`
- Ensure all dependencies are installed: `npm install`

## Unpublishing (Careful!)

**Warning**: Unpublishing is strongly discouraged and only possible within 72 hours of publication.

```bash
npm unpublish @ctera/n8n-nodes-ctera-ai@0.1.0
```

## Version Management Strategy

### Pre-1.0.0 (Current)
- **0.1.x**: Initial development, bug fixes
- **0.2.x**: New features, minor improvements
- **0.3.x+**: More features until stable

### Post-1.0.0
- **1.x.x**: Stable API, backward compatible changes
- **2.x.x**: Breaking changes

## CI/CD Automation (Future)

Consider automating publishing via GitHub Actions:

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Resources

- [npm Publishing Documentation](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- [Semantic Versioning](https://semver.org/)
- [n8n Community Nodes Guidelines](https://docs.n8n.io/integrations/creating-nodes/guidelines/)

