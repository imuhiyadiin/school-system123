import { CrudPage } from "../components/CrudPage"
import type { DataTableColumn } from "../components/DataTable"

const columns: DataTableColumn[] = [
  { key: "fullName", label: "Full name" },
  { key: "phone", label: "Phone" },
  { key: "vehiclePlate", label: "Vehicle plate" },
  { key: "location", label: "Location" },
  { key: "arrivalTime", label: "Travel time", format: "time" },
  { key: "createdAt", label: "Created at", format: "dateTime" },
]

export default function BusesPage() {
  return <CrudPage title="Buses" endpoint="/bus" columns={columns} showStats />
}
