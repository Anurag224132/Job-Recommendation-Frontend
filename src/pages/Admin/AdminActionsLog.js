const AdminActionsLog = () => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md col-span-1 md:col-span-2 lg:col-span-3">
      <h2 className="font-semibold text-lg mb-2">Admin Actions Log</h2>
      <ul className="text-sm text-gray-600 space-y-1">
        <li>✅ Deleted job 'React Developer'</li>
        <li>✅ Approved user 'jane@example.com'</li>
      </ul>
    </div>
  );
};

export default AdminActionsLog;
