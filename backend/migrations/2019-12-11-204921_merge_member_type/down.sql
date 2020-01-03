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
        'dan10'
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
FROM events_old
WHERE event_type NOT IN (
    'active',
    'passive',
    'parent',
    'student',
    'kid',
    'extern'
);

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
    member_type TEXT CHECK(member_type IN ('active', 'passive', 'parent', 'student', 'kid', 'extern')) NOT NULL,
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
    member_type,
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
    (
        SELECT event_type
        FROM events_old
        WHERE member_id = members_old.id AND event_type in (
            'active',
            'passive',
            'parent',
            'student',
            'kid',
            'extern'
        )
        ORDER BY events_old.id DESC
        LIMIT 1
    ) AS member_type,
    needs_mark,
    section_jujitsu,
    section_judo,
    section_judo_kids,
    password,
    password_recovery,
    can_edit_members
FROM members_old;

DROP TABLE members_old;

DROP TABLE events_old;