// Jest runs tests under CommonJS, but src/api/client.ts uses Vite's
// `import.meta.env`. This plugin rewrites `import.meta` to an object backed
// by `process.env` so the same source file works under both Vite and Jest.
function importMetaEnvPlugin() {
  return {
    visitor: {
      MetaProperty(path) {
        if (path.node.meta.name === 'import' && path.node.property.name === 'meta') {
          path.replaceWithSourceString('({ env: process.env })')
        }
      },
    },
  }
}

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [importMetaEnvPlugin],
}
