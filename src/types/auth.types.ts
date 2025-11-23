export type User = {
  id: string;
  name: string;
  email: string;
  is_verified: boolean;
  amount: number;
  code: string;
  is_admin?: boolean;
};
