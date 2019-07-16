# Widgy

Widgy is a Widget Shop web application with a single form that allows users to order widgets. The web application collects the following pieces of data:
- The quantity of widgets (must be an integer - we can't ship partial widgets)
- The color the widgets should be painted (red, blue or yellow)
- The date by which the widgets are needed (which must be at least 1 week from the date the user is filling out the form)
- The type of widget the customer wants (Options are: "Widget", "Widget Pro" and "Widget Xtreme")

Your order will be saaved in a database and it displays a confirmation message after you order.

In current directory:

## Setup
You will need Python2.7, Node.JS, and MySQL Server installed on your laptop
Here are some websites to download these:
- Python2.7: https://www.python.org/downloads/release/python-2716/
- Node.JS: https://nodejs.org/en/download/
- MySQL: https://dev.mysql.com/downloads/installer/

## Setup Database:
you need to start a MySQL server locally on your laptop

access credentials to the database should be:
 - user: 'root'
 - password: 'PaNW^?DV9"zT,!^`'
 - host: 'localhost'
 - charset: 'utf8'

You also need to create a database and the required procedures in the server by running MySQL commands from the two files:
from the outermost folder of the directory(Which should be called WidgetShop)
- `db/create_tables.sql`
- `db/Procedures.sql`

The python Flask app will access the server using those credentials. If you want to look at the connection configuration, look at:
from the outermost folder of the directory(Which should be called WidgetShop)
- `server/config/config.py`

## Setup Web App:
start inside the outermost folder of the directory(Which should be called WidgetShop) and run the commands in the terminal
(you may need to be a root user to perform some of these commands)
- `cd static`
- `npm install`
- `npm run build `
- `cd ../`
- `pip install -r server/requirements/requirements.txt`
- `sudo touch /var/log/widget_shop.log` _(for log file)_
- `sudo chmod 777 /var/log/widget_shop.log`

### run application:
Start inside the outermost folder of the directory(Which should be called WidgetShop) and run the commands in the terminal
(you may need to be a root user to perform some of these commands)
- `python2.7 server/main.py`

The website will be in the url: http://localhost:1996/

## Tests:
### unit tests for application
start inside the outermost folder of the directory(Which should be called WidgetShop)
   - `cd server/unit_tests/`
   - `nosetests --verbosity=2`
   
## Logs:
All logs of Errors and Debug information should in this file:
- `/var/log/widget_shop.log` <br/>
You can moniter this by running the command:
- `tail -f /var/log/widget_shop.log`
