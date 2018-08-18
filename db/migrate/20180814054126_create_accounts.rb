class CreateAccounts < ActiveRecord::Migration[5.2]
  def change
    create_table :accounts do |t|
      t.string :pubkey
      t.integer :seq, default: 0
      t.string :previous
      t.string :name
      t.string :image
      t.boolean :is_following, default: true
      t.boolean :is_blocking, default: false
      t.integer :messages_count, default: 0
      t.integer :contacts_count, default: 0
      t.datetime :created_at, null: false
    end
  end
end
