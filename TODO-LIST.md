
# TODO

- (docs) finish oly-docs step 1. **[IN PROGRESS]**
- (api) ApiException (External Exception with CODE) 
- (react) migrate react-router v4
- (security) test jwt and decorators
- (ws) create oly-ws: socket.io
- (core) add Exception everywhere **[IN PROGRESS]**
- (mapper) rename to oly-json
- (swagger) better api, error thrown and body returned 


```typescript
import { get } from "oly-http";
import { api } from "oly-swagger";

class MyCtrl {
  
  @get("/")
  @api({
    description: `This is blahblah`,
    throws: [NotFoundException],
    returns: SomethingResource
  })
  public async getSomething() {
    
  }
}

```
