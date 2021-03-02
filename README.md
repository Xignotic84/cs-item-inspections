<div align="center">
  <h2 align="center">CS Item Inspection</h2>
</div>

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* Install git (2.30.1^)
[https://git-scm.com/downloads](https://git-scm.com/downloads)
* Install nodejs (14.16.0^)
[https://nodejs.org/en/download/](https://nodejs.org/en/download/)
* Install mongodb (4.4.4)
[https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
* Install redis(3.2^)
[https://redis.io/download](https://redis.io/download)
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Xignotic84/cs-item-inspections.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Create file .env within src your details and refer to `example.env`
    ```dotenv
    PORT=6072
    REDIS_CACHE_TIME=
    COOKIE_SECRET=
    MAILER_HOST=
    MAILER_PORT=
    MAILER_AUTH_USER=
    MAILER_AUTH_PASS=
    ```
4. Run 
    ```sh
    cd src && node server
    ```


## Contact

Email: contact@xignotic.dev

Project Link: [https://github.com/Xignotic84/cs-item-inspections](https://github.com/Xignotic84/cs-item-inspections)


