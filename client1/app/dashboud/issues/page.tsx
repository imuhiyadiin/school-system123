import { CrudPage } from "../components/CrudPage"
import type { DataTableColumn } from "../components/DataTable"

const columns: DataTableColumn[] = [
  { key: "classroom", label: "Classroom" },
  { key: "student", label: "Student" },
  { key: "type", label: "Issue type" },
  { key: "details", label: "Details" },
  { key: "isResolved", label: "Resolved" },
]

export default function IssuesPage() {
  return <CrudPage title="Issues" endpoint="/issue" columns={columns} />
}
