import { CrudPage } from "../components/CrudPage"

export default function SubjectsPage() {
  return <CrudPage title="Subjects" endpoint="/subject" columns={[{ key: "name", label: "Subject name" }, { key: "description", label: "Description" }]} />
}
