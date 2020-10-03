extern crate lettre;
extern crate lettre_email;
extern crate native_tls;

use crate::config::CONFIG;

// use lettre::{ClientSecurity, ClientTlsParameters, SmtpClient, Transport};

// use lettre::smtp::authentication::{Credentials, Mechanism};
// use lettre::smtp::ConnectionReuseParameters;
use lettre::{
    header::Charset, header::ContentDisposition, header::ContentTransferEncoding,
    header::ContentType, header::DispositionParam, header::DispositionType, message::MultiPart,
    message::SinglePart, transport::smtp::authentication::Credentials,
    transport::smtp::authentication::Mechanism, transport::smtp::client::Tls,
    transport::smtp::client::TlsParameters, Address, Mailbox, Message, SmtpTransport, Transport,
};

#[derive(Debug)]
pub enum EmailError {
    Email(lettre::error::Error),
    Smtp(lettre::transport::smtp::Error),
}

impl From<lettre::error::Error> for EmailError {
    fn from(value: lettre::error::Error) -> Self {
        EmailError::Email(value)
    }
}

impl From<lettre::transport::smtp::Error> for EmailError {
    fn from(value: lettre::transport::smtp::Error) -> Self {
        EmailError::Smtp(value)
    }
}

pub fn send(
    from: String,
    to: String,
    subject: String,
    content_text: String,
    attachment: Option<(&[u8], &str)>,
) -> Result<(), EmailError> {
    let mut body = MultiPart::mixed().singlepart(
        SinglePart::builder()
            .header(ContentType::text_utf8())
            .body(content_text),
    );
    if let Some((attachment, filename)) = attachment {
        body = body.singlepart(
            SinglePart::builder()
                .header(ContentDisposition {
                    disposition: DispositionType::Attachment,
                    parameters: vec![DispositionParam::Filename(
                        Charset::Iso_8859_1,          // The character set for the bytes of the filename
                        None, // The optional language tag (see `language-tag` crate)
                        filename.as_bytes().to_vec(), // the actual bytes of the filename
                    )],
                })
                .header(ContentType(mime::APPLICATION_PDF))
                .header(ContentTransferEncoding::Base64)
                .body(attachment),
        );
    }

    let email = Message::builder()
        .to(Mailbox::new(None, {
            let mut to = to.split('@');
            Address::new(to.next().unwrap(), to.next().unwrap()).unwrap()
        }))
        .from(Mailbox::new(None, {
            let mut from = from.split('@');
            Address::new(from.next().unwrap(), from.next().unwrap()).unwrap()
        }))
        .subject(subject)
        .multipart(body)?;

    let smtp_server = CONFIG.general.smtp_server.clone();
    let smtp_port = CONFIG.general.smtp_port;
    let smtp_username = CONFIG.general.smtp_username.clone();
    let smtp_password = CONFIG.general.smtp_password.clone();

    let tls_parameters = TlsParameters::new(smtp_server.clone())?;

    let mailer = SmtpTransport::relay(&*smtp_server)
        .unwrap()
        .port(smtp_port)
        .tls(Tls::Opportunistic(tls_parameters))
        .authentication(vec![Mechanism::Login])
        .credentials(Credentials::new(smtp_username, smtp_password))
        .build();

    mailer.send(&email).map_err(|e| {
        log::error!("Could not send email. Reason:\r\n\t{:?}", e);
        e
    })?;

    Ok(())
}
