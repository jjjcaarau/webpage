use chrono::offset::Utc;
use chrono::DateTime;
use std::fs;
use std::io::{BufRead, BufReader, Read};

#[derive(Deserialize, Serialize)]
pub struct Entry {
    pub name: String,
    pub title: String,
    pub created: String,
    pub modified: String,
    pub body: String,
}

impl Entry {
    pub fn new_from_path(path: impl Into<String>) -> Self {
        let path = path.into();
        let file = match fs::File::open(path.clone()) {
            Ok(file) => file,
            Err(_) => panic!("Unable to read title from {:?}", path),
        };

        let name = path.split('/').last().unwrap().split('.').next().unwrap();

        let created: Vec<&str> = name.split('-').collect();
        let modified: DateTime<Utc> = file.metadata().unwrap().modified().unwrap().into();

        let mut buffer = BufReader::new(file);
        let mut title = String::new();
        let _ = buffer.read_line(&mut title);
        let mut body = String::new();
        let _ = buffer.read_to_string(&mut body);

        Self {
            name: name.to_string(),
            title,
            created: format!(
                "{}/{}/{} {}:{}",
                created[0], created[1], created[2], created[3], created[4]
            ),
            modified: modified.format("%d/%m/%Y %hh:%mm").to_string(),
            body,
        }
    }

    pub fn new() -> Self {
        let now = Utc::now();

        Self {
            name: now.format("%d-%m-%Y-%hh-%mm").to_string(),
            title: "Title".to_string(),
            created: String::new(),
            modified: String::new(),
            body: "Content".to_string(),
        }
    }
}
