function trimBaseUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;

  return url.replace(/\/+$/, '');
}

export const env = {
  // Server
  port: process.env.PORT as string,
  nodeVersion: process.env.NODE_VERSION as string,

  // Database
  databaseUrl: process.env.DATABASE_URL as string,

  // Authentication
  jwtSecret: process.env.JWT_SECRET as string,

  // App
  app: {
    name: process.env.APP_NAME as string,
    domain: process.env.APP_DOMAIN as string,
    email: process.env.APP_EMAIL as string,
  },

  // AWS
  aws: {
    region: process.env.AWS_REGION as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    bucketName: process.env.AWS_BUCKET_NAME as string,
    /** Base pública dos objetos (ex.: CloudFront ou `https://bucket.s3.region.amazonaws.com`). Sem barra final. */
    s3PublicBaseUrl: process.env.AWS_S3_PUBLIC_BASE_URL as string | undefined,
  },

  /**
   * API object-storage-ws (OpenAPI). Se `baseUrl` e `apiKey` estiverem definidos, upload/delete
   * de mídia usam HTTP em vez do SDK S3 direto.
   */
  objectStorage: {
    baseUrl: trimBaseUrl(process.env.OBJECT_STORAGE_BASE_URL),
    apiKey: process.env.OBJECT_STORAGE_API_KEY?.trim() || undefined,
    /** MINIO | AWS — default MINIO conforme spec OpenAPI. */
    provider:
      process.env.OBJECT_STORAGE_PROVIDER === 'AWS'
        ? ('AWS' as const)
        : ('MINIO' as const),
    retentionDias: process.env.OBJECT_STORAGE_RETENTION_DIAS?.trim() || undefined,
    /** Quando o upload não tem email de usuário (ex.: jobs). */
    usuarioFallback: process.env.OBJECT_STORAGE_USUARIO_FALLBACK?.trim() || undefined,
  },

  // Email
  emailFrom: process.env.EMAIL_FROM as string,

  // Origins
  allowedOrigins: process.env.ALLOWED_ORIGINS as string,
};

/** `true` quando upload de mídia deve usar a API object-storage-ws. */
export function useObjectStorageWs(): boolean {
  return !!(env.objectStorage.baseUrl && env.objectStorage.apiKey);
}

/** S3 direto ou object-storage-ws: há destino configurado para mídia. */
export function mediaStorageConfigured(): boolean {
  return useObjectStorageWs() || !!(env.aws.bucketName?.trim());
}
