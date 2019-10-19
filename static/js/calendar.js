document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('dojo-events');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: [ 'dayGrid', 'list', 'googleCalendar' ],
        header: {
            left: '',
            center: '',
            right: ''
        },
        defaultView: 'listYear',

        locale: 'de',

        displayEventTime: true,

        // THIS KEY WON'T WORK IN PRODUCTION!!!
        // To make your own Google API key, follow the directions here:
        // http://fullcalendar.io/docs/google_calendar/
        googleCalendarApiKey: 'AIzaSyDcnW6WejpTOCffshGDDb4neIrXVUA1EAE',
        // http://www.google.com/calendar/embed?showTitle=0&showPrint=0&showTz=0&mode=WEEK&height=1150&wkst=2&hl=de&bgcolor=%23ffffff&src=jjjc.aarau%40gmail.com&color=%23AB8B00&src=eadllljae75tt86ddm6kvj3htk%40group.calendar.google.com&color=%232952A3&src=g3hev6racu6ngnejarktaeo7os%40group.calendar.google.com&color=%23A32929&ctz=Europe%2FZurich

        eventSources: [{
            googleCalendarId: 'utsa4grrafus1nh5o20v03pjsk@group.calendar.google.com',
        }, {
            googleCalendarId: 'bodkodg85clmttg0phvte9ppkc@group.calendar.google.com',
        }],

        eventClick: function(arg) {}
    });

    calendar.render();
});

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('dojo-calendar');
  
    var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: [ 'timeGrid', 'dayGrid', 'list', 'googleCalendar' ],
        header: {
            left: '',
            center: '',
            right: ''
        },
        defaultView: 'timeGridWeek',

        height: 'auto',

        minTime: '08:00:00',
        slotDuration: '01:00:00',
        allDaySlot: false,

        locale: 'de',
        firstDay: 1,
    
        displayEventTime: true, // don't show the time column in list view
    
        // THIS KEY WON'T WORK IN PRODUCTION!!!
        // To make your own Google API key, follow the directions here:
        // http://fullcalendar.io/docs/google_calendar/
        googleCalendarApiKey: 'AIzaSyDcnW6WejpTOCffshGDDb4neIrXVUA1EAE',
        // http://www.google.com/calendar/embed?showTitle=0&showPrint=0&showTz=0&mode=WEEK&height=1150&wkst=2&hl=de&bgcolor=%23ffffff&src=jjjc.aarau%40gmail.com&color=%23AB8B00&src=eadllljae75tt86ddm6kvj3htk%40group.calendar.google.com&color=%232952A3&src=g3hev6racu6ngnejarktaeo7os%40group.calendar.google.com&color=%23A32929&ctz=Europe%2FZurich
    
        eventSources: [{
            googleCalendarId: 'jjjc.aarau@gmail.com',
        }, {
            googleCalendarId: 'eadllljae75tt86ddm6kvj3htk@group.calendar.google.com',
        }, {
            googleCalendarId: 'g3hev6racu6ngnejarktaeo7os@group.calendar.google.com',
        }],

        eventClick: function(arg) {}
    });
  
    calendar.render();
});
