-- RoamNest RBAC and JWT auth schema for PostgreSQL
-- Run this file in your roamnest_db database.

create table if not exists rn_roles (
    id bigserial primary key,
    name varchar(32) not null unique,
    created_at timestamptz not null default now()
);

create table if not exists rn_users (
    id bigserial primary key,
    full_name varchar(255),
    username varchar(100) not null unique,
    password_hash varchar(255) not null,
    role_id bigint not null references rn_roles(id),
    phone_no varchar(40),
    address text,
    enabled boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists rn_api_objects (
    id bigserial primary key,
    name varchar(120) not null unique,
    path_pattern varchar(255) not null,
    http_method varchar(16) not null,
    is_public boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique(path_pattern, http_method)
);

create table if not exists rn_role_api_privileges (
    id bigserial primary key,
    role_id bigint not null references rn_roles(id) on delete cascade,
    api_object_id bigint not null references rn_api_objects(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique(role_id, api_object_id)
);

create table if not exists rn_auth_tokens (
    id bigserial primary key,
    user_id bigint not null references rn_users(id) on delete cascade,
    token_value text not null unique,
    active boolean not null default true,
    expires_at timestamptz not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists rn_owner_user_scope (
    id bigserial primary key,
    owner_id bigint not null references rn_users(id) on delete cascade,
    user_id bigint not null references rn_users(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique(owner_id, user_id)
);

create index if not exists idx_rn_auth_tokens_user_active on rn_auth_tokens(user_id, active);
create index if not exists idx_rn_auth_tokens_expires_at on rn_auth_tokens(expires_at);
create index if not exists idx_rn_api_objects_method on rn_api_objects(http_method);

insert into rn_roles(name) values ('ADMIN') on conflict (name) do nothing;
insert into rn_roles(name) values ('OWNER') on conflict (name) do nothing;
insert into rn_roles(name) values ('USER') on conflict (name) do nothing;

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('AUTH_SIGNUP', '/api/auth/signup', 'POST', true)
on conflict (name) do nothing;

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('AUTH_LOGIN', '/api/auth/login', 'POST', true)
on conflict (name) do nothing;

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('AUTH_LOGOUT', '/api/auth/logout', 'POST', false)
on conflict (name) do nothing;

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('RBAC_API_OBJECTS_UPSERT', '/api/admin/rbac/api-objects', 'POST', false)
on conflict (name) do nothing;

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('RBAC_PRIVILEGES_GRANT', '/api/admin/rbac/privileges', 'POST', false)
on conflict (name) do nothing;

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('RBAC_PRIVILEGES_LIST', '/api/admin/rbac/privileges/*', 'GET', false)
on conflict (name) do nothing;

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('USER_DETAILS', '/api/users/details', 'GET', false)
on conflict (name) do nothing;

-- Grant ADMIN to all current non-public API objects.
insert into rn_role_api_privileges(role_id, api_object_id)
select r.id, a.id
from rn_roles r
join rn_api_objects a on a.is_public = false
where r.name = 'ADMIN'
on conflict (role_id, api_object_id) do nothing;

-- Grant OWNER and USER to user details and logout only.
insert into rn_role_api_privileges(role_id, api_object_id)
select r.id, a.id
from rn_roles r
join rn_api_objects a on a.name in ('USER_DETAILS', 'AUTH_LOGOUT')
where r.name in ('OWNER', 'USER')
on conflict (role_id, api_object_id) do nothing;
