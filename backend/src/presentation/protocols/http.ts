import type { Buffer } from 'node:buffer';

export type HttpResponse = {
  statusCode: number;
  body?: any;
};

export type HttpUploadedFile = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

export type HttpRequest = {
  body?: any;
  headers: Record<string, string>;
  query: Record<string, string | undefined>;
  params: Record<string, string | undefined>;
  account?: {
    userId: string;
  };
  file?: HttpUploadedFile;
};
