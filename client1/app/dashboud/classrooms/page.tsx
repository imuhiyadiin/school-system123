import { CrudPage } from "../components/CrudPage"

export default function ClassroomsPage() {
  return (
    <CrudPage
      title="Classrooms"
      endpoint="/classroom"
      showStats
      filterFields={{ search: false, status: false }}
      classroomFilterKey="name"
    />
  )
}
