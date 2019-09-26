
$(document).ready( function () {
  $.getJSON("https://infodocks.de/api/dkg2019/beitraege", data => {
     var showData = data.map( item => {
       item.speakers = item.Moderator1;
       item.speakers = item.Moderator2 ? item.speakers + "<br>" + item.Moderator2 : item.speakers
       return(item)
     });
     var table = $('#program').DataTable({
        "data" : showData,
        "columns" : [
          { "data": "speakers" },
          {
            "className":      'details-control',
            "orderable":      false,
            "data":           null,
            "defaultContent": '<i class="fas fa-plus-circle text-success">'
          },
          { "data": "titel" },
          {
            "className":  'fav',
            "orderable":  false,
            "data":       "id",
            "render": function(data, type, row){
              var saved = Cookies.getJSON();
              var faved = saved.faved ? saved.faved : new Array;
              var favedClass = faved.includes(data) ? "fas" : "far"; 
              return '<i prog_id='+data+' class="fa-star text-warning '+favedClass+'">';
            }
          }
       ],
     });
     $('#program tbody').on('click', 'td.fav', function() {
       var tr = $(this).closest('tr');
        var row = table.row( tr );
        var saved = Cookies.getJSON();
        if ( saved.faved && saved.faved.includes(row.data().id)) {
          $(this).children("i").removeClass('fas');
          $(this).children("i").addClass('far');
          Cookies.set('faved', saved.faved.filter( i => i != row.data().id ));
        } else {
          var faved;
          if (saved.faved) {
            faved = saved.faved;
          } else {
            faved = new Array();
          }
          $(this).children("i").addClass('fas');
          $(this).children("i").removeClass('far');
          faved.push(row.data().id);
          Cookies.set('faved', faved);
        }
        updateSchedule(data);
      });
      $('#program tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        if ( row.child.isShown() ) {
          row.child.hide();
          tr.removeClass('shown');
          $(this).children("i").removeClass('fa-minus-circle');
          $(this).children("i").addClass('fa-plus-circle');
        }
        else {
          row.child( format(row.data()) ).show();
          tr.addClass('shown');
          $(this).children("i").removeClass('fa-plus-circle');
          $(this).children("i").addClass('fa-minus-circle');
        }
      });
      updateSchedule(data);
    });
    $('#tablist a').on('click', function (e) {
      e.preventDefault()
      $(this).tab('show')
    });
});
function updateSchedule(data) {
  $("#schedule").text("");
  var days = Array.from(new Set(data.map(i => i.datum)));
  days = [3,0,2,1].map(i => days[i]);
  days.forEach( d => {
    $("#schedule").append("<h3 class='mt-3 mb-3'>"+d+"<h3>");
    if(Cookies.getJSON().faved){
      var sessions = data.filter( s => s.datum === d && Cookies.getJSON().faved.includes(s.id)).sort( (a,b) => (a.uhrzeit > b.uhrzeit) ? 1 : ((b.uhrzeit > a.uhrzeit) ? -1 : 0));
      sessions.forEach( s => {
        $("#schedule").append("<div class='card mb-3'>"+
                              "<div class='card-header'>"+s.uhrzeit+ " | " +s.raumkuerzel+" <span class='float-right'><i sid='"+s.id+"' class='remove-fav fas fa-star fav text-warning'></i></span></div>"+
                              "<div class='card-body'>"+
                              "<div><i>"+s.speakers+"</i></div>"+
                              "<div class='mt-2'>"+s.titel+"</div>"+
                              "</div></div>");
      });
    }
  });
  $('#schedule i.remove-fav').on('click', function () {
      console.log("triggered");
      console.log($(this).attr("sid"));
      Cookies.set('faved', Cookies.getJSON().faved.filter( i => i != $(this).attr("sid")));
      updateSchedule(data);
      $("[prog_id='"+$(this).attr("sid")+"']").removeClass("fas").addClass("far");
  });
}
function format ( d ) {
    return "<table class='table'><tr><th>Abstract:</th><td>" +d.abstract+"</td></tr>"+
      "<tr><th>Time:</th><td>" +d.datum+ ", "+d.uhrzeit+"</td></tr>"+
      "<tr><th>Place:</th><td>" +d.raumkuerzel+ "<td></tr>"+
      "</table>";
}
