import Navbar from "@/app/component/navbar"


export default function ProfilePage() {
  return (
    <>
      <Navbar />

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-10">

          {/* Title */}
          <h1 className="text-3xl font-bold text-blue-700 mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 mb-8">
            Manage your account and track your contributions.
          </p>

          <div className="grid md:grid-cols-3 gap-6">

            {/* LEFT PROFILE CARD */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl">
                  👤
                </div>

                <h2 className="mt-4 text-xl font-semibold">John Smith</h2>
                <span className="mt-1 text-sm bg-gray-200 px-3 py-1 rounded-full">
                  Silver Contributor
                </span>
              </div>

              <div className="mt-6 space-y-3 text-gray-600 text-sm">
                <p>📧 john.smith@example.com</p>
                <p>📞 +1 (555) 123-4567</p>
                <p>📍 123 Main Street, District 5</p>
                <p>📅 Member since August 2025</p>
              </div>

              <div className="border-t mt-6 pt-4 flex justify-between">
                <div>
                  <p className="text-blue-600 text-xl font-bold">#12</p>
                  <p className="text-sm text-gray-500">Rank</p>
                </div>
                <div>
                  <p className="text-blue-600 text-xl font-bold">285</p>
                  <p className="text-sm text-gray-500">Points</p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="md:col-span-2 space-y-6">

              {/* Stats Cards */}
              <div className="grid sm:grid-cols-2 gap-6">
                <StatCard title="Total Complaints" value="34" />
                <StatCard title="Resolved" value="27" />
                <StatCard title="In Progress" value="5" />
                <StatCard title="Total Points" value="285" />
              </div>

              {/* Category Cards */}
              <div className="grid sm:grid-cols-3 gap-6">
                <SmallCard title="Safety" value="198" />
                <SmallCard title="Environment" value="156" />
                <SmallCard title="Other" value="65" />
              </div>

              {/* Recent Complaints */}
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Recent Complaints
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="py-2">Issue</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Location</th>
                      </tr>
                    </thead>

                    <tbody>
                      <Row
                        issue="Pothole on Main Street"
                        category="Infrastructure"
                        status="In Progress"
                        date="Feb 20, 2026"
                        location="Main St, Downtown"
                      />
                      <Row
                        issue="Street light not working"
                        category="Utilities"
                        status="Pending"
                        date="Feb 19, 2026"
                        location="Oak Avenue"
                      />
                      <Row
                        issue="Garbage not collected"
                        category="Sanitation"
                        status="Resolved"
                        date="Feb 18, 2026"
                        location="Elm Street"
                      />
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function StatCard({ title, value }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
    </div>
  )
}

function SmallCard({ title, value }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h3 className="text-xl font-semibold mt-2">{value}</h3>
    </div>
  )
}

function Row({ issue, category, status, date, location }: any) {
  const statusColor =
    status === "Resolved"
      ? "bg-green-100 text-green-600"
      : status === "Pending"
      ? "bg-yellow-100 text-yellow-600"
      : "bg-blue-100 text-blue-600"

  return (
    <tr className="border-b">
      <td className="py-3">{issue}</td>
      <td>{category}</td>
      <td>
        <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>
          {status}
        </span>
      </td>
      <td>{date}</td>
      <td>{location}</td>
    </tr>
  )
}