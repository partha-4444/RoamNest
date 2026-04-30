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

create table if not exists rn_properties (
    id bigserial primary key,
    owner_id bigint not null references rn_users(id) on delete restrict,
    title varchar(150) not null,
    description text,
    location varchar(255) not null,
    address text,
    price_per_night numeric(10, 2) not null,
    max_guests integer not null default 1,
    available boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint chk_rn_properties_price_positive check (price_per_night > 0),
    constraint chk_rn_properties_max_guests_positive check (max_guests > 0)
);

create table if not exists rn_bookings (
    id bigserial primary key,
    property_id bigint not null references rn_properties(id) on delete restrict,
    user_id bigint not null references rn_users(id) on delete restrict,
    check_in_date date not null,
    check_out_date date not null,
    guests integer not null default 1,
    status varchar(20) not null default 'PENDING',
    owner_decision_note text,
    decided_by bigint references rn_users(id) on delete set null,
    decided_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint chk_rn_bookings_dates check (check_out_date > check_in_date),
    constraint chk_rn_bookings_guests_positive check (guests > 0),
    constraint chk_rn_bookings_status check (status in ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'))
);

create index if not exists idx_rn_auth_tokens_user_active on rn_auth_tokens(user_id, active);
create index if not exists idx_rn_auth_tokens_expires_at on rn_auth_tokens(expires_at);
create index if not exists idx_rn_api_objects_method on rn_api_objects(http_method);
create index if not exists idx_rn_properties_owner_id on rn_properties(owner_id);
create index if not exists idx_rn_properties_location on rn_properties(lower(location));
create index if not exists idx_rn_properties_available on rn_properties(available);
create index if not exists idx_rn_bookings_property_id on rn_bookings(property_id);
create index if not exists idx_rn_bookings_user_id on rn_bookings(user_id);
create index if not exists idx_rn_bookings_status on rn_bookings(status);
create index if not exists idx_rn_bookings_property_status_dates
    on rn_bookings(property_id, status, check_in_date, check_out_date);

create table if not exists rn_booking_messages (
    id bigserial primary key,
    booking_id bigint not null references rn_bookings(id) on delete cascade,
    sender_id bigint not null references rn_users(id) on delete restrict,
    message text not null,
    created_at timestamptz not null default now()
);

create index if not exists idx_rn_booking_messages_booking_created
    on rn_booking_messages(booking_id, created_at);
create index if not exists idx_rn_booking_messages_sender_id
    on rn_booking_messages(sender_id);

create table if not exists rn_property_reviews (
    id bigserial primary key,
    booking_id bigint not null unique references rn_bookings(id) on delete restrict,
    property_id bigint not null references rn_properties(id) on delete restrict,
    user_id bigint not null references rn_users(id) on delete restrict,
    rating smallint not null,
    comment text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint chk_rn_property_reviews_rating check (rating between 1 and 5)
);

create index if not exists idx_rn_property_reviews_property_id
    on rn_property_reviews(property_id);
create index if not exists idx_rn_property_reviews_user_id
    on rn_property_reviews(user_id);

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

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('PROPERTIES_CREATE', '/api/properties', 'POST', false)
on conflict (name) do nothing;

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('PROPERTIES_LIST', '/api/properties', 'GET', false)
on conflict (name) do nothing;

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('PROPERTIES_SEARCH', '/api/properties/search', 'GET', false)
on conflict (name) do nothing;

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('BOOKINGS_CREATE', '/api/bookings', 'POST', false)
on conflict (name) do nothing;

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('BOOKINGS_APPROVE', '/api/bookings/*/approve', 'PATCH', false)
on conflict (name) do nothing;

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('BOOKINGS_REJECT', '/api/bookings/*/reject', 'PATCH', false)
on conflict (name) do nothing;

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('BOOKING_MESSAGES_CREATE', '/api/bookings/*/messages', 'POST', false)
on conflict (name) do nothing;

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('BOOKING_MESSAGES_LIST', '/api/bookings/*/messages', 'GET', false)
on conflict (name) do nothing;

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('BOOKING_REVIEW_CREATE', '/api/bookings/*/review', 'POST', false)
on conflict (name) do nothing;

insert into rn_api_objects(name, path_pattern, http_method, is_public)
values ('PROPERTY_REVIEWS_LIST', '/api/properties/*/reviews', 'GET', false)
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

insert into rn_role_api_privileges(role_id, api_object_id)
select r.id, a.id
from rn_roles r
join rn_api_objects a on a.name in ('PROPERTIES_CREATE', 'BOOKINGS_APPROVE', 'BOOKINGS_REJECT')
where r.name = 'OWNER'
on conflict (role_id, api_object_id) do nothing;

insert into rn_role_api_privileges(role_id, api_object_id)
select r.id, a.id
from rn_roles r
join rn_api_objects a on a.name in ('PROPERTIES_LIST', 'PROPERTIES_SEARCH', 'BOOKINGS_CREATE')
where r.name = 'USER'
on conflict (role_id, api_object_id) do nothing;

-- Messaging: both USER and OWNER can send and read messages for their approved bookings.
insert into rn_role_api_privileges(role_id, api_object_id)
select r.id, a.id
from rn_roles r
join rn_api_objects a on a.name in ('BOOKING_MESSAGES_CREATE', 'BOOKING_MESSAGES_LIST')
where r.name in ('USER', 'OWNER')
on conflict (role_id, api_object_id) do nothing;

-- Reviews: only USER can leave a review; both USER and OWNER can list property reviews.
insert into rn_role_api_privileges(role_id, api_object_id)
select r.id, a.id
from rn_roles r
join rn_api_objects a on a.name = 'BOOKING_REVIEW_CREATE'
where r.name = 'USER'
on conflict (role_id, api_object_id) do nothing;

insert into rn_role_api_privileges(role_id, api_object_id)
select r.id, a.id
from rn_roles r
join rn_api_objects a on a.name = 'PROPERTY_REVIEWS_LIST'
where r.name in ('USER', 'OWNER')
on conflict (role_id, api_object_id) do nothing;
