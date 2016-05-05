$(function () {
    console.log('ready!');

    $('.main').fadeIn('slow');

    $('#search').click(function () {
        search();
    });

    $('select').selectpicker({
        style: 'btn btn-block btn-lg btn-primary',
        menuStyle: 'dropdown-inverse'
    });

    /*
    etä typeahead!
    typeahead: {
    source: function(query) {
      return $.get('http://someservice.com');
    }
  }
    */

    $('.tagsinput').tagsInput({
        autocomplete: {
            name: 'skills',
            limit: 5,
            local: ["Javascript", "Java", "Python", "PHP", "HTML5", "CSS3", "Scala", "C#", "C++", "MySQL", "MongoDB", "Node.js", "Django", "jQuery", "PostgreSQL", "Käyttöliittymäsuunnittelu", "UI", "GUI", "UX", "Graafinen suunnittelu", "Kuvittaminen"]
        }
    });


    function search() {
        var staff = false;
        var alumni = false;
        var userType = $('#user').val();
        var skills = $('#tagsinput').val().split(',');
        
        console.log(skills);
        
        if (userType == 1){alumni = true;}
        if (userType == 2){staff = true;}
                
        $.ajax({
            type: 'POST', url: 'http://nodejs-loither.rhcloud.com/search',
            data: JSON.stringify({"staff": staff,"alumni": alumni,"skills": skills}),
            success: function (data) {$('#json').html(JSON.stringify(data));},
            contentType: "application/json", dataType: 'json'
        });
    }
});