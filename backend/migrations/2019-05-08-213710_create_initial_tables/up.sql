CREATE TABLE members (
    id INTEGER PRIMARY KEY NOT NULL,
    family_id INTEGER NULL,
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
    passport_no TEXT NOT NULL,
    member_type TEXT CHECK(member_type IN ('active', 'passive', 'parent', 'student', 'kid', 'extern')) NOT NULL,
    needs_mark BOOLEAN NOT NULL
);

CREATE TABLE courses (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    division TEXT CHECK(division IN ('judo', 'jujitsu')) NOT NULL
);

CREATE TABLE events (
    id INTEGER PRIMARY KEY NOT NULL,
    member_id INTEGER NOT NULL,
    event_type TEXT CHECK(event_type IN (
        'trainer',
        'co_trainer',
        'club',
        'board',
        'honorary',
        'kyu1',
        'kyu2',
        'kyu3',
        'kyu4',
        'kyu5',
        'dan1',
        'dan2',
        'dan3',
        'dan4',
        'dan5',
        'dan6',
        'dan7',
        'dan8',
        'dan9',
        'dan10'
    )) NOT NULL,
    class TEXT CHECK(class IN('promotion', 'demotion')) NOT NULL,
    division TEXT CHECK(division IN ('club', 'judo', 'jujitsu')) NOT NULL,
    comment TEXT NULL,
    date DATE NOT NULL
);