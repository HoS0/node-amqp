# AMQP-boilerplate

## Message structure

- id

- sender

        `service name` + `service id`

- type
    - `logger`
    - `product`
    - `order`
    - `administration`
    - `api`
    - `auth`
    - `Notification`

- action
    - `create`
    - `retrieve`
    - `update` 
    - `delete`

- payload
    - error ( when message is a response )
        - 0
        - error message

- responceNeeded
    - true
    - false