class CreateContacts < ActiveRecord::Migration[5.2]
  def change
    create_table :contacts do |t|
      t.string :source
      t.string :target
      t.boolean :following
      t.boolean :blocking

      t.timestamps
    end
  end
end
