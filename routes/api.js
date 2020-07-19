/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const {Issue} = require('../models/models.js');
const {Project} = require('../models/models.js');


module.exports = function (app) {

  app.route('/api/issues/:project')
    .get(function (req, res){
      var project = req.params.project;
     // console.log(req.query);
 
      Issue.find({project_name: project.toString()}).then(function(data) { 
       // api/issues/:project?issue_title=...&issue_text=...&created_by=...&assigned_to=...&status_text=...&created_on=...&updated_on=...&open=...
       if (req.query.queryString && req.query.queryString.length > 0) {
         const queryParameters = req.query.queryString.split("&");
         const keys = [];
         const values =[];
         
         //console.log(queryParameters);
         queryParameters.forEach(parameter => {
           keys.push(parameter.split("=")[0]);
           values.push(parameter.split("=")[1]);
         });
         
         // substitute string with a boolean
         for (let i = 0; i < keys.length; i++) {
           if (keys[i] === "open") {
             if (values[i] === "true") {
               values[i] = true;
             } else if (values[i] === "false") {
               values[i] = false;
             }
           }
         }
         
         
         let filteredData = data;
         let wrongDateFormat = false;
         for (let j = 0; j < keys.length; j++) {
           //filteredData = filteredData.filter(element => element[keys[j]] == values[j]);
           filteredData = filteredData.filter(element => {
              /* Date is accepted in the query is accepted in the following format: yyyy-mm-dd
                 Since we compare only days on which issue was created or updated and not the exact time, 
                 hours, minutes, seconds and milliseconds stored in the database are set to zero*/
             if (keys[j] === "created_on" || keys[j] === "updated_on") {
               //const regex=/^\d{4}-\d{2}-\d{2}$/;
               return element[keys[j]].setHours(0,0,0,0) == Date.parse(values[j]);
             } else {
               return element[keys[j]] == values[j];
             }
            });
         }
        res.json(filteredData);
        } else {
          res.json(data);
        }
      });
    })
    .post(function (req, res){
      var project = req.params.project;
      if (req.body.issue_title === "" || req.body.issue_text === "" || req.body.created_by === "") {
        res.json(`data for required field is not provided`);
      } else {
      // find project by name; if nothing is found, create a new project
        Project.find({project_name: project.toString()}).then(async function(projects) { 
          if (projects.length == 0) {
            const newProject = new Project({
            project_name: project.toString(),
            issues: []
            });
            await newProject.save();

            const issue = new Issue ({
              issue_title: req.body.issue_title,
              issue_text: req.body.issue_text,
              created_by: req.body.created_by,
              assigned_to: req.body.assigned_to,
              status_text: req.body.status_text,
              created_on: new Date().toISOString(),
              updated_on: new Date().toISOString(),
              project_name: project.toString(),
              project_id: newProject._id
            });
            await issue.save();

            newProject.issues.push(issue._id);
            await newProject.save(); 
        // if project has already been created
        } else {
          const issue = new Issue ({
            issue_title: req.body.issue_title,
            issue_text: req.body.issue_text,
            created_by: req.body.created_by,
            assigned_to: req.body.assigned_to,
            status_text: req.body.status_text,
            created_on: new Date().toISOString(),
            updated_on: new Date().toISOString(),
            project_name: project.toString(),
            project_id: projects[0]._id
          });
          await issue.save();
          
          projects[0].issues.push(issue._id);
          await projects[0].save();
        }
      
        // display an issue after it is created
        Issue.find({project_name: project.toString()}).then(function(data) { 
          res.json(data);
        });
      
        });
      }
    })
    
    .put(function (req, res){
      var project = req.params.project;
      // update issue if it is closed
      if (req.body.open) {
        Issue.findByIdAndUpdate(req.body._id, {$set:{open: req.body.open, updated_on: new Date().toISOString()}}, {new: true}).then(function(data) { 
            res.json({
              message: `successfully updated ${req.body._id}`,
              data: data
                     });
          });
      }
    
      //update issue if any of its fields are updated
      //console.log(req.body);
      if (req.body.issue_title == "" && req.body.issue_text == ""
          && req.body.created_by == "" && req.body.assigned_to == ""
          && req.body.status_text == "") {
          res.json(`no updated field sent`);
      } else {
          if (!req.body.open) {
             Issue.findByIdAndUpdate(req.body._id, {$set:{ 
                                             updated_on: new Date().toISOString(),
                                             issue_title: req.body.issue_title, 
                                             issue_text: req.body.issue_text,
                                             created_by: req.body.created_by,
                                             assigned_to: req.body.assigned_to,
                                             status_text: req.body.status_text
                                                 }, 
                                            }, 
                             {new: true}).then(function(data) { 
            if (!data) {
              res.json(`could not update ${req.body._id}`);
            } else {
              res.json({
                 message: `successfully updated ${req.body._id}`,
                data: data
              });
            }
          });
        } 
      }
    })
    
    .delete(async function (req, res){
      var project = req.params.project;
      if  (!req.body._id) {
        res.json(`id error, failed: could not delete  ${req.body._id}`);
      } else {
        await Issue.findByIdAndDelete(req.body._id).then(function(data){
          res.json(`success: deleted ${req.body._id}`);
        });
    
        await Project.find({project_name: project.toString()}).then(function(data) { 
          data[0].issues = data[0].issues.filter(id => id != req.body._id);
        }); 
      }
    
    });
    
};
