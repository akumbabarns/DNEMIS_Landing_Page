import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const dhis2BaseUrl = env.DHIS2_BASE_URL || 'https://emistraining.dhis2nigeria.org.ng/semis'
  const dhis2Pat = env.DHIS2_PAT

  return {
    plugins: [react()],
    server: dhis2Pat
      ? {
          proxy: {
            '/dhis2': {
              target: dhis2BaseUrl,
              changeOrigin: true,
              secure: true,
              rewrite: (path) => path.replace(/^\/dhis2/, ''),
              headers: {
                Authorization: `ApiToken ${dhis2Pat}`,
              },
            },
          },
        }
      : undefined,
  }
})
