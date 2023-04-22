Backend for Practical Automation System:

## Problem Statement:

Practical Examinations are an important part of our education system. Through practicals, students get to know the real world application of concepts which they have learnt in theory sessions. Every semester, each and every institute conducts practical exams for which they have to format PCs, install various softwares, prepare the problem statements, etc. at least 10 to 15 days before conducting the practical examination. Also, there is an absence of a system which keeps track of students’ activities during the examination. Current systems require a lot of manual intervention in order to schedule as well as conduct the practical exam. 

So, considering these problems there arises a need to develop a simple and effective automated system to complete these cumbersome tasks with ease. This system will certainly help many institutes to speed up the process of  conducting  practical exams.

The project proposes to automate the cumbersome process of formatting PCs, installing different softwares and allotment of problem statements. The project also intends to keep a track of different malpractices that the students might indulge in. 
Therefore, the problem statement is to design and implement a fully automated practical exam system to ease the process of conducting practicals.


Tables to be created in MongoDB:

1. Users (fname, lname, id, username, password, email, branch, year, status, login_attempts, login_timestamp, logout_timestamp)
2. Role (Type)
3. Programme (branch, program:[])
4. Course(branch, code, course, sem, year, pattern)
5. Branch (Type)
6. Department (Type)
7. Exam (course, exam_name, start_date, end_date, status)
8. Exam-Topic(exam_id,course,statement)
9. Exam-student(user[],branch,year,subject,name,size,examid)
10. Student-Topic(id, questions: [{course, statement, changes, uploads}])
