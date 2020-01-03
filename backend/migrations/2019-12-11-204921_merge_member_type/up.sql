ALTER TABLE events RENAME TO events_old;
CREATE TABLE events (
    id INTEGER PRIMARY KEY NOT NULL,
    member_id INTEGER NOT NULL,
    event_type TEXT CHECK(event_type IN (
        'trainer',
        'co_trainer',
        'club',
        'board',
        'honorary',
        'js',
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
        'dan10',
        'active',
        'passive',
        'parent',
        'extern'
    )) NOT NULL,
    class TEXT CHECK(class IN('promotion', 'demotion')) NOT NULL,
    division TEXT CHECK(division IN ('club', 'judo', 'jujitsu')) NOT NULL,
    comment TEXT NULL,
    date DATE NOT NULL
);

INSERT INTO events (
    id,
    member_id,
    event_type,
    class,
    division,
    comment,
    date
) SELECT
    id,
    member_id,
    event_type,
    class,
    division,
    comment,
    date
FROM events_old;

INSERT INTO events (
    member_id,
    event_type,
    class,
    division,
    comment,
    date
)
SELECT
    id as member_id,
    REPLACE(REPLACE(member_type, 'kid', 'active'), 'student', 'active') as event_type,
    'promotion' as class,
    'club' as division,
    NULL as comment,
    date('now') as date
FROM members;

ALTER TABLE members RENAME TO members_old;
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
    needs_mark BOOLEAN NOT NULL,
    section_jujitsu BOOLEAN NOT NULL,
    section_judo BOOLEAN NOT NULL,
    section_judo_kids BOOLEAN NOT NULL,
    password TEXT NULL,
    password_recovery TEXT NULL,
    can_edit_members BOOLEAN NOT NULL
);

INSERT INTO members (
    id,
    family_id,
    first_name,
    middle_name,
    last_name,
    sex,
    birthday,
    email,
    phone_p,
    phone_w,
    mobile,
    postcode,
    city,
    address,
    address_no,
    comment,
    email_allowed,
    passport_no,
    needs_mark,
    section_jujitsu,
    section_judo,
    section_judo_kids,
    password,
    password_recovery,
    can_edit_members
) SELECT
    id,
    family_id,
    first_name,
    middle_name,
    last_name,
    sex,
    birthday,
    email,
    phone_p,
    phone_w,
    mobile,
    postcode,
    city,
    address,
    address_no,
    comment,
    email_allowed,
    passport_no,
    needs_mark,
    section_jujitsu,
    section_judo,
    section_judo_kids,
    NULL,
    NULL,
    0
FROM members_old;

DROP TABLE events_old;

DROP TABLE members_old;