table! {
    courses (id) {
        id -> Integer,
        name -> Text,
        division -> Text,
    }
}

table! {
    events (id) {
        id -> Integer,
        member_id -> Integer,
        event_type -> Text,
        class -> Text,
        division -> Text,
        comment -> Nullable<Text>,
        date -> Date,
    }
}

table! {
    invoices (id) {
        id -> Integer,
        member_id -> Integer,
        year -> Integer,
        date -> Date,
        due_date -> Date,
        sent -> Nullable<Date>,
        sent_as -> Text,
        number -> Integer,
        invoice_passport -> Integer,
        invoice_amount -> Integer,
        paid_amount -> Integer,
        paid -> Bool,
        comment -> Text,
    }
}

table! {
    members (id) {
        id -> Integer,
        family_id -> Nullable<Integer>,
        first_name -> Text,
        middle_name -> Text,
        last_name -> Text,
        sex -> Text,
        birthday -> Date,
        email -> Text,
        phone_p -> Text,
        phone_w -> Text,
        mobile -> Text,
        postcode -> Text,
        city -> Text,
        address -> Text,
        address_no -> Text,
        comment -> Text,
        email_allowed -> Bool,
        passport_no -> Text,
        member_type -> Text,
        needs_mark -> Bool,
        section_jujitsu -> Bool,
        section_judo -> Bool,
        section_judo_kids -> Bool,
        password -> Nullable<Text>,
        password_recovery -> Nullable<Text>,
        can_edit_members -> Bool,
    }
}

allow_tables_to_appear_in_same_query!(
    courses,
    events,
    invoices,
    members,
);
