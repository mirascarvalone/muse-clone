// Define three functions to cut down on code reuse. The first turns the API response into HTML with job attributes, and the second replaces the current job results with the most recent after a user searches or clicks to the next page, and the third prints an error message.

var items = []
function resultsToJobs(response){
  console.log(response)
  $.each(response.results,function(job,attr){
    if (attr.locations[0]){
      var location = attr.locations[0].name;
    }
    else {
      var location = 'undefined';
    }
    if (attr.company){
      var company = attr.company.name;
    }
    else {
      var company = 'undefined';
    }
    if (attr.levels[0]){
      var levels = attr.levels[0].name;
    }
    else {
      var levels = 'undefined';
    }
    if (attr.categories[0]){
      var categories = attr.categories[0].name;
    }
    else {
      var categories = 'undefined';
    }
    items.push(
      "<div class=\"job\"" +
        "<li id='" + attr.id + "'>" + "<a href=\"" + attr.refs.landing_page + "\" class=\"job-link\">" +  attr.name + "</a>" +
          "<ul>" +
            "<li>Company: " + company + "</li>" +
            "<li>Level: " + levels + "</li>" +
            "<li>Where: " + location + "</li>" +
            "<li>Category: " + categories + "</li>" +
          "</ul>" +
        "</li>" +
      "</div>");
  });
}

function addJobList(items){
  $('#job-list').replaceWith($("<div/>", {
    "id": "job-list",
    "ul": "jobs",
    html: items.join("")
  }))
}

var errorMessage = "<div class='job'>Sorry, there are no jobs listed right now. Please try again.</div>"

// JQuery pulls data from the API and handles events when a user searches or clicks next page.
$(document).ready(function() {
  var page = 0;
  $.ajax({
    url: "https://api-v2.themuse.com/jobs?page=" + page
  }).done(function(response){
    resultsToJobs(response);
    $("<div/>", {
      "id": "job-list",
      "ul": "jobs",
      html: items.join("")
    }).appendTo("#container");

    if (response.page_count > response.page + 1){
      $("<div id='next-page'>Next Page</div>").appendTo("#container");
    }

    $('#next-page').on('click',function(){
      items = [];
      page +=1;
      $.ajax({
        url: "https://api-v2.themuse.com/jobs?page=" + page
      }).done(function(response){
        resultsToJobs(response);
        addJobList(items);

        if (response.page_count == response.page+1){
          $("#next-page").toggle();
        }

      }).fail(function(response){
        $(errorMessage).appendTo("#container");
        console.log(response)
      });
    });

  }).fail(function(response){
    $(errorMessage);
    console.log(response)
  });

  $("#search").submit(function(event) {
    items = [];
    event.preventDefault();
    var company = $(event.target).find('input[name=company]').val();
    var companyParams = ""
    if (company){
      companyParams += "company=" + company.replace(/ /g, "+").replace(/,/,"%2C") + "&"
    }

    var location = $(event.target).find('input[name=location]').val()
    locationParams = ""
    if (location){
      locationParams += "location=" + location.replace(/ /g, "+").replace(/,/,"%2C") + "&"
    }

    var level = $("input[type='checkbox']:checked").val();
    var levelParams = ""
    if (level){
      $.each($("input[type='checkbox']:checked"), function(){
        levelParams += $(this).val().replace(/ /g, "+") + "&";
      });
      levelParams = "level=".concat(levelParams)
    }

    var urlWithParams = "https://api-v2.themuse.com/jobs?" + companyParams + levelParams + locationParams
    $.ajax({
      url: urlWithParams + "page=" + page
    }).done(function(response){
      $("#next-page").toggle();
      resultsToJobs(response);
      addJobList(items);

      if (response.page_count > response.page + 1){
        $("<div id='next-page-filtered'>Next Page</div>").appendTo("#container");
      }

      $('#next-page-filtered').on('click',function(){
        items = [];
        page +=1;
        $.ajax({
          url: urlWithParams + "page=" + page
        }).done(function(response){
          resultsToJobs(response);
          addJobList(items);

          if (response.page_count == response.page+1){
            $("#next-page-filtered").toggle();
          }

        }).fail(function(response){
          $(errorMessage).appendTo("#container");
          console.log(response)
        });
      })

    }).fail(function(response){
      console.log("error");
    });

  });

});