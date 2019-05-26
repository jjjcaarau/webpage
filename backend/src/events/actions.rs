use super::model::{
    NewEvent,
};
use crate::schema::{
    events,
};
use diesel::prelude::*;

pub fn create(connection: &SqliteConnection, new_event: NewEvent) {
    let _ = diesel::insert_into(events::table)
        .values(&new_event)
        .execute(connection)
        .expect("Error saving new member.");
}