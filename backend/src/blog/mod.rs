pub mod entry;

use self::entry::Entry;

use crate::config::CONFIG;

pub fn get_entries() -> Vec<Entry> {
    let blog_root = std::env::var("JJJCAARAU_WEB_BLOG_ROOT")
        .unwrap_or(CONFIG.general.blog_root.clone());
    let mut paths: Vec<_> = std::fs::read_dir(blog_root).unwrap()
        .map(|r| r.unwrap())
        .collect();
    paths.sort_by_key(|dir| dir.metadata().unwrap().created().unwrap());

    paths.iter().map(|path| Entry::new_from_path(path.path().into_os_string().into_string().unwrap())).collect()
}