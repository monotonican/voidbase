class CreateSessions < ActiveRecord::Migration[5.2]
  def change
    create_table :sessions do |t|
      t.string "key"
      t.string "host"
      t.integer "port"
      t.integer "local_latest", default: 0
      t.integer "remote_latest", default: 0
      t.integer "failure", default: 0
      t.float "rtt", default: 0.0
      t.float "skew", default: 0.0
      t.boolean "active", default: true
      t.boolean "is_client", default: true
      t.datetime "state_change"
      t.datetime "created_at", null: false
      t.jsonb "state", default: "{}"
      t.jsonb "notes", default: "{}"
    end
  end
end
