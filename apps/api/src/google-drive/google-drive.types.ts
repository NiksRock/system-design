// apps/api/src/google-drive/google-drive.types.ts

export type GoogleFile = {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  size?: string;
  md5Checksum?: string;
};

export type ListResponse = {
  files: GoogleFile[];
  nextPageToken?: string;
};

export type TokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};
