class AddAccountUpdated < ActiveRecord::Migration[5.2]
  def change
    add_column :accounts, :updated, :integer, default: 0
    add_column :accounts, :state, :string, default: 'local'
  end
end
