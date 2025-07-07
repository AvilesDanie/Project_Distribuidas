import uvicorn
from app.main import app
from app.config.settings import settings

if __name__ == "__main__":
    uvicorn.run("run:app", host="0.0.0.0", port=settings.APP_PORT, reload=True)
