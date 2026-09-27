import { CrudPage } from "../components/CrudPage"

export default function TeachersPage() {
  return (
    <CrudPage
      title="Teachers"
      endpoint="/teacher"
      showStats
      searchPlaceholder="Search by teacher name or phone..."
      searchKeys={["fullName", "phone"]}
      filterFields={{ classroom: false, status: false }}
    />
  )
}
