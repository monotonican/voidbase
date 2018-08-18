Rails.application.routes.draw do
  namespace 'api', defaults: {format: :json} do
    post 'add_account' => 'accounts#add_account'
    post 'get_account' => 'accounts#get_account'
    get  'get_message' => 'messages#get_message'
    post 'add_message' => 'messages#add_message'
    get  'get_messages_by_channel' => 'messages#get_messages_by_channel'
    get  'get_home_feed' => 'messages#get_home_feed'
  end
end
