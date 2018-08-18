json.(message, :id, :key, :sig, :author, :msgtype, :seq, :previous, :timestamp, :content)

json.attached do
  account = message.account
  json.name account.try(:name)
  json.image account.try(:image)
end
