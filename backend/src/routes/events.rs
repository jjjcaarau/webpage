use crate::events::model::{JsonEvent, NewEvent};
use chrono::NaiveDate;
use rocket_contrib::json::Json;

#[post("/create_json", format = "json", data = "<event>")]
pub fn create_json(event: Json<JsonEvent>) {
    let connection = crate::db::establish_connection();

    let event = event.0;
    let date = NaiveDate::parse_from_str(event.date.as_ref(), "%Y-%m-%d")
        .unwrap_or(NaiveDate::from_ymd(1970, 1, 1));
    let event = NewEvent {
        member_id: event.member_id,
        event_type: event.event_type,
        class: event.class,
        division: event.division,
        comment: event.comment,
        date: date,
    };
    crate::events::actions::create(&connection, event);
}
