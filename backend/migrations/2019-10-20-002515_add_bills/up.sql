CREATE TABLE bills (
    id INTEGER PRIMARY KEY NOT NULL,
    member_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    number INTEGER NOT NULL,
    bill_passport INTEGER NOT NULL,
    bill_amount INTEGER NOT NULL,
    paid_amount INTEGER NOT NULL,
    paid BOOLEAN NOT NULL,
    comment TEXT NOT NULL
);