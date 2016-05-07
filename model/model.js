import { Mongo } from 'meteor/mongo';

export const SensorData = new Mongo.Collection('sensdata');
PowerData = new Mongo.Collection('powerdat');


Meteor.methods({


    lastMonthUsage : function () {

        var today = new Date();
        var prevDate = new Date();
        prevDate.setUTCMinutes(prevDate.getUTCMinutes() - 10); // Tracking last T minutes data

        // var result = SensorData.findOne();
        var result = SensorData.find({
                createdAt : {
                    //  new Date(year, month, day, hours, minutes, seconds, milliseconds)
                    '$gte': prevDate,
                    '$lte': today
                }
            },{sort:{createdAt : -1}}).fetch();

        var resultSet = [];
        // return [prevDate, today, result];
        for (var variable in result) {
          // resultSet.push(variable.value);
          console.log(result[variable].presence);
          resultSet.push(result[variable].presence);
        }
        return [today, prevDate, resultSet];
    },


});
