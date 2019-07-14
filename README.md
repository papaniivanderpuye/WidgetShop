# Automation_KPI
Used for managing the Automation KPI reporting.

Utilizes OneDrive sync with Sharepoint to capture most local copy when running as a regularly scheduled task.  Paths are currently hard coded into script.  If running the script, make sure to change the filepath to the excel you are using.

### Using local instance
1. Clone repo
2. `cd static && npm install && npm run build && cd ../` (Note: For concurrent UI changes, run `npm run watch` in a seperate console session)
3. `cd server`
4. Start flask app: `python2.7 main.py`
5. Go to `<host>:<port>` in your browser (ex. localhost:7777>
6. Make changes
7. Verify changes
