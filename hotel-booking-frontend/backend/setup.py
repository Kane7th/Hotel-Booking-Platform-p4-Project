#!/usr/bin/env python3
"""
Hotel Booking System Backend Setup Script
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return None

def main():
    print("🏨 Hotel Booking System Backend Setup")
    print("=" * 50)
    
    # Check if Python is available
    python_version = run_command("python --version", "Checking Python version")
    if not python_version:
        python_version = run_command("python3 --version", "Checking Python3 version")
        if not python_version:
            print("❌ Python is not installed or not in PATH")
            sys.exit(1)
    
    print(f"Python version: {python_version.strip()}")
    
    # Create virtual environment
    if not os.path.exists("venv"):
        run_command("python -m venv venv", "Creating virtual environment")
    
    # Activate virtual environment and install dependencies
    if os.name == 'nt':  # Windows
        activate_cmd = "venv\\Scripts\\activate"
        pip_cmd = "venv\\Scripts\\pip"
        python_cmd = "venv\\Scripts\\python"
    else:  # Unix/Linux/MacOS
        activate_cmd = "source venv/bin/activate"
        pip_cmd = "venv/bin/pip"
        python_cmd = "venv/bin/python"
    
    # Install dependencies
    run_command(f"{pip_cmd} install -r requirements.txt", "Installing Python dependencies")
    
    # Initialize database
    run_command(f"{python_cmd} init_db.py", "Initializing database with sample data")
    
    print("\n🎉 Setup completed successfully!")
    print("\nTo start the backend server:")
    print(f"1. Activate virtual environment: {activate_cmd}")
    print(f"2. Run the server: {python_cmd} app.py")
    print("\nThe server will be available at: http://localhost:5000")
    print("\nLogin credentials:")
    print("- Admin: username='admin', password='password123'")
    print("- User: username='john_doe', password='password123'")

if __name__ == "__main__":
    main()
