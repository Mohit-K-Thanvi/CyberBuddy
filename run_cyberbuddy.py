import subprocess
import time
import sys
import os
import signal

# Unified launcher for CyberBuddy
# Starts Backend (Uvicorn) and Frontend (Next.js)

def start_process(command, cwd):
    return subprocess.Popen(
        command, 
        cwd=cwd, 
        shell=True,
        stdout=sys.stdout,
        stderr=sys.stderr
    )

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print(f"[*] Starting backend server from {backend_dir}...")
    # Use sys.executable to ensure we use the same python interpreter (venv)
    # and run uvicorn as a module (-m uvicorn) to avoid PATH issues
    backend_cmd = f'"{sys.executable}" -m uvicorn main:app --reload'
    backend = start_process(backend_cmd, backend_dir)

    print("[*] Starting frontend development server...")
    frontend = start_process("npm run dev", frontend_dir)

    print("\n[SUCCESS] CyberBuddy is running!")
    print(" -> Backend: http://127.0.0.1:8000")
    print(" -> Frontend: http://localhost:3000")
    print("\nPress Ctrl+C to stop all servers.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[*] Stopping servers...")
        backend.terminate()
        frontend.terminate() # On Windows shell=True makes this tricky, but basic attempt
        
        # Force kill on windows if needed
        if sys.platform == "win32":
            subprocess.call(['taskkill', '/F', '/T', '/PID', str(backend.pid)])
            subprocess.call(['taskkill', '/F', '/T', '/PID', str(frontend.pid)])
            
        print("[*] Stopped.")

if __name__ == "__main__":
    main()