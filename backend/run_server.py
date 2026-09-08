import socket
import uvicorn
import json
import os
from pathlib import Path
from app.main import app

def run():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(('127.0.0.1', 0))
    port = sock.getsockname()[1]
    
    # Save backend port info so frontend/tools can read it
    port_file = Path(__file__).parent.parent / "backend_port.json"
    with open(port_file, "w") as f:
        json.dump({"port": port, "url": f"http://127.0.0.1:{port}"}, f)
        
    print(f"============================================================")
    print(f"  QDS FastAPI Backend successfully bound to port {port}")
    print(f"  API URL: http://127.0.0.1:{port}")
    print(f"  Docs: http://127.0.0.1:{port}/docs")
    print(f"============================================================")
    
    config = uvicorn.Config(app=app, log_level="info", lifespan="on")
    server = uvicorn.Server(config)
    server.run(sockets=[sock])

if __name__ == "__main__":
    run()
