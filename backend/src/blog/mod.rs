pub mod entry;

use self::entry::Entry;

use crate::config::CONFIG;

pub fn get_entries() -> Vec<Entry> {
    let mut paths: Vec<_> = std::fs::read_dir(CONFIG.general.blog_root.clone()).unwrap()
        .map(|r| r.unwrap())
        .collect();
    paths.sort_by_key(|dir| dir.metadata().unwrap().created().unwrap());

    paths.iter().map(|path| Entry::new_from_path(path.path().into_os_string().into_string().unwrap())).collect()
}