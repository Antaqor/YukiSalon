export default function HomeFeedPage() {
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gray-500 rounded-full" />
        <textarea
          className="w-full min-h-12 bg-transparent border-b border-gray-600 focus:border-brand transition"
          placeholder="What's happening?"
        />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="dark:bg-[#2a2a2a] rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gray-500 rounded-full" />
            <span>User {i + 1}</span>
          </div>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
      ))}
    </div>
  );
}
