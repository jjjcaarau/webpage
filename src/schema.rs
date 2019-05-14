table! {
    courses (id) {
        id -> Integer,
        name -> Text,
        division -> Text,
    }
}

table! {
    event_types (id) {
        id -> Integer,
        name -> Text,
    }
}

table! {
    events (id) {
        id -> Integer,
        event_type_id -> Integer,
        #[sql_name = "type"]
        type_ -> Text,
        division -> Text,
        comment -> Nullable<Text>,
        date -> Date,
    }
}

table! {
    members (id) {
        id -> Integer,
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
        membership_type_id -> Integer,
        passport_no -> Text,
        member_type -> Integer,
        honorary_member -> Bool,
        honorary_member_reason -> Text,
        needs_mark_jujitsu -> Bool,
        needs_mark_judo -> Bool,
    }
}

allow_tables_to_appear_in_same_query!(
    courses,
    event_types,
    events,
    members,
);
