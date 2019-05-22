use crate::schema::*;

#[derive(Derivative, DbEnum, AsExpression, Serialize, Deserialize, PartialEq, Debug)]
#[derivative(Default(bound=""))]
pub enum MemberType {
    #[derivative(Default)]
    Active,
    Passive,
    Parent,
    Honorary,
    Student,
    Kid,
}

#[derive(Queryable, Identifiable, AsChangeset, Associations, Serialize, Deserialize, PartialEq, Debug)]
#[belongs_to(Member, foreign_key = "family_id")]
pub struct Member {
    pub id: i32,
    pub family_id: Option<i32>,
    pub first_name: String,
    pub middle_name: String,
    pub last_name: String,
    pub sex: String,
    pub birthday: chrono::NaiveDate,
    pub email: String,
    pub phone_p: String,
    pub phone_w: String,
    pub mobile: String,
    pub postcode: String,
    pub city: String,
    pub address: String,
    pub address_no: String,
    pub comment: String,
    pub email_allowed: bool,
    pub passport_no: String,
    pub member_type: MemberType,
    pub honorary_member_reason: String,
    pub needs_mark_jujitsu: bool,
    pub needs_mark_judo: bool,
}

#[derive(Insertable, Derivative, Associations)]
#[derivative(Default)]
#[table_name="members"]
pub struct NewMember {
    pub family_id: Option<i32>,
    pub first_name: String,
    pub middle_name: String,
    pub last_name: String,
    pub sex: String,
    #[derivative(Default(value="chrono::NaiveDate::from_ymd(2019, 01, 12)"))]
    pub birthday: chrono::NaiveDate,
    pub email: String,
    pub phone_p: String,
    pub phone_w: String,
    pub mobile: String,
    pub postcode: String,
    pub city: String,
    pub address: String,
    pub address_no: String,
    pub comment: String,
    pub email_allowed: bool,
    pub passport_no: String,
    pub member_type: MemberType,
    pub honorary_member_reason: String,
    pub needs_mark_jujitsu: bool,
    pub needs_mark_judo: bool,
}

#[derive(Default, Serialize, Deserialize)]
pub struct JsonMember {
    pub id: i32,
    pub family_id: Option<i32>,
    pub first_name: String,
    pub middle_name: String,
    pub last_name: String,
    pub sex: String,
    pub birthday: String,
    pub email: String,
    pub phone_p: String,
    pub phone_w: String,
    pub mobile: String,
    pub postcode: String,
    pub city: String,
    pub address: String,
    pub address_no: String,
    pub comment: String,
    pub email_allowed: bool,
    pub passport_no: String,
    pub member_type: MemberType,
    pub honorary_member_reason: String,
    pub needs_mark_jujitsu: bool,
    pub needs_mark_judo: bool,
}

impl NewMember {
    pub fn new() -> Self {
        Self {
            ..Default::default()
        }
    }
}