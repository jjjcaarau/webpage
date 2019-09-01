#[derive(Derivative, Serialize, Deserialize, PartialEq, Debug, Clone)]
#[derivative(Default(bound=""))]
pub enum EventType {
    #[derivative(Default)]
    Trainer,
    CoTrainer,
    Club,
    Board,
    Honorary,
    Js,
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

#[derive(Derivative, Serialize, Deserialize, PartialEq, Debug, Clone)]
#[derivative(Default(bound=""))]
pub enum EventClass {
    #[derivative(Default)]
    Promotion,
    Demotion,
}

#[derive(Derivative, Serialize, Deserialize, PartialEq, Debug, Copy, Clone)]
#[derivative(Default(bound=""))]
pub enum EventDivision {
    #[derivative(Default)]
    Club,
    Judo,
    Jujitsu,
}

#[derive(Default, Serialize, Deserialize)]
pub struct Event {
    pub id: i32,
    pub member_id: i32,
    pub event_type: EventType,
    pub class: EventClass,
    pub division: EventDivision,
    pub comment: Option<String>,
    pub date: String,
}