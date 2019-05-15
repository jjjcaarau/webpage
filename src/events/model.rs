use crate::schema::*;
use crate::members::model::Member;

#[derive(Derivative, DbEnum, AsExpression, Serialize, Deserialize, PartialEq, Debug)]
#[derivative(Default(bound=""))]
pub enum EventType {
    #[derivative(Default)]
    Trainer,
    CoTrainer,
    Club,
    Board,
    Honorary,
}

#[derive(Derivative, DbEnum, AsExpression, Serialize, Deserialize, PartialEq, Debug)]
#[derivative(Default(bound=""))]
pub enum EventClass {
    #[derivative(Default)]
    Promotion,
    Demotion,
}

#[derive(Derivative, DbEnum, AsExpression, Serialize, Deserialize, PartialEq, Debug)]
#[derivative(Default(bound=""))]
pub enum EventDivision {
    #[derivative(Default)]
    Club,
    Judo,
    Jujitsu,
}

#[derive(Queryable, Identifiable, AsChangeset, Associations, Serialize, Deserialize, PartialEq, Debug)]
#[belongs_to(Member, foreign_key = "member_id")]
#[table_name="events"]
pub struct Event {
    id: i32,
    member_id: i32,
    event_type: EventType,
    class: EventClass,
    division: EventDivision,
    comment: Option<String>,
    date: chrono::NaiveDate,
}