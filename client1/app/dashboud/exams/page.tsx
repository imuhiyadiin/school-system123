import { CrudPage } from "../components/CrudPage"
import type { DataTableColumn } from "../components/DataTable"

const columns: DataTableColumn[] = [
  { key: "name", label: "Exam name" },
  { key: "subject", label: "Subject" },
  { key: "type", label: "Exam type" },
  { key: "total", label: "Total marks" },
  { key: "date", label: "Exam date" },
]

export default function ExamsPage() {
  return <CrudPage title="Exams" endpoint="/exam" columns={columns} />
}
