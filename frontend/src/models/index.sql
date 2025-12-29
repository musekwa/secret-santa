create table if not exists public.participants (
    id uuid not null default gen_random_uuid(),
    name text not null,
    email text not null,
    amount text not null default '1000',
    code text not null default '',
    is_verified boolean not null default false,
    constraint participants_pkey PRIMARY KEY (id),
    constraint participants_email_unique unique (email),
    constraint participants_code_unique unique (code)
) tablespace pg_default;

create table if not exists public.verifications (
    id uuid not null default gen_random_uuid(),
    otp text not null,
    expires_at text not null,
    participant_id uuid not null,
    constraint verifications_pkey PRIMARY KEY (id),
    constraint verifications_participants_id_fkey foreign key (participant_id) references participants(id) on delete cascade
) tablespace pg_default;


create table if not exists public.hidden_friendships (
    id uuid not null default gen_random_uuid(),
    participant_id uuid not null,
    friend_id uuid not null,
    constraint hidden_friendships_pkey PRIMARY KEY (id),
    constraint hidden_friendships_participants_id_fkey foreign key (participant_id) references participants(id) on delete cascade,
    constraint hidden_friendships_friends_id_fkey foreign key (friend_id) references participants(id) on delete cascade,
    constraint hidden_friendships_participant_id_unique unique (participant_id),
    constraint hidden_friendships_friend_id_unique unique (friend_id)
) tablespace pg_default;


alter table public.participants
    disable row level security;


alter table public.verifications
    disable row level security;

alter table public.hidden_friendships
    disable row level security;
