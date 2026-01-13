require('dotenv').config();

describe('Environment Sanity Check', () => {
    it('should have MINIO variables loaded', () => {
        console.log('MINIO_ENDPOINT:', process.env.MINIO_ENDPOINT);
        console.log('VITE_GOOGLE_CLIENT_ID:', process.env.VITE_GOOGLE_CLIENT_ID);
        expect(process.env.MINIO_ENDPOINT).toBeDefined();
    });
});
