#[derive(Debug)]
pub enum Error {
    Diesel(diesel::result::Error),
    NotFound,
}

impl From<diesel::result::Error> for Error {
    fn from(error: diesel::result::Error) -> Self {
        Error::Diesel(error)
    }
}