'use client'

interface WelcomeMessageProps {
  userEmail: string
}

export default function WelcomeMessage({ userEmail }: WelcomeMessageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4 px-6">
        <h1 className="text-2xl font-light text-gray-900">
          Thank you for signing up
        </h1>
        
        <p className="text-gray-500">
          Your investor account is being reviewed and will be activated shortly.
        </p>
      </div>
    </div>
  )
}