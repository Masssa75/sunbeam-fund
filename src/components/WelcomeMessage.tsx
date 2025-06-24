'use client'

interface WelcomeMessageProps {
  userEmail: string
}

export default function WelcomeMessage({ userEmail }: WelcomeMessageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 px-6">
        <h1 className="text-3xl font-light text-gray-900">
          Welcome to Sunbeam Fund
        </h1>
        
        <p className="text-lg text-gray-600 max-w-md">
          Thank you for signing up.
        </p>
        
        <p className="text-gray-500">
          We will enable your investor account shortly and send you a message when it's ready.
        </p>
        
        <div className="text-sm text-gray-400 pt-4">
          Logged in as: {userEmail}
        </div>
      </div>
    </div>
  )
}