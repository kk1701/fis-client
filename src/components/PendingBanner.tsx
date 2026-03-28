export default function PendingBanner() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center max-w-lg mx-auto mt-16">
      <div className="text-4xl mb-3">⏳</div>
      <h2 className="text-lg font-semibold text-yellow-800 mb-1">
        Account Pending Approval
      </h2>
      <p className="text-yellow-700 text-sm">
        Your account is under review by the admin. You'll be able to manage
        your profile once approved.
      </p>
    </div>
  );
}