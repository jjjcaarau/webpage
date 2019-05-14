CREATE TABLE members (
    id INTEGER PRIMARY KEY NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    sex TEXT NOT NULL,
    birthday DATE NOT NULL,
    email TEXT NOT NULL,
    phone_p TEXT NOT NULL,
    phone_w TEXT NOT NULL,
    mobile TEXT NOT NULL,
    postcode TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    address_no TEXT NOT NULL,
    comment TEXT NOT NULL,
    email_allowed BOOLEAN NOT NULL,
    membership_type_id INTEGER NOT NULL,
    passport_no TEXT NOT NULL,
    member_type INTEGER NOT NULL,
    honorary_member BOOLEAN NOT NULL,
    honorary_member_reason TEXT NOT NULL,
    needs_mark_jujitsu BOOLEAN NOT NULL,
    needs_mark_judo BOOLEAN NOT NULL
);

CREATE TABLE courses (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    division TEXT CHECK(division IN ('judo', 'jujitsu')) NOT NULL
);

CREATE TABLE events (
    id INTEGER PRIMARY KEY NOT NULL,
    event_type_id INTEGER NOT NULL,
    type TEXT CHECK(type IN('promotion', 'demotion')) NOT NULL,
    division TEXT CHECK(division IN ('club', 'judo', 'jujitsu')) NOT NULL,
    comment TEXT NULL,
    date DATE NOT NULL
);

CREATE TABLE event_types (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL
);

INSERT INTO event_types (name)
VALUES
    ("Trainer"),
    ("Trainer (CO)"),
    ("Eintritt"),
    ("Austritt"),
    ("Vorstand"),
    ("Honorary Member");