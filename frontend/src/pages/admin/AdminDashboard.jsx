export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Welcome to the SportMed Admin Portal.</p>
      <div className="admin-stats mt-6">
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-value">---</p>
        </div>
        <div className="stat-card">
          <h3>Pending Orders</h3>
          <p className="stat-value">---</p>
        </div>
      </div>
    </div>
  );
}
