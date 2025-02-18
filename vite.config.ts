import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use dynamic import for vite-tsconfig-paths
export default defineConfig(async () => {
    const viteTsconfigPaths = await import('vite-tsconfig-paths');
    return {
        base: '',
        plugins: [react(), viteTsconfigPaths.default()],
        server: {
            open: true,
            port: 3000,
        },
        build: {
            outDir: 'build', // Specify the output directory
        },
    };
});
