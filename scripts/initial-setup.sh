#!/bin/bash

###############################################################################
# Initial Server Setup Script
# Run this once on a fresh Oracle Cloud Ubuntu VM
###############################################################################

set -e

echo "🚀 Starting Initial Server Setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo apt install docker-compose -y
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install nginx -y

# Install Certbot for SSL
echo "🔒 Installing Certbot..."
sudo apt install certbot python3-certbot-nginx -y

# Install Git
echo "📚 Installing Git..."
sudo apt install git -y

# Setup Firewall
echo "🔥 Configuring UFW Firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Install fail2ban for SSH protection
echo "🛡️ Installing Fail2ban..."
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create project directory
echo "📁 Creating project directory..."
mkdir -p ~/ProjekAbsensi
mkdir -p ~/backups

# Setup swap (for better memory management)
echo "💾 Setting up swap..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap enabled"
fi

echo ""
echo "✅ Initial setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone your repository: git clone <your-repo-url> ~/ProjekAbsensi"
echo "2. Configure environment variables"
echo "3. Run deploy.sh script"
echo ""
echo "⚠️  IMPORTANT: Logout and login again for Docker group permissions to take effect"
