# Baseline Results

**Date:** 2025-08-11 (UTC)

## Environment

- Node.js version: v22.17.0
- pnpm version: 10.13.1

## Command Outputs

### pnpm install

(no output, installation succeeded without errors)

### pnpm build

```
> rest-express@1.0.0 build /home/donovan/Documents/JobFit-AI
> vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

vite v7.0.5 building for production...
transforming...
✓ 1813 modules transformed.
rendering chunks...
computing gzip size...
../dist/public/index.html                   0.77 kB │ gzip:   0.47 kB
../dist/public/assets/index-UtDb71LV.css   71.53 kB │ gzip:  12.66 kB
../dist/public/assets/index-DkUQmC8-.js   609.44 kB │ gzip: 183.89 kB
✓ built in 8.20s
```

### pnpm lint

```
> rest-express@1.0.0 lint /home/donovan/Documents/JobFit-AI
> eslint . --ext .js,.jsx,.ts,.tsx

```

### pnpm test

```
> rest-express@1.0.0 test /home/donovan/Documents/JobFit-AI
> vitest run --passWithNoTests

RUN  v1.6.1 /home/donovan/Documents/JobFit-AI/client

No test files found, exiting with code 0
```
