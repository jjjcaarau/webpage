CREATE TABLE invoices (
    id INTEGER PRIMARY KEY NOT NULL,
    member_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    date DATE NOT NULL,
    due_date DATE NOT NULL,
    sent DATE NULL,
    sent_as TEXT CHECK(sent_as IN ('snail_mail', 'email')) NOT NULL,
    number INTEGER NOT NULL,
    amount_passport INTEGER NOT NULL,
    amount_membership INTEGER NOT NULL,
    amount_paid INTEGER NOT NULL,
    amount_rebate INTEGER NOT NULL,
    percentage_rebate INTEGER NOT NULL,
    rebate_reason TEXT NOT NULL,
    paid BOOLEAN NOT NULL,
    comment TEXT NOT NULL
);