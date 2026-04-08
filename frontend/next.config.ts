import createNextIntlPlugin from 'next-intl/plugin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env'), override: true });

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: false,
};

export default withNextIntl(nextConfig);
