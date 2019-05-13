use crate::schema::*;

#[derive(Queryable, Identifiable, AsChangeset, Serialize, Deserialize, Debug)]
pub struct Member {
    pub id: i32,
    pub first_name: String,
    pub middle_name: String,
    pub last_name: String,
    pub sex: String,
    pub birthday: chrono::NaiveDate,
    pub email_1: String,
    pub email_2: String,
    pub email_3: String,
    pub phone_p: String,
    pub phone_g: String,
    pub mobile: String,
    pub zip_code: String,
    pub city: String,
    pub street: String,
    pub street_nr: String,
    pub comment: String,
}

#[derive(Insertable, Derivative)]
#[derivative(Default)]
#[table_name="members"]
pub struct NewMember {
    pub first_name: String,
    pub middle_name: String,
    pub last_name: String,
    pub sex: String,
    #[derivative(Default(value="chrono::NaiveDate::from_ymd(2019, 01, 12)"))]
    pub birthday: chrono::NaiveDate,
    pub email_1: String,
    pub email_2: String,
    pub email_3: String,
    pub phone_p: String,
    pub phone_g: String,
    pub mobile: String,
    pub zip_code: String,
    pub city: String,
    pub street: String,
    pub street_nr: String,
    pub comment: String,
}

#[derive(FromForm, Default)]
pub struct UpdateMember {
    pub id: i32,
    pub first_name: String,
    pub middle_name: String,
    pub last_name: String,
    pub sex: String,
    pub birthday: String,
    pub email_1: String,
    pub email_2: String,
    pub email_3: String,
    pub phone_p: String,
    pub phone_g: String,
    pub mobile: String,
    pub zip_code: String,
    pub city: String,
    pub street: String,
    pub street_nr: String,
    pub comment: String,
}

impl NewMember {
    pub fn new() -> Self {
        Self {
            ..Default::default()
        }
    }
}