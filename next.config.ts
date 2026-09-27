import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Een vast build-ID: ongewijzigde pagina's blijven dan byte-voor-byte gelijk
  // tussen builds, zodat Vercel ze niet opnieuw hoeft te uploaden. Het gratis
  // plan staat maar 5000 bestandsuploads per dag toe.
  generateBuildId: async () => "dutchplanes",
  /* config options here */
};

export default nextConfig;
