$(function () {
    updateSkillsArray();
    setUpElements();

    function search() {
        var staff = false;
        var alumni = false;
        var userType = $('#user').val();
        var skills = $('#tagsinput').val().split(',');
        if (userType == 1) {alumni = true;}
        if (userType == 2) {staff = true;}
        $.ajax({
            type: 'POST',
            url: 'http://nodejs-loither.rhcloud.com/search',
            data: JSON.stringify({
                "staff": staff,
                "alumni": alumni,
                "skills": skills
            }),
            success: function (data) {
                $('#json').html(JSON.stringify(data));
            },
            contentType: "application/json",
            dataType: 'json'
        });
    }
    
    function setUpElements() {
        $('.main').fadeIn('slow');
        $('#search').click(function () {search();});
        $('select').selectpicker({
            style: 'btn btn-block btn-lg btn-primary',
            menuStyle: 'dropdown-inverse'
        });
    }

    function updateSkillsArray() {
        $.get('http://nodejs-loither.rhcloud.com/skills', function (items) {
            var skills = [];
            items.forEach(function (items) {
                skills.push(items.skills);
            });
            setUpTagsInput(skills);
        });
    }
    
    function setUpTagsInput(skills){
        $('.tagsinput').tagsInput({
                autocomplete: {
                    name: 'skills',
                    limit: 5,
                    local: skills
                }
            });
    }
});