class Api::AccountsController < ApplicationController

  def add_account
    @account = Account.find_or_create_by(pubkey: params[:pubkey])
    render template: '/api/account'
  end

  def get_account
    @account = Account.find_by(pubkey: params[:pubkey])
    if @account
      render template: '/api/account'
    else
      render json: { account: nil }
    end
  end

  def get_accounts
    @accounts = Account.all
    render template: '/api/accounts'
  end

  def has_contact
    contact = Contact.find_by(source: params[:source], target: params[:target])
    render json: {following: !!contact}
  end

end
