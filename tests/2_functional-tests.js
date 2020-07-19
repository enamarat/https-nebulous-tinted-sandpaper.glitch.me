/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

let savedId = null;

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
           if (err) {
           console.error(err);
            return done(err);
          }
          assert.equal(res.status, 200);
          //fill me in too!
          savedId = res.body[0]._id;
        
          assert.exists(res.body[0].issue_title);
          assert.exists(res.body[0].issue_text) 
          assert.exists(res.body[0].created_by);
          assert.exists(res.body[0].assigned_to);
          assert.exists(res.body[0].status_text);
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title2',
          issue_text: 'text2',
          created_by: 'Functional Test - Required fields filled in'
        })
        .end(function(err, res){
           if (err) {
           console.error(err);
            return done(err);
          }
          assert.equal(res.status, 200);
          assert.exists(res.body[0].issue_title);
          assert.exists(res.body[0].issue_text) 
          assert.exists(res.body[0].created_by);
          done();
        });
      });
      
      test('Missing required fields', function(done) {
         chai.request(server)
        .post('/api/issues/test')
        .send({
           issue_title:"",
            issue_text:"",
            created_by:""
        })
        .end(function(err, res){
           if (err) {
           console.error(err);
            return done(err);
          }
           //console.log(res);
          assert.equal(res.status, 200);
          assert.equal(res.body, 'data for required field is not provided');
          done();
        });
      });
      
    });
    
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: savedId,
          issue_title:"",
          issue_text:"",
          created_by:"", 
          assigned_to:"",
          status_text:""
              })
        .end(function(err, res){
           if (err) {
           console.error(err);
            return done(err);
          }
         //  console.log(res.body[res.body.length-1]);
         assert.equal(res.status, 200);
         assert.equal(res.body, 'no updated field sent');
       
          done();
        });
      });
      
      test('One field to update', function(done) {
         chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: savedId,
          issue_title:"Updated_title"
              })
        .end(function(err, res){
           if (err) {
           console.error(err);
            return done(err);
          }
         assert.equal(res.status, 200);
         assert.equal(res.body.data.issue_title, `Updated_title`);
         done();
         });
      });
      
      test('Multiple fields to update', function(done) {
          chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: savedId,
          issue_title:"Updated_title",
          issue_text:"Updated_text",
          created_by:"Updated_author", 
          assigned_to:"Updated_employee",
          status_text:"Updated_status" 
              })
        .end(function(err, res){
           if (err) {
           console.error(err);
            return done(err);
          }
          assert.equal(res.status, 200);
          assert.equal(res.body.data.issue_title, `Updated_title`);
          assert.equal(res.body.data.issue_text, `Updated_text`);
          assert.equal(res.body.data.created_by, `Updated_author`);
          assert.equal(res.body.data.assigned_to, `Updated_employee`);
          assert.equal(res.body.data.status_text, `Updated_status`);
          done();
         });
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
         chai.request(server)
        .get('/api/issues/test')
        .query({queryString:"issue_title=Title2"})
        .end(function(err, res){
             if (err) {
           console.error(err);
            return done(err);
          }
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body[0].issue_title, 'Title2');
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
          chai.request(server)
        .get('/api/issues/test')
        .query({queryString:"issue_title=Title2&issue_text=text2"})
        .end(function(err, res){
             if (err) {
           console.error(err);
            return done(err);
          }
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body[0].issue_title, 'Title2');
          assert.equal(res.body[0].issue_text, 'text2');
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({})
          .end(function(err, res){
            if(err){
              console.error(err);
              return done(err);
            }
            assert.equal(res.body, 'id error, failed: could not delete  undefined');
            done();
          });
      });
      
      test('Valid _id', function(done) {
         chai.request(server)
          .delete('/api/issues/test')
          .send({ _id: "5f142d07130c313e1c0e94fe"})
          .end(function(err, res){
            if(err){
              console.error(err);
              return done(err);
            }
            assert.equal(res.body, `success: deleted 5f142d07130c313e1c0e94fe`);
            done();
          });
      });
    });

});
