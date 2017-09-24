# Events

## Actions

```ts
class App {

  @on(olyReactEvents.ACTION_BEGIN)
  onActionBegin(ev: IActionBeginEvent) {
  
  }
  
  @on(olyReactEvents.ACTION_ERROR)
  onActionError(ev: IActionErrorEvent) {
  
  }
  
  @on(olyReactEvents.ACTION_SUCCESS)
  onActionSuccess(ev: IActionSuccessEvent) {
  
  }
}
```

## Transitions

```ts
class App {

  @on(olyReactRouterEvents.TRANSITION_BEGIN)
  onTransitionBegin(ev: ITransitionBeginEvent) {
  
  }
  
  @on(olyReactRouterEvents.TRANSITION_END)
  onTransitionEnd(ev: ITransitionEndEvent) {
  
  }
}
```
