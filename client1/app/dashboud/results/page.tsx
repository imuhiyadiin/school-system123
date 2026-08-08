import { CrudPage } from "../components/CrudPage"
import type { DataTableColumn } from "../components/DataTable"

const columns: DataTableColumn[] = [
  { key: "classroom", label: "Classroom" },
  { key: "student", label: "Student" },
  { key: "subject", label: "Subject" },
  { key: "exam", label: "Exam" },
  { key: "marks", label: "Marks" },
]

export default function ResultsPage() {
  return <CrudPage title="Results" endpoint="/result" columns={columns} />
}
