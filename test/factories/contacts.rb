FactoryBot.define do
  factory :contact do
    source "MyString"
    target "MyString"
    following false
    blocking false
  end
end
