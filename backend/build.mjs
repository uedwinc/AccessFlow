import * as esbuild from 'esbuild';
import { readdir, mkdir } from 'fs/promises';
import { join } from 'path';

/**
 * Build Lambda functions for Node 22 runtime
 * Creates optimized bundles with all dependencies included
 */

const lambdaHandlers = [
  {
    name: 'analyzeApplication',
    entry: 'src/handlers/analyzeApplication.ts',
    output: 'dist/lambda/analyzeApplication/index.js'
  },
  {
    name: 'interviewPrep',
    entry: 'src/handlers/interviewPrep.ts',
    output: 'dist/lambda/interviewPrep/index.js'
  }
];

async function buildLambda(handler) {
  console.log(`Building ${handler.name}...`);
  
  try {
    await esbuild.build({
      entryPoints: [handler.entry],
      bundle: true,
      platform: 'node',
      target: 'node22',
      format: 'esm',
      outfile: handler.output,
      external: [
        // AWS SDK v3 is provided by Lambda runtime
        '@aws-sdk/*'
      ],
      banner: {
        js: `
// AWS Lambda Node 22 ESM compatibility
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`.trim()
      },
      minify: true,
      sourcemap: true,
      metafile: true,
      logLevel: 'info'
    });
    
    console.log(`✅ ${handler.name} built successfully`);
  } catch (error) {
    console.error(`❌ Failed to build ${handler.name}:`, error);
    process.exit(1);
  }
}

async function buildAll() {
  console.log('🚀 Building Lambda functions for Node 22...\n');
  
  // Create dist/lambda directory
  await mkdir('dist/lambda', { recursive: true });
  
  // Build all handlers in parallel
  await Promise.all(lambdaHandlers.map(buildLambda));
  
  console.log('\n✨ All Lambda functions built successfully!');
  console.log('\nOutput:');
  lambdaHandlers.forEach(handler => {
    console.log(`  - ${handler.output}`);
  });
}

buildAll().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});
