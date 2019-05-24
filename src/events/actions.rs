use super::model::{
    Event,
    NewEvent,
};
use crate::schema::{
    members,
    events,
};
use diesel::prelude::*;
use diesel::SaveChangesDsl;

pub fn create(connection: &SqliteConnection, new_event: NewEvent) {
    let _ = diesel::insert_into(events::table)
        .values(&new_event)
        .execute(connection)
        .expect("Error saving new member.");
}