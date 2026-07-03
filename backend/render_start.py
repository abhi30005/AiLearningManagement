import os

import uvicorn


if __name__ == "__main__":
    port = int(os.getenv("PORT", os.getenv("DEFAULT_API_PORT", "8000")))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
