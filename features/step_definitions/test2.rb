Before do
  @created = []
end

After do
  @created.each do |item|
    result = @session.delete(item["id"]+"?rev="+item["rev"])
  end
end

Given /^a couchdb database at "([^"]*)"$/ do |couchdb_baseurl|
  @couchdb_baseurl = couchdb_baseurl
  @session = Patron::Session.new
  @session.base_url = "#{couchdb_baseurl}/"
end

Given /^authenticated as "([^"]*)"$/ do |auth_data|
  userpass = auth_data.split(":")
  @session.username = userpass[0]
  @session.password = userpass[1]
  response = @session.get ""
  response.body.match('\{"db_name"').should be_true
end


Given /^a defined Design Document "([^"]*)"$/ do |design_doc_id|
  response = @session.get "#{design_doc_id}"
  response.body.match('\{').should be_true;
end

Given /^this documents$/ do |string|
  body =<<-EOB
  {"all_or_nothing": false, "docs": #{string}}
  EOB

  response = @session.post("_bulk_docs", body,
                {
                  'Content-Type' => 'application/json'
                })
  response.body.match('\[\{').should be_true
  results = JSON.parse(response.body)

  results.each { |item| @created.push(item) if item["error"].nil? }
 
  results.each do |item|
    item["error"].should be_nil
  end
end

When /^I GET the url "([^"]*)"$/ do |view|
  response = @session.get view
  @view_result = JSON.parse(response.body)
end

Then /^I should have the response with (\d+) rows$/ do |total_rows|
  if @view_result["total_rows"] # NON REDUCED VIEW
    @view_result["total_rows"].to_i.should eql(total_rows.to_i) 
  else # REDUCED VIEW
    @view_result["rows"].length.should eql(total_rows.to_i)
  end
end

Then /^with keys "([^"]*)"$/ do |expected_keys|
  result_keys = @view_result["rows"].map { |i| i["key"] }

  expected_keys.split(",").should eql(result_keys)
end

Then /^values "([^"]*)"$/ do |expected_values|
  result_values = @view_result["rows"].map { |i| i["value"].to_s }

  expected_values.split(",").should eql(result_values)
end
