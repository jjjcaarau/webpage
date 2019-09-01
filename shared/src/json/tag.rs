pub use super::{
    member::{
        MemberType,
    },
    event::{
        Event,
        EventDivision,
    },
};

#[derive(Serialize, Deserialize, Debug)]
pub enum Division {
    Judo,
    JuJitsu,
}

impl From<EventDivision> for Division {
    fn from(division: EventDivision) -> Self {
        match division {
            EventDivision::Judo => Division::Judo,
            EventDivision::Jujitsu => Division::JuJitsu,
            EventDivision::Club => panic!("This is a bug. Please report it.")
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Grade {
    Kyu(Division, u8),
    Dan(Division, u8),
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Tag {
    Trainer(Division),
    CoTrainer(Division),
    Honorary,
    Board,
    Kid,
    Student,
    Resigned,
    Extern,
    Active,
    Passive,
    Parent,
    Grade(Grade),
}

impl From<MemberType> for Tag {
    fn from(member_type: MemberType) -> Self {
        match member_type {
            MemberType::Active => Tag::Active,
            MemberType::Passive => Tag::Passive,
            MemberType::Parent => Tag::Parent,
            MemberType::Student => Tag::Student,
            MemberType::Kid => Tag::Kid,
            MemberType::Extern => Tag::Extern,
        }
    }
}