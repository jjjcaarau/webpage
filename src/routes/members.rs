use rocket_contrib::templates::Template;
use rocket_contrib::json::Json;
use rocket::request::Form;
use chrono::NaiveDate;
use crate::members::model::{
    Member,
    NewMember,
    JsonMember,
};
use crate::events::model::{
    Event,
};

#[derive(Serialize)]
struct ListResult {
    members: Vec<(Member, Vec<Event>)>,
}

#[get("/list")]
pub fn list() -> Result<Template, diesel::result::Error> {
    let connection = crate::db::establish_connection();
    let members = crate::members::actions::list_all(&connection);
    members.map(|v| Template::render("pages/members/list", ListResult { members: v }))
}

#[get("/list_json")]
pub fn list_json() -> Json<Vec<(Member, Vec<Event>)>> {
    let connection = crate::db::establish_connection();
    Json(crate::members::actions::list_all(&connection).unwrap())
}

// #[post("/update", format = "json", data = "<member>")]
// pub fn update(member: Json<JsonMember>) {
//     let connection = crate::db::establish_connection();

//     let member = member.0;
//     let birthday = NaiveDate::parse_from_str(member.birthday.as_ref(), "%Y-%m-%d").unwrap_or(NaiveDate::from_ymd(1970, 1, 1));
//     let result = if member.id == 0 {
//         let member = NewMember {
//             first_name: member.first_name,
//             middle_name: member.middle_name,
//             last_name: member.last_name,
//             sex: member.sex,
//             birthday: birthday,
//             email_1: member.email_1,
//             email_2: member.email_2,
//             email_3: member.email_3,
//             phone_p: member.phone_p,
//             phone_g: member.phone_g,
//             mobile: member.mobile,
//             zip_code: member.zip_code,
//             city: member.city,
//             street: member.street,
//             street_nr: member.street_nr,
//             comment: member.comment,
//         };
//         crate::members::actions::create(&connection, member)
//     } else {
//         let member = Member {
//             id: member.id,
//             first_name: member.first_name,
//             middle_name: member.middle_name,
//             last_name: member.last_name,
//             sex: member.sex,
//             birthday: birthday,
//             email_1: member.email_1,
//             email_2: member.email_2,
//             email_3: member.email_3,
//             phone_p: member.phone_p,
//             phone_g: member.phone_g,
//             mobile: member.mobile,
//             zip_code: member.zip_code,
//             city: member.city,
//             street: member.street,
//             street_nr: member.street_nr,
//             comment: member.comment,
//         };
//         crate::members::actions::update(&connection, member)
//     };
// }