class Api::MessagesController < ApplicationController

  def get_message
    @message = Message.find_by(key: params[:key])
    render template: '/api/message'
  end

  def get_messages_by_root
    @messages = Message.where('content @> ?', {root: params[:root]}.to_json).where(blocked: false, msgtype: 'reply').includes(:account).order('id desc').limit(20)
    render template: '/api/messages'
  end

  def get_messages_by_channel
    @messages = Message.where('content @> ?', {channel: params[:channel]}.to_json).where(blocked: false, msgtype: 'post').includes(:account).order('id desc').limit(20)
    if params[:since]
      @messages = @messages.where("id < ?", params[:since])
    end
    render template: '/api/messages'
  end

  def get_messages_by_user
    @messages = Message.where(author: params[:key], blocked: false, msgtype: 'post').order('id desc').limit(20)
    render template: '/api/messages'
  end

  def get_home_feed
    @messages = Message.where(blocked: false, msgtype: 'post').includes(:account).order('id desc').limit(20)
    # @messages = Message.where(blocked: false, msgtype: 'post').includes(:account).order('content->\'channel\' desc').limit(20)
    if params[:pubkey]
      @messages = @messages.where(author: params[:pubkey])
    end
    if params[:since]
      @messages = @messages.where("id < ?", params[:since])
    end
    render template: '/api/messages'
  end

  def has_vote
    render template: '/api/message'
  end

  def votes
    @messages = Message.where(blocked: false, msgtype: 'vote').includes(:account).order('id desc').limit(20)
    render template: '/api/messages'
  end

  def get_channels
    render json: { channels: [] }
  end

  def add_message
    @message_json = JSON.parse(params[:message], :symbolize_names => true)
    @message = Message.find_by(key: @message_json[:key])
    account = Account.find_by(pubkey: @message_json[:author])

    if !@message
      @message = Message.create(@message_json)
      account.update(seq: @message_json[:seq], previous: @message_json[:key])
    end

    render template: '/api/message'
  end

  def upload
    digest = Base64.urlsafe_encode64(Digest::SHA2.file(params[:file].tempfile).digest)
    File.rename params[:file].tempfile.path, "public/uploads/#{digest}"
    render json: { result: 'ok', hash: digest, path: "/uploads/#{digest}" }
  end

end
