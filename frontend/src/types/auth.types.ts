

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  is_verified: boolean;
  refresh_token?: string;
  created_at: Date;
  updated_at: Date;
};

export type Participant = {
  user_id: string;
  gift_value: number;
  role: string;
  status: Status;
  code: string;
};

export type Group = {
  id: string;
  name: string;
  owner_id: string;
  is_active: boolean;
  participants: Participant[];
  created_at: Date;
  updated_at: Date;
}

export enum Status {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}
