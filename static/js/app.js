$(function () {
    updateSkillsArray();
    setUpElements();
    var id;

    function setModalHeader(text) {
        $('#modal-title').html(text);
    }

    function getUserInfo(id_token) {
        $.ajax({
            type: 'POST',
            url: 'http://nodejs-loither.rhcloud.com/oauth',
            data: JSON.stringify({
                "oauth": id_token
            }),
            success: function (data) {
                if (data[0] != undefined) {
                    id = data[0]._id;
                    populateUserDataFields(data[0]);
                } else {
                    populateSignUpData();
                }

            },
            contentType: "application/json",
            dataType: 'json'
        });
    }

    function updateUserInfo(profile) {
        getUserInfo(profile.getId());
    }

    function populateUserDataFields(user) {
        $('#firstName').val(user.firstName);
        $('#lastName').val(user.lastName);
        $('#email').val(user.email);
        $('#major').val(user.major);
        if (user.yearCourse != null) {
            $('#yearCourse').selectpicker('val', user.yearCourse);
        }
        user.skills.forEach(function (skill) {
            $('#tagsinput2').addTag(skill);
        });
        if (user.alumni) {
            $('#alumni').checkbox('check');
        }
        if (user.staff) {
            $('#staff').checkbox('check');
        }
        if (user.availability.inno) {
            $('#inno').checkbox('check');
        }
        if (user.availability.thesis) {
            $('#thesis').checkbox('check');
        }
        if (user.availability.work) {
            $('#work').checkbox('check');
        }
    }

    function populateSignUpData() {
        setModalHeader('Luo käyttäjätiedot');
        $('#send').html('Tallenna');
        $('#firstName').val(profile.getGivenName());
        $('#lastName').val(profile.getFamilyName());
        $('#email').val(profile.getEmail());
    }

    function sendFormData() {
        //console.log(scrapeFormData());
        if (id != undefined) {
            $.ajax({
                type: 'PUT',
                url: 'http://nodejs-loither.rhcloud.com/users/' + id,
                data: scrapeFormData(),
                success: function (data) {
                    if (!data.error) {
                        showStatusMessage('Tiedot päivitetty onnistuneesti.', false);
                    } else {
                        showStatusMessage('Tietojen päivitys epäonnistui.', true);
                    }
                },
                contentType: "application/json",
                dataType: 'json'
            });
        } else {
            $.ajax({
                type: 'POST',
                url: 'http://nodejs-loither.rhcloud.com/users',
                data: scrapeFormData(),
                success: function (data) {
                    if (!data.error) {
                        showStatusMessage('Tiedot tallennettu onnistuneesti.', false);
                    } else {
                        showStatusMessage('Tietojen tallennus epäonnistui.', true);
                    }
                },
                contentType: "application/json",
                dataType: 'json'
            });
        }
    }

    function scrapeFormData() {
        var tmpUser = {};
        tmpUser.availability = {};
        var tmpSkills = $('#tagsinput2').val().split(',');
        var skills = [];

        tmpSkills.forEach(function (item) {
            skills.push(item.toLowerCase());
        });

        tmpUser.oauth = profile.getId();
        tmpUser.firstName = $('#firstName').val();
        tmpUser.lastName = $('#lastName').val();
        tmpUser.email = $('#email').val();
        tmpUser.major = $('#major').val();
        tmpUser.yearCourse = $('#yearCourse').val();   

        if ($('#alumni').is(':checked')) {
            tmpUser.alumni = true;
        } else {
            tmpUser.alumni = false;
        }
        if ($('#staff').is(':checked')) {
            tmpUser.staff = true;
        } else {
            tmpUser.staff = false;
        }

        tmpUser.skills = skills;

        if ($('#inno').is(':checked')) {
            tmpUser.availability.inno = true;
        } else {
            tmpUser.availability.inno = false;
        }
        if ($('#thesis').is(':checked')) {
            tmpUser.availability.thesis = true;
        } else {
            tmpUser.availability.thesis = false;
        }
        if ($('#work').is(':checked')) {
            tmpUser.availability.work = true;
        } else {
            tmpUser.availability.work = false;
        }

        return JSON.stringify(tmpUser);
    }

    function showStatusMessage(message, alert) {
        if (!alert) {
            $('#status').html(message);
            $('#status').addClass('alert alert-success');
            $('#status').fadeIn();
            resetStatusMessage();
        } else {
            $('#status').html(message);
            $('#status').addClass('alert alert-danger');
            $('#status').fadeIn();
            resetStatusMessage();
        }
    }

    function resetStatusMessage() {
        setTimeout(function () {
            $('#status').fadeOut('slow');
            setTimeout(function () {
                $('#status').removeClass();
            }, 500);
        }, 1500);

    }

    window.onSignIn = function (googleUser) {
        $('#google-sign-in').fadeOut();
        $('#user-info').fadeIn();
        profile = googleUser.getBasicProfile();
        setModalHeader('Muokkaa tietoja');
        $('#send').html('Päivitä');
        updateUserInfo(profile);
    }

    function search(skills) {
        var staff = false;
        var alumni = false;
        var userType = $('#user').val();
        if (userType == 1) {
            alumni = true;
        }
        if (userType == 2) {
            staff = true;
        }
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
        $('#search').click(function () {
            search($('#tagsinput').val().split(','));
        });
        $('#send').click(function () {
            sendFormData();
        });
        $('select').selectpicker({
            style: 'btn btn-block btn-lg btn-primary',
            menuStyle: 'dropdown-inverse'
        });
        $(':checkbox').checkbox();
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

    function setUpTagsInput(skills) {
        $('.tagsinput').tagsInput({
            autocomplete: {
                name: 'skills',
                limit: 5,
                local: skills
            }
        });
    }


});