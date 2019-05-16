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
    Kyu1,
    Kyu2,
    Kyu3,
    Kyu4,
    Kyu5,
    Dan1,
    Dan2,
    Dan3,
    Dan4,
    Dan5,
    Dan6,
    Dan7,
    Dan8,
    Dan9,
    Dan10,
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