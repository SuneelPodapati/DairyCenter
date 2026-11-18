# Deployment Details
## ----------Setup Web App for API -------------- 
- Create new Node 22 web app deployment
- Connect `dairy-center-api` repo for deployment and overwrite the yaml file. 
- Add Enviroment Variable -> App Settings 
  - `API_SECRET_HEADER` (Random Value),
  - `Puretipalli` (mongodb+srv://<username>:<password>@clusteraws.<xxxxxx>.mongodb.net/DairyCenter)
- Copy out bound traffic IP address and update the network access Ips in MongoDB atlas

## ---------- Setup DB -------------
 - Create new SQL server and SQL DB
 - Enable traffic from local IP and select Allow Azure services to access this service
 - Go to DB and copy ADO.NET (SQL authentication) connection string with user name and password

## ----------- Setup Web App --------------
 - Create new .NET 4.8 web app deployment
 - Connect to repo for deployment, don't over write the yaml file. 
 - Download the publish profile value 
 - In Github repo settings, update the publish profile value and paste the raw publish profile string
 - Add Enviroment Variables -> App Settings and Connection strings
  - `API_EndPoint` (https://web-api-endpoint from above API deployment)
  - `API_SECRET_HEADER` (same random value from api app settings)
  - `DASHBOARD_Puretipalli` (mongo db atlas dashboard url)
  - `DefaultConnection` (connection string from above DB deployment), select type = SQLServer


Note: The credentials are store stored in my password vault app for backup
