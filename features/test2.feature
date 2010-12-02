Feature: Documents by Type

So that I can list doc by types
As a a couchdb client
I want to query a design doc view 

Background:
  Given a couchdb database at "http://localhost:5984/deploy_planner_2"
    And authenticated as "admin:test123"
    And a defined Design Document "_design/docs"
    And this documents
       """
       [{"type":"type1", "val1": "test1"},
       {"type":"type2", "val2": "test3"},
       {"type":"type2", "val2": "test2"},
       {"type":"type3", "val3": "test3"}]
       """

Scenario: List all documents by type
  When I GET the url "_design/docs/_view/by_type?reduce=false"
  Then I should have the response with 4 rows
    And with keys "type1,type2,type2,type3"


Scenario: Count documents by type
  When I GET the url "_design/docs/_view/by_type?reduce=true&group=true"
  Then I should have the response with 3 rows
    And with keys "type1,type2,type3"
    And values "1,2,1"
