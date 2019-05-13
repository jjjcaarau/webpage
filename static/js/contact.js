$(function () {
    $('#contact-form').submit(function (event) {
        event.preventDefault();

        grecaptcha.execute();
    });
});

function afterCaptchaValidation() {
    let $contactForm = $('#contact-form');
    $.ajax({
        type: 'POST',
        url: $contactForm.attr('action'),
        data: $contactForm.serialize(),
        success: function (data) {
        if ((typeof data) === 'object' && data.success === true) {
                $contactForm.find('button').text('Success').addClass('btn-success').removeClass('btn-danger');
        }
        else {
                $contactForm.find('button').text('Error').addClass('btn-danger').removeClass('btn-success').attr('title', 'Server Error. Your message could not be sent');
        }
        },
        error: function (data) {
            $contactForm.find('button').text('Error').addClass('btn-danger').removeClass('btn-success').attr('title', 'Error. Your message could not be sent');
        }
    });
}