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

function showLabel(cond){
    var x = document.getElementById('alertLable');
    x.style.visibility = 'visible';
    if(cond == 1)
    {
        x.innerHTML = "Passwords didn't match";
    }
    else {
        x.innerHTML ="User already exist";
    }
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

    'createChart' : function(){
        Meteor.defer(function() {
               // Create standard Highcharts chart with options:
               console.log('renderchart');
               drawChart();
             });
    },

});

Template.main.events({
    'click .logout' : function(){
        Meteor.logout();
    },
});

Template.dashboard.events({
    'click #backToLogin' : function(){
        Router.go('/');
    },
});

Template.register.events({
    'submit #reg-form' : function(event){

        event.preventDefault();

        var target = event.target;
        // var user_name = target.uname.value;
        var unameVar = target.uname.value;
        var emailVar = target.uemail.value;

        var pwdVar = target.xpwd1.value;
        var pwdVar2 = target.xpwd2.value;

        var n = (pwdVar == pwdVar2);
        if(! n)
        {
            console.log('Registration failed');
            // alert('Registration failed');
            // Session.set("display","visible");
            showLabel(1);
            return false;
        }

        // else create a new user
        Accounts.createUser({
            username: unameVar,
            email : emailVar,
            password : pwdVar,
        },
    function(err){
        if(err)
        {
            console.log('failed');
            showLabel(2);
        }
        else {
            Router.go('/dashboard');
        }
    });
    },

    // 'click #regCancel' : function(){
    //
    // },

});

Template.login.helpers({
    'redirectDash' : function(){
        Router.go('/dashboard');
    },
});

Template.login.events({
    'submit #login-form' : function(event){
        event.preventDefault();
        var target = event.target;
        var usernameVar = target.luname.value;
        var passwdVar = target.lpasswd.value;

        Meteor.loginWithPassword(usernameVar, passwdVar, function(err){
            if(err)
            {
                console.log('login failure');
                showLoginLabel();
                target.luname.value = '';
                target.lpasswd.value = '';
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


// plotting chart in myChart

function drawChart() {
    var data = {
     labels : ["January","February","March","April","May","June","July"],
     datasets : [
       {
           fillColor : "rgba(220,220,220,0.5)",
           strokeColor : "rgba(220,220,220,1)",
           pointColor : "rgba(220,220,220,1)",
           pointStrokeColor : "#fff",
           data : [65,59,90,81,56,55,40]
       },
       {
           fillColor : "rgba(151,187,205,0.5)",
           strokeColor : "rgba(151,187,205,1)",
           pointColor : "rgba(151,187,205,1)",
           pointStrokeColor : "#fff",
           data : [28,48,40,19,96,27,100]
       }
       ]
     }

     console.log('read mychart');
     //Get context with jQuery - using jQuery's .get() method.
     var ctx = document.getElementById('myChart').getContext("2d");
      //This will get the first returned node in the jQuery collection.
      var myNewChart = new Chart(ctx);

      new Chart(ctx).Line(data);
}
