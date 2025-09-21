export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white font-bold text-2xl">A</span>
        </div>
        <div className="text-gray-600 font-medium">Loading Apiflow...</div>
        <div className="mt-4">
          <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
