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

  // Email
  emailFrom: process.env.EMAIL_FROM as string,

  // Origins
  allowedOrigins: process.env.ALLOWED_ORIGINS as string,
};
