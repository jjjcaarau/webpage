CREATE TEMPORARY TABLE members_backup(
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
    section_judo_kids BOOLEAN NOT NULL
);
INSERT INTO members_backup SELECT
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
    section_judo_kids
FROM members;
DROP TABLE members;
CREATE TABLE members(
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
    section_judo_kids BOOLEAN NOT NULL
);
INSERT INTO members SELECT
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
    section_judo_kids
FROM members_backup;
DROP TABLE members_backup;