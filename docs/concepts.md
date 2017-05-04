# Concepts

There is nothing new.

## Convention

**Definition** is a "class" or more precisely, a named function with a local context.
  Definitions are important because o *l* y use them as identifier.

**Declaration** is a definition inside an o *l* y kernel.

**Instance** is an object given by the injection of a definition. All instances are stored inside the o *l* y kernel.

**State** is a value identified with a key and used by one or many instance(s). All the states are stored in a "store" (which is a just a Map).

**Service** is a stateless declaration. So, it's just a class with methods, nothing more.
By default, services are singleton, that's mean there always will only one instance of the service inside the kernel.

**Provider** is a stateful declaration with hooks. Unlink services, providers have hooks to initialize their state.
  For example, DatabaseProvider is a provider which create a connection on start and close connection on stop. The connection is a state. "DatabaseProvider provides a connection".

**Controller** is a service with actions. An action is an instruction sequence triggered by an event.
