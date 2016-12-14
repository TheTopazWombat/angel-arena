create database angel_arena;

create type side as enum ('corp', 'runner');

create type faction as enum ('anarch', 'criminal', 'shaper', 'sunny', 'adam', 'apex', 'haas', 'weyland', 'jinteki', 'nbn', 'neutral');

create type win as enum ('points', 'flatline', 'decking', 'time');

create type card_type as enum ('identity', 'event', 'hardware', 'program', 'resource', 'agenda', 'asset', 'ice', 'operation', 'upgrade');

create type competition_level as enum ('casual', 'gnc', 'sc', 'regional', 'national', 'world', 'anrpc');



create table users (
    id serial primary key,
    username text,
    password text,
    email text
);

create table tournaments (
    id serial primary key,
    admin integer references users(id),
    level competition_level,
    tournament_date text,
    player_count integer
);

create table users_tournaments_relations (
    id serial primary key,
    admin boolean default 'false',
    user_id integer references users(id),
    tournament_id integer references tournaments(id),
    swiss_place integer,
    overall_place integer,
    strength_of_schedule integer,
    used_bye boolean,
);

create table matches (
    id serial primary key,
    player_1 integer references users(id),
    player_2 integer references users(id),
    parent_tournament integer references tournaments(id),
    match_json text
)

create table decks (
    id serial primary key,
    side side,
    faction faction,
    player integer references users(id),
    cards integer[],
    mwl_legal boolean,
    archetype varchar(80),
    ruleset varchar(40),
    wins integer,
    losses integer,
    identity varchar(40)
);


create table cards (
    id serial primary key,
    cost integer,
    deck_limit integer,
    faction faction,
    side side,
    flavor varchar(255),
    img_src varchar(255),
    subtypes text[],
    text_box text,
    type card_type,
    is_unique boolean,
    cycle varchar(40),
    min_deck_size integer default null,
    influence integer
);

