# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  config.vm.box = "ubuntu/xenial64"

  # ruby code to find project name
  service_name = File.basename(__dir__)

  # assign vagrant vm the project name
  config.vm.define service_name do |t|
  end

  # disable default behavior
  config.vm.synced_folder ".", "/vagrant", disabled: true
  # sync project into folder under home directory
  config.vm.synced_folder ".", "/home/ubuntu/#{service_name}"
  
  config.vm.provision "shell", privileged: false, inline: <<-SHELL
    sudo apt-get update
    sudo apt-get upgrade -y
    sudo apt-get install -y git
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash
    curl -sSL https://get.docker.com/ | sh
    sudo usermod -aG docker $USER
    source $HOME/.nvm/nvm.sh
    echo "export NVM_DIR=$HOME/.nvm" >> $HOME/.profile
    echo "[ -s \"$NVM_DIR/nvm.sh\" ] && \. \"$NVM_DIR/nvm.sh\"" >> $HOME/.profile
    nvm install node
    cd $HOME/#{service_name} && npm run setup
  SHELL
end
