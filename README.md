Please don't push node modules folder as installations may differ according to the version of npm installed on each PC.

After you pull the changes, just do 'npm install' , it'll setup node modules on your local machine.

API'S Done, Validations and corner cases not done yet.

Collections in Mongo:

1. Users (fname, lname, id, username, password, email, branch, year, status, login_attempts, login_timestamp, logout_timestamp)
2. Role (Type)
3. Programme (branch, program:[])

'program' is an array. 

4. Course(branch, code, course, sem, year, pattern)
5. Branch (Type)
6. Department (Type)
7. Exam (course, exam_name, start_date, end_date, status)
8. Exam-Topic(exam_id,course,statement)
9. Exam-student(user[],branch,year,subject,name,size,examid)
10. Student-Topic(id, questions: [course, statement, uploads])