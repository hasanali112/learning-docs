# FastAPI এর ভেতরের pattern

FastAPI দিয়ে কাজ করলে তুমি না জেনেই প্রতিদিন কয়েকটা design pattern ব্যবহার করছো। নাম জানলে বোঝা যায় এগুলো কেন এভাবে বানানো, আর নিজের কোডেও একই ধারণা কাজে লাগানো যায়।

## এক নজরে

| FastAPI এর জিনিস | Pattern | কাজ |
|---|---|---|
| `Depends(...)` | Dependency Injection | function এর যা লাগবে, FastAPI বানিয়ে হাতে দেয় |
| `app.dependency_overrides` | Strategy বদলানো | test এ আসল জিনিসের বদলে নকল বসানো |
| Middleware | Chain of Responsibility + Decorator | প্রতিটা request কয়েকটা স্তর পার হয়, যেকোনো স্তর থামাতে পারে |
| `@app.get(...)` | Registration (registry) | route তালিকায় function এর নাম লেখানো, GoF decorator না |
| `lifespan` + `app.state` | process প্রতি Singleton | DB pool, HTTP client একবার বানিয়ে সবাই ব্যবহার |
| ASGI | Adapter / port | যেকোনো ASGI server যেকোনো ASGI app চালাতে পারে |
| Pydantic model | DTO (Data Transfer Object) | সীমানায় data এর আকার ঠিক করা আর যাচাই |
| `exception_handler` | Registry / Strategy | কোন error এ কোন উত্তর, সেটা আলাদা করে রাখা |

## Dependency Injection: `Depends`

function নিজে তার দরকারি জিনিস বানায় না। সে শুধু বলে "আমার এটা লাগবে", FastAPI বানিয়ে দেয়।

```python
def get_courier(settings: Settings = Depends(get_settings)) -> Courier:
    return make_courier(settings.courier_name, settings.courier_creds)

@app.post("/orders/{order_id}/ship")
def ship(order_id: int, courier: Courier = Depends(get_courier)):
    return {"tracking": courier.book(order_id, "...")}
```

`ship` জানে না courier কোথা থেকে এলো। এখানে [Factory](/design-patterns/factory) (`make_courier`) আর [Singleton](/design-patterns/singleton) (`get_settings`) দুটোই কাজ করছে, আর DI তাদের জোড়া লাগাচ্ছে।

### test এ বদলানো

```python
class FakeCourier:
    def book(self, order_id: int, address: str) -> str:
        return "FAKE-1"

app.dependency_overrides[get_courier] = lambda: FakeCourier()
```

এখন test এ আসল courier এর API তে কোনো request যায় না। এটা runtime এ [Strategy](/design-patterns/strategy) বদলানোর মতোই।

## Middleware: Chain of Responsibility

প্রতিটা middleware request হাতে পায়, চাইলে নিজেই উত্তর দিয়ে থামায়, নাহলে `call_next` দিয়ে পরের জনকে দেয়:

```python
@app.middleware("http")
async def require_api_key(request: Request, call_next):
    if request.headers.get("x-api-key") != settings.api_key:
        return JSONResponse({"detail": "unauthorized"}, status_code=401)   # এখানেই থামে
    return await call_next(request)                                        # পরের জনকে দাও

@app.middleware("http")
async def timing(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    response.headers["x-time"] = f"{time.perf_counter() - start:.3f}"
    return response
```

`require_api_key` দরকার হলে থামিয়ে দেয়, এটা [Chain of Responsibility](/design-patterns/chain-of-responsibility)। `timing` সবসময় পরের জনকে ডাকে আর আগে-পরে কিছু যোগ করে, এটা [Decorator](/design-patterns/decorator) এর মতো। দুটোই একই middleware ব্যবস্থার ভেতরে।

::: warning middleware এর ক্রম
`@app.middleware` দিয়ে যোগ করা middleware এ **যেটা পরে যোগ হয়, সেটা বাইরের দিকে বসে** আর request আগে পায়। উপরের কোডে `timing` আগে request পায়, তারপর `require_api_key`। ক্রম গুরুত্বপূর্ণ হলে একবার পরীক্ষা করে নাও।
:::

## `@app.get` decorator না, registration

```python
@app.get("/health")
def health():
    return {"status": "ok"}
```

দেখতে decorator, কিন্তু `health` function কে মোড়ানো হয় না। FastAPI শুধু route এর তালিকায় লিখে রাখে "GET /health এ এই function চলবে", তারপর function টা যেমন ছিল তেমনই ফেরত দেয়। এটাকে বলে **registration** বা **registry** pattern। Python এর `@` আর Decorator pattern এর পার্থক্য: [Decorator](/design-patterns/decorator)।

## `lifespan`: process প্রতি একটা

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http = httpx.AsyncClient()    # server চালুর সময় একবার
    yield
    await app.state.http.aclose()           # বন্ধের সময়
```

পুরো app এ একটাই `httpx.AsyncClient`, সব request সেটাই ব্যবহার করে। মনে রাখো, uvicorn কে কয়েকটা worker দিলে **প্রতিটা worker process এর নিজের** একটা থাকে।

## ASGI: Adapter আর port

ASGI হলো একটা নিয়ম: server আর Python app কীভাবে কথা বলবে। এই নিয়ম মানলে uvicorn, Hypercorn, Granian, যেকোনো server যেকোনো ASGI app (FastAPI, Starlette, Django) চালাতে পারে। এটা [Hexagonal](/architecture/layered-hexagonal) এর port এর মতো: একটা চুক্তি, যার দুই পাশে যে কেউ বসতে পারে। বিস্তারিত: [uvicorn, Starlette, Pydantic](/fastapi/core-parts)।

## Pydantic model: DTO

```python
class OrderIn(BaseModel):       # বাইরে থেকে যা আসবে
    product: str
    qty: int

class OrderOut(BaseModel):      # বাইরে যা যাবে
    id: int
    status: str
```

API এর সীমানায় data এর আকার ঠিক করা আর যাচাই করা, এটা **DTO (Data Transfer Object)** এর কাজ। এটা GoF এর ২৩টার মধ্যে নেই, কিন্তু খুব পরিচিত pattern। `OrderIn` আর database এর model আলাদা রাখলে database বদলালেও API এর আকার স্থির থাকে।

## কোথা থেকে কোথায়

FastAPI নিজে এই pattern গুলো দিয়ে বানানো। তুমি নিজের কোডেও একই জিনিস করতে পারো: courier এর জন্য [Adapter](/design-patterns/adapter), চার্জের জন্য [Strategy](/design-patterns/strategy), order নিশ্চিত করার জন্য [Facade](/design-patterns/facade), আর সবগুলো জোড়া লাগাতে `Depends`।
