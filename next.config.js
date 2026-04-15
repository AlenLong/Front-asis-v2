/** @type {import('next').NextConfig} */
const { execSync } = require('child_process');

// Info de Git y servidor al iniciar
try {
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  const repo = execSync('git config --get remote.origin.url').toString().trim();

  console.log(`\n🚀 Frontend running on: https://app.australbyte.com`);
  console.log(`🔀 Rama: ${branch}`);
  console.log(`📁 Repo: ${repo}\n`);
} catch {
  console.log('\n⚠️  No se pudo obtener info de Git\n');
}

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
