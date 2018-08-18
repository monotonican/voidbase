FactoryBot.define do
  factory :message do
    key "MyString"
    sig "MyString"
    author "MyString"
    msgtype "MyString"
    seq 1
    previous "MyString"
    content ""
    timestamp ""
    localtime ""
    raw "MyText"
    blocked false
  end
end
