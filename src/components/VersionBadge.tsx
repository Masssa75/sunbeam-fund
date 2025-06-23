export default function VersionBadge() {
  // Version will be updated with each deployment
  const version = "1.0.0"
  const deployDate = "2025-06-23"
  
  return (
    <div className="fixed bottom-4 right-4 text-xs text-gray-400 bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm border border-gray-200">
      v{version} • {deployDate}
    </div>
  )
}