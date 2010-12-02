When /^I GET a document$/ do
  visit 'http://localhost:5984/deploy_planner_2/_design/docs'
end

Then /^I should have JSON$/ do
  response_body.should contain('{')
end
