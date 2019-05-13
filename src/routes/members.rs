use rocket_contrib::templates::Template;
use rocket_contrib::json::Json;
use rocket::request::Form;

#[derive(Serialize)]
struct ListResult {
    members: std::vec::Vec<crate::members::model::Member>,
}

#[get("/list")]
pub fn list() -> Result<Template, diesel::result::Error> {
    let connection = crate::db::establish_connection();
    let members = crate::members::actions::list_all(&connection);
    members.map(|v| Template::render("pages/members/list", ListResult { members: v }))
}

#[get("/list_json")]
pub fn list_json() -> Json<Vec<crate::members::model::Member>> {
    let connection = crate::db::establish_connection();
    Json(crate::members::actions::list_all(&connection).unwrap())
}

// #[post("/update", data = "<member>")]
// pub fn update(member: Form<crate::members::model::NewMember>) {
//     let connection = crate::db::establish_connection();
//     crate::members::actions::create(&connection, member.0)
// }