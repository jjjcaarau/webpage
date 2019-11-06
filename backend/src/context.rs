use crate::user::User;

#[derive(Serialize)]
pub struct Context<T: serde::Serialize> {
    user: Option<User>,
    #[serde(flatten)]
    data: T,
}

impl<T: serde::Serialize> Context<T> {
    pub fn new(user: Option<User>, data: T) -> Self {
        Self {
            user,
            data,
        }
    }
}