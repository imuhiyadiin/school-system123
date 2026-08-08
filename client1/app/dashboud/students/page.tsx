import { CrudPage } from "../components/CrudPage"

export default function StudentsPage() {
  return <CrudPage title="Students" endpoint="/students" createEndpoint="/students" />
}
