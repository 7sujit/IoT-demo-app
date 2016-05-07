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
        return useDetailsVar.emails[0].address;
    },

    'createChart' : function(){
        Meteor.defer(function() {
               // Create standard Highcharts chart with options:
               drawChart();
             });
    },

    // 'createDonut' : function(){
    //     Meteor.defer(function () {
    //         drawDonutChart();
    //     });
    // },

});


Template.dashboard.events({
    'click #backToLogin' : function(){
        Router.go('/');
    }
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

var updateHandle;
var flag = 0;

SensorData.find().observeChanges({
   added: function () {
      updateHandle.destroy();
      drawChart(updateHandle);
      console.log(updateHandle);
   }
});

function drawChart() {

    var options = {
        maintainAspectRatio: false,
        responsive: false,
        bezierCurve: false,
        animation: false,
        scaleLineColor: "rgba(0,10,0,.5)",
    }


    var obj_list = SensorData.find({},{sort:{createdAt : -1},limit: 7}).fetch();
    var zero_count = 0;
    var lbl = [];
    var ds = [];
    // console.log(obj_list);
    for (var i in obj_list){
        var x = obj_list[i].createdAt;
        var y = obj_list[i].value;
        if(obj_list[i].presence == '0'){
          zero_count = zero_count + 1;
        }
        // console.log(obj_list[i].presence);
        // console.log(x.getUTCHours() + ':' + x.getUTCMinutes() + ':' + x.getUTCSeconds());
        // console.log(y);
        // console.log(x);
        // console.log(x.toString());
        lbl.push(x.getHours() + ':' + x.getMinutes() + ':' + x.getSeconds());
        ds.push(y);
    }

    // console.log(obj_list[0].presence + ': ' + obj_list[0].createdAt);

    var s = document.getElementById('indicatorButton')
    if(obj_list[0].presence=='0'){
      //absent
      s.style.background='#FF6347';
    }
    else {
      s.style.background='#008000';
    }
    var lights = document.getElementById('light');
    var status = PowerData.find({},{}).fetch();
    var xstatus = status[0]._id; // ID of the record entry
    // console.log(status[0]._id._str);
    // console.log(xstatus);
    var status_id = Meteor.Collection.ObjectID(status[0]._id._str);

    if(obj_list[0].presence=='1'){
      // if present and light intensity is above threshold_daytime
      // now only considering presence alone and only for night situation

      // s.style.background='#008000';
      console.log('zero count : ' + zero_count + ' / color : blue');
      PowerData.update(xstatus,{$set: {'power_on': '1'}});
      lights.src='pic_bulbon.gif';
      zero_count=0;
    }
    else if(zero_count == 7) // change logic for contigous 4 zero slots
    { // if not present and light intensity is greater than threshold => switch of the lights
      console.log('zero count : ' + zero_count + ' / color : red');
      PowerData.update(xstatus,{$set: {'power_on': '0'}});
      lights.src='pic_bulboff.gif';
      zero_count=0;
    }

    // console.log(x);

    lbl = lbl.reverse();
    ds = ds.reverse();
    thr = []
    for (var variable in ds) {
      thr.push(175);
    }
    var data = {
     labels : lbl,
     datasets : [
       {
         label: "Target",
              fillColor : "rgba(0,0,220,0)",
              strokeColor : "rgba(0,0,200,1)",
              pointColor : "rgba(200,0,0,1)",
              pointStrokeColor : "rgba(200,0,0,1)",
              // pointHighlightFill : "#fff",
              pointHighlightStroke : "rgba(220,220,220,1)",
           data : ds
       },
       {
         label: "Sales",
                fillColor : "rgba(151,187,205,0.2)",
                strokeColor : "rgba(151,187,205,1)",
                pointColor : "rgba(151,187,205,1)",
                pointStrokeColor : "#fff",
                pointHighlightFill : "#fff",
                pointHighlightStroke : "rgba(151,187,205,1)",
         data : thr
       }
       ]
     }

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
