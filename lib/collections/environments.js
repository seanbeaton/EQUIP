/*
* JS MongoDB collection init and methods file
* Environments
*/

import {checkAccess} from "../../helpers/access";

Environments = new Mongo.Collection('environments');

Meteor.methods({

  environmentInsert: function(postAttributes) {
    // no checkAccess() for insert

    var user = Meteor.user();
    var environment = _.extend(postAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date(),
      lastModifiedParam: new Date(),
      lastModifiedObs: new Date(),
      inputStyle: 'box'
    });

    var envId = Environments.insert(environment);

    return {
      _id: envId
    };
  },

  environmentInsertExample: function() {
    // no checkAccess() for insert

    let user = Meteor.user();
    let environment = {
      userId: user._id,
      author: user.username,
      submitted: new Date(),
      lastModifiedParam: new Date(),
      lastModifiedObs: new Date(),
      inputStyle: 'box',
      envName: 'Example Classroom',
      isExample: true,
    };

    var envId = Environments.insert(environment);


    let observations = [
      { "name" : "Observation #1 - 9/4", "origObsId": "5AXYcxDCzuvmyJba7", "envId" : envId, "timer" : 0,"observationDate" : "2018-09-04" },
      { "name" : "Observation #2 - 9/6", "origObsId": "f8zBBMSxggdC8Dkq8", "envId" : envId, "timer" : 0, "observationDate" : "2018-09-06" },
      { "name" : "Observation #3 - 9/13", "origObsId": "9tGTT4fstJDpFdRwB", "envId" : envId, "timer" : 0, "observationDate" : "2018-09-13" },
    ];

    let sequences = [
      {
        origObsId: "5AXYcxDCzuvmyJba7",
        sequences: [
          {
          "envId": envId,
          "time": 457,
          "info": {
            "studentId": "bi3vmfFQgKJdHNwgh",
            "Name": "Lawrence",
            "Student Talk (Type)": "Explanation",
            "Student Talk (Length)": "Extended Contribution",
            "Teacher Question (Type)": "Procedural",
            "Teacher Wait Time": "Long",
            "Teacher Tone": "Enthusiastic"
          },
          "origObsId": "5AXYcxDCzuvmyJba7",
          "obsName": "Observation #1 - 9/4",
          "userId": "NjGRSNrT67gFP4Lr8",
          "author": "niral"
        },
          {
            "envId": envId,
            "time": 788,
            "info": {
              "studentId": "BPD36cdiewZ2T9exL",
              "Name": "Rick",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 570,
            "info": {
              "studentId": "dEL7gyWuoFJNZrg82",
              "Name": "Thomas",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 268,
            "info": {
              "studentId": "9qGH3fcWkiwR86iGi",
              "Name": "Jalen",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 491,
            "info": {
              "studentId": "q6NYoymnPEjpZs72b",
              "Name": "Nia",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 135,
            "info": {
              "studentId": "RM5Dy5tzuohoD6Dqf",
              "Name": "Halona",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Dismissive"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 187,
            "info": {
              "studentId": "q6NYoymnPEjpZs72b",
              "Name": "Nia",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 770,
            "info": {
              "studentId": "3bi7D9c4YSLDEFpwa",
              "Name": "Joey",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 424,
            "info": {
              "studentId": "J6ukPFHqP8RheNGvS",
              "Name": "Marcus",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Dismissive"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 471,
            "info": {
              "studentId": "yeJFGefprSETvo9SL",
              "Name": "Janelle",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 94,
            "info": {
              "studentId": "o6XtJXyFbp4jnB87x",
              "Name": "Garrett",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 83,
            "info": {
              "studentId": "3bi7D9c4YSLDEFpwa",
              "Name": "Joey",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 810,
            "info": {
              "studentId": "o6XtJXyFbp4jnB87x",
              "Name": "Garrett",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 399,
            "info": {
              "studentId": "9qGH3fcWkiwR86iGi",
              "Name": "Jalen",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 613,
            "info": {
              "studentId": "tTHWRjCLpppGZz2kD",
              "Name": "Phoung",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 555,
            "info": {
              "studentId": "9qGH3fcWkiwR86iGi",
              "Name": "Jalen",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 351,
            "info": {
              "studentId": "YCgLDJuyTAEmNvhBj",
              "Name": "Candace",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 672,
            "info": {
              "studentId": "RM5Dy5tzuohoD6Dqf",
              "Name": "Halona",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 380,
            "info": {
              "studentId": "qGENFvnCBMc9BaCKK",
              "Name": "Zahra",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 716,
            "info": {
              "studentId": "3bi7D9c4YSLDEFpwa",
              "Name": "Joey",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 28,
            "info": {
              "studentId": "ZceZCDAB6u7mmG2JG",
              "Name": "Carlos",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 847,
            "info": {
              "studentId": "yeJFGefprSETvo9SL",
              "Name": "Janelle",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 737,
            "info": {
              "studentId": "BPD36cdiewZ2T9exL",
              "Name": "Rick",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 509,
            "info": {
              "studentId": "YCgLDJuyTAEmNvhBj",
              "Name": "Candace",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 798,
            "info": {
              "studentId": "BPD36cdiewZ2T9exL",
              "Name": "Rick",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 242,
            "info": {
              "studentId": "rr7qSCqvjS8Lc6qxt",
              "Name": "Parker",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 690,
            "info": {
              "studentId": "PiLdia7itRF854tth",
              "Name": "Sam",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 538,
            "info": {
              "studentId": "bi3vmfFQgKJdHNwgh",
              "Name": "Lawrence",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 870,
            "info": {
              "studentId": "yeJFGefprSETvo9SL",
              "Name": "Janelle",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 157,
            "info": {
              "studentId": "jwjYy8uqDhbGGfXch",
              "Name": "Lark",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 21,
            "info": {
              "studentId": "eu2EALdccbuqZCNy8",
              "Name": "Monet",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 213,
            "info": {
              "studentId": "BPD36cdiewZ2T9exL",
              "Name": "Rick",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 445,
            "info": {
              "studentId": "M7Aq9BvER2wXwfxLr",
              "Name": "Russell",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 655,
            "info": {
              "studentId": "6wqFdntTEFHZtdAdi",
              "Name": "Debra",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 511,
            "info": {
              "studentId": "J6ukPFHqP8RheNGvS",
              "Name": "Marcus",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 43,
            "info": {
              "studentId": "J6ukPFHqP8RheNGvS",
              "Name": "Marcus",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 588,
            "info": {
              "studentId": "M7Aq9BvER2wXwfxLr",
              "Name": "Russell",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 857,
            "info": {
              "studentId": "ZceZCDAB6u7mmG2JG",
              "Name": "Carlos",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Dismissive"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 762,
            "info": {
              "studentId": "BPD36cdiewZ2T9exL",
              "Name": "Rick",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 423,
            "info": {
              "studentId": "dEL7gyWuoFJNZrg82",
              "Name": "Thomas",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 63,
            "info": {
              "studentId": "bi49C8ERtr2Mb2QMk",
              "Name": "Tama",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 318,
            "info": {
              "studentId": "tTHWRjCLpppGZz2kD",
              "Name": "Phoung",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "5AXYcxDCzuvmyJba7",
            "obsName": "Observation #1 - 9/4",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          }]
      },
      {
        origObsId: "9tGTT4fstJDpFdRwB",
        sequences: [
          {
            "envId": envId,
            "time": 2091,
            "info": {
              "studentId": "ZceZCDAB6u7mmG2JG",
              "Name": "Carlos",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 1436,
            "info": {
              "studentId": "9qGH3fcWkiwR86iGi",
              "Name": "Jalen",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 4319,
            "info": {
              "studentId": "tTHWRjCLpppGZz2kD",
              "Name": "Phoung",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 2363,
            "info": {
              "studentId": "9qGH3fcWkiwR86iGi",
              "Name": "Jalen",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 2467,
            "info": {
              "studentId": "J6ukPFHqP8RheNGvS",
              "Name": "Marcus",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Dismissive"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 6931,
            "info": {
              "studentId": "9qGH3fcWkiwR86iGi",
              "Name": "Jalen",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 5183,
            "info": {
              "studentId": "BPD36cdiewZ2T9exL",
              "Name": "Rick",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 5431,
            "info": {
              "studentId": "BPD36cdiewZ2T9exL",
              "Name": "Rick",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Dismissive"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 1748,
            "info": {
              "studentId": "MACbM7wxZvhYzmFKG",
              "Name": "Lequoia",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 407,
            "info": {
              "studentId": "6cmDQHSLbJY4kzjge",
              "Name": "Jennifer",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 4355,
            "info": {
              "studentId": "tTHWRjCLpppGZz2kD",
              "Name": "Phoung",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 1899,
            "info": {
              "studentId": "yeJFGefprSETvo9SL",
              "Name": "Janelle",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Dismissive"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 7919,
            "info": {
              "studentId": "q6NYoymnPEjpZs72b",
              "Name": "Nia",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 4012,
            "info": {
              "studentId": "kDDPen8uSXP2SbeNP",
              "Name": "Faye",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 1456,
            "info": {
              "studentId": "9qGH3fcWkiwR86iGi",
              "Name": "Jalen",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 6651,
            "info": {
              "studentId": "9qGH3fcWkiwR86iGi",
              "Name": "Jalen",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 459,
            "info": {
              "studentId": "YCgLDJuyTAEmNvhBj",
              "Name": "Candace",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 5543,
            "info": {
              "studentId": "BPD36cdiewZ2T9exL",
              "Name": "Rick",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 2255,
            "info": {
              "studentId": "tTHWRjCLpppGZz2kD",
              "Name": "Phoung",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 6407,
            "info": {
              "studentId": "RM5Dy5tzuohoD6Dqf",
              "Name": "Halona",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 2159,
            "info": {
              "studentId": "6wqFdntTEFHZtdAdi",
              "Name": "Debra",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 536,
            "info": {
              "studentId": "BPD36cdiewZ2T9exL",
              "Name": "Rick",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Dismissive"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 6319,
            "info": {
              "studentId": "RM5Dy5tzuohoD6Dqf",
              "Name": "Halona",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 4491,
            "info": {
              "studentId": "dEL7gyWuoFJNZrg82",
              "Name": "Thomas",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 5747,
            "info": {
              "studentId": "6wqFdntTEFHZtdAdi",
              "Name": "Debra",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 5831,
            "info": {
              "studentId": "6wqFdntTEFHZtdAdi",
              "Name": "Debra",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 7887,
            "info": {
              "studentId": "qGENFvnCBMc9BaCKK",
              "Name": "Zahra",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 1488,
            "info": {
              "studentId": "9qGH3fcWkiwR86iGi",
              "Name": "Jalen",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 556,
            "info": {
              "studentId": "BPD36cdiewZ2T9exL",
              "Name": "Rick",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 1675,
            "info": {
              "studentId": "bi49C8ERtr2Mb2QMk",
              "Name": "Tama",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 2048,
            "info": {
              "studentId": "ZceZCDAB6u7mmG2JG",
              "Name": "Carlos",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 6351,
            "info": {
              "studentId": "6pA4nSaHkhcAbn2ec",
              "Name": "Wendy",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 6611,
            "info": {
              "studentId": "9qGH3fcWkiwR86iGi",
              "Name": "Jalen",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 511,
            "info": {
              "studentId": "BPD36cdiewZ2T9exL",
              "Name": "Rick",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 2128,
            "info": {
              "studentId": "6wqFdntTEFHZtdAdi",
              "Name": "Debra",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 336,
            "info": {
              "studentId": "BPD36cdiewZ2T9exL",
              "Name": "Rick",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 4379,
            "info": {
              "studentId": "tTHWRjCLpppGZz2kD",
              "Name": "Phoung",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 80,
            "info": {
              "studentId": "ZceZCDAB6u7mmG2JG",
              "Name": "Carlos",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 2208,
            "info": {
              "studentId": "3bi7D9c4YSLDEFpwa",
              "Name": "Joey",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 6787,
            "info": {
              "studentId": "3bi7D9c4YSLDEFpwa",
              "Name": "Joey",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 251,
            "info": {
              "studentId": "J6ukPFHqP8RheNGvS",
              "Name": "Marcus",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 487,
            "info": {
              "studentId": "RM5Dy5tzuohoD6Dqf",
              "Name": "Halona",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 5711,
            "info": {
              "studentId": "MACbM7wxZvhYzmFKG",
              "Name": "Lequoia",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 1819,
            "info": {
              "studentId": "q6NYoymnPEjpZs72b",
              "Name": "Nia",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 2296,
            "info": {
              "studentId": "dEL7gyWuoFJNZrg82",
              "Name": "Thomas",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 5123,
            "info": {
              "studentId": "3bi7D9c4YSLDEFpwa",
              "Name": "Joey",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 7815,
            "info": {
              "studentId": "M7Aq9BvER2wXwfxLr",
              "Name": "Russell",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 139,
            "info": {
              "studentId": "6wqFdntTEFHZtdAdi",
              "Name": "Debra",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 4519,
            "info": {
              "studentId": "tTHWRjCLpppGZz2kD",
              "Name": "Phoung",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 1847,
            "info": {
              "studentId": "qGENFvnCBMc9BaCKK",
              "Name": "Zahra",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 211,
            "info": {
              "studentId": "PiLdia7itRF854tth",
              "Name": "Sam",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 2919,
            "info": {
              "studentId": "M7Aq9BvER2wXwfxLr",
              "Name": "Russell",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 2427,
            "info": {
              "studentId": "yeJFGefprSETvo9SL",
              "Name": "Janelle",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 7839,
            "info": {
              "studentId": "J6ukPFHqP8RheNGvS",
              "Name": "Marcus",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 95,
            "info": {
              "studentId": "dEL7gyWuoFJNZrg82",
              "Name": "Thomas",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 375,
            "info": {
              "studentId": "6pA4nSaHkhcAbn2ec",
              "Name": "Wendy",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 5155,
            "info": {
              "studentId": "BPD36cdiewZ2T9exL",
              "Name": "Rick",
              "Student Talk (Type)": "Explanation",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Explanation",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 4467,
            "info": {
              "studentId": "bi3vmfFQgKJdHNwgh",
              "Name": "Lawrence",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Dismissive"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 5231,
            "info": {
              "studentId": "BPD36cdiewZ2T9exL",
              "Name": "Rick",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 292,
            "info": {
              "studentId": "M7Aq9BvER2wXwfxLr",
              "Name": "Russell",
              "Student Talk (Type)": "Procedural",
              "Student Talk (Length)": "Extended Contribution",
              "Teacher Question (Type)": "Procedural",
              "Teacher Wait Time": "Long",
              "Teacher Tone": "Enthusiastic"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
          {
            "envId": envId,
            "time": 5047,
            "info": {
              "studentId": "9qGH3fcWkiwR86iGi",
              "Name": "Jalen",
              "Student Talk (Type)": "Factual/Recall",
              "Student Talk (Length)": "Brief Contribution",
              "Teacher Question (Type)": "Factual/Recall",
              "Teacher Wait Time": "Short",
              "Teacher Tone": "Neutral"
            },
            "origObsId": "9tGTT4fstJDpFdRwB",
            "obsName": "Observation #3 - 9/13",
            "userId": "NjGRSNrT67gFP4Lr8",
            "author": "niral"
          },
        ]
      },
      {
        origObsId: "f8zBBMSxggdC8Dkq8",
        sequences: [
          { "envId" : envId, "time" : 1682, "info" : { "studentId" : "9qGH3fcWkiwR86iGi", "Name" : "Jalen", "Student Talk (Type)" : "Factual/Recall", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Factual/Recall", "Teacher Wait Time" : "Short", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 2837, "info" : { "studentId" : "Ja8HnaEBThtxDk7jR", "Name" : "Kristy", "Student Talk (Type)" : "Procedural", "Student Talk (Length)" : "Extended Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Short", "Teacher Tone" : "Enthusiastic" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 56, "info" : { "studentId" : "Ja8HnaEBThtxDk7jR", "Name" : "Kristy", "Student Talk (Type)" : "Factual/Recall", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Factual/Recall", "Teacher Wait Time" : "Short", "Teacher Tone" : "Dismissive" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 2972, "info" : { "studentId" : "6wqFdntTEFHZtdAdi", "Name" : "Debra", "Student Talk (Type)" : "Procedural", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Short", "Teacher Tone" : "Enthusiastic" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1487, "info" : { "studentId" : "RM5Dy5tzuohoD6Dqf", "Name" : "Halona", "Student Talk (Type)" : "Factual/Recall", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Factual/Recall", "Teacher Wait Time" : "Short", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1193, "info" : { "studentId" : "PiLdia7itRF854tth", "Name" : "Sam", "Student Talk (Type)" : "Explanation", "Student Talk (Length)" : "Extended Contribution", "Teacher Question (Type)" : "Explanation", "Teacher Wait Time" : "Long", "Teacher Tone" : "Enthusiastic" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1718, "info" : { "studentId" : "9qGH3fcWkiwR86iGi", "Name" : "Jalen", "Student Talk (Type)" : "Explanation", "Student Talk (Length)" : "Extended Contribution", "Teacher Question (Type)" : "Explanation", "Teacher Wait Time" : "Short", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 2750, "info" : { "studentId" : "6pA4nSaHkhcAbn2ec", "Name" : "Wendy", "Student Talk (Type)" : "Procedural", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Long", "Teacher Tone" : "Dismissive" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 2891, "info" : { "studentId" : "M7Aq9BvER2wXwfxLr", "Name" : "Russell", "Student Talk (Type)" : "Factual/Recall", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Factual/Recall", "Teacher Wait Time" : "Short", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 221, "info" : { "studentId" : "6pA4nSaHkhcAbn2ec", "Name" : "Wendy", "Student Talk (Type)" : "Procedural", "Student Talk (Length)" : "Extended Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Short", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 2798, "info" : { "studentId" : "jwjYy8uqDhbGGfXch", "Name" : "Lark", "Student Talk (Type)" : "Procedural", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Short", "Teacher Tone" : "Enthusiastic" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 3005, "info" : { "studentId" : "bi49C8ERtr2Mb2QMk", "Name" : "Tama", "Student Talk (Type)" : "Factual/Recall", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Factual/Recall", "Teacher Wait Time" : "Short", "Teacher Tone" : "Enthusiastic" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 2939, "info" : { "studentId" : "rr7qSCqvjS8Lc6qxt", "Name" : "Parker", "Student Talk (Type)" : "Explanation", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Explanation", "Teacher Wait Time" : "Long", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1619, "info" : { "studentId" : "6cmDQHSLbJY4kzjge", "Name" : "Jennifer", "Student Talk (Type)" : "Factual/Recall", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Factual/Recall", "Teacher Wait Time" : "Short", "Teacher Tone" : "Dismissive" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1574, "info" : { "studentId" : "3bi7D9c4YSLDEFpwa", "Name" : "Joey", "Student Talk (Type)" : "Procedural", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Short", "Teacher Tone" : "Enthusiastic" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1856, "info" : { "studentId" : "MACbM7wxZvhYzmFKG", "Name" : "Lequoia", "Student Talk (Type)" : "Explanation", "Student Talk (Length)" : "Extended Contribution", "Teacher Question (Type)" : "Explanation", "Teacher Wait Time" : "Long", "Teacher Tone" : "Enthusiastic" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 3059, "info" : { "studentId" : "3bi7D9c4YSLDEFpwa", "Name" : "Joey", "Student Talk (Type)" : "Explanation", "Student Talk (Length)" : "Extended Contribution", "Teacher Question (Type)" : "Explanation", "Teacher Wait Time" : "Long", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1814, "info" : { "studentId" : "bi49C8ERtr2Mb2QMk", "Name" : "Tama", "Student Talk (Type)" : "Factual/Recall", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Factual/Recall", "Teacher Wait Time" : "Short", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1598, "info" : { "studentId" : "BPD36cdiewZ2T9exL", "Name" : "Rick", "Student Talk (Type)" : "Explanation", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Explanation", "Teacher Wait Time" : "Short", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 431, "info" : { "studentId" : "C86274KRGHFbHeBeT", "Name" : "Brenda", "Student Talk (Type)" : "Procedural", "Student Talk (Length)" : "Extended Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Short", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1388, "info" : { "studentId" : "rr7qSCqvjS8Lc6qxt", "Name" : "Parker", "Student Talk (Type)" : "Explanation", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Explanation", "Teacher Wait Time" : "Long", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1133, "info" : { "studentId" : "dEL7gyWuoFJNZrg82", "Name" : "Thomas", "Student Talk (Type)" : "Factual/Recall", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Long", "Teacher Tone" : "Dismissive" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 788, "info" : { "studentId" : "ZceZCDAB6u7mmG2JG", "Name" : "Carlos", "Student Talk (Type)" : "Explanation", "Student Talk (Length)" : "Extended Contribution", "Teacher Question (Type)" : "Explanation", "Teacher Wait Time" : "Short", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1658, "info" : { "studentId" : "q6NYoymnPEjpZs72b", "Name" : "Nia", "Student Talk (Type)" : "Explanation", "Student Talk (Length)" : "Extended Contribution", "Teacher Question (Type)" : "Explanation", "Teacher Wait Time" : "Short", "Teacher Tone" : "Dismissive" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 185, "info" : { "studentId" : "C86274KRGHFbHeBeT", "Name" : "Brenda", "Student Talk (Type)" : "Procedural", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Short", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 857, "info" : { "studentId" : "ZceZCDAB6u7mmG2JG", "Name" : "Carlos", "Student Talk (Type)" : "Procedural", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Short", "Teacher Tone" : "Dismissive" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1325, "info" : { "studentId" : "o6XtJXyFbp4jnB87x", "Name" : "Garrett", "Student Talk (Type)" : "Procedural", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Short", "Teacher Tone" : "Enthusiastic" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1544, "info" : { "studentId" : "jwjYy8uqDhbGGfXch", "Name" : "Lark", "Student Talk (Type)" : "Procedural", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Long", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 100, "info" : { "studentId" : "M7Aq9BvER2wXwfxLr", "Name" : "Russell", "Student Talk (Type)" : "Explanation", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Explanation", "Teacher Wait Time" : "Long", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1355, "info" : { "studentId" : "6pA4nSaHkhcAbn2ec", "Name" : "Wendy", "Student Talk (Type)" : "Procedural", "Student Talk (Length)" : "Extended Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Short", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 251, "info" : { "studentId" : "Ja8HnaEBThtxDk7jR", "Name" : "Kristy", "Student Talk (Type)" : "Procedural", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Short", "Teacher Tone" : "Enthusiastic" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1766, "info" : { "studentId" : "YCgLDJuyTAEmNvhBj", "Name" : "Candace", "Student Talk (Type)" : "Factual/Recall", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Short", "Teacher Tone" : "Enthusiastic" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 341, "info" : { "studentId" : "MACbM7wxZvhYzmFKG", "Name" : "Lequoia", "Student Talk (Type)" : "Explanation", "Student Talk (Length)" : "Extended Contribution", "Teacher Question (Type)" : "Factual/Recall", "Teacher Wait Time" : "Short", "Teacher Tone" : "Enthusiastic" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1433, "info" : { "studentId" : "BPD36cdiewZ2T9exL", "Name" : "Rick", "Student Talk (Type)" : "Explanation", "Student Talk (Length)" : "Extended Contribution", "Teacher Question (Type)" : "Explanation", "Teacher Wait Time" : "Short", "Teacher Tone" : "Enthusiastic" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 2717, "info" : { "studentId" : "6cmDQHSLbJY4kzjge", "Name" : "Jennifer", "Student Talk (Type)" : "Procedural", "Student Talk (Length)" : "Extended Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Short", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 30, "info" : { "studentId" : "95DpkuiArZBGrw3ep", "Name" : "Silvia", "Student Talk (Type)" : "Explanation", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Procedural", "Teacher Wait Time" : "Short", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
          { "envId" : envId, "time" : 1412, "info" : { "studentId" : "BPD36cdiewZ2T9exL", "Name" : "Rick", "Student Talk (Type)" : "Factual/Recall", "Student Talk (Length)" : "Brief Contribution", "Teacher Question (Type)" : "Factual/Recall", "Teacher Wait Time" : "Short", "Teacher Tone" : "Neutral" }, "origObsId" : "f8zBBMSxggdC8Dkq8", "obsName" : "Observation #2 - 9/6", "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
        ]
      }
    ]

    let subjects = [
      { "origStudId" : "3bi7D9c4YSLDEFpwa", "data_x" : "0", "data_y" : "180", "envId" : envId, "info" : { "name" : "Joey", "Gender" : "Boy", "SES" : "Higher", "Race" : "White", "Language Proficiency" : "English Dominant", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "6cmDQHSLbJY4kzjge", "data_x" : "460", "data_y" : "120", "envId" : envId, "info" : { "name" : "Jennifer", "Gender" : "Girl", "SES" : "Higher", "Race" : "White", "Language Proficiency" : "English Dominant", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "6pA4nSaHkhcAbn2ec", "data_x" : "460", "data_y" : "420", "envId" : envId, "info" : { "name" : "Wendy", "Gender" : "Girl", "SES" : "Lower", "Race" : "White", "Language Proficiency" : "English Dominant", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "6wqFdntTEFHZtdAdi", "data_x" : "690", "data_y" : "0", "envId" : envId, "info" : { "name" : "Debra", "Gender" : "Girl", "SES" : "Higher", "Race" : "Latinx", "Language Proficiency" : "Emergent Multilingual", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "7hMZqbtHkbW34654D", "data_x" : "690", "data_y" : "120", "envId" : envId, "info" : { "name" : "Joe", "Gender" : "Boy", "SES" : "Lower", "Race" : "White", "Language Proficiency" : "Emergent Multilingual", "Popularity" : "Very Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "95DpkuiArZBGrw3ep", "data_x" : "690", "data_y" : "360", "envId" : envId, "info" : { "name" : "Silvia", "Gender" : "Girl", "SES" : "Lower", "Race" : "Latinx", "Language Proficiency" : "Emergent Multilingual", "Popularity" : "Very Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "9qGH3fcWkiwR86iGi", "data_x" : "230", "data_y" : "60", "envId" : envId, "info" : { "name" : "Jalen", "Gender" : "Boy", "SES" : "Higher", "Race" : "Black", "Language Proficiency" : "English Dominant", "Popularity" : "Very Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "BPD36cdiewZ2T9exL", "data_x" : "0", "data_y" : "360", "envId" : envId, "info" : { "name" : "Rick", "Gender" : "Boy", "SES" : "Higher", "Race" : "White", "Language Proficiency" : "English Dominant", "Popularity" : "Very Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "C86274KRGHFbHeBeT", "data_x" : "0", "data_y" : "0", "envId" : envId, "info" : { "name" : "Brenda", "Gender" : "Girl", "SES" : "Higher", "Race" : "White", "Language Proficiency" : "English Dominant", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "J6ukPFHqP8RheNGvS", "data_x" : "460", "data_y" : "240", "envId" : envId, "info" : { "name" : "Marcus", "Gender" : "Boy", "SES" : "Lower", "Race" : "Black", "Language Proficiency" : "English Dominant", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "Ja8HnaEBThtxDk7jR", "data_x" : "460", "data_y" : "180", "envId" : envId, "info" : { "name" : "Kristy", "Gender" : "Girl", "SES" : "Lower", "Race" : "White", "Language Proficiency" : "English Dominant", "Popularity" : "Very Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "M7Aq9BvER2wXwfxLr", "data_x" : "230", "data_y" : "360", "envId" : envId, "info" : { "name" : "Russell", "Gender" : "Boy", "SES" : "Lower", "Race" : "Black", "Language Proficiency" : "English Dominant", "Popularity" : "Very Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "MACbM7wxZvhYzmFKG", "data_x" : "230", "data_y" : "240", "envId" : envId, "info" : { "name" : "Lequoia", "Gender" : "Girl", "SES" : "Higher", "Race" : "Native", "Language Proficiency" : "English Dominant", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "PiLdia7itRF854tth", "data_x" : "460", "data_y" : "360", "envId" : envId, "info" : { "name" : "Sam", "Gender" : "Boy", "SES" : "Lower", "Race" : "Native", "Language Proficiency" : "English Dominant", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "RM5Dy5tzuohoD6Dqf", "data_x" : "690", "data_y" : "60", "envId" : envId, "info" : { "name" : "Halona", "Gender" : "Girl", "SES" : "Higher", "Race" : "Native", "Language Proficiency" : "English Dominant", "Popularity" : "Very Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "TJWroFtrqepXD5nEv", "data_x" : "230", "data_y" : "180", "envId" : envId, "info" : { "name" : "Julisa", "Gender" : "Girl", "SES" : "Higher", "Race" : "Latinx", "Language Proficiency" : "Emergent Multilingual", "Popularity" : "Very Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "WrQp24BJPA3d3TxXS", "data_x" : "230", "data_y" : "300", "envId" : envId, "info" : { "name" : "Niral", "Gender" : "Boy", "SES" : "Lower", "Race" : "Native", "Language Proficiency" : "English Dominant", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "YCgLDJuyTAEmNvhBj", "data_x" : "0", "data_y" : "60", "envId" : envId, "info" : { "name" : "Candace", "Gender" : "Girl", "SES" : "Higher", "Race" : "Black", "Language Proficiency" : "English Dominant", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "ZceZCDAB6u7mmG2JG", "data_x" : "460", "data_y" : "0", "envId" : envId, "info" : { "name" : "Carlos", "Gender" : "Boy", "SES" : "Lower", "Race" : "Latinx", "Language Proficiency" : "English Dominant", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "bi3vmfFQgKJdHNwgh", "data_x" : "0", "data_y" : "240", "envId" : envId, "info" : { "name" : "Lawrence", "Gender" : "Boy", "SES" : "Higher", "Race" : "Asian", "Language Proficiency" : "English Dominant", "Popularity" : "Very Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral"},
      { "origStudId" : "bi49C8ERtr2Mb2QMk", "data_x" : "0", "data_y" : "420", "envId" : envId, "info" : { "name" : "Tama", "Gender" : "Girl", "SES" : "Lower", "Race" : "Native", "Language Proficiency" : "English Dominant", "Popularity" : "Very Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral" },
      { "origStudId" : "dEL7gyWuoFJNZrg82", "data_x" : "230", "data_y" : "420", "envId" : envId, "info" : { "name" : "Thomas", "Gender" : "Boy", "SES" : "Higher", "Race" : "Asian", "Language Proficiency" : "Emergent Multilingual", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral" },
      { "origStudId" : "eu2EALdccbuqZCNy8", "data_x" : "690", "data_y" : "240", "envId" : envId, "info" : { "name" : "Monet", "Gender" : "Girl", "SES" : "Higher", "Race" : "Black", "Language Proficiency" : "English Dominant", "Popularity" : "Very Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral" },
      { "origStudId" : "jwjYy8uqDhbGGfXch", "data_x" : "690", "data_y" : "180", "envId" : envId, "info" : { "name" : "Lark", "Gender" : "Girl", "SES" : "Higher", "Race" : "White", "Language Proficiency" : "English Dominant", "Popularity" : "Very Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral" },
      { "origStudId" : "kDDPen8uSXP2SbeNP", "data_x" : "0", "data_y" : "120", "envId" : envId, "info" : { "name" : "Faye", "Gender" : "Girl", "SES" : "Higher", "Race" : "Asian", "Language Proficiency" : "English Dominant", "Popularity" : "Very Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral" },
      { "origStudId" : "nKcxTyae8NrzMcXY6", "data_x" : "230", "data_y" : "0", "envId" : envId, "info" : { "name" : "Elan", "Gender" : "Boy", "SES" : "Lower", "Race" : "Native", "Language Proficiency" : "Emergent Multilingual", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral" },
      { "origStudId" : "o6XtJXyFbp4jnB87x", "data_x" : "230", "data_y" : "120", "envId" : envId, "info" : { "name" : "Garrett", "Gender" : "Boy", "SES" : "Higher", "Race" : "White", "Language Proficiency" : "English Dominant", "Popularity" : "Very Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral" },
      { "origStudId" : "q6NYoymnPEjpZs72b", "data_x" : "0", "data_y" : "300", "envId" : envId, "info" : { "name" : "Nia", "Gender" : "Girl", "SES" : "Higher", "Race" : "Black", "Language Proficiency" : "English Dominant", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral" },
      { "origStudId" : "qGENFvnCBMc9BaCKK", "data_x" : "690", "data_y" : "420", "envId" : envId, "info" : { "name" : "Zahra", "Gender" : "Girl", "SES" : "Higher", "Race" : "Black", "Language Proficiency" : "English Dominant", "Popularity" : "Very Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral" },
      { "origStudId" : "rr7qSCqvjS8Lc6qxt", "data_x" : "460", "data_y" : "300", "envId" : envId, "info" : { "name" : "Parker", "Gender" : "Boy", "SES" : "Higher", "Race" : "White", "Language Proficiency" : "English Dominant", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral" },
      { "origStudId" : "tTHWRjCLpppGZz2kD", "data_x" : "690", "data_y" : "300", "envId" : envId, "info" : { "name" : "Phoung", "Gender" : "Girl", "SES" : "Lower", "Race" : "Asian", "Language Proficiency" : "Emergent Multilingual", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral" },
      { "origStudId" : "yeJFGefprSETvo9SL", "data_x" : "460", "data_y" : "60", "envId" : envId, "info" : { "name" : "Janelle", "Gender" : "Girl", "SES" : "Higher", "Race" : "Black", "Language Proficiency" : "English Dominant", "Popularity" : "Not-As-Popular" }, "userId" : "NjGRSNrT67gFP4Lr8", "author" : "niral" },
    ];

    let subjParams = {
      label0: 'Gender',
      parameter0: 'Boy, Girl, Nonbinary',
      label1: 'SES',
      parameter1: 'Higher, Lower',
      label2: 'Race',
      parameter2: 'Asian, Black, Latinx, Native, White, Mixed, Other',
      label3: 'Language Proficiency',
      parameter3: 'English Dominant, Emergent Multilingual',
      label4: 'Popularity',
      parameter4: 'Very Popular, Not-As-Popular',
      envId: 'WP2Eui4s8CF4HJwRK',
      parameterPairs: 5
    };
    let seqParams = {
      label0: 'Student Talk (Type)',
      parameter0: 'Explanation, Procedural, Factual/Recall',
      label1: 'Student Talk (Length)',
      parameter1: 'Extended Contribution, Brief Contribution',
      label2: 'Teacher Question (Type)',
      parameter2: 'Explanation, Procedural, Factual/Recall',
      label3: 'Teacher Wait Time',
      parameter3: 'Long, Short',
      label4: 'Teacher Tone',
      parameter4: 'Enthusiastic, Neutral, Dismissive',
      envId: 'WP2Eui4s8CF4HJwRK',
      parameterPairs: 5
    };

    subjParams.envId = envId;
    Meteor.call('importSubjParameters', subjParams, function(error, result) {
      if (error) {
        throw new Meteor.Error(error.error, error.reason)
      }
    });

    seqParams.envId = envId;
    Meteor.call('importSeqParameters', seqParams, function(error, result) {
      if (error) {
        throw new Meteor.Error(error.error, error.reason)
      }
    });

    subjects.forEach(function(subj) {
      Meteor.call('subjectInsert', subj);
    });

    observations.forEach(function(obs) {
      Meteor.call('observationInsert', obs, function(error, result) {
        let newObsId = result._id;
        let obsSequences = sequences.find(seq => seq.origObsId === obs.origObsId);
        obsSequences.sequences.forEach(function(sequence) {
          let newStud = Subjects.findOne({origStudId: sequence.info.studentId, envId: envId})
          sequence.obsId = newObsId;
          sequence.info.studentId = newStud._id;
          Meteor.call('sequenceInsert', sequence, function(err, ret) {
            return 0;
          })
        })
      })
    });

    return {
      _id: envId
    };
  },

  environmentDelete: function(envId) {
    checkAccess(envId, 'environment', 'delete');

    Environments.remove({
      _id: envId
    })
    Observations.remove({
      envId: envId
    })
    Sequences.remove({
      envId: envId
    })
    Subjects.remove({
      envId: envId
    })
    SubjectParameters.remove({
      'children.envId': envId
    })
    SequenceParameters.remove({
      'children.envId': envId
    })
  },

  environmentRename: function(args) {
    checkAccess(args.envId, 'environment', 'edit');

    return !!Environments.update({'_id': args.envId}, {$set: {'envName': args.envName}});
  },

  environmentDuplicate: function(args) {
    checkAccess(args.sourceEnvId, 'environment', 'view');

    // if (args.import_students && !args.import_parameters) {
    //   throw new Meteor.Error('duplicate_error', 'You cannot import students without importing parameters.')
    // }

    const env_values = {
      envName: args.envName
    };
    Meteor.call('environmentInsert', env_values, function(error, result) {
      if (error) {
        throw new Meteor.Error(error.error, error.reason)
      }
      const new_env = result;

      Meteor.call('exportSubjParameters', args.sourceEnvId, function(error, result) {
        if (error) {
          throw new Meteor.Error(error.error, error.reason)
        }

        result.envId = new_env._id;

        Meteor.call('updateSubjParameters', result, function(error, result) {
          if (error) {
            throw new Meteor.Error(error.error, error.reason)
          }
        })
      });

      Meteor.call('exportSeqParameters', args.sourceEnvId, function(error, result) {
        if (error) {
          throw new Meteor.Error(error.error, error.reason)
        }

        result.envId = new_env._id;

        Meteor.call('importSeqParameters', result, function(error, result) {
          if (error) {
            throw new Meteor.Error(error.error, error.reason)
          }
        })
      });

      if (args.import_students) {
        let students = Subjects.find({envId: args.sourceEnvId}).fetch();
        for (let s_index in students) {
          if (!students.hasOwnProperty(s_index)) {
            continue
          }
          const student = students[s_index];

          const subject = {
            data_x: student.data_x,
            data_y: student.data_y,
            envId: new_env._id,
            info: student.info
          };

          Meteor.call('subjectInsert', subject, function(error, result) {
            if (error) {
              throw new Meteor.Error(error.error, error.reason)
            }
          });
        }
      }
    });
  },

  environmentImportShared: function(shareId) {
    checkAccess(shareId, 'shared_environment', 'view');

    let shared_env = SharedEnvironments.findOne({_id:shareId});

    const env_values = {
      envName: shared_env.envName
    };
    let envId = Meteor.call('environmentInsert', env_values, function(error, result) {
      if (error) {
        throw new Meteor.Error(error.error, error.reason)
      }
      const new_env = result;

      console.log(shared_env);
      shared_env.subjectParameters.envId = new_env._id;
      shared_env.subjectParameters.children.envId = new_env._id;

      Meteor.call('importSubjParameters', shared_env.subjectParameters.children, function(error, result) {
        if (error) {
          throw new Meteor.Error(error.error, error.reason)
        }
        else {
          console.log('sharing students check:', shared_env.shareStudents);
          if (shared_env.shareStudents) {
            console.log('sharing students passed, copying the following students:', shared_env.students);
            let students = shared_env.students;
            for (let s_index in students) {
              if (!students.hasOwnProperty(s_index)) {
                continue
              }
              const student = students[s_index];

              const subject = {
                data_x: student.data_x,
                data_y: student.data_y,
                envId: new_env._id,
                info: student.info
              };

              Meteor.call('subjectInsert', subject, function(error, result) {
                if (error) {
                  throw new Meteor.Error(error.error, error.reason)
                }
              });
            }
          }
        }
      });

      shared_env.sequenceParameters.envId = new_env._id;
      shared_env.sequenceParameters.children.envId = new_env._id;

      Meteor.call('importSeqParameters', shared_env.sequenceParameters.children, function(error, result) {
        if (error) {
          throw new Meteor.Error(error.error, error.reason)
        }
      });

      return new_env._id
    });
    return {
      _id: envId,
    }
  },

  exportAllParams: function(envId) {
    checkAccess(envId, 'environment', 'view');

    var seqParams = SequenceParameters.findOne({'children.envId': envId}) || null;
    var subjParams = SubjectParameters.findOne({'children.envId': envId}) || null;

    if (seqParams == null && subjParams == null) { return {} };

    var allParams = {};
    if (seqParams != null){
      allParams['sequence'] = seqParams['children'];
    }
    if (subjParams != null) {
      allParams['subject'] = subjParams['children'];
    }

    return allParams;

  },

  environmentModifyParam: function(envId) {
    checkAccess(envId, 'environment', 'edit');

    var env = Environments.update({'_id': envId}, {$set: {'lastModifiedParam': new Date()}});
  },

  environmentModifyObs: function(envId) {
    checkAccess(envId, 'environment', 'edit');

    var env = Environments.update({'_id': envId}, {$set: {'lastModifiedObs': new Date()}});
  },

  updateInputStyle: function(obj) {
    checkAccess(envId, 'environment', 'edit');

    var env = Environments.update({'_id':obj.envId}, {$set: {'inputStyle':obj.inputStyle}});
  }
});
