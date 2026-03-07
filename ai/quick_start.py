"""
VIBRANIUM AI - Quick Start Script
Automated setup and testing
"""

import subprocess
import sys
import os
from pathlib import Path

print("""
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║                    VIBRANIUM AI - Quick Start                        ║
║                                                                      ║
║                   AI Product Intelligence Platform                   ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
""")

def run_command(cmd, description):
    """Run a shell command with output"""
    print(f"\n📦 {description}")
    print(f"   Command: {cmd}")
    print("-" * 70)
    
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            check=True,
            text=True,
            capture_output=False
        )
        print(f"✓ {description} - SUCCESS")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} - FAILED")
        print(f"   Error: {e}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    print(f"\n🐍 Python Version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("✗ Python 3.8 or higher is required!")
        return False
    
    print("✓ Python version is compatible")
    return True

def main():
    print("\nStarting VIBRANIUM AI setup...\n")
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Check if we're in the right directory
    if not Path("requirements.txt").exists():
        print("\n✗ Error: requirements.txt not found!")
        print("   Please run this script from the 'ai' directory")
        sys.exit(1)
    
    # Step 1: Check pip
    print("\n" + "="*70)
    print("STEP 1: Checking pip")
    print("="*70)
    run_command(f"{sys.executable} -m pip --version", "Verify pip installation")
    
    # Step 2: Upgrade pip
    print("\n" + "="*70)
    print("STEP 2: Upgrading pip")
    print("="*70)
    run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrade pip")
    
    # Step 3: Install dependencies
    print("\n" + "="*70)
    print("STEP 3: Installing dependencies")
    print("="*70)
    print("\n⏳ This may take several minutes (downloading ML models)...")
    
    success = run_command(
        f"{sys.executable} -m pip install -r requirements.txt",
        "Install Python packages"
    )
    
    if not success:
        print("\n✗ Installation failed. Trying with --no-cache-dir...")
        success = run_command(
            f"{sys.executable} -m pip install --no-cache-dir -r requirements.txt",
            "Install Python packages (no cache)"
        )
    
    if not success:
        print("\n✗ Installation failed!")
        print("\nTroubleshooting:")
        print("1. Make sure you have internet connection")
        print("2. Try running: pip install --upgrade pip")
        print("3. Try installing packages individually")
        sys.exit(1)
    
    # Step 4: Check environment
    print("\n" + "="*70)
    print("STEP 4: Environment Configuration")
    print("="*70)
    
    if Path(".env").exists():
        print("✓ .env file found")
    else:
        print("ℹ No .env file found (optional)")
        print("  For AI generation, create .env with:")
        print("  GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxx")
        print("  GROQ_MODEL=llama-3.3-70b-versatile")
    
    # Step 5: Run system tests
    print("\n" + "="*70)
    print("STEP 5: Running System Tests")
    print("="*70)
    print("\n⏳ Loading AI models and running tests...")
    print("   (This may take 30-60 seconds on first run)\n")
    
    test_success = run_command(
        f"{sys.executable} test_system.py",
        "Run system tests"
    )
    
    # Final summary
    print("\n" + "="*70)
    print("SETUP COMPLETE")
    print("="*70)
    
    if test_success:
        print("""
✅ VIBRANIUM AI is ready to use!

📚 NEXT STEPS:

1. Start the API server:
   cd api
   python main.py

2. Access the API documentation:
   http://localhost:8000/docs

3. Test the endpoints:
   - Health check: GET /api/v1/health
   - Analyze product: POST /api/v1/analyze-product
   - Compare products: POST /api/v1/compare-products

4. Integrate with frontend:
   - API is configured for CORS with localhost:5173
   - Use the provided schemas for requests/responses

📖 For more information, see README.md

🚀 Happy building!
        """)
    else:
        print("""
⚠️ Setup completed but some tests failed.

This might be due to:
- Missing dependencies
- Model loading issues
- Network connectivity

Try running: python test_system.py

For help, check README.md
        """)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️ Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Unexpected error: {str(e)}")
        sys.exit(1)
