import { CrudPage } from "../components/CrudPage"

export default function SubjectsPage() {
  return (
    <CrudPage
      title="Subjects"
      endpoint="/subject"
      showStats
      filterFields={{ search: true, classroom: false, status: false }}
      columns={[
        { key: "name", label: "Subject name" },
        { key: "description", label: "Description" },
      ]}
    />
  )
}
