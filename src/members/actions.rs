use super::model::*;
use crate::schema::*;
use diesel::prelude::*;

pub fn list_all(connection: &SqliteConnection) -> Result<std::vec::Vec<Member>, diesel::result::Error> {
    use crate::schema::members::dsl::*;

    members
        .load::<Member>(connection)
}

pub fn create(connection: &SqliteConnection, new_member: NewMember) {
    diesel::insert_into(members::table)
        .values(&new_member)
        .execute(connection)
        .expect("Error saving new post");
}