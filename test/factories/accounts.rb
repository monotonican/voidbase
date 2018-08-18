FactoryBot.define do
  factory :account do
    pubkey "MyString"
    seq 1
    previous "MyString"
    name "MyString"
    image "MyString"
    is_following false
    is_blocking false
    messages_count 1
    contacts_count 1
  end
end
