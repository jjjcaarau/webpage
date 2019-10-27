use crate::members::model::Member;
use crate::schema::*;

#[derive(
    Derivative, DbEnum, AsExpression, Serialize, Deserialize, PartialEq, Debug, Copy, Clone,
)]
#[derivative(Default(bound = ""))]
pub enum SentAs {
    #[derivative(Default)]
    SnailMail,
    Email,
}

#[derive(
    Queryable,
    Identifiable,
    AsChangeset,
    Associations,
    Serialize,
    Deserialize,
    PartialEq,
    Debug,
    Clone,
)]
#[belongs_to(Member, foreign_key = "member_id")]
pub struct Invoice {
    pub id: i32,
    pub member_id: i32,
    pub year: i32,
    pub date: chrono::NaiveDate,
    pub due_date: chrono::NaiveDate,
    pub sent: Option<chrono::NaiveDate>,
    pub sent_as: SentAs,
    pub number: i32,
    pub invoice_passport: i32,
    pub invoice_amount: i32,
    pub paid_amount: i32,
    pub paid: bool,
    pub comment: String,
}

#[derive(Insertable, Derivative, Associations)]
#[derivative(Default)]
#[table_name = "invoices"]
pub struct NewInvoice {
    pub member_id: i32,
    pub year: i32,
    #[derivative(Default(value = "chrono::NaiveDate::from_ymd(2019, 01, 12)"))]
    pub date: chrono::NaiveDate,
    #[derivative(Default(value = "chrono::NaiveDate::from_ymd(2019, 01, 12)"))]
    pub due_date: chrono::NaiveDate,
    pub sent: Option<chrono::NaiveDate>,
    pub sent_as: SentAs,
    pub number: i32,
    pub invoice_passport: i32,
    pub invoice_amount: i32,
    pub paid_amount: i32,
    pub paid: bool,
    pub comment: String,
}

impl NewInvoice {
    pub fn new() -> Self {
        Self {
            ..Default::default()
        }
    }
}
