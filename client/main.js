import { Template } from 'meteor/templating';

import './main.html';

Router.map(function(){
    this.route('login',{path:'/'});
    this.route('dashboard',{path:'/dashboard'});
    this.route('register',{path:'/register'});
});

Router.configure({
    layoutTemplate: 'main'
});


function showLabel(){
    var x = document.getElementById('alertLable');
    x.style.visibility = 'visible';
}

function showLoginLabel() {
    var x = document.getElementById('alertLoginLable');
    x.style.visibility = 'visible';
}

// Template.

Template.dashboard.helpers({
    'accountName' : function(){
        var useDetailsVar = Meteor.user();
        console.log(useDetailsVar.emails[0].address);
        return useDetailsVar.emails[0].address;
    },
});

Template.dashboard.events({
    'click .logout' : function(){
        Meteor.logout();
    },
    'click #backToLogin' : function(){
        Router.go('/');
    },
});

Template.register.events({
    'submit #reg-form' : function(event){

        event.preventDefault();

        var target = event.target;
        // var user_name = target.uname.value;
        var emailVar = target.uemail.value;

        var pwdVar = target.xpwd1.value;
        var pwdVar2 = target.xpwd2.value;

        var n = (pwdVar == pwdVar2);
        if(! n)
        {
            console.log('Registration failed');
            // alert('Registration failed');
            // Session.set("display","visible");
            showLabel();
            return false;
        }

        // else create a new user
        Accounts.createUser({
            email : emailVar,
            password : pwdVar,
        },
    function(err){
        if(err)
        {
            console.log('failed');
        }
        else {
            Router.go('/dashboard');
        }
    });
    },

});

Template.login.events({
    'submit #login-form' : function(event){
        event.preventDefault();
        var target = event.target;
        var uemailVar = target.lemail.value;
        var passwdVar = target.lpasswd.value;

        Meteor.loginWithPassword(uemailVar, passwdVar, function(err){
            if(err)
            {
                console.log('login failure');
                showLoginLabel();
                target.lpasswd.value = '';
                target.lemail.value = '';
            }
            else {
                Router.go('/dashboard');
            }
        });
    },
    'click #reg-btn' : function(){
        Router.go('/register');
    },

});

// Accounts.onLoginFailure(function(){
//     Router.go('/');
// });
// Accounts.onLogin(function(){
//     Router.go('/dashboard');
// });

Accounts.onLogout(function(){
    Router.go('/');
});
