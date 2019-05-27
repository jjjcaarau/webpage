use rocket_contrib::templates::Template;
use rocket_contrib::json::Json;
use chrono::NaiveDate;
use crate::members::model::{
    Member,
    NewMember,
    JsonMember,
};
use crate::events::model::{
    Event,
};
use crate::members::actions::{
    Error,
    get_stats,
};

#[derive(Serialize)]
struct ListResult {
    members: Vec<(Member, Vec<Event>, Vec<Member>)>,
}

#[derive(Serialize)]
pub struct ViewResult {
    member: (Member, Vec<Event>, Vec<Member>),
}

#[get("/list")]
pub fn list() -> Result<Template, diesel::result::Error> {
    let connection = crate::db::establish_connection();
    let members = crate::members::actions::list_all(&connection);
    members.map(|v| Template::render("pages/members/list", ListResult { members: v }))
}

#[get("/view/<id>")]
pub fn view(id: i32) -> Template {
    Template::render("pages/members/view", std::collections::HashMap::<i32,i32>::new())
}

#[get("/stats")]
pub fn stats() -> Template {
    let connection = crate::db::establish_connection();
    Template::render("pages/members/stats", get_stats(&connection))
}

#[get("/list_json")]
pub fn list_json() -> Json<Vec<(Member, Vec<Event>, Vec<Member>)>> {
    let connection = crate::db::establish_connection();
    Json(crate::members::actions::list_all(&connection).unwrap())
}

#[get("/view_json/<id>")]
pub fn view_json(id: i32) -> Json<ViewResult> {
    let connection = crate::db::establish_connection();
    let member = crate::members::actions::get(&connection, id);
    match member {
        Ok(member) => Json(ViewResult { member }),
        Err(Error::Diesel(_)) => panic!("Internal Server Error"),
        Err(Error::NotFound) => panic!("Not Found"),
    }
}

#[derive(Serialize)]
pub struct UpdateResponse {
    id: i32,
}

#[post("/update_json", format = "json", data = "<member>")]
pub fn update_json(member: Json<JsonMember>) -> Json<UpdateResponse> {
    let connection = crate::db::establish_connection();

    let member = member.0;
    let birthday = NaiveDate::parse_from_str(member.birthday.as_ref(), "%Y-%m-%d").unwrap_or(NaiveDate::from_ymd(1970, 1, 1));
    let result = if member.id == 0 {
        let member = NewMember {
            family_id: None,
            first_name: member.first_name,
            middle_name: member.middle_name.unwrap_or("".to_string()),
            last_name: member.last_name,
            sex: member.sex,
            birthday: birthday,
            email: member.email.unwrap_or("".to_string()),
            phone_p: member.phone_p.unwrap_or("".to_string()),
            phone_w: member.phone_w.unwrap_or("".to_string()),
            mobile: member.mobile.unwrap_or("".to_string()),
            postcode: member.postcode,
            city: member.city,
            address: member.address,
            address_no: member.address_no,
            comment: member.comment.unwrap_or("".to_string()),
            email_allowed: member.email_allowed,
            passport_no: member.passport_no.unwrap_or("".to_string()),
            member_type: member.member_type,
            needs_mark: member.needs_mark,
        };
        crate::members::actions::create(&connection, &member).map(|m| m.id)
    } else {
        let member = Member {
            id: member.id,
            family_id: member.family_id,
            first_name: member.first_name,
            middle_name: member.middle_name.unwrap_or("".to_string()),
            last_name: member.last_name,
            sex: member.sex,
            birthday: birthday,
            email: member.email.unwrap_or("".to_string()),
            phone_p: member.phone_p.unwrap_or("".to_string()),
            phone_w: member.phone_w.unwrap_or("".to_string()),
            mobile: member.mobile.unwrap_or("".to_string()),
            postcode: member.postcode,
            city: member.city,
            address: member.address,
            address_no: member.address_no,
            comment: member.comment.unwrap_or("".to_string()),
            email_allowed: member.email_allowed,
            passport_no: member.passport_no.unwrap_or("".to_string()),
            member_type: member.member_type,
            needs_mark: member.needs_mark,
        };
        crate::members::actions::update(&connection, &member).map(|_| member.id)
    };

    let id = result.expect("This is a bug. Please report it.");

    Json(UpdateResponse { id })
}

#[derive(Serialize, Deserialize)]
pub struct MemberFamilyUpdate {
    member_id: i32,
    family_id: Option<i32>,
}

#[post("/update_family_json", format = "json", data = "<update>")]
pub fn update_family_json(update: Json<MemberFamilyUpdate>) {
    let connection = crate::db::establish_connection();
    crate::members::actions::update_family(&connection, update.member_id, update.family_id).unwrap();
}