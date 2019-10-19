use rocket::outcome::IntoOutcome;
use rocket::request::{self, Form, FlashMessage, FromRequest, Request};
use rocket::response::{Redirect, Flash};
use rocket::http::{Cookie, Cookies};

use rocket_contrib::templates::Template;

use crate::config::CONFIG;

#[derive(FromForm)]
pub struct Login {
    username: String,
    password: String,
    submit: String,
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
    
    // Request recovery password.
    if login.submit == "recovery" {
        if let Ok(mut member) = crate::members::actions::get_by_email(&connection, &login.username) {
            let hash = uuid::Uuid::new_v4().to_string();

            crate::members::actions::update_recovery(&connection, &member.0, Some(hash.clone()));

            let content = format!("{}/password_recovery/{}", CONFIG.general.site_url.clone(), hash);

            println!("{}", content);
            
            crate::email::send(CONFIG.general.email.clone(), login.username.clone(), "Passwort zurücksetzen".into(), "".into(), content);
        }
        Err(Flash::success(Redirect::to(uri!(login_page)), "Email was sent to user if it exists."))
    } else {
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

#[get("/password_recovery/<hash>")]
pub fn password_recovery_get(flash: Option<FlashMessage<'_, '_>>, hash: String) -> Template {
    let mut context = std::collections::HashMap::new();
    if let Some(ref msg) = flash {
        context.insert("flash", msg.msg());
        if msg.name() == "error" {
            context.insert("flash_type", "Error");
        }
    }
    context.insert("hash", &hash);
    Template::render("password_recovery", &context)
}

#[derive(FromForm)]
pub struct Recovery {
    password: String,
    hash: String,
    submit: String,
}

#[post("/password_recovery", data = "<recovery>")]
pub fn password_recovery_post(recovery: Form<Recovery>) -> Flash<Redirect> {
    let connection = crate::db::establish_connection();
    if let Ok(mut member) = crate::members::actions::get_by_recovery(&connection, &recovery.hash) {
        crate::members::actions::update_recovery(&connection, &member, None).unwrap();
        crate::members::actions::update_password(&connection, &member, Some(recovery.password.clone())).unwrap();
        Flash::success(Redirect::to(uri!(login_page)), "Password recovery successful.")
    } else {
        Flash::error(Redirect::to(uri!(password_recovery_get: recovery.hash.clone())), "Password recovery failed.")
    }
}