$(function () {

    'use strict';
    /**
     *  MetroPro client side js, Lauri Lankinen 2016
     *  javascript file handling events between backend and UI
     *  uses Google Web sign-in API for oauth login
     */

    /**
     *  Page load, setup necessary elements
     */

    updateSkillsArray();
    setUpElements();
    var id;

    function setModalHeader(text) {
        $('#modal-title').html(text);
    }

    /**
     *  Fetch user data against oauth token
     */

    function getUserInfo(profile) {
        $.ajax({
            type: 'POST',
            url: 'http://nodejs-loither.rhcloud.com/oauth',
            data: JSON.stringify({
                "oauth": profile.getId()
            }),
            success: function (data) {
                if (data[0] !== undefined) {
                    id = data[0]._id;
                    populateUserDataFields(data[0]);
                } else {
                    populateSignUpData(profile);
                }

            },
            contentType: "application/json",
            dataType: 'json'
        });
    }

    /**
     *  Get user profile from oauth data
     */

    function updateUserInfo(profile) {
        getUserInfo(profile);
    }

    /**
     *  Populate UI data fields with fetched user data
     */

    function populateUserDataFields(user) {
        $('#firstName').val(user.firstName);
        $('#lastName').val(user.lastName);
        $('#email').val(user.email);
        $('#major').val(user.major);
        if (user.yearCourse !== null) {
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

    /**
     *  Populate data fields for new user from oauth data
     */

    function populateSignUpData(profile) {
        setModalHeader('Luo käyttäjätiedot');
        $('#send').html('Tallenna');
        $('#firstName').val(profile.getGivenName());
        $('#lastName').val(profile.getFamilyName());
        $('#email').val(profile.getEmail());
    }

    /**
     *  Send api call (add / update user)
     */

    function sendFormData() {
        if (id !== undefined) {
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

    /**
     *  Fetch user data from UI fields
     */

    function scrapeFormData() {
        var tmpUser = {};
        tmpUser.availability = {};
        var tmpSkills = $('#tagsinput2').val().split(',');
        var skills = [];

        tmpSkills.forEach(function (item) {
            skills.push(item.toLowerCase());
        });

        tmpUser.oauth = id;
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

    /**
     *  Display success / error message with custom text
     */

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

    /**
     *  Hide status message
     */

    function resetStatusMessage() {
        setTimeout(function () {
            $('#status').fadeOut('slow');
            setTimeout(function () {
                $('#status').removeClass();
            }, 500);
        }, 1500);

    }

    /**
     *  oAuth callback function
     */

    window.onSignIn = function (googleUser) {
        $('#google-sign-in').fadeOut();
        $('#user-info').fadeIn();
        var profile = googleUser.getBasicProfile();
        setModalHeader('Muokkaa tietoja');
        $('#send').html('Päivitä');
        $('#send').fadeIn();
        updateUserInfo(profile);
    };

    /**
     *  Search skills from api
     */

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
                hideHeader();
                updateResults(skills, data);
            },
            contentType: "application/json",
            dataType: 'json'
        });
    }

    /**
     *  Display search results
     */

    function updateResults(skills, results) {
        $('#results').html('');
        if (results.length > 0) {
            $('#results').hide();
            $('#results').append('<div class="col-xs-12"><h3 class="underline">Hakutulokset</h3></div>');
            results.forEach(function (result) {
                $('#results').append(renderResult(result, skills));
            });
            $('#results').fadeIn('slow');
        } else {
            $('#results').hide().append('<p>Ei tuloksia. Kokeile hakea uudestaan.</p>').fadeIn('slow');
        }
    }

    /**
     *  Render single search result
     */

    function renderResult(result, skills) {
        var element = '<div class="col-xs-12 col-md-4 result"><div class="inner">';
        if (result.firstName !== undefined && result.lastName !== undefined) {
            element += '<h5>' + result.firstName + ' ' + result.lastName + '</h5>';
        }
        if (result.yearCourse < 5 && result.major !== undefined) {
            element += '<p>' + result.major + ' <span class="small">(' + result.yearCourse + '. vuosi)</span></p>';
        } else if (result.staff && result.alumni) {
            element += '<p>henkilökunta, alumni</p>';
        } else if (result.staff) {
            element += '<p>henkilökunta</p>';
        } else if (result.alumni) {
            element += '<p>alumni</p>';
        }
        element += '<p class="skills">';
        result.skills.forEach(function (skill) {
            if (skills.indexOf(skill.toLowerCase()) != -1) {
                element += '<span class="tagged">' + skill + '</span> ';
            } else {
                element += '<span class="other">' + skill + '</span> ';
            }
        });
        element += '</p>';
        if (result.email !== undefined) {
            element += '<p class="email"><span class="fui-mail"> ' + result.email + '</p>';
        }
        element += '<p>Kiinnostunut </br>';
        if (result.availability.inno) {
            element += '<span class="other">Innoprojektista</span> ';
        }
        if (result.availability.thesis) {
            element += '<span class="other">Päättötyöstä</span> ';
        }
        if (result.availability.work) {
            element += '<span class="other">Palkkatyöstä</span> ';
        }
        element += '</p>';
        element += '</div></div>';
        return element;

    }

    /**
     *  Hide header when initiating search
     */

    function hideHeader() {
        $('.headline').fadeOut('slow');
    }

    /**
     *  Setup dynamic elements on page load
     */

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

    /**
     *  Render tags in skills array to tagged search field
     */

    function updateSkillsArray() {
        $.get('http://nodejs-loither.rhcloud.com/skills', function (items) {
            var skills = [];
            items.forEach(function (items) {
                skills.push(items.skills);
            });
            setUpTagsInput(skills);
        });
    }

    /**
     *  Initiate all tagged inputs
     */

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