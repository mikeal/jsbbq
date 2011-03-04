var request = function (options, callback) {
  options.success = function (obj) {
    callback(null, obj);
  }
  options.error = function (err) {
    if (err) callback(err);
    else callback(true);
  }
  options.dataType = 'json';
  options.contentType = 'application/json'
  $.ajax(options)
}

var isaacsPicture = 'http://www.gravatar.com/avatar/73a2b24daecb976af81e010b7a3ce3c6?s=140';
var aaronPicture = 'http://www.gravatar.com/avatar/f04bfa14141dca6713f0d9caa763e26b?s=140';

var isaacsDescription = "Async Programming in node.js - Isaac Schlueter <br><br>";
isaacsDescription += 'Async isn\'t hard and you don\'t need promises. isaacs, author of <a href="http://npmjs.org/">npm</a>, will explain.'
var aaronsDescription = 'Holy crap! I am so frickin pumped about client side js right now - Aaron Quint<br><br>It\'s an amazing time to be a javascript developer. aq, author of <a href="http://code.quirkey.com/sammy/">sammy.js</a> will walk through the finer points of sammy, couchdb, and making 100% client side apps.'

var guillermoDescription = "Socket.io Smackdown - Guillermo Rauch<br><br>Guillermo, author of <a href=\"http://socket.io\">socket.io</a> and co-founder of <a href=\"https://www.learnboost.com/\">LearnBoost</a>, is going to give you a drop kick course in writing badass realtime apps with socket.io."
var guillermoPicture = 'http://www.gravatar.com/avatar/486e20e16ef676a02ac0299d2f92b813?s=140';

var paulDescription = 'Chrome Tools Deep Dive - Paul Irish<br><br>There is all kinds of badass you don\'t even know about hidden in Chrome\'s developer tools. Paul Irish (<a href="http://yayquery.com/">yayQuery</a>, <a href="http://w3fools.com/">w3fools</a>) is gonna make you 10x more productive debugging in just 30 minutes.'
var paulPicture = 'http://www.gravatar.com/avatar/ffe68d6f71b225f7661d33f2a8908281?s=140';

var meetup = {
    date: "Saturday February 12th"
  , location: "Mikeal's House, Oakland, CA"
  , locationLink: 'http://maps.google.com/maps?q=449+rich+st,+oakland,+ca&ie=UTF8&hq=&hnear=449+Rich+St,+Oakland,+Alameda,+California+94609&gl=us&z=16'
  , schedule: [
        ['4pm', 'require("meat"); require("beer");']
      , ['6pm', guillermoDescription, guillermoPicture]
      // , ['7:30pm', 'require("food")']
      , ['6:30pm', paulDescription, paulPicture]
      , ['7:15pm', 'require("pub");']
    ]
}

var getAttendeeHtml = function (doc) {
  var text = '<div class="attendee">'+
    '<div class="attendee-name">'+doc.name+'</div>'+
    '<div class="attendee-pic">'+
      '<img class="attendee-pic" src="'+'http://www.gravatar.com/avatar/'+
        hex_md5(doc.email)+'?s=50'+'"></img></div>'+
  '</div>'
  return text;
}

var app = {};

app.index = function () {
  $("div#main-container").prepend('<div class="event-title">'+meetup.date+' @ '+'<a href="'+meetup.locationLink+'">'+meetup.location+'</a></div>')
  var text = '';
  for (var i=0;i<meetup.schedule.length;i++) {
    if (meetup.schedule[i].length === 2) {
      text += '<div class="event-item">'
      text +=   '<div class="event-time">'+meetup.schedule[i][0]+'</div>'
      text +=   '<div class="event-break-title"><span class="code">'+meetup.schedule[i][1]+'</span></div>'
      text += '</div>'
    } else {
      text += '<div class="event-item">'
      text +=   '<div class="event-time">'+meetup.schedule[i][0]+'</div>'
      text +=   '<div class="event-talk-title">'+meetup.schedule[i][1]+'</div>'
      text +=   '<div class="event-talk-pic"><img class="speaker" src="'+meetup.schedule[i][2]+'" /></div>'
      text += '</div>'
    }
    text += '<div class="spacer">'
  }
  $('div#upcoming-event').append($(text))
  
  $('span#rsvp-button').click(function () {
    var data = {  email: $("input[name=email]").val()
                , name: $("input[name=name]").val()
                , type: 'rsvp'
                , eventDate: meetup.date
                }
    request({type:'POST', url:'/api', data: JSON.stringify(data)}, function (err, obj) {
      if (obj.id) {
        $("div#rsvp").remove();
        $("div#attendees").append($(getAttendeeHtml(data)));
      }
    })
  })
  .hover(
      function () {$(this).css("background-color", "#BABABA")}, 
      function () {$(this).css("background-color", "#AAAAAA")}
  )
  ;
  
  request({url:'/_view/rsvp?'+$.param({key: JSON.stringify(meetup.date), include_docs:'true'})}, function (err, resp) {
    resp.rows.forEach( function (row) {
      $("div#attendees").append($(
        getAttendeeHtml(row.doc)
      ));
    })
    $("div#attendees").append($('<div class="spacer">&nbsp</div>'))
  })
}

var a = $.sammy(function () {
  // Index of all databases
  this.get('', app.index);
  this.get("#/", app.index);
  
})

$(function () {a.use('Mustache'); a.run(); });
