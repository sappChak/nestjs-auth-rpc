export interface IGoogleToken {
  access_token: string;
  id_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}
