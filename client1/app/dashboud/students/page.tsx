import { CrudPage } from "../components/CrudPage"

export default function StudentsPage() {
  return (
    <CrudPage
      title="Students"
      endpoint="/students"
      createEndpoint="/students"
      showStats
      searchPlaceholder="Search by student name..."
      searchKeys={["fullName"]}
      filterFields={{ status: false, studentId: true }}
    />
  )
}
