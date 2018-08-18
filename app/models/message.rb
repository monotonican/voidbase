class Message < ApplicationRecord
  belongs_to :account, primary_key: 'pubkey', foreign_key: "author"
end
