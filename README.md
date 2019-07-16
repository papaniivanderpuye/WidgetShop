# Widgy

Widgy is a Widget Shop web application with a single form that allows users to order widgets. The web application collects the following pieces of data:
- The quantity of widgets (must be an integer - we can't ship partial widgets)
- The color the widgets should be painted (red, blue or yellow)
- The date by which the widgets are needed (which must be at least 1 week from the date the user is filling out the form)
- The type of widget the customer wants (Options are: "Widget", "Widget Pro" and "Widget Xtreme")

It displayed a confirmation message after your order.

In current directory:

## Setup
You will need Python2.7, Node.JS, and MySQL Server installed on your laptop

## Setup Database:
you need to start a MySQL server locally on your laptop

access credentials to the database should be:
 - user: 'root'
 - password: 'PaNW^?DV9"zT,!^`'
 - host: 'localhost'
 - charset: 'utf8'

You also need to create a database and the required procedures in the server by running MySQL commands from the two files:
- `db/create_tables.sql`
- `db/Procedures.sql`

The python Flask app will access the server using those credentials if you want to the connection configuration, look at:
-`server/config/config.py`

## Setup Web App:
- `npm install --prefix static`
- `npm run build --prefix static`
- `pip install -r server/requirements/requirements.txt`

run application:
 `python2.7 server/main.py`

The website will be in the url: http://localhost:1996/

## Tests:
### unit tests for application
   - `cd server/unit_tests/`
   - `nosetests --verbosity=2`
