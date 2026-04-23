export type HttpResponse = {
  statusCode: number;
  body?: any;
};

export type HttpRequest = {
  body?: any;
  headers: Record<string, string>;
  query: Record<string, string | undefined>;
  params: Record<string, string | undefined>;
  account?: {
    userId: string;
  };
};
