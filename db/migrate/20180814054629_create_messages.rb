class CreateMessages < ActiveRecord::Migration[5.2]
  def change
    create_table :messages do |t|
      t.string :key
      t.string :sig
      t.string :author
      t.string :msgtype
      t.integer :seq, default: 0
      t.string :previous
      t.jsonb :content
      t.bigint :timestamp, default: 0
      t.bigint :localtime, default: 0
      t.text :raw
      t.boolean :blocked, default: false
      t.datetime :created_at, null: false
    end
  end
end
