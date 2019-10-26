use crate::schema::*;
use crate::members::model::Member;

#[derive(Queryable, Identifiable, AsChangeset, Associations, Serialize, Deserialize, PartialEq, Debug, Clone)]
#[belongs_to(Member, foreign_key = "member_id")]
pub struct Bill {
    pub id: i32,
    pub member_id: i32,
    pub year: i32,
    pub date: chrono::NaiveDate,
    pub due_date: chrono::NaiveDate,
    pub number: i32,
    pub bill_passport: i32,
    pub bill_amount: i32,
    pub paid_amount: i32,
    pub paid: bool,
    pub comment: String,
}

#[derive(Insertable, Derivative, Associations)]
#[derivative(Default)]
#[table_name="bills"]
pub struct NewBill {
    pub member_id: i32,
    pub year: i32,
    #[derivative(Default(value="chrono::NaiveDate::from_ymd(2019, 01, 12)"))]
    pub date: chrono::NaiveDate,
    #[derivative(Default(value="chrono::NaiveDate::from_ymd(2019, 01, 12)"))]
    pub due_date: chrono::NaiveDate,
    pub number: i32,
    pub bill_passport: i32,
    pub bill_amount: i32,
    pub paid_amount: i32,
    pub paid: bool,
    pub comment: String,
}

impl NewBill {
    pub fn new() -> Self {
        Self {
            ..Default::default()
        }
    }
}