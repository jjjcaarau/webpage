use rocket::outcome::IntoOutcome;
use rocket::request::{self, Form, FlashMessage, FromRequest, Request};
use rocket::response::{Redirect, Flash};
use rocket::http::{Cookie, Cookies};

use rocket_contrib::templates::Template;

#[derive(FromForm)]
pub struct Login {
    username: String,
    password: String
}

#[derive(Debug)]
pub struct User {
    id: usize,
    pub can_edit_members: bool,
}

impl<'a, 'r> FromRequest<'a, 'r> for User {
    type Error = std::convert::Infallible;

    fn from_request(request: &'a Request<'r>) -> request::Outcome<User, Self::Error> {
        let value = request.cookies()
            .get_private("user_id")
            .and_then(|cookie| cookie.value().parse().ok());
        if let Some(id) = value {
            let connection = crate::db::establish_connection();
            if let Ok(member) = crate::members::actions::get(&connection, id) {
                return request::Outcome::Success(User {
                    id: id as usize,
                    can_edit_members: member.0.can_edit_members,
                })
            }
        }
        return request::Outcome::Forward(());
    }
}

#[post("/login", data = "<login>")]
pub fn login(mut cookies: Cookies<'_>, login: Form<Login>) -> Result<Redirect, Flash<Redirect>> {
    let connection = crate::db::establish_connection();
    if let Ok(member) = crate::members::actions::get_by_email(&connection, &login.username) {
        if let Some(password) = member.0.password {
            if pbkdf2::pbkdf2_check(&login.password, &password).is_ok() {
                cookies.add_private(Cookie::new("user_id", member.0.id.to_string()));
                return Ok(Redirect::to(uri!(crate::routes::root::index)));
            }
        }
    }
    Err(Flash::error(Redirect::to(uri!(login_page)), "Invalid username/password."))
}

#[get("/logout")]
pub fn logout(mut cookies: Cookies<'_>) -> Flash<Redirect> {
    cookies.remove_private(Cookie::named("user_id"));
    Flash::success(Redirect::to(uri!(login_page)), "Successfully logged out.")
}

#[get("/login")]
pub fn login_user(_user: User) -> Redirect {
    Redirect::to(uri!(crate::routes::root::index))
}

#[get("/login", rank = 2)]
pub fn login_page(flash: Option<FlashMessage<'_, '_>>) -> Template {
    let mut context = std::collections::HashMap::new();
    if let Some(ref msg) = flash {
        context.insert("flash", msg.msg());
        if msg.name() == "error" {
            context.insert("flash_type", "Error");
        }
    }

    Template::render("login", &context)
}

#[get("/", rank = 2)]
pub fn index_redirect() -> Redirect {
    Redirect::to(uri!(login_page))
}