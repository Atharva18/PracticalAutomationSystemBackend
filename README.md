Please don't push node modules folder as installations may differ according to the version of npm installed on each PC.

After you pull the changes, just do 'npm install' , it'll setup node modules on your local machine.

API'S Done, Validations and corner cases not done yet.

Collections in Mongo:

1. Users (fname, lname, id, username, password, roll_type, email, status, login_attempts, login_timestamp, logout_timestamp)
2. Role (Type)
3. Programme (branch, program:[])
4. Course(branch, code, course, sem, year, pattern)

'program' is an array. 