import { Template } from 'meteor/templating';

import { SensorData } from '../model/model.js';

import '../model/model.js';
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


Template.main.events({
    'click .logout' : function(){
        Meteor.logout();
    },
});

//////////// DASHBOARD //////////////
Template.dashboard.helpers({
    'accountName' : function(){
        var useDetailsVar = Meteor.user();
        // console.log(useDetailsVar.emails[0].address);
        return useDetailsVar.emails[0].address;
    },

    'createChart' : function(){
        Meteor.defer(function() {
               // Create standard Highcharts chart with options:
            //    console.log('renderchart');
               drawChart();
             });
    },

    'createDonut' : function(){
        Meteor.defer(function () {
            // console.log('render donut chart');
            drawDonutChart();
        });
    },

});


Template.dashboard.events({
    'click #backToLogin' : function(){
        Router.go('/');
    },

    'click #submitTest' : function(event){
        var data = document.getElementById('testValue').value;
        // console.log(data);
        SensorData.insert({
            createdAt : new Date(),
            value : data,
        });
    },

});

////////////// dashboard ends////////////////

///////////////////// REGISTER EVENTS //////////

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
            // console.log('Registration failed');
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
            // console.log('failed');
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
                // console.log('login failure');
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

var updateHandle;
var flag = 0;

SensorData.find().observeChanges({
   added: function () {
      updateHandle.destroy();
      drawChart(updateHandle);
    //   console.log(updateHandle);
   }
});

function drawChart() {
    var options = {
        maintainAspectRatio: false,
        responsive: false,
        bezierCurve: false,
        animation: false,
    }

    var obj_list = SensorData.find({},{sort:{createdAt : -1},limit: 7}).fetch();
    var lbl = [];
    var ds = [];
    // console.log(obj_list);
    for (var i in obj_list){
        var x = obj_list[i].createdAt;
        var y = obj_list[i].value;
        // console.log(x.getUTCHours() + ':' + x.getUTCMinutes() + ':' + x.getUTCSeconds());
        // console.log(y);

        lbl.push(x.getUTCHours() + ':' + x.getUTCMinutes() + ':' + x.getUTCSeconds());
        ds.push(y)
    }
    // console.log(x);

    lbl = lbl.reverse();
    ds = ds.reverse();
    var data = {
     labels : lbl,
     datasets : [
       {
           fillColor : "rgba(0,0,0,0)",
           strokeColor : "rgba(0,0,200,1)",
           pointColor : "rgba(200,0,0,1)",
           pointStrokeColor : "#fff",
           data : ds
       },
       ]
     }

    //  console.log('read mychart');
     //Get context with jQuery - using jQuery's .get() method.
     var ctx = document.getElementById('myChart').getContext("2d");
      //This will get the first returned node in the jQuery collection.
      var myNewChart = new Chart(ctx);

      updateHandle = new Chart(ctx).Line(data, options);

}

function drawDonutChart() {

    var options = {
        maintainAspectRatio: false,
        responsive: false,
        animation: false
    }

    var data = [
        {
            value: 300,
            color:"#F7464A",
            highlight: "#FF5A5E",
            label: "Energy Wastage"
        },
        {
            value: 150,
            color: "#46BFBD",
            highlight: "#5AD3D1",
            label: "No Wastage"
        }
    ]

    var ctx = document.getElementById('myDonutChart').getContext("2d");
    var myNewChart = new Chart(ctx);

    new Chart(ctx).Doughnut(data, options);

}
