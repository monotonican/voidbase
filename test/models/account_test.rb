require "test_helper"

describe Account do
  let(:account) { Account.new }

  it "must be valid" do
    value(account).must_be :valid?
  end
end
