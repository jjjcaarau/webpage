use rocket::Request;
use rocket::request::{FromRequest, Outcome};

#[derive(Debug, Copy, Clone, Serialize)]
pub struct User {
    id: usize,
    pub can_edit_members: bool,
}

pub struct MaybeUser(Option<User>);

impl std::ops::Deref for MaybeUser {
    type Target = Option<User>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<'a, 'r> FromRequest<'a, 'r> for MaybeUser {
    type Error = std::convert::Infallible;

    fn from_request(request: &'a Request<'r>) -> Outcome<MaybeUser, Self::Error> {
        let value = request
            .cookies()
            .get_private("user_id")
            .and_then(|cookie| cookie.value().parse().ok());
        if let Some(id) = value {
            let connection = crate::db::establish_connection();
            if let Ok(member) = crate::members::actions::get(&connection, id) {
                return Outcome::Success(MaybeUser(Some(User {
                    id: id as usize,
                    can_edit_members: member.0.can_edit_members,
                })));
            }
        }
        return Outcome::Success(MaybeUser(None));
    }
}

impl<'a, 'r> FromRequest<'a, 'r> for User {
    type Error = std::convert::Infallible;

    fn from_request(request: &'a Request<'r>) -> Outcome<User, Self::Error> {
        let value = request
            .cookies()
            .get_private("user_id")
            .and_then(|cookie| cookie.value().parse().ok());
        if let Some(id) = value {
            let connection = crate::db::establish_connection();
            if let Ok(member) = crate::members::actions::get(&connection, id) {
                return Outcome::Success(User {
                    id: id as usize,
                    can_edit_members: member.0.can_edit_members,
                });
            }
        }
        return Outcome::Forward(());
    }
}