import { Button } from "@mui/material";
import { fs, dialog } from "@tauri-apps/api";
import { useState, useEffect, Key } from 'react'
import { Roll, Student } from '../lib/Student'
import StudentButton from "./StudentButton";

function forceUpdate() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [ value, setValue ] = useState(true);
  return () => setValue(!value)
}

export default function StudentGrid({file, date}:{file: string, date: string}) {
  const [ studs, setStudents ] = useState<Roll | undefined>()
  let force = forceUpdate()

  function studentsNeeded(roll: Roll) {
    fs.readTextFile(file).then((csv) => {
      let data = csv.split("\n")
      data.forEach(student => {
        if (student.startsWith('a1g')) {
          roll.newStudent(student)
        }
      })
      setStudents(roll)
    })
  }
  
  const allPresentPress = () => {
    studs!.allPresent()
    force()
  }
  
  useEffect(() => {
    let roll = new Roll();
    studentsNeeded(roll)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  const handleExport = async () => {
    let stringToWrite = studs!.listStudents(date)
    console.log('stringToWrite', stringToWrite)
    const filePath = await dialog.save({
      title: "Please Select A Location To Save",
      filters: [{
        name: "Comma-Seperated Values",
        extensions: ['csv']
      }]
    })
    .then(data => {
      fs.writeFile({
        path: data,
        contents: stringToWrite
      })
      return data
    })
    .catch(err => {
      console.log(err)
    })
    console.log('Successfully saved to: ', filePath)
  }


  if (studs?.students) {
    console.log(studs)
    return (
      <div>
        <h1>Students</h1>
        <p>{studs!.students.length}</p>
        <Button onClick={allPresentPress}>All Present</Button>
        <Button onClick={handleExport}>Export</Button>
        {studs!.students.map((student: Student, index: Key | null | undefined) => <StudentButton key={index} stud={student}/>)}
      </div>
    );

  }
  else {
    return (
      <h1>Loading...</h1>
    )
  }
}
