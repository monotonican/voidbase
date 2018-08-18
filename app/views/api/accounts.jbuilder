json.accounts @accounts do |account|
  json.partial! '/api/account', account: account
end
