import { CrudPage } from "../components/CrudPage"
import type { DataTableColumn } from "../components/DataTable"

const columns: DataTableColumn[] = [
  { key: "username", label: "Full name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "createdAt", label: "Created" },
]

export default function UsersPage() {
  return <CrudPage title="Users" endpoint="/user" createEndpoint="/user/register" columns={columns} />
}
