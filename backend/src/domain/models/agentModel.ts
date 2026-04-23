export type AgentModel = {
  id: string;
  appUserId: string | null;
  name: string;
  agentType: number;
  publicLocation: boolean | null;
  geoLocation: string;
  shortDescription: string | null;
  longDescription: string | null;
  createTimestamp: Date;
  updateTimestamp: Date | null;
  status: number;
};

