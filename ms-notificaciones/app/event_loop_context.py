import asyncio

_loop_principal = None

def set_loop(loop: asyncio.AbstractEventLoop):
    global _loop_principal
    _loop_principal = loop

def get_loop() -> asyncio.AbstractEventLoop:
    return _loop_principal
