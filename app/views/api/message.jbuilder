json.message do
  json.partial! '/api/message', message: @message
end
