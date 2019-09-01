#[derive(Derivative, Serialize, Deserialize, PartialEq, Debug, Copy, Clone)]
#[derivative(Default(bound=""))]
pub enum MemberType {
    #[derivative(Default)]
    Active,
    Passive,
    Parent,
    Student,
    Kid,
    Extern,
}

#[derive(Default, Serialize, Deserialize, PartialEq, Clone)]
pub struct Member {
    pub id: i32,
    pub family_id: Option<i32>,
    pub first_name: String,
    pub middle_name: Option<String>,
    pub last_name: String,
    pub sex: String,
    pub birthday: String,
    pub email: Option<String>,
    pub phone_p: Option<String>,
    pub phone_w: Option<String>,
    pub mobile: Option<String>,
    pub postcode: String,
    pub city: String,
    pub address: String,
    pub address_no: String,
    pub comment: Option<String>,
    pub email_allowed: bool,
    pub passport_no: Option<String>,
    pub member_type: MemberType,
    pub needs_mark: bool,
    pub section_jujitsu: bool,
    pub section_judo: bool,
}