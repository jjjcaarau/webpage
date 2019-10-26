mod cli;
mod bills;

use std::io::{BufRead, Write};
use bufstream::BufStream;
use std::os::unix::net::{UnixStream,UnixListener};
use std::thread::{
    self,
    JoinHandle,
};
use structopt::StructOpt;

use crate::config::CONFIG;

fn handle_client(stream: UnixStream) {
    let mut stream = BufStream::new(stream);
    loop {
        let mut s = String::new();
        s += "cli ";
        stream.read_line(&mut s);
        s.trim();
        let opt = cli::Opt::from_iter(s.trim().split(" "));
        
        match opt {
            cli::Opt::Invoice(invoice) => match invoice {
                cli::Invoice::Generate {
                    typ,
                } => match &typ[..] {
                    "all" => bills::generate_all(),
                    "first" => bills::generate_first(),
                    "late" => bills::generate_late_notice(),
                    t => println!("Action type \"{}\" does not exist.", t),
                },
                cli::Invoice::Send {
                    typ,
                } => match &typ[..] {
                    "all" => bills::send_all(),
                    "first" => bills::send_first(),
                    "late" => bills::send_late_notice(),
                    t => println!("Action type \"{}\" does not exist.", t),
                },
            }
        }

        stream.flush();
    }
}

pub fn init() -> JoinHandle<()> {
    thread::spawn(|| {
        let listener = UnixListener::bind(&CONFIG.api.socket_path).unwrap();

        for stream in listener.incoming() {
            match stream {
                Ok(stream) => {
                    thread::spawn(|| handle_client(stream));
                }
                Err(err) => {
                    println!("Error: {}", err);
                    break;
                }
            }
        }
    })
}